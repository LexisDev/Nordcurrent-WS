
    const schema = {
  "asyncapi": "2.0.0",
  "info": {
    "title": "Nordcurrent WS API",
    "version": "1.0.0",
    "description": "Description of commands for the simplified game server via WebSocket.\nThe client first sends the `login` command, after which it can execute\nother commands. Player data is stored in JSON files.\n"
  },
  "servers": {
    "development": {
      "url": "nordcurrent-ws.local:8999",
      "protocol": "ws",
      "description": "Local development server. Docs: http://nordcurrent-ws.local:8999/docs/"
    }
  },
  "defaultContentType": "application/json",
  "channels": {
    "/": {
      "publish": {
        "message": {
          "oneOf": [
            {
              "name": "LevelComplete",
              "title": "level-complete",
              "summary": "Player won a level — 1 unit of energy is granted back (capped at the maximum). Together with level-start this nets to zero, so a win effectively does not cost energy.",
              "description": "Player won a level — 1 unit of energy is granted back (capped at the maximum). Together with level-start this nets to zero, so a win effectively does not cost energy.",
              "payload": {
                "type": "object",
                "properties": {
                  "cmd": {
                    "type": "string",
                    "const": "level-complete",
                    "description": "Player won a level — 1 unit of energy is granted back (capped at the maximum). Together with level-start this nets to zero, so a win effectively does not cost energy.",
                    "x-parser-schema-id": "<anonymous-schema-1>"
                  },
                  "token": {
                    "type": "string",
                    "description": "Optional request identifier that the server returns in the response.",
                    "x-parser-schema-id": "token"
                  },
                  "params": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                    "x-parser-schema-id": "<anonymous-schema-2>"
                  }
                },
                "required": [
                  "cmd"
                ],
                "x-parser-schema-id": "LevelComplete"
              },
              "x-response": {
                "type": "object",
                "properties": {
                  "command": {
                    "type": "string",
                    "description": "Name of the command, on which the response was created.",
                    "x-parser-schema-id": "<anonymous-schema-20>"
                  },
                  "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
                  "data": {
                    "type": "object",
                    "description": "Actual player snapshot after executing the command.",
                    "properties": {
                      "player": {
                        "type": "object",
                        "description": "Player document.",
                        "x-parser-schema-id": "<anonymous-schema-22>"
                      }
                    },
                    "x-parser-schema-id": "<anonymous-schema-21>"
                  }
                },
                "x-parser-schema-id": "changes-response"
              },
              "examples": [
                {
                  "payload": {
                    "cmd": "level-complete",
                    "token": "MTgwNjY1MTIzMTIuNTUwOTc=",
                    "params": {}
                  }
                }
              ]
            },
            {
              "name": "LevelStart",
              "title": "level-start",
              "summary": "Player started or restarted a level — 1 unit of energy is consumed. If energy dropped below the maximum, the recovery timer is started.",
              "description": "Player started or restarted a level — 1 unit of energy is consumed. If energy dropped below the maximum, the recovery timer is started.",
              "payload": {
                "type": "object",
                "properties": {
                  "cmd": {
                    "type": "string",
                    "const": "level-start",
                    "description": "Player started or restarted a level — 1 unit of energy is consumed. If energy dropped below the maximum, the recovery timer is started.",
                    "x-parser-schema-id": "<anonymous-schema-3>"
                  },
                  "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
                  "params": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                    "x-parser-schema-id": "<anonymous-schema-4>"
                  }
                },
                "required": [
                  "cmd"
                ],
                "x-parser-schema-id": "LevelStart"
              },
              "x-response": "$ref:$.channels./.publish.message.oneOf[0].x-response",
              "examples": [
                {
                  "payload": {
                    "cmd": "level-start",
                    "token": "MTgwNjY1MTIzMTIuNTUwOTc=",
                    "params": {}
                  }
                }
              ]
            },
            {
              "name": "Login",
              "title": "login",
              "summary": "Authenticate connections by player ID. Creates a session, loads player data from a JSON file (or creates a new one), and returns a full player snapshot.",
              "description": "Authenticate connections by player ID. Creates a session, loads player data from a JSON file (or creates a new one), and returns a full player snapshot.",
              "payload": {
                "type": "object",
                "properties": {
                  "cmd": {
                    "type": "string",
                    "const": "login",
                    "description": "Authenticate connections by player ID. Creates a session, loads player data from a JSON file (or creates a new one), and returns a full player snapshot.",
                    "x-parser-schema-id": "<anonymous-schema-5>"
                  },
                  "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
                  "params": {
                    "type": "object",
                    "properties": {
                      "playerId": {
                        "type": "string",
                        "description": "Player ID, e.g. 'Player1', 'Player2'. Latin letters, digits, '-' and '_'.",
                        "x-parser-schema-id": "<anonymous-schema-7>"
                      }
                    },
                    "required": [
                      "playerId"
                    ],
                    "x-parser-schema-id": "<anonymous-schema-6>"
                  }
                },
                "required": [
                  "cmd"
                ],
                "x-parser-schema-id": "Login"
              },
              "x-response": {
                "type": "object",
                "properties": {
                  "command": {
                    "type": "string",
                    "description": "Name of the command (login).",
                    "x-parser-schema-id": "<anonymous-schema-16>"
                  },
                  "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
                  "data": {
                    "type": "object",
                    "description": "Data from the server and the full player snapshot.",
                    "properties": {
                      "server": {
                        "type": "object",
                        "description": "Information about the game server (time).",
                        "x-parser-schema-id": "<anonymous-schema-18>"
                      },
                      "player": {
                        "type": "object",
                        "description": "Document of the player (id, params, createdAt, updatedAt).",
                        "x-parser-schema-id": "<anonymous-schema-19>"
                      }
                    },
                    "x-parser-schema-id": "<anonymous-schema-17>"
                  }
                },
                "x-parser-schema-id": "auth-response"
              },
              "examples": [
                {
                  "payload": {
                    "cmd": "login",
                    "token": "MTgwNjY1MTIzMTIuNTUwOTc=",
                    "params": {
                      "playerId": "Player1"
                    }
                  }
                }
              ]
            },
            {
              "name": "SetParam",
              "title": "set-param",
              "summary": "Test command: changes one player parameter. The change is applied in memory and saved to the JSON file when the connection is closed.",
              "description": "Test command: changes one player parameter. The change is applied in memory and saved to the JSON file when the connection is closed.",
              "payload": {
                "type": "object",
                "properties": {
                  "cmd": {
                    "type": "string",
                    "const": "set-param",
                    "description": "Test command: changes one player parameter. The change is applied in memory and saved to the JSON file when the connection is closed.",
                    "x-parser-schema-id": "<anonymous-schema-8>"
                  },
                  "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
                  "params": {
                    "type": "object",
                    "properties": {
                      "key": {
                        "type": "string",
                        "description": "Player parameter name (e.g. 'coins', 'level', 'name').",
                        "x-parser-schema-id": "<anonymous-schema-10>"
                      },
                      "value": {
                        "type": "integer",
                        "description": "New value for the parameter. In the example, a number is shown; at runtime, any value is accepted (number, string, object).",
                        "x-parser-schema-id": "<anonymous-schema-11>"
                      }
                    },
                    "required": [
                      "key",
                      "value"
                    ],
                    "x-parser-schema-id": "<anonymous-schema-9>"
                  }
                },
                "required": [
                  "cmd"
                ],
                "x-parser-schema-id": "SetParam"
              },
              "x-response": "$ref:$.channels./.publish.message.oneOf[0].x-response",
              "examples": [
                {
                  "payload": {
                    "cmd": "set-param",
                    "token": "MTgwNjY1MTIzMTIuNTUwOTc=",
                    "params": {
                      "key": "coins",
                      "value": 250
                    }
                  }
                }
              ]
            },
            {
              "name": "Trigger",
              "title": "trigger",
              "summary": "Trigger for the timer of a game entity. For energy, it credits all fully elapsed recovery cycles (1 unit per interval) and restarts the count if the maximum has not yet been reached.",
              "description": "Trigger for the timer of a game entity. For energy, it credits all fully elapsed recovery cycles (1 unit per interval) and restarts the count if the maximum has not yet been reached.",
              "payload": {
                "type": "object",
                "properties": {
                  "cmd": {
                    "type": "string",
                    "const": "trigger",
                    "description": "Trigger for the timer of a game entity. For energy, it credits all fully elapsed recovery cycles (1 unit per interval) and restarts the count if the maximum has not yet been reached.",
                    "x-parser-schema-id": "<anonymous-schema-12>"
                  },
                  "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
                  "params": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "type": "string",
                        "description": "Type of the game entity with a timer.",
                        "enum": [
                          "resource"
                        ],
                        "x-parser-schema-id": "<anonymous-schema-14>"
                      },
                      "id": {
                        "type": "string",
                        "description": "ID of the entity (e.g. 'energy').",
                        "x-parser-schema-id": "<anonymous-schema-15>"
                      }
                    },
                    "required": [
                      "type",
                      "id"
                    ],
                    "x-parser-schema-id": "<anonymous-schema-13>"
                  }
                },
                "required": [
                  "cmd"
                ],
                "x-parser-schema-id": "Trigger"
              },
              "x-response": "$ref:$.channels./.publish.message.oneOf[0].x-response",
              "examples": [
                {
                  "payload": {
                    "cmd": "trigger",
                    "token": "MTgwNjY1MTIzMTIuNTUwOTc=",
                    "params": {
                      "type": "resource",
                      "id": "energy"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  },
  "components": {
    "messages": {
      "LevelComplete": "$ref:$.channels./.publish.message.oneOf[0]",
      "LevelStart": "$ref:$.channels./.publish.message.oneOf[1]",
      "Login": "$ref:$.channels./.publish.message.oneOf[2]",
      "SetParam": "$ref:$.channels./.publish.message.oneOf[3]",
      "Trigger": "$ref:$.channels./.publish.message.oneOf[4]"
    },
    "schemas": {
      "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
      "auth-response": "$ref:$.channels./.publish.message.oneOf[2].x-response",
      "changes-response": "$ref:$.channels./.publish.message.oneOf[0].x-response",
      "error-response": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string",
            "description": "Name of the command, which caused the error (if applicable).",
            "x-parser-schema-id": "<anonymous-schema-23>"
          },
          "token": "$ref:$.channels./.publish.message.oneOf[0].payload.properties.token",
          "error": {
            "type": "object",
            "description": "Description of the error.",
            "properties": {
              "type": {
                "type": "string",
                "description": "Type of the error (name of the exception class).",
                "x-parser-schema-id": "<anonymous-schema-25>"
              },
              "message": {
                "type": "string",
                "description": "Human-readable error message.",
                "x-parser-schema-id": "<anonymous-schema-26>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-24>"
          }
        },
        "x-parser-schema-id": "error-response"
      },
      "LevelComplete": "$ref:$.channels./.publish.message.oneOf[0].payload",
      "LevelStart": "$ref:$.channels./.publish.message.oneOf[1].payload",
      "Login": "$ref:$.channels./.publish.message.oneOf[2].payload",
      "SetParam": "$ref:$.channels./.publish.message.oneOf[3].payload",
      "Trigger": "$ref:$.channels./.publish.message.oneOf[4].payload"
    }
  },
  "x-parser-spec-parsed": true,
  "x-parser-api-version": 3,
  "x-parser-spec-stringified": true
};
    const config = {"show":{"sidebar":true},"sidebar":{"showOperations":"byDefault"}};
    const appRoot = document.getElementById('root');
    AsyncApiStandalone.render(
        { schema, config, }, appRoot
    );
  