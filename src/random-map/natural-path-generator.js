"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturalPathGenerator = void 0;
const flat_coords_array_1 = require("@lob-sdk/flat-coords-array");
const priority_queue_1 = require("@lob-sdk/priority-queue");
class NaturalPathGenerator {
    randomFn;
    terrains;
    heightMap;
    width;
    noiseScale;
    heightDiffCost;
    terrainReplacements = new Map();
    terrainCosts = new Map();
    constructor(randomFn, terrains, heightMap, width = 1, noiseScale = 10, heightDiffCost = 4, terrainReplacements, terrainCosts) {
        this.randomFn = randomFn;
        this.terrains = terrains;
        this.heightMap = heightMap;
        this.width = width;
        this.noiseScale = noiseScale;
        this.heightDiffCost = heightDiffCost;
        if (width < 1) {
            throw new Error("Path width must be a positive number");
        }
        terrainReplacements?.forEach(({ fromTerrain, toTerrain }) => this.terrainReplacements.set(fromTerrain, toTerrain));
        terrainCosts?.forEach(({ terrain, cost }) => this.terrainCosts.set(terrain, cost));
    }
    generatePath(start, goal) {
        // Use PriorityQueue for openList
        const openList = new priority_queue_1.PriorityQueue((a, b) => a - b); // Min-heap for f values
        const closedList = new Set();
        // Hash map for O(1) node lookups
        const nodeMap = new Map();
        const startNode = {
            x: start.x,
            y: start.y,
            g: 0,
            h: this.heuristic(start, goal),
            f: 0,
            parent: null,
        };
        startNode.f = startNode.g + startNode.h;
        openList.enqueue(startNode, startNode.f);
        nodeMap.set(`${start.x},${start.y}`, startNode);
        const getNeighbors = (node) => {
            const directions = [
                { x: 0, y: -1 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
            ];
            const neighbors = directions
                .map((dir) => ({ x: node.x + dir.x, y: node.y + dir.y }))
                .filter((p) => {
                return this.isValidPathSegment(p);
            });
            return neighbors;
        };
        while (!openList.isEmpty()) {
            const currentNode = openList.dequeue();
            const currentKey = `${currentNode.x},${currentNode.y}`;
            nodeMap.delete(currentKey); // Remove from nodeMap
            if (currentNode.x === goal.x && currentNode.y === goal.y) {
                return this.reconstructPath(currentNode);
            }
            closedList.add(currentKey);
            const neighbors = getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (closedList.has(neighborKey))
                    continue;
                const heightDiffCost = this.calculateHeightDiffCost(currentNode, neighbor);
                const terrainCost = this.calculateTerrainCost(neighbor);
                const g = currentNode.g +
                    terrainCost +
                    heightDiffCost +
                    this.generateNoise(this.noiseScale);
                const h = this.heuristic(neighbor, goal);
                const f = g + h;
                const existingNode = nodeMap.get(neighborKey);
                if (!existingNode || g < existingNode.g) {
                    const newNode = {
                        x: neighbor.x,
                        y: neighbor.y,
                        g,
                        h,
                        f,
                        parent: currentNode,
                    };
                    if (!existingNode) {
                        openList.enqueue(newNode, newNode.f);
                        nodeMap.set(neighborKey, newNode);
                    }
                    else {
                        // Update existing node
                        existingNode.g = g;
                        existingNode.f = f;
                        existingNode.parent = currentNode;
                        // PriorityQueue doesn't support priority updates directly,
                        // so we re-enqueue with the new priority
                        openList.enqueue(existingNode, existingNode.f);
                    }
                }
            }
        }
        return []; // No path found
    }
    generateNoise(scale) {
        return this.randomFn() * scale - scale / 2;
    }
    heuristic(a, b) {
        return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    }
    isValidTile(grid, x, y) {
        return x >= 0 && y >= 0 && x < grid.length && y < grid[0].length;
    }
    isValidPathSegment(p) {
        const halfWidth = Math.floor(this.width / 2);
        for (let offset = -halfWidth; offset <= halfWidth - (this.width % 2 === 0 ? 1 : 0); offset++) {
            const checkX = p.x + offset;
            const checkY = p.y;
            if (!this.isValidTile(this.heightMap, checkX, checkY)) {
                return false;
            }
        }
        return true;
    }
    calculateHeightDiffCost(current, neighbor) {
        const halfWidth = Math.floor(this.width / 2);
        let totalHeightDiff = 0;
        let validTiles = 0;
        for (let offset = -halfWidth; offset <= halfWidth - (this.width % 2 === 0 ? 1 : 0); offset++) {
            const currX = current.x + offset;
            const currY = current.y;
            const nextX = neighbor.x + offset;
            const nextY = neighbor.y;
            if (this.isValidTile(this.heightMap, currX, currY) &&
                this.isValidTile(this.heightMap, nextX, nextY)) {
                const heightDiff = this.heightMap[currX][currY] !== this.heightMap[nextX][nextY]
                    ? this.heightDiffCost
                    : 0;
                totalHeightDiff += heightDiff;
                validTiles++;
            }
        }
        return validTiles > 0 ? totalHeightDiff / validTiles : this.heightDiffCost;
    }
    reconstructPath(node) {
        const path = [];
        let current = node;
        while (current) {
            path.push({ x: current.x, y: current.y });
            current = current.parent;
        }
        return path.reverse();
    }
    getPathTiles(path) {
        const tiles = new flat_coords_array_1.FlatCoordsArray();
        const halfWidth = Math.floor(this.width / 2);
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            // Use Bresenham's line algorithm for the center path
            const points = this.bresenhamLine(start.x, start.y, end.x, end.y);
            for (const point of points) {
                // Fill a rectangular area around each point
                for (let offsetX = -halfWidth; offsetX <= halfWidth - (this.width % 2 === 0 ? 1 : 0); offsetX++) {
                    for (let offsetY = -halfWidth; offsetY <= halfWidth - (this.width % 2 === 0 ? 1 : 0); offsetY++) {
                        const tileX = point.x + offsetX;
                        const tileY = point.y + offsetY;
                        if (this.isValidTile(this.heightMap, tileX, tileY)) {
                            tiles.add(tileX, tileY);
                        }
                    }
                }
            }
        }
        // Handle the last point
        if (path.length > 0) {
            const lastPoint = path[path.length - 1];
            for (let offsetX = -halfWidth; offsetX <= halfWidth - (this.width % 2 === 0 ? 1 : 0); offsetX++) {
                for (let offsetY = -halfWidth; offsetY <= halfWidth - (this.width % 2 === 0 ? 1 : 0); offsetY++) {
                    const tileX = lastPoint.x + offsetX;
                    const tileY = lastPoint.y + offsetY;
                    if (this.isValidTile(this.heightMap, tileX, tileY)) {
                        tiles.add(tileX, tileY);
                    }
                }
            }
        }
        return Array.from(tiles).map(([x, y]) => {
            return { x, y };
        });
    }
    bresenhamLine(x0, y0, x1, y1) {
        const points = [];
        let x = x0;
        let y = y0;
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        while (true) {
            points.push({ x, y });
            if (x === x1 && y === y1)
                break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        return points;
    }
    /**
     * Determines the appropriate terrain type for a path tile based on terrain replacement rules
     * @param x X coordinate of the tile
     * @param y Y coordinate of the tile
     * @param baseTerrain The base terrain type for the path
     * @param terrains The terrain map to check against
     * @returns The terrain type to use for this tile
     */
    getTerrainForTile(x, y, baseTerrain, terrains) {
        if (!this.terrainReplacements || !this.isValidTile(terrains, x, y)) {
            return baseTerrain;
        }
        const underlyingTerrain = terrains[x][y];
        // Find a matching replacement rule
        const replacement = this.terrainReplacements.get(underlyingTerrain);
        return replacement ? replacement : baseTerrain;
    }
    /**
     * Calculates the terrain cost for a given position
     * @param position The position to check
     * @returns The terrain cost (defaults to 1 if no cost is specified)
     */
    calculateTerrainCost(position) {
        if (!this.terrains ||
            !this.isValidTile(this.terrains, position.x, position.y)) {
            return 1;
        }
        const terrain = this.terrains[position.x][position.y];
        return this.terrainCosts.get(terrain) || 1;
    }
}
exports.NaturalPathGenerator = NaturalPathGenerator;
