import Renewable from "./renewable";

export default class Library {
    private static instance: Library;

    private readonly renewables: Record<string, Renewable> = {};

    private constructor() {
        this.renewables.energy = new Renewable("energy", {
            capacity: Number(process.env.ENERGY_CAPACITY) || 5,
            cycle: Number(process.env.ENERGY_CYCLE_SECONDS) || 60,
        });
    }

    public static getInstance(): Library {
        if (!Library.instance) {
            Library.instance = new Library();
        }
        return Library.instance;
    }

    public getRenewable(id: string): Renewable | undefined {
        return this.renewables[id];
    }

    public getRenewables(): Record<string, Renewable> {
        return this.renewables;
    }
}
