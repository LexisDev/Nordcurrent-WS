/**
 * Thrown when the client requests a command that is not registered.
 */
export default class UnknownCommandException extends Error {
    public readonly name = "UnknownCommandException";
}
