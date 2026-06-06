import { getClassName } from "../application/mixin";
import BadParameterException from "../exceptions/bad-parameter-exception";

const TriggerableTrait = {
    getFinishTime(this: any) {
        const startTime = this.getStartTime();
        return startTime > 0 ? startTime + this.getCycleTime() : null;
    },

    getTimeLeft(this: any, time: number) {
        const finishTime = this.getFinishTime();
        return finishTime ? Math.max(finishTime - time, 0) : null;
    },

    isTimerRunning(this: any) {
        return this.getStartTime() > 0;
    },

    isWorking(this: any) {
        return this.isTimerRunning();
    },

    trigger(this: any, time: number) {
        if (!this.isTimerRunning()) {
            throw new BadParameterException(`Timer is not started`);
        }
        const className = getClassName(this);
        if (!this.isTimerReady(time)) {
            throw new BadParameterException(`Timer:${className} is not ready. ${this.getTimeLeft(time)} seconds left`);
        }
        this.onTimer(time);
        this.afterTrigger();
    },

    afterTrigger() {
    },

    getCycleTime(this: any) {
        return this.getLibraryObject().getCycleTime();
    },

    onTimer(this: any, _time: number) {
    },

    getCompletedCycles(this: any, time: number) {
        return Math.max(0, Math.floor((time - this.getStartTime()) / this.getCycleTime()));
    },

    getElapsedTime(this: any, time: number) {
        return time - this.getStartTime();
    },

    startTimer(this: any, time: number) {
        this.setStartTime(time);
    },

    stopTimer(this: any) {
        this.setStartTime(0);
    },

    isTimerReady(this: any, time: number) {
        const finishTime = this.getFinishTime();
        return finishTime && finishTime <= time;
    },

    getStartTime(this: any) {
        return this.startTime;
    },

    setStartTime(this: any, time: number) {
        this.startTime = time;
    },
};

export default TriggerableTrait;
