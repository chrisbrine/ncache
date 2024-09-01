import { CachingForEachFn, CachingValueTypes, IDatabase, SQLFile, SQLForEachAllFn, SQLForEachSpaceFn, SQLOptions } from "../types";
export declare class SQLDatabase implements IDatabase {
    private config;
    private db;
    private tablePrefix;
    constructor(config: SQLOptions);
    private tableName;
    private convertValue;
    get(space: string, name: string): Promise<CachingValueTypes | null>;
    set(space: string, name: string, value: CachingValueTypes, expire?: number): Promise<null>;
    delete(space: string, name: string): Promise<null>;
    deleteSpace(space: string): Promise<null>;
    addSpace(space: string): Promise<null>;
    forEachSpace(callback: SQLForEachSpaceFn): Promise<null>;
    forEach(space: string, callback: CachingForEachFn): Promise<null>;
    forEachAll(callback: SQLForEachAllFn): Promise<null>;
    keys(space: string): Promise<string[]>;
    next(space: string, name: string): Promise<string | null>;
    nextSpace(space: string): Promise<string | null>;
    keysSpaces(): Promise<string[]>;
    close(): Promise<null>;
    size(space: string): Promise<number>;
    sizeSpaces(): Promise<number>;
    has(space: string, name: string): Promise<boolean>;
    hasSpace(space: string): Promise<boolean>;
}
export declare const getSQLDatabase: (config: SQLOptions) => SQLDatabase;
export declare const parseSQLOptions: (config: SQLOptions | null | undefined | SQLFile) => SQLOptions;
