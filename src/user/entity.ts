import type UserState from "./user-state";

export default abstract class Entity {
    public userState!: UserState;

    public save(): void {
        this.userState.markDirty();
    }

    public getLibraryObject(): any {
        return null;
    }

    public abstract getResponsePath(): string[] | null;

    public abstract getSnapshot(time: number): any;
}
