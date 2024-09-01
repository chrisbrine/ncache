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
exports.CachingSpaces = void 0;
const db_1 = require("../db");
const caching_1 = require("../caching");
const defaultOptions = {
    namespaces: [],
    default: "default",
    protected: false,
    cachingOptions: {
        ttl: 600000,
    },
};
class CachingSpaces {
    constructor(options = {}) {
        var _a, _b, _c, _d;
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
        this.namespaces = new Map();
        this.db = (0, db_1.getSQLDatabase)((0, db_1.parseSQLOptions)((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.cachingOptions) === null || _b === void 0 ? void 0 : _b.sql));
        this.default = this.options.default || "default";
        if (!((_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.namespaces) === null || _d === void 0 ? void 0 : _d.includes(this.default))) {
            if (!this.options.namespaces) {
                this.options.namespaces = [];
            }
            this.options.namespaces.push(this.default);
        }
        this.options.namespaces.forEach((namespace) => {
            this.add(namespace);
        });
        // this.setOptions(options);
    }
    // public all(): NamespaceMap {
    //   return this.namespaces;
    // }
    getSpace(space_1) {
        return __awaiter(this, arguments, void 0, function* (space, allowCreate = true) {
            if (this.namespaces.has(space)) {
                return this.namespaces.get(space);
            }
            else if (yield this.db.hasSpace(space)) {
                this.add(space);
                return this.namespaces.get(space);
            }
            else if (!this.options.protected && allowCreate) {
                yield this.db.addSpace(space);
                this.add(space);
                return this.namespaces.get(space);
            }
            else {
                return undefined;
            }
        });
    }
    json() {
        return __awaiter(this, arguments, void 0, function* (all = false) {
            const namespaces = {};
            const spaces = yield this.db.keysSpaces();
            for (const space of spaces) {
                const item = yield this.getSpace(space);
                if (all && item) {
                    namespaces[space] = all ? yield item.json() : item;
                }
            }
            return namespaces;
            // this.namespaces.forEach((caching, namespace) => {
            //   namespaces[namespace] = all ? caching.json() : caching;
            // });
            // return namespaces;
        });
    }
    getDefault() {
        return this.default;
    }
    isProtected() {
        var _a;
        return ((_a = this.options) === null || _a === void 0 ? void 0 : _a.protected) || false;
    }
    add(namespace) {
        if (!this.options.namespaces) {
            this.options.namespaces = [];
        }
        this.options.namespaces.push(namespace);
        this.namespaces.set(namespace, new caching_1.Caching(namespace, this.options.cachingOptions));
    }
    // public remove(namespace: TNamespace, move?: TNamespace) {
    remove(namespace) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.namespaces) {
                this.options.namespaces = [];
            }
            this.options.namespaces = this.options.namespaces.filter((ns) => ns !== namespace);
            this.namespaces.delete(namespace);
            yield this.db.deleteSpace(namespace);
            // if (move) {
            //   this.move(namespace, move);
            // }
        });
    }
    clear() {
        this.namespaces.clear();
    }
    size() {
        return this.namespaces.size;
    }
    // public move(from: TNamespace, to: TNamespace) {
    //   const caching = this.namespaces.get(from);
    //   if (caching) {
    //     this.namespaces.set(to, caching);
    //     this.namespaces.delete(from);
    //   }
    // }
    has(namespace) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.hasSpace(namespace);
            // return this.namespaces.has(namespace);
        });
    }
    get(namespace, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const caching = yield this.getSpace(namespace, false);
            if (caching) {
                return yield caching.get(key);
            }
            return null;
        });
    }
    set(namespace, key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const caching = yield this.getSpace(namespace);
            if (caching) {
                yield caching.set(key, value);
            }
        });
    }
    delete(namespace, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const caching = yield this.getSpace(namespace, false);
            if (caching) {
                yield caching.delete(key);
            }
        });
    }
    getNamespace(namespace) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getSpace(namespace, false);
        });
    }
    forEach(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.forEachSpace((space) => __awaiter(this, void 0, void 0, function* () {
                const item = yield this.getSpace(space);
                if (item) {
                    callback(item, space);
                }
            }));
            // this.namespaces.forEach(callback);
        });
    }
    keys() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.keysSpaces();
            // return Array.from(this.namespaces.keys());
        });
    }
    values() {
        return __awaiter(this, void 0, void 0, function* () {
            const values = [];
            yield this.db.forEachSpace((space) => __awaiter(this, void 0, void 0, function* () {
                const item = yield this.getSpace(space);
                if (item) {
                    values.push(item);
                }
            }));
            return values;
            // return Array.from(this.namespaces.values());
        });
    }
    entries() {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = [];
            yield this.db.forEachSpace((space) => __awaiter(this, void 0, void 0, function* () {
                const item = yield this.getSpace(space);
                if (item) {
                    entries.push([space, item]);
                }
            }));
            return entries;
            // return Array.from(this.namespaces.entries());
        });
    }
    // public [Symbol.iterator]() {
    //   return this.namespaces[Symbol.iterator]();
    // }
    getOptions() {
        return this.options;
    }
}
exports.CachingSpaces = CachingSpaces;
