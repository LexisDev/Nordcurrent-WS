import Application from "../application/application";
import Library from "../library/library";
import PlayerStorage, { PlayerData } from "../storage/player-storage";
import Logger from "../utils/logger";
import UserEnergy from "./resources/user-energy";
import UserRenewable from "./resources/user-renewable";

export default class UserState {
    private dirty = false;

    public readonly resources: Record<string, UserRenewable> = {};

    private constructor(
        private readonly storage: PlayerStorage,
        private readonly data: PlayerData,
    ) {
        this.loadResources();
    }

    public get time(): number {
        return Math.floor(Date.now() / 1000);
    }

    private static defaultData(playerId: string): PlayerData {
        const now = Date.now();
        return {
            id: playerId,
            params: {
                name: playerId,
                level: 1,
                coins: 0,
            },
            resources: {},
            createdAt: now,
            updatedAt: now,
        };
    }

    public static load(app: Application, playerId: string): UserState {
        const existing = app.storage.load(playerId);
        if (existing) {
            Logger.info(`Loaded player ${playerId} from storage`);
            return new UserState(app.storage, existing);
        }
        Logger.info(`Creating new player ${playerId}`);
        const state = new UserState(app.storage, UserState.defaultData(playerId));
        state.dirty = true;
        return state;
    }

    private loadResources(): void {
        const saved = this.data.resources ?? {};
        for (const config of Object.values(Library.getInstance().getRenewables())) {
            const data = saved[config.id];
            this.resources[config.id] =
                config.id === "energy"
                    ? new UserEnergy(this, config, data)
                    : new UserRenewable(this, config, data);
        }
    }

    public getId(): string {
        return this.data.id;
    }

    public getResource(id: string): UserRenewable | undefined {
        return this.resources[id];
    }

    public getEnergy(): UserEnergy {
        return this.resources.energy as UserEnergy;
    }

    public getParam<T = any>(key: string, defaultValue: T | null = null): T | null {
        return key in this.data.params ? this.data.params[key] : defaultValue;
    }

    public setParam(key: string, value: any): void {
        this.data.params[key] = value;
        this.dirty = true;
    }

    public markDirty(): void {
        this.dirty = true;
    }

    public getSnapshot() {
        const time = this.time;
        const resources: Record<string, any> = {};
        for (const [id, resource] of Object.entries(this.resources)) {
            resources[id] = resource.getSnapshot(time);
        }
        return {
            id: this.data.id,
            params: { ...this.data.params },
            resources,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
        };
    }

    public save(): void {
        if (!this.dirty) {
            return;
        }
        this.data.resources = {};
        for (const [id, resource] of Object.entries(this.resources)) {
            this.data.resources[id] = resource.extract() as {
                amount: number;
                capacity: number;
                startTime: number;
            };
        }
        this.data.updatedAt = Date.now();
        this.storage.save(this.data);
        this.dirty = false;
        Logger.info(`Saved player ${this.data.id} to storage`);
    }
}
