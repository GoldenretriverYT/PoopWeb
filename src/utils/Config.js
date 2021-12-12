const fs = require("fs");
const PathUtils = require("./PathUtils");

class Config {
    static initiliazed = false;
    static dirname = "";
    static version = "v0.2.0";

    static config = {
        "portHttp": 80,
        "hostDirectory": "{pwdir}/www/",
        "log": "{pwdir}/log/",
        "extensionHandlers": {
            "pw": "poopscript",
            "default": "sendfile"
        },
        "poopscriptSettings": {
            /**
             * @type {"print_error"|"http500"}
             */
            "errorHandling": "print_error",
            "mysql": {
                "example": {
                    "host": "localhost",
                    "username": "myusername",
                    "password": "mypassword",
                    "database": "mydatabase"
                }
            }
        }
    }

    static init() {
        if(!fs.existsSync(PathUtils.preparePath("{pwdir}/conf/"))) {
            console.log("Creating path /conf/");
            fs.mkdirSync(PathUtils.preparePath("{pwdir}/conf/"));
        }

        if(!fs.existsSync(PathUtils.preparePath("{pwdir}/conf/config.json"))) {
            console.log("No config.json found, creating it...");
            fs.writeFileSync(PathUtils.preparePath("{pwdir}/conf/config.json"), JSON.stringify(Config.config, null, 4));
        }

        Config.config = JSON.parse(fs.readFileSync(PathUtils.preparePath("{pwdir}/conf/config.json")).toString());
        Config.initiliazed = true;
    }
}

module.exports = Config;