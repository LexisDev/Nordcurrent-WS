/**
 * Thrown when a command requires an authenticated session but none exists,
 * or the login payload is invalid.
 */
export default class SessionException extends Error {
    public readonly name = "SessionException";
}
