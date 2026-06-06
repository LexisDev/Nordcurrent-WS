import Command from "../application/command";

export default class SetParam extends Command {
    public static getRequiredParams(): string[] {
        return ["key", "value"];
    }

    public run(): void {
        const key = this.getParam<string>("key")!;
        const value = this.getParam("value");
        this.userState.setParam(key, value);
    }
}
