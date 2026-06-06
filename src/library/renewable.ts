export default class Renewable {
    public readonly delta: number;
    public readonly cycleTime: number;
    public readonly minCycleTime: number;
    public readonly capacity: number;

    constructor(
        public readonly id: string,
        attributes: { capacity: number; cycle: number; min_cycle?: number; delta?: number },
    ) {
        this.delta = attributes.delta ?? 1;
        this.cycleTime = attributes.cycle;
        this.minCycleTime = attributes.min_cycle ?? 1;
        this.capacity = attributes.capacity;
        if (!(this.cycleTime > 0 && this.capacity > 0)) {
            throw new Error(`Renewable '${id}': cycle time and capacity must be positive integers`);
        }
    }

    public getCapacity(): number {
        return this.capacity;
    }

    public getDelta(): number {
        return this.delta;
    }

    public getCycleTime(): number {
        return this.cycleTime;
    }
}
