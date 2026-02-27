import { GenerateRandomMapResult, GenerateRandomMapProps } from "@lob-sdk/types";
export declare class RandomMapGenerator {
    generate({ scenario, dynamicBattleType, maxPlayers, seed, tileSize, era, tilesX, tilesY, }: GenerateRandomMapProps): GenerateRandomMapResult;
    private executeInstructions;
}
