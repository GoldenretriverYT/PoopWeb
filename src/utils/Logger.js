const fs = require("fs");
const PathUtils = require("./PathUtils");
const Config = require("./Config");

class Logger {
    static preparedPath = null;

    static log(str) {
        fs.appendFileSync(this.preparedPath, "\n[LOG] " + this.generatePrefix() + str.toString());
    }

    static warn(str) {
        fs.appendFileSync(this.preparedPath, "\n[WARN] " + this.generatePrefix() + str.toString());
    }
    static error(str) {
        fs.appendFileSync(this.preparedPath, "\n[ERROR] " + this.generatePrefix() + str.toString());
    }

    static init() {
        if(!Config.initiliazed) {
            throw "Config must be initiliazed before Logger!";
        }

        this.preparedPath = PathUtils.preparePath(Config.config.log + "/poopweb.log");

        if(!fs.existsSync(PathUtils.preparePath(Config.config.log))) {
            fs.mkdirSync(PathUtils.preparePath(Config.config.log));
        }

        if(!fs.existsSync(this.preparedPath)) {
            fs.writeFileSync(this.preparedPath, "=== Start of PoopWeb log ===");
        }
    }

    static generatePrefix() {
        var d = new Date(Date.now());
        return "[" + this.intDigits(d.getDate(), 2) + "/" + this.intDigits(d.getMonth()+1, 2) + "/" + this.intDigits(d.getFullYear(), 4) + " " + this.intDigits(d.getHours(), 2) + ":" + this.intDigits(d.getMinutes(), 2) + ":" + this.intDigits(d.getSeconds(), 2) + "] ";     
    }

    /**
     * 
     * @param {Number} int 
     * @param {*} digits 
     * @returns 
     */
    static intDigits(int, digits) {
        return int.toLocaleString("en", {useGrouping: false, minimumIntegerDigits: digits});
    }
}

module.exports = Logger;