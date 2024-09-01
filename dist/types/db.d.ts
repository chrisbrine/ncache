import { CachingForEachFn, CachingKey, CachingValueTypes } from "./caching";
export interface SQLOptions {
    file: SQLFile;
    tablePrefix?: string;
}
export type SQLFile = string;
export interface SQLSchema {
    id: string;
    space: string;
    name: CachingKey;
    expire: number;
    value: string;
    type: string;
}
export type SQLForEachSpaceFn = (space: string) => void;
export type SQLForEachAllFn = (space: string, name: string, value: CachingValueTypes) => void;
export interface IDatabase {
    get(space: string, name: string): Promise<CachingValueTypes | null>;
    set(space: string, name: string, value: CachingValueTypes, expire?: number): Promise<null>;
    delete(space: string, name: string): Promise<null>;
    deleteSpace(space: string): Promise<null>;
    addSpace(space: string): Promise<null>;
    forEachSpace(callback: SQLForEachSpaceFn): Promise<null>;
    forEachAll(callback: SQLForEachAllFn): Promise<null>;
    forEach(space: string, callback: CachingForEachFn): Promise<null>;
    keys(space: string): Promise<string[]>;
    next(space: string, name: string): Promise<string | null>;
    nextSpace(space: string): Promise<string | null>;
    keysSpaces(): Promise<string[]>;
    size(space: string): Promise<number>;
    sizeSpaces(): Promise<number>;
    has(space: string, name: string): Promise<boolean>;
    hasSpace(space: string): Promise<boolean>;
    close(): Promise<null>;
}
