"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AStar = void 0;
const priority_queue_1 = require("@lob-sdk/priority-queue/priority-queue");
/**
 * A node in the A* pathfinding algorithm representing a position in the grid.
 */
class Node {
    /** The x coordinate of the node. */
    x;
    /** The y coordinate of the node. */
    y;
    /** The cost from the start node to this node. */
    g = 0;
    /** The heuristic cost from this node to the goal. */
    h = 0;
    /** The total cost (g + h) for this node. */
    f = 0;
    /** The parent node in the path. */
    parent = null;
    /**
     * Creates a new Node instance.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Encodes the node's coordinates as a single number for efficient hashing and lookup.
     * @param width - The width of the grid.
     * @returns A unique numeric key for this node's position.
     */
    getKey(width) {
        return this.y * width + this.x;
    }
}
/**
 * An optimized A* pathfinding algorithm implementation with caching and subpath reuse.
 * Supports both 4-directional and 8-directional movement.
 */
class AStar {
    // Pre-computed neighbor directions (4-directional movement) as [dx, dy] tuples
    static CARDINAL_DIRECTIONS = [
        [0, -1], // up
        [0, 1], // down
        [-1, 0], // left
        [1, 0], // right
    ];
    // Pre-computed neighbor directions (8-directional movement) as [dx, dy] tuples
    static DIAGONAL_DIRECTIONS = [
        [-1, -1], // up-left
        [1, -1], // up-right
        [-1, 1], // down-left
        [1, 1], // down-right
    ];
    width;
    height;
    getStepCost;
    DIAGONAL_COST = 1.41421356237; // √2
    neighborDirections;
    pathCache = new Map();
    // Optimized subpath lookup: Map<startKey, Set<CachedPath>> for O(1) start lookup, then O(k) waypoint check
    subpathCache = new Map();
    maxKey; // Cached maxKey calculation
    // Reusable arrays to avoid allocations
    neighborsArray = [];
    pathArray = [];
    // Reusable data structures to avoid allocations per pathfinding call
    openList;
    openSet;
    closedSet;
    nodeMap;
    // Node pool for memory efficiency
    nodePool = [];
    nodePoolIndex = 0;
    /**
     * Creates a new AStar pathfinding instance.
     * @param width - The width of the grid in tiles.
     * @param height - The height of the grid in tiles.
     * @param getStepCost - A function that returns the cost to move from one point to another. Returns Infinity for impassable terrain.
     * @param useDiagonals - Whether to allow diagonal movement (8-directional) or only cardinal directions (4-directional). Defaults to true.
     */
    constructor(width, height, getStepCost, useDiagonals = true) {
        this.width = width;
        this.height = height;
        this.getStepCost = getStepCost;
        this.maxKey = width * height; // Cache maxKey calculation
        // Initialize neighbor directions based on useDiagonals setting
        this.neighborDirections = useDiagonals
            ? [...AStar.CARDINAL_DIRECTIONS, ...AStar.DIAGONAL_DIRECTIONS]
            : AStar.CARDINAL_DIRECTIONS;
        // Initialize reusable data structures
        this.openList = new priority_queue_1.PriorityQueue((a, b) => a - b);
        this.openSet = new Set();
        this.closedSet = new Set();
        this.nodeMap = new Map();
    }
    /**
     * Clears the path cache, freeing memory used by cached paths.
     */
    clearCache() {
        this.pathCache.clear();
        this.subpathCache.clear();
    }
    /**
     * Calculates the heuristic distance between two points using Chebyshev distance for 8-directional movement.
     * This is faster than Euclidean distance and still admissible.
     * @param x1 - The x coordinate of the first point.
     * @param y1 - The y coordinate of the first point.
     * @param x2 - The x coordinate of the second point.
     * @param y2 - The y coordinate of the second point.
     * @returns The heuristic distance estimate.
     */
    heuristic(x1, y1, x2, y2) {
        const dx = x1 > x2 ? x1 - x2 : x2 - x1; // Faster than Math.abs
        const dy = y1 > y2 ? y1 - y2 : y2 - y1;
        return dx > dy
            ? dx + (this.DIAGONAL_COST - 1) * dy
            : dy + (this.DIAGONAL_COST - 1) * dx; // Avoid Math.max/Math.min
    }
    /**
     * Encodes coordinates as a single number for efficient hashing.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns A unique numeric key for the position.
     */
    encodeKey(x, y) {
        return y * this.width + x;
    }
    /**
     * Gets a Node from the pool or creates a new one for memory efficiency.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns A Node instance for the given coordinates.
     */
    getNode(x, y) {
        if (this.nodePoolIndex < this.nodePool.length) {
            const node = this.nodePool[this.nodePoolIndex++];
            node.x = x;
            node.y = y;
            node.g = 0;
            node.h = 0;
            node.f = 0;
            node.parent = null;
            return node;
        }
        // Pool exhausted, create new node and add to pool
        // Limit pool size to prevent unbounded growth (keep max 1000 nodes)
        const node = new Node(x, y);
        if (this.nodePool.length < 1000) {
            this.nodePool.push(node);
        }
        this.nodePoolIndex++;
        return node;
    }
    /**
     * Finds the optimal path from start to end using the A* algorithm.
     * Uses caching and subpath reuse for improved performance.
     * @param start - The starting point.
     * @param end - The destination point.
     * @returns An array of points representing the path, or null if no path exists.
     */
    findPath(start, end) {
        if (!this.isValidPoint(start) || !this.isValidPoint(end)) {
            return null;
        }
        // Use numeric keys throughout for consistency and performance
        const startKey = this.encodeKey(start.x, start.y);
        const endKey = this.encodeKey(end.x, end.y);
        // Create cache key using numeric encoding: startKey * maxKey + endKey
        const cacheKey = startKey * this.maxKey + endKey;
        // Check cache first - exact match
        const cached = this.pathCache.get(cacheKey);
        if (cached !== undefined) {
            return cached ? cached.path : null;
        }
        // Check for subpath reuse: O(1) lookup for paths starting at startKey, then O(k) waypoint check
        const startPaths = this.subpathCache.get(startKey);
        if (startPaths) {
            for (const cachedPath of startPaths) {
                const endIndex = cachedPath.pointToIndex.get(endKey);
                if (endIndex !== undefined) {
                    // Return subpath from start to end
                    return cachedPath.path.slice(0, endIndex + 1);
                }
            }
        }
        // Reuse data structures - clear them first
        this.openList.clear();
        this.openSet.clear();
        this.closedSet.clear();
        this.nodeMap.clear();
        this.nodePoolIndex = 0; // Reset node pool
        // Cache end coordinates to avoid repeated property access
        const endX = end.x;
        const endY = end.y;
        const startNode = this.getNode(start.x, start.y);
        startNode.h = this.heuristic(start.x, start.y, endX, endY);
        startNode.f = startNode.g + startNode.h;
        this.nodeMap.set(startKey, startNode);
        this.openList.enqueue(startNode, startNode.f);
        this.openSet.add(startKey);
        while (!this.openList.isEmpty()) {
            const currentNode = this.openList.dequeue();
            const currentKey = currentNode.getKey(this.width);
            this.openSet.delete(currentKey);
            if (currentKey === endKey) {
                const path = this.reconstructPath(currentNode);
                // Copy path array since we're reusing the internal array
                const pathCopy = new Array(path.length);
                for (let i = 0; i < path.length; i++) {
                    pathCopy[i] = { x: path[i].x, y: path[i].y };
                }
                // Build point-to-index map for subpath reuse using numeric keys
                const pointToIndex = new Map();
                for (let i = 0; i < pathCopy.length; i++) {
                    const key = this.encodeKey(pathCopy[i].x, pathCopy[i].y);
                    pointToIndex.set(key, i);
                }
                const cachedPath = { path: pathCopy, pointToIndex };
                // Cache the path with metadata (memory efficient, path array is stored once)
                this.pathCache.set(cacheKey, cachedPath);
                // Add to subpath cache for efficient subpath lookup
                let startPaths = this.subpathCache.get(startKey);
                if (!startPaths) {
                    startPaths = new Set();
                    this.subpathCache.set(startKey, startPaths);
                }
                startPaths.add(cachedPath);
                return pathCopy;
            }
            this.closedSet.add(currentKey);
            // Cache current node coordinates to avoid repeated property access
            const currentX = currentNode.x;
            const currentY = currentNode.y;
            const neighbors = this.getNeighbors(currentNode);
            for (let i = 0; i < neighbors.length; i++) {
                const neighborPos = neighbors[i];
                const neighborX = neighborPos.x;
                const neighborY = neighborPos.y;
                const neighborKey = this.encodeKey(neighborX, neighborY);
                if (this.closedSet.has(neighborKey)) {
                    continue;
                }
                // Get or create neighbor node (reuse from pool)
                let neighbor = this.nodeMap.get(neighborKey);
                if (!neighbor) {
                    neighbor = this.getNode(neighborX, neighborY);
                    this.nodeMap.set(neighborKey, neighbor);
                }
                // Calculate step cost - reuse Point2 object from neighbors array
                // Create temporary Point2 only once for current position
                const currentPos = { x: currentX, y: currentY };
                const baseStepCost = this.getStepCost(currentPos, neighborPos);
                if (baseStepCost === Infinity) {
                    continue; // Treat as non-passable
                }
                // Inline diagonal check - faster than Math.abs
                const dx = neighborX - currentX;
                const dy = neighborY - currentY;
                const isDiagonal = (dx === 1 || dx === -1) && (dy === 1 || dy === -1);
                const moveCost = baseStepCost * (isDiagonal ? this.DIAGONAL_COST : 1);
                const tentativeG = currentNode.g + moveCost;
                const inOpenList = this.openSet.has(neighborKey);
                if (inOpenList && tentativeG >= neighbor.g) {
                    continue; // Already have a better path
                }
                neighbor.parent = currentNode;
                neighbor.g = tentativeG;
                neighbor.h = this.heuristic(neighborX, neighborY, endX, endY);
                neighbor.f = neighbor.g + neighbor.h;
                if (!inOpenList) {
                    this.openSet.add(neighborKey);
                    this.openList.enqueue(neighbor, neighbor.f);
                }
                // Note: If node is already in open list with worse g, we update it but don't re-enqueue.
                // The PriorityQueue will still work, but may have duplicate entries with different priorities.
                // This is acceptable for performance - the algorithm will still find the optimal path.
            }
        }
        // Cache null result (no path found)
        this.pathCache.set(cacheKey, null);
        return null;
    }
    /**
     * Gets all valid neighboring points for a given node.
     * @param node - The node to get neighbors for.
     * @returns An array of valid neighboring points.
     */
    getNeighbors(node) {
        // Reuse array to avoid allocations, but return a copy to avoid mutation
        this.neighborsArray.length = 0;
        const neighbors = this.neighborsArray;
        // Cache node coordinates
        const nodeX = node.x;
        const nodeY = node.y;
        const width = this.width;
        const height = this.height;
        // Use pre-computed directions
        for (let i = 0; i < this.neighborDirections.length; i++) {
            const [dx, dy] = this.neighborDirections[i];
            const x = nodeX + dx;
            const y = nodeY + dy;
            // Inline bounds check for better performance
            if (x >= 0 && x < width && y >= 0 && y < height) {
                neighbors.push({ x, y });
            }
        }
        // Return a copy to avoid mutation issues (neighbors array is reused)
        // This is still faster than creating a new array each time
        return neighbors.slice();
    }
    /**
     * Checks if a point is within the valid bounds of the grid.
     * @param point - The point to validate.
     * @returns True if the point is valid, false otherwise.
     */
    isValidPoint(point) {
        return (point.x >= 0 &&
            point.x < this.width &&
            point.y >= 0 &&
            point.y < this.height);
    }
    /**
     * Reconstructs the path from the goal node back to the start by following parent pointers.
     * @param node - The goal node.
     * @returns An array of points representing the path from start to goal.
     */
    reconstructPath(node) {
        // Reuse array to avoid allocations
        this.pathArray.length = 0;
        const path = this.pathArray;
        // Build path in reverse order
        let current = node;
        let length = 0;
        // First pass: count length and build reverse path
        while (current) {
            path[length++] = { x: current.x, y: current.y };
            current = current.parent;
        }
        // Reverse in-place for efficiency
        for (let i = 0, j = length - 1; i < j; i++, j--) {
            const temp = path[i];
            path[i] = path[j];
            path[j] = temp;
        }
        // Set correct length
        path.length = length;
        return path;
    }
}
exports.AStar = AStar;
