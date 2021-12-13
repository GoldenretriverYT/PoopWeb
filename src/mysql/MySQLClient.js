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
        this.#pool.query(query, args, (err, res, fields) => {
            if(err) {
                throw "MySQL error: " + err;
            }

            return res;
        });
    }
}

module.exports = MySQLClient;