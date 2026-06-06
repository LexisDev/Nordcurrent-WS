import { randomBytes } from "crypto";
import WebSocket = require("ws");
import BadParameterException from "../exceptions/bad-parameter-exception";
import MissingParameterException from "../exceptions/missing-parameter-exception";
import SessionException from "../exceptions/session-exception";
import UnknownCommandException from "../exceptions/unknown-command-exception";
import AuthResponse from "../response/auth-response";
import ChangesResponse from "../response/changes-response";
import ErrorResponse from "../response/error-response";
import Response from "../response/response";
import UserState from "../user/user-state";
import Logger from "../utils/logger";
import Application from "./application";
import Command from "./command";
import Request from "./request";

export default class Connection {
    public readonly id = randomBytes(8).toString("hex");

    private userState: UserState | null = null;
    private readonly queue: Request[] = [];
    private processing = false;
    private closed = false;

    constructor(
        private readonly socket: WebSocket,
        private readonly app: Application,
    ) {
        socket.on("message", (data) => this.onMessage(data));
        socket.on("close", () => this.onClose());
        socket.on("error", (e: Error) => Logger.error("Socket error", { error: e.message }));
    }

    public get playerId(): string | null {
        return this.userState ? this.userState.getId() : null;
    }

    private onMessage(data: WebSocket.RawData) {
        let request: Request;
        try {
            request = Request.fromJson(data as Buffer);
        } catch (e) {
            this.sendErrorAndClose(e as Error);
            return;
        }
        this.enqueue(request);
    }

    public enqueue(request: Request) {
        if (this.closed) {
            return;
        }
        this.queue.push(request);
        if (!this.processing) {
            void this.drain();
        }
    }

    private async drain() {
        this.processing = true;
        while (this.queue.length && !this.closed) {
            const request = this.queue[0];
            try {
                const response = await this.handleRequest(request);
                this.queue.shift();
                if (!this.closed) {
                    this.send(response);
                }
            } catch (e) {
                this.queue.shift();
                this.sendErrorAndClose(e as Error, request);
                break;
            }
        }
        this.processing = false;
    }

    private async handleRequest(request: Request): Promise<Response> {
        const constructor = Command.resolve(request.command);

        if (!this.userState) {
            if (!constructor.isPublic()) {
                throw new SessionException("Authentication required: send 'login' first");
            }
            this.startSession(request);
            await Command.create(request.command, request.params, this.app).execute(this.userState!);
            return new AuthResponse(this.userState!, request.token);
        }

        try {
            await Command.create(request.command, request.params, this.app).execute(this.userState);
        } catch (e) {
            if (this.isFatal(e as Error)) {
                throw e;
            }
            return new ErrorResponse(e as Error, request);
        }
        return new ChangesResponse(request, this.userState);
    }

    private startSession(request: Request) {
        const playerId = request.params.playerId;
        if (typeof playerId !== "string" || !/^[A-Za-z0-9_-]+$/.test(playerId)) {
            throw new SessionException("'playerId' must be a non-empty alphanumeric string");
        }
        this.userState = UserState.load(this.app, playerId);
        Logger.info(`Connection ${this.id} authenticated as ${playerId}`);
    }

    private isFatal(e: Error): boolean {
        return !(
            e instanceof BadParameterException ||
            e instanceof MissingParameterException ||
            e instanceof UnknownCommandException
        );
    }

    private send(response: Response) {
        const payload = JSON.stringify(response.toArray(Date.now()));
        this.socket.send(payload);
    }

    private sendErrorAndClose(error: Error, request?: Request) {
        Logger.error(`Closing connection ${this.id}: ${error.message}`, { player: this.playerId });
        if (!this.closed) {
            this.closed = true;
            this.send(new ErrorResponse(error, request));
            this.socket.close();
        }
        void this.persist();
    }

    public async onClose() {
        if (this.closed) {
            await this.persist();
            return;
        }
        this.closed = true;
        Logger.info(`Connection ${this.id} closed`, { player: this.playerId });
        await this.persist();
    }

    private async persist() {
        if (!this.userState) {
            return;
        }
        try {
            this.userState.save();
        } catch (e) {
            Logger.error("Failed to persist player on close", { error: String(e), player: this.playerId });
        } finally {
            this.userState = null;
        }
    }
}
