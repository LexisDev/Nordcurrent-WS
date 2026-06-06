export default interface Triggerable {
    trigger(time: number): void;
    isTimerReady(time: number): boolean;
    getTimeLeft(time: number): number | null;
}

export function isTriggerable(arg: any): arg is Triggerable {
    return arg && typeof arg.trigger === "function";
}
