import { getSQLDatabase, parseSQLOptions } from "../db";
import {
  // CachingMap,
  // CachingValue,
  CachingKey,
  CachingOptions,
  CachingValueTypes,
  CachingJson,
  CachingForEachFn,
  IDatabase,
} from "../types";

const defaultOptions: CachingOptions = {
  ttl: 600000,
  sql: {
    file: ":memory:",
  },
};

export class Caching {
  private space: string;
  // private cache: CachingMap;
  private options: CachingOptions;
  private db: IDatabase;

  constructor(space = "default", options = {} as CachingOptions) {
    this.options = { ...defaultOptions, ...options };
    this.space = space;
    // only sql is supported for now
    this.db = getSQLDatabase(parseSQLOptions(this.options.sql));
    this.db.addSpace(this.space);
    // this.cache = new Map<CachingKey, CachingValue>();
  }

  public async set(key: CachingKey, value: CachingValueTypes, ttl?: number) {
    const useTTL = ttl === undefined ? this.getTTL() : ttl;
    const expireTime = useTTL > 0 ? Date.now() + useTTL : 0;
    await this.db.set(this.space, key, value, expireTime);
    // if (ttl < 0) {
    //   ttl = 0;
    // }
    // const cachingValue: CachingValue = { value, ttl, createdAt: Date.now() };
    // this.cache.set(key, cachingValue);
  }

  public async get(key: CachingKey): Promise<CachingValueTypes | null> {
    return await this.db.get(this.space, key);
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
  }

  public async delete(key: CachingKey) {
    await this.db.delete(this.space, key);
    // this.cache.delete(key);
  }

  public async clear() {
    await this.db.deleteSpace(this.space);
    // this.cache.clear();
  }

  public async size() {
    return await this.db.size(this.space);
    // return this.cache.size;
  }

  public async keys() {
    return await this.db.keys(this.space);
    // return this.cache.keys();
  }

  public async values() {
    const values: CachingValueTypes[] = [];
    await this.db.forEach(this.space, (key, value) => {
      values.push(value);
    });
    return values;
    // return this.cache.values();
  }

  public async entries() {
    const entries: [CachingKey, CachingValueTypes][] = [];
    await this.db.forEach(this.space, (value, key) => {
      entries.push([key, value]);
    });
    return entries;
    // return this.cache.entries();
  }

  public async has(key: CachingKey) {
    return await this.db.has(this.space, key);
    // return this.cache.has(key);
  }

  public async forEach(callbackfn: CachingForEachFn) {
    await this.db.forEach(this.space, callbackfn);
    // this.cache.forEach((value, key) => {
    //   callbackfn(value.value, key, this.cache);
    // });
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

  public async json(): Promise<CachingJson> {
    const allItems: CachingJson = {};
    await this.db.forEach(this.space, (value, key) => {
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
  }

  public getOptions() {
    return this.options;
  }

  public setOptions(options: CachingOptions) {
    this.options = { ...this.options, ...options };
  }

  public getTTL(): number {
    return this.options.ttl === undefined
      ? defaultOptions.ttl || 0
      : this.options.ttl;
  }

  public setTTL(ttl: number) {
    this.options.ttl = ttl;
  }
}
