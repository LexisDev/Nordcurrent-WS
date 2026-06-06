import * as path from "path";
import MissingParameterException from "../exceptions/missing-parameter-exception";
import UnknownCommandException from "../exceptions/unknown-command-exception";
import UserState from "../user/user-state";
import Application from "./application";

export default abstract class Command {
    protected name!: string;
    protected params: Record<string, any> = {};
    protected app!: Application;
    protected userState!: UserState;

    public static getRequiredParams(): string[] {
        return [];
    }

    public static isPublic(): boolean {
        return false;
    }

    public static resolve(name: string): { new (): Command } & typeof Command {
        try {
            const safeName = name.replace(/\\/g, "/");
            if (safeName.includes("..")) {
                throw new Error("invalid command name");
            }
            return require(path.join(__dirname, "..", "commands", safeName)).default;
        } catch {
            throw new UnknownCommandException(`Command '${name}' is not supported`);
        }
    }

    public static create(name: string, params: Record<string, any>, app: Application): Command {
        const constructor = Command.resolve(name);
        const command = new constructor();
        command.name = name;
        command.app = app;
        command.params = params ?? {};
        return command;
    }

    public abstract run(): void | Promise<void>;

    public async execute(userState: UserState): Promise<void> {
        for (const paramName of (this.constructor as typeof Command).getRequiredParams()) {
            if (this.getParam(paramName) == null) {
                throw new MissingParameterException(`Param '${paramName}' is required for command '${this.name}'`);
            }
        }
        this.userState = userState;
        await this.run();
    }

    protected getParam<T = any>(name: string, defaultValue: T | null = null): T | null {
        return name in this.params ? this.params[name] : defaultValue;
    }
}
