"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caching = void 0;
const db_1 = require("../db");
const defaultOptions = {
    ttl: 600000,
    sql: {
        file: ":memory:",
    },
};
class Caching {
    constructor(space = "default", options = {}) {
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
        this.space = space;
        // only sql is supported for now
        this.db = (0, db_1.getSQLDatabase)((0, db_1.parseSQLOptions)(this.options.sql));
        this.db.addSpace(this.space);
        // this.cache = new Map<CachingKey, CachingValue>();
    }
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            const useTTL = ttl === undefined ? this.getTTL() : ttl;
            const expireTime = useTTL > 0 ? Date.now() + useTTL : 0;
            yield this.db.set(this.space, key, value, expireTime);
            // if (ttl < 0) {
            //   ttl = 0;
            // }
            // const cachingValue: CachingValue = { value, ttl, createdAt: Date.now() };
            // this.cache.set(key, cachingValue);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.get(this.space, key);
            // const item = this.cache.get(key);
            // if (!item) {
            //   return null;
            // }
            // // check ttl
            // if (item.ttl > 0 && Date.now() - item.createdAt > item.ttl) {
            //   this.cache.delete(key);
            //   return null;
            // }
            // return item.value;
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.delete(this.space, key);
            // this.cache.delete(key);
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.deleteSpace(this.space);
            // this.cache.clear();
        });
    }
    size() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.size(this.space);
            // return this.cache.size;
        });
    }
    keys() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.keys(this.space);
            // return this.cache.keys();
        });
    }
    values() {
        return __awaiter(this, void 0, void 0, function* () {
            const values = [];
            yield this.db.forEach(this.space, (key, value) => {
                values.push(value);
            });
            return values;
            // return this.cache.values();
        });
    }
    entries() {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = [];
            yield this.db.forEach(this.space, (value, key) => {
                entries.push([key, value]);
            });
            return entries;
            // return this.cache.entries();
        });
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.has(this.space, key);
            // return this.cache.has(key);
        });
    }
    forEach(callbackfn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.forEach(this.space, callbackfn);
            // this.cache.forEach((value, key) => {
            //   callbackfn(value.value, key, this.cache);
            // });
        });
    }
    // public [Symbol.iterator]() {
    //   return this.db[Symbol.iterator](
    // return this.cache[Symbol.iterator]();
    // }
    // public all() {
    //   const allItems: CachingJson = {};
    //   this.db.forEach(this.space, (value, key) => {
    //     allItems[key] = value;
    //   });
    //   return allItems;
    //   // return this.cache;
    // }
    json() {
        return __awaiter(this, void 0, void 0, function* () {
            const allItems = {};
            yield this.db.forEach(this.space, (value, key) => {
                allItems[key] = value;
            });
            return allItems;
            // const json: CachingJson = {};
            // this.cache.forEach((value, key) => {
            //   const result = this.get(key);
            //   if (result) {
            //     json[key] = result;
            //   }
            // });
            // return json;
        });
    }
    getOptions() {
        return this.options;
    }
    setOptions(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
    getTTL() {
        return this.options.ttl === undefined
            ? defaultOptions.ttl || 0
            : this.options.ttl;
    }
    setTTL(ttl) {
        this.options.ttl = ttl;
    }
}
exports.Caching = Caching;
