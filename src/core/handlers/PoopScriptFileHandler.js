const fs = require("fs");
const Config = require("./../../utils/Config");
const Logger = require("./../../utils/Logger");
const GenericUtils = require("./../../utils/GenericUtils");
const PoopScriptEnv = require("./../../utils/PoopScriptEnv");
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

        var env = new PoopScriptEnv(PoopScriptEnv.removalTemplates.poopweb);

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
                if(fs.existsSync(words.splice(2).join(" "))) {
                    env.GLOBAL_VARS[words[1]] = fs.readFileSync(words.splice(2).join(" "));
                } else {
                    throw("File not found");
                }
            },
            "appendToFile": (words) => {
                if(fs.existsSync(words.splice(2).join(" "))) {
                    fs.appendFileSync(words.splice(2).join(" "), env.GLOBAL_VARS[words[1]]);
                } else {
                    throw("File not found");
                }
            },
            "writeToFile": (words) => {
                fs.writeFileSync(words.splice(2).join(" "), env.GLOBAL_VARS[words[1]]);
            },
            "doesExist": (words) => {
                if(fs.existsSync(words.splice(2).join(" "))) {
                    env.GLOBAL_VARS[words[1]] = "yes";
                } else {
                    env.GLOBAL_VARS[words[1]] = "no";
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