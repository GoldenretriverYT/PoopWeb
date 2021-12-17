const express = require("express");
const http = require("http");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const DefaultFileHandler = require("./handlers/DefaultFileHandler");
const PoopScriptFileHandler = require("./handlers/PoopScriptFileHandler");
const Config = require("../utils/Config");
const Logger = require("../utils/Logger");
const PathUtils = require("../utils/PathUtils");
const GenericUtils = require("../utils/GenericUtils");

class WebServer {
    static async init() {
        if(!fs.existsSync(PathUtils.preparePath(Config.config.hostDirectory))) {
            fs.mkdirSync(PathUtils.preparePath(Config.config.hostDirectory), {recursive: true});
        }

        var app = express();

        app.use(cookieParser());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        app.use("*", async (req, res) => {
            var urlParsed = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
            
            Logger.log(urlParsed.pathname + " | query: " + urlParsed.search + " | ip: " + req.socket.remoteAddress);

            var modifiedUrl = urlParsed.pathname;

            if(!fs.existsSync(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl))) { // Check if path even exists
                res.status(404).send(GenericUtils.generateErrorPage("Resource not found", "The requested resource was not found on the server."));
                Logger.error(modifiedUrl + ": 404");
                return;
            }

            if(fs.lstatSync(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl)).isDirectory()) {
                modifiedUrl += "index.pw";

                if(!fs.existsSync(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl))) { // Check again if index.pw exists.
                    res.status(404).send(GenericUtils.generateErrorPage("No index.pw", "The requested resource is a directory, but does not include a index.pw file."));
                    Logger.error(modifiedUrl + ": 404");
                    return;
                }
            }
            
            var extFound = false;
            
            for(var ext of Object.keys(Config.config.extensionHandlers)) {
                if(Config.config.extensionHandlers[ext] == "poopscript" || Config.config.extensionHandlers[ext] == "sendfile") {
                    if(modifiedUrl.endsWith(ext)) {
                        if(Config.config.extensionHandlers[ext] == "poopscript") {
                            await PoopScriptFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res).catch((err) => {
                                res.status(500).send(GenericUtils.generateErrorPage("Internal server error", "An internal server error occurred."));
                            });
                        }else if(Config.config.extensionHandlers[ext] == "sendfile") {
                            await DefaultFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res);
                        }

                        extFound = true;
                    }
                }else {
                    res.status(500).send(GenericUtils.generateErrorPage("Internal server error", "Invalid extension handler defined in config, check logs for more information"));
                    Logger.error(modifiedUrl + ": Invalid extension handler defined for " + ext);
                    return;
                }
            };

            if(extFound) return;
            
            if(!("default" in Config.config.extensionHandlers)) {
                res.status(500).send(GenericUtils.generateErrorPage("Internal server error", "No file handler for this file extension is defined and there is no default file handler"));
                Logger.error(modifiedUrl + ": No file handler for this file extension is defined and there is no default file handler");
                return;
            }

            if(Config.config.extensionHandlers["default"] == "poopscript") {
                await PoopScriptFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res);
            }else if(Config.config.extensionHandlers["default"] == "sendfile") {
                await DefaultFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res);
            }
        });

        var httpServer = http.createServer(app);
        httpServer.listen(Config.config.portHttp);
        console.log("WebServer listening to port " + Config.config.portHttp);
    }
}

module.exports = WebServer;