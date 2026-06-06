import Request from "../application/request";
import UserState from "../user/user-state";
import Response from "./response";

export default class ChangesResponse implements Response {
    constructor(
        private readonly request: Request,
        private readonly userState: UserState,
    ) {}

    public toArray() {
        return {
            command: this.request.command,
            token: this.request.token,
            data: {
                player: this.userState.getSnapshot(),
            },
        };
    }
}
