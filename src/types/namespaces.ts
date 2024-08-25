import { Caching } from "../caching";
import { CachingJson, CachingOptions } from "./caching";

export type TNamespace = string;
export type TNamespaces = TNamespace[];

export interface NamespacesOptions {
  cachingOptions: CachingOptions;
  namespaces: TNamespaces;
  default: TNamespace;
  protected: boolean;
}

export type NamespaceMap = Map<TNamespace, Caching>;

export type NamespaceJson = {
  [key: TNamespace]: Caching | CachingJson;
};
