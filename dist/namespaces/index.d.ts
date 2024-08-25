import { Caching } from "../caching";
import { TNamespace, NamespacesOptions, NamespaceMap, CachingKey, CachingValueTypes, TNamespaces } from "../types";
export declare class CachingSpaces {
    private namespaces;
    private options;
    constructor(options?: NamespacesOptions);
    all(): NamespaceMap;
    json(all?: boolean): object;
    getDefault(): TNamespace;
    isProtected(): boolean;
    add(namespace: TNamespace): void;
    remove(namespace: TNamespace, move?: TNamespace): void;
    clear(): void;
    size(): number;
    move(from: TNamespace, to: TNamespace): void;
    has(namespace: TNamespace): boolean;
    get(namespace: TNamespace, key: CachingKey): CachingValueTypes | null;
    set(namespace: TNamespace, key: CachingKey, value: CachingValueTypes): void;
    delete(namespace: TNamespace, key: CachingKey): void;
    getNamespace(namespace: TNamespace): Caching | null;
    forEach(callback: (caching: Caching, namespace: TNamespace) => void): void;
    keys(): TNamespaces;
    values(): Caching[];
    entries(): [TNamespace, Caching][];
    [Symbol.iterator](): IterableIterator<[string, Caching]>;
    getOptions(): NamespacesOptions;
    setOptions(options: NamespacesOptions): void;
}
