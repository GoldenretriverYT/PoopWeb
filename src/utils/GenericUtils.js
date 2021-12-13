const Config = require("./Config");

/**
 * Generates a error page based on title and desc
 * @param {string} title
 * @param {string} desc
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