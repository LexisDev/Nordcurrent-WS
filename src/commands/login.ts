import Command from "../application/command";

export default class Login extends Command {
    public static isPublic(): boolean {
        return true;
    }

    public static getRequiredParams(): string[] {
        return ["playerId"];
    }

    public run(): void {
        
    }
}
