import sqlite from "sqlite3";
import {
  CachingForEachFn,
  CachingKey,
  CachingValueTypes,
  IDatabase,
  SQLFile,
  SQLForEachAllFn,
  SQLForEachSpaceFn,
  SQLOptions,
  SQLSchema,
} from "../types";

const SQLConnections: Map<string, sqlite.Database> = new Map<
  string,
  sqlite.Database
>();

const SQLDatabases: Map<string, SQLDatabase> = new Map<string, SQLDatabase>();

export class SQLDatabase implements IDatabase {
  private db: sqlite.Database;
  private tablePrefix: string;
  // private file: string;

  constructor(private config: SQLOptions) {
    this.tablePrefix = config.tablePrefix || "";
    if (SQLConnections.has(this.config.file)) {
      this.db = SQLConnections.get(this.config.file) as sqlite.Database;
    } else {
      this.db = new sqlite.Database(
        this.config.file,
        sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
      );
      SQLConnections.set(this.config.file, this.db);
    }
  }

  private tableName(space: string): string {
    return `${this.tablePrefix}${space}`;
  }

  private convertValue(value: string, type: string): CachingValueTypes {
    if (type === "number") {
      return Number(value);
    } else if (type === "boolean") {
      return value === "true";
    } else if (type === "object") {
      return JSON.parse(value);
    }
    return value;
  }

  get(space: string, name: string): Promise<CachingValueTypes | null> {
    return new Promise((resolve, reject) => {
      let value: CachingValueTypes | null = null;
      this.db
        .prepare(`SELECT * FROM ${this.tableName(space)} WHERE name = ?`)
        .each([name], (err: Error, row: SQLSchema) => {
          if (err) {
            reject(err);
          }
          if (row.expire > 0 && Date.now() > row.expire) {
            this.delete(space, name);
            resolve(null);
          } else {
            value = this.convertValue(row.value, row.type);
            resolve(value);
          }
        });
    });
  }

