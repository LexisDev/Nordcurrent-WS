import Command from "../application/command";

export default class LevelComplete extends Command {
    public run(): void {
        this.userState.getEnergy().rewardForWin();
    }
}
