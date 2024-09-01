import { Caching } from "../caching";
import { TNamespace, NamespacesOptions, CachingKey, NamespaceJson, CachingValueTypes, TNamespaces, ForEachSpacesFn } from "../types";
export declare class CachingSpaces {
    private db;
    private namespaces;
    private default;
    private options;
    constructor(options?: NamespacesOptions);
    private getSpace;
    json(all?: boolean): Promise<NamespaceJson>;
    getDefault(): TNamespace;
    isProtected(): boolean;
    add(namespace: TNamespace): void;
    remove(namespace: TNamespace): Promise<void>;
    clear(): void;
    size(): number;
    has(namespace: TNamespace): Promise<boolean>;
    get(namespace: TNamespace, key: CachingKey): Promise<CachingValueTypes | null>;
    set(namespace: TNamespace, key: CachingKey, value: CachingValueTypes): Promise<void>;
    delete(namespace: TNamespace, key: CachingKey): Promise<void>;
    getNamespace(namespace: TNamespace): Promise<Caching | undefined>;
    forEach(callback: ForEachSpacesFn): Promise<void>;
    keys(): Promise<TNamespaces>;
    values(): Promise<Caching[]>;
    entries(): Promise<[TNamespace, Caching][]>;
    getOptions(): NamespacesOptions;
}
