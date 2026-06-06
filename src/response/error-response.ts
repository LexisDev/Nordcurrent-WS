import Request from "../application/request";
import Response from "./response";

export default class ErrorResponse implements Response {
    constructor(
        private readonly error: Error,
        private readonly request?: Request,
    ) {}

    public getError(): Error {
        return this.error;
    }

    public toArray() {
        return {
            command: this.request ? this.request.command : null,
            token: this.request ? this.request.token : null,
            error: {
                type: this.error.name || "Error",
                message: this.error.message,
            },
        };
    }
}
