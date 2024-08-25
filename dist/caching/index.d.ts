import { CachingMap, CachingValue, CachingKey, CachingOptions, CachingValueTypes, CachingJson } from "../types";
export declare class Caching {
    private cache;
    private options;
    constructor(options?: CachingOptions);
    set(key: CachingKey, value: CachingValueTypes, ttl?: number): void;
    get(key: CachingKey): CachingValueTypes | null;
    delete(key: CachingKey): void;
    clear(): void;
    size(): number;
    keys(): IterableIterator<string>;
    values(): IterableIterator<CachingValue>;
    entries(): IterableIterator<[string, CachingValue]>;
    has(key: CachingKey): boolean;
    forEach(callbackfn: (value: CachingValueTypes, key: CachingKey, map: CachingMap) => void): void;
    [Symbol.iterator](): IterableIterator<[string, CachingValue]>;
    all(): CachingMap;
    json(): CachingJson;
    getOptions(): CachingOptions;
    setOptions(options: CachingOptions): void;
}
