/**
 * Thrown when a command parameter has an invalid value.
 */
export default class BadParameterException extends Error {
    public readonly name = "BadParameterException";
}
