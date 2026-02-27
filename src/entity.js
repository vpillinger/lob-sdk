"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityType = exports.Entity = void 0;
class Entity {
    id;
    name;
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
exports.Entity = Entity;
var EntityType;
(function (EntityType) {
    EntityType[EntityType["Unit"] = 0] = "Unit";
    EntityType[EntityType["Objective"] = 1] = "Objective";
})(EntityType || (exports.EntityType = EntityType = {}));
