const Config = require("./Config");

/**
 * Prepares a path and replaces placeholders like {pwdir}
 * @param {string} path 
 */
module.exports.generateErrorPage = (title, desc) => {
    return `<h1>${title}</h1>
            <span>${desc}</span>
            <br><hr>
            Powered by PoopWeb WebServer ${Config.version}
            
            <style>
                * {
                    font-family: Arial, Helvetica;
                }
            </style>`;
}