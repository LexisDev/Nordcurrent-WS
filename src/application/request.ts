import ProtocolException from "../exceptions/protocol-exception";

export default class Request {
    public readonly start: number = Date.now();

    constructor(
        public readonly command: string,
        public readonly params: Record<string, any> = {},
        public readonly token?: string,
    ) {}

    public static fromJson(data: string | Buffer): Request {
        let parsed: any;
        try {
            parsed = JSON.parse(data.toString());
        } catch {
            throw new ProtocolException("Unable to decode request: invalid JSON");
        }
        if (!parsed || typeof parsed.cmd !== "string") {
            throw new ProtocolException("Unable to decode request: 'cmd' is required");
        }
        return new Request(parsed.cmd, parsed.params ?? {}, parsed.token);
    }
}
