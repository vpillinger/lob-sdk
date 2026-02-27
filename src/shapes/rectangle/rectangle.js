"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rectangle = void 0;
const vector_1 = require("@lob-sdk/vector");
const types_1 = require("../types");
class Rectangle {
    center;
    width;
    height;
    rotation;
    shapeType = types_1.ShapeType.Rectangle;
    vertices = [];
    constructor(center, width, height, rotation // In radians
    ) {
        this.center = center;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.updateVertices();
    }
    updateVertices() {
        const cosA = Math.cos(this.rotation);
        const sinA = Math.sin(this.rotation);
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        this.vertices = [
            new vector_1.Vector2(this.center.x + cosA * halfWidth - sinA * halfHeight, this.center.y + sinA * halfWidth + cosA * halfHeight),
            new vector_1.Vector2(this.center.x - cosA * halfWidth - sinA * halfHeight, this.center.y - sinA * halfWidth + cosA * halfHeight),
            new vector_1.Vector2(this.center.x - cosA * halfWidth + sinA * halfHeight, this.center.y - sinA * halfWidth - cosA * halfHeight),
            new vector_1.Vector2(this.center.x + cosA * halfWidth + sinA * halfHeight, this.center.y + sinA * halfWidth - cosA * halfHeight),
        ];
    }
    getEdges() {
        const edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            edges.push(this.vertices[(i + 1) % 4].subtract(this.vertices[i]));
        }
        return edges;
    }
    pointTouches(point) {
        // Step 1: Translate the point to the rectangle's center
        const translatedPoint = new vector_1.Vector2(point.x - this.center.x, point.y - this.center.y);
        // Step 2: Rotate the point by the negative rectangle's rotation
        const cosA = Math.cos(-this.rotation);
        const sinA = Math.sin(-this.rotation);
        const rotatedX = translatedPoint.x * cosA - translatedPoint.y * sinA;
        const rotatedY = translatedPoint.x * sinA + translatedPoint.y * cosA;
        // Step 3: Check if the rotated point is within the bounds of the unrotated rectangle
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        return (rotatedX >= -halfWidth &&
            rotatedX <= halfWidth &&
            rotatedY >= -halfHeight &&
            rotatedY <= halfHeight);
    }
}
exports.Rectangle = Rectangle;
