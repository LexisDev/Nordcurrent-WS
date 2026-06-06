import * as fs from "fs";
import * as path from "path";
import Logger from "../utils/logger";

export interface PlayerData {
    id: string;
    params: Record<string, any>;
    resources?: Record<string, { amount: number; capacity: number; startTime: number }>;
    createdAt: number;
    updatedAt: number;
}

export default class PlayerStorage {
    constructor(private readonly directory: string) {
        fs.mkdirSync(this.directory, { recursive: true });
    }

    private fileFor(playerId: string): string {
        if (!/^[A-Za-z0-9_-]+$/.test(playerId)) {
            throw new Error(`Invalid player id: '${playerId}'`);
        }
        return path.join(this.directory, `${playerId}.json`);
    }

    public load(playerId: string): PlayerData | null {
        const file = this.fileFor(playerId);
        if (!fs.existsSync(file)) {
            return null;
        }
        try {
            return JSON.parse(fs.readFileSync(file, "utf8")) as PlayerData;
        } catch (e) {
            Logger.error(`Failed to read player file for ${playerId}`, { error: String(e) });
            throw e;
        }
    }

    public save(data: PlayerData): void {
        const file = this.fileFor(data.id);
        const tmp = `${file}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
        fs.renameSync(tmp, file);
    }
}
