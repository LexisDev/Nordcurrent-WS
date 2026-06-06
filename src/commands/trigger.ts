import Command from "../application/command";
import BadParameterException from "../exceptions/bad-parameter-exception";
import Triggerable, { isTriggerable } from "../user/triggerable";

export default class Trigger extends Command {
    public static getRequiredParams(): string[] {
        return ["id", "type"];
    }

    public run(): void {
        const entity = this.getTriggerableEntity();
        entity.trigger(this.userState.time);
    }

    private getTriggerableEntity(): Triggerable {
        const id = this.getParam<string>("id")!;
        const type = this.getParam<string>("type");
        switch (type) {
            case "resource": {
                const resource = this.userState.getResource(id);
                if (!resource) {
                    throw new BadParameterException(`Resource '${id}' not found`);
                }
                if (!isTriggerable(resource)) {
                    throw new BadParameterException(`Resource '${id}' is not triggerable`);
                }
                return resource;
            }
            default:
                throw new BadParameterException(`Unknown trigger type '${type}'`);
        }
    }
}
