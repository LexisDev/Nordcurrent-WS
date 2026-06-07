import Command from "../application/command";

export default class LevelStart extends Command {
    public run(): void {
        this.userState.getEnergy().consumeForLevel();
    }
}
