import Mixin from "../../application/mixin";
import BadParameterException from "../../exceptions/bad-parameter-exception";
import Renewable from "../../library/renewable";
import PolymorphicEntity from "../polymorphic-entity";
import Triggerable from "../triggerable";
import TriggerableTrait from "../triggerable-trait";
import type UserState from "../user-state";

export interface RenewableData {
    amount: number;
    capacity: number;
    startTime: number;
}

@Mixin(TriggerableTrait)
class UserRenewable extends PolymorphicEntity implements Triggerable {
    public startTime = 0;
    protected amount: number;
    protected capacity: number;

    public isTimerRunning!: () => boolean;
    public isTimerReady!: (time: number) => boolean;
    public trigger!: (time: number) => void;
    public startTimer!: (time: number) => void;
    public stopTimer!: () => void;
    public getStartTime!: () => number;
    public setStartTime!: (time: number) => void;
    public getCompletedCycles!: (time: number) => number;
    public getTimeLeft!: (time: number) => number | null;
    public getFinishTime!: () => number | null;

    constructor(userState: UserState, public readonly config: Renewable, data?: RenewableData) {
        super();
        this.userState = userState;
        this.capacity = config.getCapacity();
        this.amount = config.getCapacity();
        if (data) {
            this.hydrate(data);
        }
        this.adjustTimer();
    }

    public attributes(): Record<string, string> {
        return {
            amount: "amount",
            capacity: "capacity",
            startTime: "startTime",
        };
    }

    public getResponsePath(): string[] {
        return ["resources", this.resourceId];
    }

    public get resourceId(): string {
        return this.config.id;
    }

    public getLibraryObject(): Renewable {
        return this.config;
    }

    public getCycleTime(): number {
        return this.config.getCycleTime();
    }

    public getAmount(): number {
        return this.amount;
    }

    public getCapacity(): number {
        return this.capacity;
    }

    public setAmount(amount: number): void {
        this.amount = Math.max(0, Math.min(this.capacity, amount));
        this.adjustTimer();
        this.save();
    }

    public spend(amount = 1): void {
        if (this.amount < amount) {
            throw new BadParameterException(
                `Not enough '${this.resourceId}': have ${this.amount}, need ${amount}`,
            );
        }
        this.setAmount(this.amount - amount);
    }

    public add(amount = 1): void {
        this.setAmount(this.amount + amount);
    }

    private adjustTimer(): void {
        if (!this.isTimerRunning() && this.amount < this.capacity) {
            this.startTimer(this.userState.time);
        } else if (this.isTimerRunning() && this.amount >= this.capacity) {
            this.stopTimer();
        }
    }

    protected onTimer(time: number): void {
        const delta = this.config.getDelta();
        const cycles = this.getCompletedCycles(time);
        const newAmount = Math.min(this.capacity, this.amount + cycles * delta);
        if (newAmount < this.capacity) {
            this.startTimer(this.getStartTime() + cycles * this.getCycleTime());
        } else {
            this.stopTimer();
        }
        this.amount = newAmount;
        this.save();
    }

    public getSnapshot(time: number) {
        return {
            id: this.resourceId,
            amount: this.amount,
            capacity: this.capacity,
            start_time: this.startTime,
            time_left: this.getTimeLeft(time),
        };
    }
}

export default UserRenewable;
