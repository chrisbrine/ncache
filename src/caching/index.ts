import {
  CachingMap,
  CachingValue,
  CachingKey,
  CachingOptions,
  CachingValueTypes,
  CachingJson,
} from "../types";

export class Caching {
  private cache: CachingMap;
  private options: CachingOptions;

  constructor(options = {} as CachingOptions) {
    this.options = options;
    this.cache = new Map<CachingKey, CachingValue>();
  }

  public set(
    key: CachingKey,
    value: CachingValueTypes,
    ttl = this.options.ttl
  ) {
    if (ttl < 0) {
      ttl = 0;
    }
    const cachingValue: CachingValue = { value, ttl, createdAt: Date.now() };
    this.cache.set(key, cachingValue);
  }

  public get(key: CachingKey): CachingValueTypes | null {
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

  public delete(key: CachingKey) {
    this.cache.delete(key);
  }

  public clear() {
    this.cache.clear();
  }

  public size() {
    return this.cache.size;
  }

  public keys() {
    return this.cache.keys();
  }

  public values() {
    return this.cache.values();
  }

  public entries() {
    return this.cache.entries();
  }

  public has(key: CachingKey) {
    return this.cache.has(key);
  }

  public forEach(
    callbackfn: (
      value: CachingValueTypes,
      key: CachingKey,
      map: CachingMap
    ) => void
  ) {
    this.cache.forEach((value, key) => {
      callbackfn(value.value, key, this.cache);
    });
  }

  public [Symbol.iterator]() {
    return this.cache[Symbol.iterator]();
  }

  public all() {
    return this.cache;
  }

  public json(): CachingJson {
    const json: CachingJson = {};
    this.cache.forEach((value, key) => {
      const result = this.get(key);
      if (result) {
        json[key] = result;
      }
    });
    return json;
  }

  public getOptions() {
    return this.options;
  }

  public setOptions(options: CachingOptions) {
    this.options = options;
  }
}
