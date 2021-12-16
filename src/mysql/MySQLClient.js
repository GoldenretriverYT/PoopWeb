const mysql = require("mysql2");

class MySQLClient {
    /** @type {mysql.Pool} */
    #pool = null;

    constructor(host, db, username, password) {
        this.#pool = mysql.createPool({
            "database": db,
            "host": host,
            "user": username,
            "password": password
        });
    }

    query(query, args) {
        return new Promise((resolve, reject) => {
            this.#pool.query(query, args, (err, res, fields) => {
                if(err) {
                    reject("MySQL error: " + err);
                }
    
                resolve(res);
            });
        });
    }
}

module.exports = MySQLClient;