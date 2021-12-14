const fs = require("fs");
const Config = require("./../../utils/Config");
const Logger = require("./../../utils/Logger");
const GenericUtils = require("./../../utils/GenericUtils");
const { PoopScriptEnv } = require("./../../utils/PoopScriptEnv");
const { response, request } = require("express");

class PoopScriptFileHandler {
    /**
     * 
     * @param {string} filePath 
     * @param {request} req 
     * @param {response} res 
     */
    static handleFile(filePath, req, res) {
        var lines = fs.readFileSync(filePath).toString().split(/(\r\n|\r|\n)/g);
        var linesResult = [];
        var poopScriptStarted = false;
        var poopScriptLines = [];
        var stopExec = false;

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
            "status": (words, specialData) => {
                res = res.status(Number.parseInt(words[1]));
            },
            "sendAndFinish": (words) => {
                res.send(words.splice(1).join(" "));
                
                stopExec = true;
                return;
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
                console.log(words);
                console.log(words[2]);
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

        lines.forEach((line, idx) => {
            if(stopExec) return;

            if(line.trim() == ";;start ps" && !poopScriptStarted) {
                poopScriptLines = [];
                poopScriptStarted = true;
            }else if(line.trim() == ";;stop ps" && poopScriptStarted) {
                try {
                    poopScriptStarted = false;
                    env.exec(poopScriptLines.join("\n"));
                } catch(err) {
                    if(Config.config.poopscriptSettings.errorHandling == "print_error") {
                        console.log("Oops! PoopScript crashed!");
                        console.log(err);

                        res.status(500).send("[ERROR] PoopScript errored out: " + err);

                        Logger.error(req.path + ": PoopScript crashed.");
                        Logger.error(err.message + " | StackTrace: " + err.stack);
                        
                        stopExec = true;
                        return;
                    } else {
                        console.log("Oops! PoopScript crashed!");
                        console.log(err);

                        res.status(500).send(GenericUtils.generateErrorPage("Internal server error", "PoopScript crashed. Check server logs for more information."));
                        Logger.error(req.path + ": PoopScript crashed.");
                        Logger.error(err.message + " | StackTrace: " + err.stack);
                        
                        stopExec = true;
                        return;
                    }
                }
            }else if(poopScriptStarted) {
                poopScriptLines.push(line);
            }else {
                linesResult.push(line);
            }
        });

        res.status(200).send(linesResult.join("\n"));
    }
}

module.exports = PoopScriptFileHandler;