import UserRenewable from "./user-renewable";

export default class UserEnergy extends UserRenewable {
    public consumeForLevel(): void {
        this.spend(1);
    }

    public rewardForWin(): void {
        this.add(1);
    }
}
