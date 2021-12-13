const fs = require("fs");
const PathUtils = require("./utils/PathUtils");
const Config = require("./utils/Config");
const Logger = require("./utils/Logger");
const WebServer = require("./core/WebServer");
const MySQLManager = require("./mysql/MySQLManager");

console.log(`Welcome to PoopWeb ${Config.version}`);

Config.dirname = __dirname;

console.log("Initiliazing Config & Logger...");
Config.init();
Logger.init();
console.log("\nDone! Initiliazing MySQLManager...");
MySQLManager.init();
console.log("\nDone! Starting WebServer...");
WebServer.init();