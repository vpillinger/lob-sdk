import { EntityId } from "@lob-sdk/types";
export declare abstract class Entity {
    id: EntityId;
    name?: string;
    constructor(id: EntityId, name?: string);
}
export declare enum EntityType {
    Unit = 0,
    Objective = 1
}
