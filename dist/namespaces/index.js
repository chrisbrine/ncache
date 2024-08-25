"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingSpaces = void 0;
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
        this.options = defaultOptions;
        this.namespaces = new Map();
        this.setOptions(options);
    }
    all() {
        return this.namespaces;
    }
    json(all = false) {
        const namespaces = {};
        this.namespaces.forEach((caching, namespace) => {
            namespaces[namespace] = all ? caching.json() : caching;
        });
        return namespaces;
    }
    getDefault() {
        return this.options.default;
    }
    isProtected() {
        return this.options.protected;
    }
    add(namespace) {
        this.options.namespaces.push(namespace);
        this.namespaces.set(namespace, new caching_1.Caching(this.options.cachingOptions));
    }
    remove(namespace, move) {
        this.options.namespaces = this.options.namespaces.filter((ns) => ns !== namespace);
        this.namespaces.delete(namespace);
        if (move) {
            this.move(namespace, move);
        }
    }
    clear() {
        this.namespaces.clear();
    }
    size() {
        return this.namespaces.size;
    }
    move(from, to) {
        const caching = this.namespaces.get(from);
        if (caching) {
            this.namespaces.set(to, caching);
            this.namespaces.delete(from);
        }
    }
    has(namespace) {
        return this.namespaces.has(namespace);
    }
    get(namespace, key) {
        const caching = this.namespaces.get(namespace);
        if (caching) {
            return caching.get(key);
        }
        return null;
    }
    set(namespace, key, value) {
        let caching = this.namespaces.get(namespace);
        if (!this.options.protected && !caching) {
            this.add(namespace);
            caching = this.namespaces.get(namespace);
        }
        if (caching) {
            caching.set(key, value);
        }
    }
    delete(namespace, key) {
        const caching = this.namespaces.get(namespace);
        if (caching) {
            caching.delete(key);
        }
    }
    getNamespace(namespace) {
        return this.namespaces.get(namespace) || null;
    }
    forEach(callback) {
        this.namespaces.forEach(callback);
    }
    keys() {
        return Array.from(this.namespaces.keys());
    }
    values() {
        return Array.from(this.namespaces.values());
    }
    entries() {
        return Array.from(this.namespaces.entries());
    }
    [Symbol.iterator]() {
        return this.namespaces[Symbol.iterator]();
    }
    getOptions() {
        return this.options;
    }
    setOptions(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
        if (!this.options.namespaces.includes(this.options.default)) {
            this.options.namespaces.push(this.options.default);
        }
        this.namespaces.forEach((caching, namespace) => {
            if (this.options.protected &&
                !this.options.namespaces.includes(namespace)) {
                this.namespaces.delete(namespace);
            }
        });
        this.options.namespaces.forEach((namespace) => {
            if (!this.namespaces.has(namespace)) {
                this.namespaces.set(namespace, new caching_1.Caching(this.options.cachingOptions));
            }
        });
    }
}
exports.CachingSpaces = CachingSpaces;
