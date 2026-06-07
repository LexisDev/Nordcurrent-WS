import { resolve, join } from "path";
import { promises as fs } from "fs";
import * as yaml from "js-yaml";

require("dotenv").config({ path: resolve(__dirname, "..", "..", ".env") });

type ISchemaSettingParam = {
    Description: string;
    Type: string;
    Enum?: string[];
    Required: boolean;
    Props?: Record<string, ISchemaSettingParam>;
};

interface ISchemaSettings {
    Command: string;
    Params: Record<string, ISchemaSettingParam>;
    ParamsSample: object;
    Description: string;
    XResponse?: string;
}

interface IAsyncapiMessage {
    name: string;
    title: string;
    summary: string;
    description: string;
    payload: { $ref: string };
    "x-response": { $ref: string };
    examples: unknown[];
}

interface IAsyncapiSchema {
    type: string;
    properties?: Record<string, IAsyncapiSchema | { $ref: string }>;
    items?: IAsyncapiSchema | { $ref: string } | Record<string, never>;
    required?: string[];
    description?: string;
    const?: string;
    enum?: string[];
}

const ROOT = resolve(__dirname, "..").replace(/\\/g, "/");
const PATH = {
    SpecJson: `${ROOT}/schema/schema-spec.json`,
    CommandsSampleYaml: `${ROOT}/schema/commands-sample.yaml`,
    CommandsFolder: `${ROOT}/commands`,
    BaseCommandClass: `${ROOT}/application/command`,
    CommandsYaml: `${ROOT}/schema/commands.yaml`,
    CommandsDocsFolder: resolve(process.cwd(), "docs/commands").replace(/\\/g, "/"),
};

export async function generateDocs() {
    const documentation = await getBaseDoc();

    const rawSchemaSettings = await fs.readFile(PATH.SpecJson, "utf-8");
    const schemaSettings: ISchemaSettings[] = JSON.parse(rawSchemaSettings);
    const baseCommandClass = require(PATH.BaseCommandClass).default;

    const channels: { $ref: string }[] = [];
    const messages: Record<string, IAsyncapiMessage> = {};
    const schemas: Record<string, IAsyncapiSchema> = {};

    const commands = await getCommandFilesPaths();
    const commandsPathNames = commands.map((it) => commandPathName(it));

    for (const setting of schemaSettings) {
        if (!commandsPathNames.includes(setting.Command)) {
            console.warn(`Command class was not found for spec entry '${setting.Command}'`);
        }
    }

    for (const command of commands) {
        const commandClass = require(command).default;
        if (!commandClass || !(commandClass.prototype instanceof baseCommandClass)) {
            continue;
        }

        const pathName = commandPathName(command);
        const commandName = convertCommandPathToName(command);

        channels.push({ $ref: "#/components/messages/" + commandName });

        const settings = schemaSettings.find((o) => o.Command === pathName);
        if (!settings) {
            console.warn(`Spec entry was not found for command '${pathName}'`);
        } else {
            for (const param of commandClass.getRequiredParams()) {
                if (!settings.Params[param]) {
                    console.warn(`Required param '${param}' missing in spec for command '${pathName}'`);
                } else if (!settings.Params[param].Required) {
                    console.warn(`Param '${param}' is required by class but not marked Required in spec for '${pathName}'`);
                }
            }
        }

        const yamlConfig = generateYaml(settings, pathName, commandName);
        messages[commandName] = yamlConfig.messages;
        schemas[commandName] = yamlConfig.schemas;
    }

    documentation.servers = buildServers();
    documentation.channels["/"].publish.message.oneOf = channels;
    documentation.components.messages = messages;
    documentation.components.schemas = { ...documentation.components.schemas, ...schemas };

    await fs.writeFile(PATH.CommandsYaml, yaml.dump(documentation));

    console.info(`Docs generated: ${PATH.CommandsYaml}`);
}

export async function buildDocs() {
    const Generator = require("@asyncapi/generator");
    const GeneratorClass = Generator.default || Generator;
    const generator = new GeneratorClass("@asyncapi/html-template", PATH.CommandsDocsFolder, {
        forceWrite: true,
    });

    await generator.generateFromFile(PATH.CommandsYaml);
    console.info("Docs build success");
}

