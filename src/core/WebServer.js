const express = require("express");
const http = require("http");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const DefaultFileHandler = require("./handlers/DefaultFileHandler");
const PoopScriptFileHandler = require("./handlers/PoopScriptFileHandler");
const Config = require("../utils/Config");
const Logger = require("../utils/Logger");
const PathUtils = require("../utils/PathUtils")

class WebServer {
    static init() {
        if(!fs.existsSync(PathUtils.preparePath(Config.config.hostDirectory))) {
            fs.mkdirSync(PathUtils.preparePath(Config.config.hostDirectory), {recursive: true});
        }

        var app = express();

        app.use(cookieParser());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        app.use("*", (req, res) => {
            var urlParsed = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
            
            Logger.log(urlParsed.pathname + " | query: " + urlParsed.search + " | ip: " + req.socket.remoteAddress);

            var modifiedUrl = urlParsed.pathname;

            if(!fs.existsSync(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl))) {
                res.status(404).send("<h1>Not found</h1>The requested resource is not available<br>Powered by PoopWeb WebServer v1.0");
                Logger.error(modifiedUrl + ": 404");
                return;
            }

            if(fs.lstatSync(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl)).isDirectory()) {
                modifiedUrl += "index.pw";
            }
            
            var extFound = false;
            
            Object.keys(Config.config.extensionHandlers).forEach((ext) => {
                if(Config.config.extensionHandlers[ext] == "poopscript" || Config.config.extensionHandlers[ext] == "sendfile") {
                    if(modifiedUrl.endsWith(ext)) {
                        if(Config.config.extensionHandlers[ext] == "poopscript") {
                            PoopScriptFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res);
                        }else if(Config.config.extensionHandlers[ext] == "sendfile") {
                            DefaultFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res);
                        }

                        extFound = true;
                    }
                }else {
                    res.status(500).send("<h1>Internal server error</h1>Invalid extension handler defined in config, check logs for more information<br>Powered by PoopWeb WebServer v1.0");
                    Logger.error(modifiedUrl + ": Invalid extension handler defined for " + ext);
                    return;
                }
            });

            if(extFound) return;
            
            if(!("default" in Config.config.extensionHandlers)) {
                res.status(500).send("<h1>Internal server error</h1>No file handler for this file extension is defined and there is no default file handler<br>Powered by PoopWeb WebServer v1.0");
                Logger.error(modifiedUrl + ": No file handler for this file extension is defined and there is no default file handler");
                return;
            }

            if(Config.config.extensionHandlers["default"] == "poopscript") {
                PoopScriptFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res);
            }else if(Config.config.extensionHandlers["default"] == "sendfile") {
                DefaultFileHandler.handleFile(PathUtils.preparePath(Config.config.hostDirectory + modifiedUrl), req, res);
            }
        });

        var httpServer = http.createServer(app);
        httpServer.listen(Config.config.portHttp);
        console.log("WebServer listening to port " + Config.config.portHttp);
    }
}

module.exports = WebServer;