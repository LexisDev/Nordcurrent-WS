export enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}

function write(level: LogLevel, message: string, context?: unknown) {
    const time = new Date().toISOString();
    const suffix = context !== undefined ? ` ${JSON.stringify(context)}` : "";
    console.log(`[${time}] [${level}] ${message}${suffix}`);
}

const Logger = {
    info: (message: string, context?: unknown) => write(LogLevel.INFO, message, context),
    warn: (message: string, context?: unknown) => write(LogLevel.WARN, message, context),
    error: (message: string, context?: unknown) => write(LogLevel.ERROR, message, context),
};

export default Logger;
