/**
 * Thrown when a required command parameter is absent.
 */
export default class MissingParameterException extends Error {
    public readonly name = "MissingParameterException";
}
