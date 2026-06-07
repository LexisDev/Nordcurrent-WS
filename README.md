# Nordcurrent WS

Simplified WebSocket game server. Player data is stored in JSON files; commands are handled server-side and return structured JSON responses.

## Architecture

The proposed client–server architecture follows the technical specification using a **WebSocket** connection. After connecting, the client is authenticated through the server API and gains access to server-side functions.

On **login**, the client receives all data the server stores, loads it into memory, and works with it locally without repeatedly hitting the server. The server is contacted only when data **mutates** or when the **connection is lost**—then updated data is persisted on the server (here, JSON files, but the same pattern works with a relational database or any other durable storage) and waits for the next session. This model is well suited for the game logic described in the specification.

### Client integration flow

To implement game logic on the client:

1. Connect to the WebSocket server: [`wss://nordcurrent-ws.onrender.com`](wss://nordcurrent-ws.onrender.com)
2. Run **login**:
   ```json
   { "cmd": "login", "params": { "playerId": "Player2" }, "token": "test-token" }
   ```
3. After login, if a timer has already elapsed (e.g. energy recovery), call **trigger**:
   ```json
   { "cmd": "trigger", "params": { "type": "resource", "id": "energy" } }
   ```
4. To start or restart a level:
   ```json
   { "cmd": "level-start", "params": {} }
   ```
5. On successful level completion:
   ```json
   { "cmd": "level-complete", "params": {} }
   ```

This design makes it straightforward to add new game mechanics and evolve the stack—message brokers, different databases, analytics, logging, and other infrastructure can be introduced without changing the client-facing API shape.

## Production

| | URL |
|---|---|
| **WebSocket API** | [`wss://nordcurrent-ws.onrender.com`](wss://nordcurrent-ws.onrender.com) |
| **Documentation** | [https://nordcurrent-ws.onrender.com/docs/](https://nordcurrent-ws.onrender.com/docs/) |

Connect to the WebSocket endpoint above and send JSON messages. Full command reference, request/response schemas, and examples are in the docs.

## How the API works

The client opens a **WebSocket** connection and sends one JSON object per request:

```json
{ "cmd": "login", "params": { "playerId": "Player1" }, "token": "optional-id" }
```

- **`cmd`** — command name (e.g. `login`, `level-start`, `trigger`).
- **`params`** — command arguments (object; may be empty).
- **`token`** — optional client request id; the server echoes it in the response.

The server processes requests **one at a time** on each connection (queued). The first command must be **`login`** with a player id (`Player1`, `Player2`, …). That loads or creates the player from a JSON file and returns a full snapshot (params, energy, timers, etc.).

After login, other commands are allowed: change params, spend energy on level start, grant energy on level win, trigger regeneration timers, and so on. Game rules live in **user entity models** on the server; commands only invoke them. On **disconnect**, the player state is saved back to disk.

Responses are JSON as well: success payloads include `command`, `token`, and `data` (player snapshot or auth payload); errors include `error.type` and `error.message`.

## Local development

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root, for example:

```env
NODE_ENV=development
SERVER_PORT=8999
DOCS_PORT=3000
```

`SERVER_PORT` is the port for both the WebSocket API and `/docs` when running locally.

### Build and run

```bash
npm run build
npm start
```

WebSocket: `ws://localhost:8999` (or your `SERVER_PORT`).  
Docs (after `generate-docs` + `build-docs`): `http://localhost:8999/docs/`

### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server (`dist/server.js`) |
| `npm run generate-docs` | Generate AsyncAPI spec (`src/schema/commands.yaml`) |
| `npm run build-docs` | Build static HTML docs into `docs/commands/` |
| `npm run build-dev` | Compile + build docs |
| `npm run test` | Run tests |
| `npm run lint` | Lint `src/**/*.ts` |
