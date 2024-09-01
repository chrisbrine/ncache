import { CachingKey, CachingOptions, CachingValueTypes, CachingJson, CachingForEachFn } from "../types";
export declare class Caching {
    private space;
    private options;
    private db;
    constructor(space?: string, options?: CachingOptions);
    set(key: CachingKey, value: CachingValueTypes, ttl?: number): Promise<void>;
    get(key: CachingKey): Promise<CachingValueTypes | null>;
    delete(key: CachingKey): Promise<void>;
    clear(): Promise<void>;
    size(): Promise<number>;
    keys(): Promise<string[]>;
    values(): Promise<CachingValueTypes[]>;
    entries(): Promise<[string, CachingValueTypes][]>;
    has(key: CachingKey): Promise<boolean>;
    forEach(callbackfn: CachingForEachFn): Promise<void>;
    json(): Promise<CachingJson>;
    getOptions(): CachingOptions;
    setOptions(options: CachingOptions): void;
    getTTL(): number;
    setTTL(ttl: number): void;
}
