import UserState from "../user/user-state";
import Response from "./response";

export default class AuthResponse implements Response {
    constructor(
        private readonly userState: UserState,
        private readonly token?: string,
    ) {}

    public toArray(time: number) {
        return {
            command: "login",
            token: this.token,
            data: {
                server: { time },
                player: this.userState.getSnapshot(),
            },
        };
    }
}
