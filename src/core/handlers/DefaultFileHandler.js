const fs = require("fs");
const { response, request } = require("express");

class DefaultFileHandler {
    /**
     * 
     * @param {string} filePath 
     * @param {request} req 
     * @param {response} res 
     */
    static handleFile(filePath, req, res) {
        res.status(200).send(fs.readFileSync(filePath).toString());
    }
}

module.exports = DefaultFileHandler;