"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caching = void 0;
class Caching {
    constructor(options = {}) {
        this.options = options;
        this.cache = new Map();
    }
    set(key, value, ttl = this.options.ttl) {
        if (ttl < 0) {
            ttl = 0;
        }
        const cachingValue = { value, ttl, createdAt: Date.now() };
        this.cache.set(key, cachingValue);
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        // check ttl
        if (item.ttl > 0 && Date.now() - item.createdAt > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
    keys() {
        return this.cache.keys();
    }
    values() {
        return this.cache.values();
    }
    entries() {
        return this.cache.entries();
    }
    has(key) {
        return this.cache.has(key);
    }
    forEach(callbackfn) {
        this.cache.forEach((value, key) => {
            callbackfn(value.value, key, this.cache);
        });
    }
    [Symbol.iterator]() {
        return this.cache[Symbol.iterator]();
    }
    all() {
        return this.cache;
    }
    json() {
        const json = {};
        this.cache.forEach((value, key) => {
            const result = this.get(key);
            if (result) {
                json[key] = result;
            }
        });
        return json;
    }
    getOptions() {
        return this.options;
    }
    setOptions(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
    setTTL(ttl) {
        this.options.ttl = ttl;
    }
}
exports.Caching = Caching;