  set(
    space: string,
    name: string,
    value: CachingValueTypes,
    expire?: number,
  ): Promise<null> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO ${this.tableName(space)} (space, name, value, expire, type) VALUES (?, ?, ?, ?, ?)`,
        expire
          ? [space, name, value, expire, typeof value]
          : [space, name, value, 0, typeof value],
        (err: Error) => {
          console.log("set", err);
          if (err) {
            console.log("err", err);
            reject(err);
          }
          resolve(null);
        },
      );
    });
  }

  delete(space: string, name: string): Promise<null> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM ${this.tableName(space)} WHERE name = ?`,
        [name],
        (err: Error) => {
          if (err) {
            reject(err);
          }
          resolve(null);
        },
      );
    });
  }

  deleteSpace(space: string): Promise<null> {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM ${this.tableName(space)}`, (err: Error) => {
        if (err) {
          reject(err);
        }
        resolve(null);
      });
    });
  }

  addSpace(space: string): Promise<null> {
    // create table with ID and name as keys and name must be unique within the table
    // space, name as TEXT, and value as BLOB
    return new Promise((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${this.tableName(space)} (id INTEGER PRIMARY KEY, space STRING, name TEXT UNIQUE, value STRING, expire INTEGER, type TEXT)`,
        (err: Error) => {
          if (err) {
            reject(err);
          }
          console.log("added space");
          resolve(null);
        },
      );
    });
  }

  forEachSpace(callback: SQLForEachSpaceFn): Promise<null> {
    // reiterate over all tables in the database one by one, not with all at once
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err: Error, rows: SQLSchema[]) => {
          if (err) {
            reject(err);
          }
          for (const row of rows) {
            callback(row.name);
          }
          resolve(null);
        },
      );
    });
  }

  forEach(space: string, callback: CachingForEachFn): Promise<null> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM ${this.tableName(space)}`,
        (err: Error, row: SQLSchema) => {
          if (err) {
            reject(err);
          }
          const currentValue = this.convertValue(row.value, row.type);
          callback(currentValue, row.name as CachingKey);
        },
      );
      resolve(null);
    });
  }

  forEachAll(callback: SQLForEachAllFn): Promise<null> {
    return new Promise((resolve, reject) => {
      this.db
        .prepare("SELECT * FROM sqlite_master WHERE type='table'")
        .each((err: Error, row: SQLSchema) => {
          if (err) {
            reject(err);
          }
          const space = row.name;
          const currentValue = this.convertValue(row.value, row.type);
          callback(space, row.name as CachingKey, currentValue);
        });
      resolve(null);
    });
  }

  keys(space: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT name FROM ${this.tableName(space)}`,
        (err: Error, rows: SQLSchema[]) => {
          if (err) {
            reject(err);
          }
          const keys: string[] = [];
          for (const row of rows) {
            keys.push(row.name);
          }
          resolve(keys);
        },
      );
    });
  }

  next(space: string, name: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.db.prepare(
        `SELECT name FROM ${this.tableName(space)} WHERE name > ? LIMIT 1`,
        [name],
        (err: Error, rows: SQLSchema[]) => {
          if (err) {
            reject(err);
          }
          resolve(rows[0]?.name || null);
        },
      );
    });
  }

  nextSpace(space: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name > ? LIMIT 1",
        [space],
        (err: Error, rows: SQLSchema[]) => {
          if (err) {
            reject(err);
          }
          resolve(rows[0]?.space || null);
        },
      );
    });
  }

  keysSpaces(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err: Error, rows: SQLSchema[]) => {
          if (err) {
            reject(err);
          }
          const keys: string[] = [];
          for (const row of Object.values(rows)) {
            keys.push(row.name);
          }
          resolve(keys);
        },
      );
    });
  }

  close(): Promise<null> {
    return new Promise((resolve, reject) => {
      try {
        this.db.close();
        SQLConnections.delete(this.config.file);
        resolve(null);
      } catch (err) {
        reject(err);
      }
    });
  }

  size(space: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) FROM ${this.tableName(space)}`,
        (err: Error, rows: Record<string, unknown>) => {
          if (err) {
            reject(err);
          }
          resolve((rows as Record<string, number>)["COUNT(*)"]);
        },
      );
    });
  }

  sizeSpaces(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT COUNT(*) FROM sqlite_master WHERE type='table'",
        (err: Error, rows: Record<string, unknown>) => {
          if (err) {
            reject(err);
          }
          resolve((rows as Record<string, number>)["COUNT(*)"]);
        },
      );
    });
  }

  has(space: string, name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) FROM ${this.tableName(space)} WHERE name = ?`,
        [name],
        (err: Error, rows: Record<string, unknown>) => {
          if (err) {
            reject(err);
          }
          if ((rows as Record<string, number>)["COUNT(*)"] > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
      );
    });
  }

  hasSpace(space: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) FROM ${this.tableName(space)}`,
        (err: Error, rows: Record<string, unknown>[]) => {
          if (err) {
            reject(err);
          }
          if ((rows as unknown as Record<string, number>)["COUNT(*)"] > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
      );
    });
  }
}

export const getSQLDatabase = (config: SQLOptions): SQLDatabase => {
  const label = JSON.stringify(config);
  if (SQLDatabases.has(label)) {
    return SQLDatabases.get(label) as SQLDatabase;
  } else {
    const db = new SQLDatabase(config);
    SQLDatabases.set(label, db);
    return db;
  }
};

export const parseSQLOptions = (
  config: SQLOptions | null | undefined | SQLFile,
): SQLOptions => {
  const options: SQLOptions = {
    file: ":memory:",
    tablePrefix: "",
  };
  if (config) {
    if (typeof config === "string") {
      options.file = config;
    } else {
      options.file = config.file;
      options.tablePrefix = config.tablePrefix || "";
    }
  }
  return options;
};
