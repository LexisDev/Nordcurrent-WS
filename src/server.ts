import * as path from "path";
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
import Application from "./application/application";
import Logger from "./utils/logger";

process.on("unhandledRejection", (reason) => {
    Logger.error("Unhandled promise rejection", { reason: String(reason) });
});

Logger.info(`Starting worker process #${process.pid}`);
new Application().start();
