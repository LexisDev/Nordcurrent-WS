/**
 * Thrown when an incoming message cannot be parsed or violates the protocol.
 */
export default class ProtocolException extends Error {
    public readonly name = "ProtocolException";
}
