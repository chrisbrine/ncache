import { Caching } from "../caching";
import { CachingJson, CachingOptions } from "./caching";
export type ForEachSpacesFn = (caching: Caching, namespace: TNamespace) => void;
export type TNamespace = string;
export type TNamespaces = TNamespace[];
export interface NamespacesOptions {
    cachingOptions?: CachingOptions;
    namespaces?: TNamespaces;
    default?: TNamespace;
    protected?: boolean;
}
export type NamespaceMap = Map<TNamespace, Caching>;
export type NamespaceJson = Record<TNamespace, Caching | CachingJson>;