function getProperty(type: string, props?: Record<string, ISchemaSettingParam>): IAsyncapiSchema {
    const property: IAsyncapiSchema = {
        type: type.match(/\w+/)![0],
    };

    if (property.type.includes("array")) {
        if (type.includes("<")) {
            const subtype = type.match(/<(.+)>/)![1];
            property.items = getProperty(subtype, props);
            if (props) {
                (property.items as IAsyncapiSchema).required = Object.keys(props).filter((key) => props[key].Required);
            }
        } else {
            property.items = {};
        }
    }

    if (property.type.includes("object")) {
        const mappedProps: Record<string, IAsyncapiSchema> = {};
        if (props) {
            for (const key in props) {
                const prop = props[key];
                mappedProps[key] = getProperty(prop.Type, prop.Props);
                if (prop.Enum) {
                    mappedProps[key].enum = prop.Enum;
                }
                if (prop.Description) {
                    mappedProps[key].description = prop.Description;
                }
                if (prop.Props) {
                    mappedProps[key].required = Object.keys(prop.Props).filter((k) => prop.Props![k].Required);
                }
            }
            property.properties = mappedProps;
        } else {
            property.properties = {};
        }
    }

    return property;
}

function buildServers(): Record<string, any> {
    if (process.env.NODE_ENV === "production") {
        const host = process.env.DOCS_HOST || "nordcurrent-ws.onrender.com";
        return {
            production: {
                url: host,
                protocol: "wss",
                description: `Production server. Docs: https://${host}/docs/`,
            },
        };
    }

    const host = process.env.DOCS_HOST || "nordcurrent-ws.local";
    const port = process.env.SERVER_PORT || "8080";
    return {
        development: {
            url: `${host}:${port}`,
            protocol: "ws",
            description: `Local development server. Docs: http://${host}:${port}/docs/`,
        },
    };
}

async function getBaseDoc(): Promise<any> {
    const baseDoc = await fs.readFile(PATH.CommandsSampleYaml, "utf-8");
    return yaml.load(baseDoc);
}

async function getCommandFilesPaths(): Promise<string[]> {
    const result: string[] = [];
    async function walk(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = join(dir, entry.name).replace(/\\/g, "/");
            if (entry.isDirectory()) {
                await walk(full);
            } else if (entry.name.endsWith(".ts")) {
                result.push(full);
            }
        }
    }
    await walk(PATH.CommandsFolder);
    return result.sort();
}

function commandPathName(path: string): string {
    return path.split("/commands/").pop()!.replace(/\.ts$/, "");
}

function convertCommandPathToName(path: string): string {
    let tmp = path.split("/commands/").pop()!;
    tmp = tmp.split("-").join(" ");
    let fileName = capitalize(tmp).split(" ").join("-").split(".").slice(0, -1).join(".");
    fileName = fileName.split("/").join(" ");
    fileName = capitalize(fileName);
    fileName = fileName.split("-").join("");
    fileName = fileName.split(" ").join("-");
    return fileName;
}

function generateYaml(
    settings: ISchemaSettings | undefined,
    commandPath: string,
    commandName: string,
): { messages: IAsyncapiMessage; schemas: IAsyncapiSchema } {
    const descr: string = settings?.Description || "NO DATA FOR THIS COMMAND IN SPEC";
    const paramsSample: object = settings?.ParamsSample || {};
    const payload = { $ref: "#/components/schemas/" + commandName };
    const token = "MTgwNjY1MTIzMTIuNTUwOTc=";
    const paramsSchemas: IAsyncapiSchema = { type: "object", properties: {} };

    const examples = [{ payload: { cmd: commandPath, token, params: { ...paramsSample } } }];

    if (settings?.Params) {
        const requiredFields: string[] = [];
        for (const key in settings.Params) {
            const setting = settings.Params[key];
            const property = getProperty(setting.Type, setting.Props);
            property.description = setting.Description;
            if (setting.Enum) {
                property.enum = setting.Enum;
            }
            if (setting.Props) {
                property.required = Object.keys(setting.Props).filter((k) => setting.Props![k].Required);
            }
            if (setting.Required) {
                requiredFields.push(key);
            }
            paramsSchemas.properties![key] = property;
        }
        paramsSchemas.required = requiredFields;
    }

    const responseRef = settings?.XResponse
        ? "#/components/schemas/" + settings.XResponse
        : "#/components/schemas/changes-response";

    return {
        messages: {
            name: commandName,
            title: commandPath,
            summary: descr,
            description: descr,
            payload,
            "x-response": { $ref: responseRef },
            examples,
        },
        schemas: {
            type: "object",
            properties: {
                cmd: { type: "string", const: commandPath, description: descr },
                token: { $ref: "#/components/schemas/token" },
                params: paramsSchemas,
            } as any,
            required: ["cmd"],
        },
    };
}

function capitalize(str: string, lower = false): string {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
}
