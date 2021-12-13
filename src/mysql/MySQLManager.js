const MySQLClient = require("./MySQLClient");
const Config = require("../utils/Config");

class MySQLManager {
    static clients = {

    };

    static init() {
        Object.keys(Config.config.poopscriptSettings.mysql).forEach((key, idx) => {
            this.clients[key] = new MySQLClient(Config.config.poopscriptSettings.mysql[key].host,
                                            Config.config.poopscriptSettings.mysql[key].database,
                                            Config.config.poopscriptSettings.mysql[key].username,
                                            Config.config.poopscriptSettings.mysql[key].password);
            
            console.log("Created new MySQL connection pool for " + key);
        });
    }

    constructor() {
        throw "static class - do not construct";
    }
}

module.exports = MySQLManager;