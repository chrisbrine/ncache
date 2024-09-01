"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSQLOptions = exports.getSQLDatabase = exports.SQLDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const SQLConnections = new Map();
const SQLDatabases = new Map();
class SQLDatabase {
    // private file: string;
    constructor(config) {
        this.config = config;
        this.tablePrefix = config.tablePrefix || "";
        if (SQLConnections.has(this.config.file)) {
            this.db = SQLConnections.get(this.config.file);
        }
        else {
            this.db = new sqlite3_1.default.Database(this.config.file, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE);
            SQLConnections.set(this.config.file, this.db);
        }
    }
    tableName(space) {
        return `${this.tablePrefix}${space}`;
    }
    convertValue(value, type) {
        if (type === "number") {
            return Number(value);
        }
        else if (type === "boolean") {
            return value === "true";
        }
        else if (type === "object") {
            return JSON.parse(value);
        }
        return value;
    }
    get(space, name) {
        return new Promise((resolve, reject) => {
            let value = null;
            this.db
                .prepare(`SELECT * FROM ${this.tableName(space)} WHERE name = ?`)
                .each([name], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (row.expire > 0 && Date.now() > row.expire) {
                    this.delete(space, name);
                    resolve(null);
                }
                else {
                    value = this.convertValue(row.value, row.type);
                    resolve(value);
                }
            });
        });
    }
    set(space, name, value, expire) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT OR REPLACE INTO ${this.tableName(space)} (space, name, value, expire, type) VALUES (?, ?, ?, ?, ?)`, expire
                ? [space, name, value, expire, typeof value]
                : [space, name, value, 0, typeof value], (err) => {
                console.log("set", err);
                if (err) {
                    console.log("err", err);
                    reject(err);
                }
                resolve(null);
            });
        });
    }
    delete(space, name) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName(space)} WHERE name = ?`, [name], (err) => {
                if (err) {
                    reject(err);
                }
                resolve(null);
            });
        });
    }
    deleteSpace(space) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName(space)}`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve(null);
            });
        });
    }
    addSpace(space) {
        // create table with ID and name as keys and name must be unique within the table
        // space, name as TEXT, and value as BLOB
        return new Promise((resolve, reject) => {
            this.db.run(`CREATE TABLE IF NOT EXISTS ${this.tableName(space)} (id INTEGER PRIMARY KEY, space STRING, name TEXT UNIQUE, value STRING, expire INTEGER, type TEXT)`, (err) => {
                if (err) {
                    reject(err);
                }
                console.log("added space");
                resolve(null);
            });
        });
    }
    forEachSpace(callback) {
        // reiterate over all tables in the database one by one, not with all at once
        return new Promise((resolve, reject) => {
            this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
                if (err) {
                    reject(err);
                }
                for (const row of rows) {
                    callback(row.name);
                }
                resolve(null);
            });
        });
    }
    forEach(space, callback) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName(space)}`, (err, row) => {
                if (err) {
                    reject(err);
                }
                const currentValue = this.convertValue(row.value, row.type);
                callback(currentValue, row.name);
            });
            resolve(null);
        });
    }
    forEachAll(callback) {
        return new Promise((resolve, reject) => {
            this.db
                .prepare("SELECT * FROM sqlite_master WHERE type='table'")
                .each((err, row) => {
                if (err) {
                    reject(err);
                }
                const space = row.name;
                const currentValue = this.convertValue(row.value, row.type);
                callback(space, row.name, currentValue);
            });
            resolve(null);
        });
    }
    keys(space) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT name FROM ${this.tableName(space)}`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                const keys = [];
                for (const row of rows) {
                    keys.push(row.name);
                }
                resolve(keys);
            });
        });
    }
    next(space, name) {
        return new Promise((resolve, reject) => {
            this.db.prepare(`SELECT name FROM ${this.tableName(space)} WHERE name > ? LIMIT 1`, [name], (err, rows) => {
                var _a;
                if (err) {
                    reject(err);
                }
                resolve(((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.name) || null);
            });
        });
    }
    nextSpace(space) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name > ? LIMIT 1", [space], (err, rows) => {
                var _a;
                if (err) {
                    reject(err);
                }
                resolve(((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.space) || null);
            });
        });
    }
    keysSpaces() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
                if (err) {
                    reject(err);
                }
                const keys = [];
                for (const row of Object.values(rows)) {
                    keys.push(row.name);
                }
                resolve(keys);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            try {
                this.db.close();
                SQLConnections.delete(this.config.file);
                resolve(null);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    size(space) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) FROM ${this.tableName(space)}`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows["COUNT(*)"]);
            });
        });
    }
    sizeSpaces() {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT COUNT(*) FROM sqlite_master WHERE type='table'", (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows["COUNT(*)"]);
            });
        });
    }
    has(space, name) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) FROM ${this.tableName(space)} WHERE name = ?`, [name], (err, rows) => {
                if (err) {
                    reject(err);
                }
                if (rows["COUNT(*)"] > 0) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }
    hasSpace(space) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) FROM ${this.tableName(space)}`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                if (rows["COUNT(*)"] > 0) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }
}
exports.SQLDatabase = SQLDatabase;
const getSQLDatabase = (config) => {
    const label = JSON.stringify(config);
    if (SQLDatabases.has(label)) {
        return SQLDatabases.get(label);
    }
    else {
        const db = new SQLDatabase(config);
        SQLDatabases.set(label, db);
        return db;
    }
};
exports.getSQLDatabase = getSQLDatabase;
const parseSQLOptions = (config) => {
    const options = {
        file: ":memory:",
        tablePrefix: "",
    };
    if (config) {
        if (typeof config === "string") {
            options.file = config;
        }
        else {
            options.file = config.file;
            options.tablePrefix = config.tablePrefix || "";
        }
    }
    return options;
};
exports.parseSQLOptions = parseSQLOptions;
