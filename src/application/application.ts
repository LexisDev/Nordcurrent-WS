import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as WebSocket from "ws";
import PlayerStorage from "../storage/player-storage";
import Logger from "../utils/logger";
import Connection from "./connection";

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".map": "application/json; charset=utf-8",
};

export default class Application {
    public readonly storage: PlayerStorage;
    private readonly connections = new Map<string, Connection>();
    private readonly docsDir: string;
    private httpServer?: http.Server;
    private wss?: WebSocket.Server;

    constructor(
        private readonly port: number = Number(process.env.PORT) || Number(process.env.SERVER_PORT) || 8080,
        storageDir: string = process.env.PLAYERS_DIR || path.resolve(__dirname, "..", "..", "runtime", "players"),
        docsDir: string = process.env.DOCS_DIR || path.resolve(process.cwd(), "docs", "commands"),
    ) {
        this.storage = new PlayerStorage(storageDir);
        this.docsDir = path.resolve(docsDir);
    }

    public start() {
        this.httpServer = http.createServer((req, res) => this.handleHttp(req, res));
        this.wss = new WebSocket.Server({ server: this.httpServer });
        this.wss.on("connection", (socket, req) => this.handleConnection(socket, req));

        this.httpServer.listen(this.port, "0.0.0.0", () => {
            Logger.info(`Server listening on port ${this.port} (WebSocket API + HTTP /docs)`);
        });

        process.on("SIGINT", () => this.shutdown());
        process.on("SIGTERM", () => this.shutdown());
    }

    private handleHttp(req: http.IncomingMessage, res: http.ServerResponse) {
        const url = (req.url || "/").split("?")[0];

        if (url === "/") {
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("nordcurrent-ws is running. API docs: /docs");
            return;
        }

        if (url === "/docs") {
            res.writeHead(302, { Location: "/docs/" });
            res.end();
            return;
        }

        if (url.startsWith("/docs/")) {
            this.serveDocs(url.slice("/docs/".length), res);
            return;
        }

        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
    }

    private serveDocs(relativePath: string, res: http.ServerResponse) {
        const decoded = decodeURIComponent(relativePath);
        const rel = decoded === "" ? "index.html" : decoded;
        const filePath = path.resolve(this.docsDir, rel);

        if (filePath !== this.docsDir && !filePath.startsWith(this.docsDir + path.sep)) {
            res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Forbidden");
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                const message = fs.existsSync(this.docsDir)
                    ? "Doc file not found"
                    : "Docs are not generated yet. Run: npm run generate-docs && npm run build-docs";
                res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                res.end(message);
                return;
            }
            const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
            res.writeHead(200, { "Content-Type": type });
            res.end(data);
        });
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
        this.wss?.close();
        this.httpServer?.close();
        process.exit(0);
    }
}
