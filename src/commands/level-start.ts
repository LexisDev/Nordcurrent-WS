import Command from "../application/command";
import BadParameterException from "../exceptions/bad-parameter-exception";

export default class LevelStart extends Command {
    public run(): void {
        const energy = this.userState.getResource("energy");
        if (!energy) {
            throw new BadParameterException("Energy resource is not configured");
        }
        energy.spend(1);
    }
}
