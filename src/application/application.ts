import * as http from "http";
import * as path from "path";
import * as WebSocket from "ws";
import PlayerStorage from "../storage/player-storage";
import Logger from "../utils/logger";
import Connection from "./connection";

export default class Application {
    public readonly storage: PlayerStorage;
    private readonly connections = new Map<string, Connection>();
    private server?: WebSocket.Server;

    constructor(
        private readonly port: number = Number(process.env.SERVER_PORT) || 8080,
        storageDir: string = process.env.PLAYERS_DIR || path.resolve(__dirname, "..", "..", "runtime", "players"),
    ) {
        this.storage = new PlayerStorage(storageDir);
    }

    public start() {
        this.server = new WebSocket.Server({ port: this.port, host: "0.0.0.0" });
        this.server.on("listening", () => Logger.info(`Server listening on port ${this.port}`));
        this.server.on("connection", (socket, req) => this.handleConnection(socket, req));

        process.on("SIGINT", () => this.shutdown());
        process.on("SIGTERM", () => this.shutdown());
    }

    private handleConnection(socket: WebSocket, req: http.IncomingMessage) {
        const connection = new Connection(socket, this);
        this.connections.set(connection.id, connection);
        Logger.info(`New connection ${connection.id} from ${req.socket.remoteAddress}`);
        socket.on("close", () => this.connections.delete(connection.id));
    }

    private async shutdown() {
        Logger.info("Shutting down, persisting connected players...");
        await Promise.all(Array.from(this.connections.values()).map((c) => c.onClose()));
        this.server?.close();
        process.exit(0);
    }
}
