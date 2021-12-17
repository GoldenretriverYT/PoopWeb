const fs = require("fs");
const Config = require("./../../utils/Config");
const Logger = require("./../../utils/Logger");
const GenericUtils = require("./../../utils/GenericUtils");
const { PoopScriptEnv } = require("./../../utils/PoopScriptEnv");
const { response, request } = require("express");
const MySQLManager = require("../../mysql/MySQLManager");
const MySQLClient = require("../../mysql/MySQLClient");

class PoopScriptFileHandler {
    /**
     * 
     * @param {string} filePath 
     * @param {request} req 
     * @param {response} res 
     */
    static async handleFile(filePath, req, _res) {
        var lines = fs.readFileSync(filePath).toString().split(/(\r\n|\r|\n)/g);

        var linesResult = [];
        var poopScriptStarted = false;
        var poopScriptLines = [];

        var stopExec = false;
        var halt = false;
        var res = _res;

        var overrideStatus = -1;

        var env = new PoopScriptEnv(["__globalctx__->eval", "__globalctx__->alert"]);

        env.setCustomConsoleHandler({
            log: (...args) => {
                linesResult.push(args.join(" "));
            },
            lognnl: (...args) => {
                linesResult[linesResult.length-1] = linesResult[linesResult.length-1] + args.join(" ");
            },
            warn: (...args) => {
                linesResult.push("[warn] " + args.join(" "));
                Logger.warn(req.path + ": " + args.join(" "));
            },
            error: (...args) => {
                if(Config.config.poopscriptSettings.errorHandling == "print_error") {
                    res.status(500).send("[ERROR] " + args.join(" "));
                    Logger.error(req.path + ": " + args.join(" "));

                    stopExec = true;
                    return;
                } else {
                    res.status(500).send(GenericUtils.generateErrorPage("Internal server error", "The PoopScript execution did error out."));
                    Logger.error(req.path + ": " + args.join(" "));
                    
                    stopExec = true;
                    return;
                }
            }
        });

        env.GLOBAL_OBJECTS["web"] = {
            "status": async (words, specialData) => {
                if(isNaN(parseInt(words[1])) || parseInt(words[1]) > 1000 || parseInt(words[1]) < 100) {
                    throw "Status must be an integer from 100 to 1000.";
                }

                overrideStatus = parseInt(words[1]);
            },
            "sendAndFinish": (words) => {
                res.send(words.splice(1).join(" "));
                
                stopExec = true;
                return;
            },
            "vardump": (words) => {
                linesResult.push(JSON.stringify(env.GLOBAL_VARS));
            }
        }

        env.GLOBAL_OBJECTS["fs"] = {
            "readFile": (words, specialData) => {
                if(fs.existsSync(words[2])) {
                    env.GLOBAL_VARS[words[1]] = fs.readFileSync(words[2]);
                } else {
                    throw("File not found");
                }
            },
            "appendToFile": (words) => {
                if(fs.existsSync(words[1])) {
                    fs.appendFileSync(words[1], words[2]); // changed syntax in 0.3.0
                } else {
                    throw("File not found");
                }
            },
            "writeToFile": (words) => {
                fs.writeFileSync(words[1], words[2]);
            },
            "doesExist": (words) => {
                if(fs.existsSync(words[2])) {
                    env.GLOBAL_VARS[words[1]] = "yes";
                } else {
                    env.GLOBAL_VARS[words[1]] = "no";
                }
            },
            "mkdir": (words) => {
                if(words[1] == "yes") {
                    fs.mkdirSync(words[2], {recursive: true});
                } else if(words[1] == "no") {
                    fs.mkdirSync(words[2]);
                } else {
                    throw "mkdir expects 2 arguments, first one needs to be yes/no (argument: recursive)";
                }
            }
        }

        /** @type {MySQLClient} */
        var mysqlSelected = null;

        env.GLOBAL_OBJECTS["mysql"] = {
            "selectConnection": (words) => {
                if(words[1] in MySQLManager.clients) {
                    mysqlSelected = MySQLManager.clients[words[1]];
                } else {
                    throw "This connection was defined in the configuration";
                }
            },
            "query": async (words) => {
                if(mysqlSelected == null) throw "Use mysql->selectConnection first before performing a query.";
                halt = true;

                var res = await mysqlSelected.query(words[3], words.splice(4, words.length));

                console.log(res);
                env.GLOBAL_VARS[words[1]] = res;

                await env.exec(env.CUSTOM_FUNCTIONS[words[2]].join(";\n"));

                halt = false;
            }
        }

        for(var line of lines) {
            if(stopExec) return;

            if(line.trim() == ";;start ps" && !poopScriptStarted) {
                poopScriptLines = [];
                poopScriptStarted = true;
            }else if(line.trim() == ";;stop ps" && poopScriptStarted) {
                try {
                    poopScriptStarted = false;
                    await env.exec(poopScriptLines.join("\n"));
                } catch(err) {
                    if(Config.config.poopscriptSettings.errorHandling == "print_error") {
                        console.log("Oops! PoopScript crashed!");
                        console.log(err);

                        res.status(500).send("[ERROR] PoopScript errored out: " + err);

                        Logger.error(req.path + ": PoopScript crashed. Error: " + err);
                        Logger.error("Message: " + err.message + " | StackTrace: " + err.stack);
                        
                        stopExec = true;
                        return;
                    } else {
                        console.log("Oops! PoopScript crashed!");
                        console.log(err);

                        res.status(500).send(GenericUtils.generateErrorPage("Internal server error", "PoopScript crashed. Check server logs for more information."));
                        Logger.error(req.path + ": PoopScript crashed. Error: " + err);
                        Logger.error("Message: " + err.message + " | StackTrace: " + err.stack);
                        
                        stopExec = true;
                        return;
                    }
                }
            }else if(poopScriptStarted) {
                poopScriptLines.push(line);
            }else {
                linesResult.push(line);
            }
        };

        var ticks = 0;
        while(halt) {
            ticks++;
            await sleep(10);

            if(ticks > 500) {
                res.status(408).send("Requested timed out.");
                return;
            }
        }

        res.status((overrideStatus == -1 ? 200 : overrideStatus)).send(linesResult.join("\n"));
    }
}

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

module.exports = PoopScriptFileHandler;