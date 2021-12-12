const fs = require("fs");
const PathUtils = require("./utils/PathUtils");
const Config = require("./utils/Config");
const Logger = require("./utils/Logger");
const WebServer = require("./core/WebServer");

const PRODUCT_NAME = "PoopWeb";
const VERSION = "0.2.0";

console.log(`Welcome to ${PRODUCT_NAME} v${VERSION}`);

Config.dirname = __dirname;

console.log("Initiliazing Config & Logger...");
Config.init();
Logger.init();
console.log("Done! Starting WebServer...");
WebServer.init();