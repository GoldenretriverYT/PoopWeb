const Config = require("./Config");

/**
 * Prepares a path and replaces placeholders like {pwdir}
 * @param {string} path 
 */
module.exports.preparePath = (path) => {
    return path
            .replace(/\{pwdir\}/g, Config.dirname);
}