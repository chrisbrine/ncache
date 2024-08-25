import { Caching } from "../caching";
import {
  TNamespace,
  NamespacesOptions,
  NamespaceMap,
  CachingOptions,
  CachingKey,
  NamespaceJson,
  CachingValueTypes,
  TNamespaces,
} from "../types";

const defaultOptions: NamespacesOptions = {
  namespaces: [],
  default: "default",
  protected: false,
  cachingOptions: {
    ttl: 600000,
  } as CachingOptions,
};

export class CachingSpaces {
  private namespaces: NamespaceMap;
  private options: NamespacesOptions;

  constructor(options = {} as NamespacesOptions) {
    this.options = defaultOptions;
    this.namespaces = new Map<TNamespace, Caching>();

    this.setOptions(options);
  }

  public all(): NamespaceMap {
    return this.namespaces;
  }

  public json(all = false): object {
    const namespaces: NamespaceJson = {};
    this.namespaces.forEach((caching, namespace) => {
      namespaces[namespace] = all ? caching.json() : caching;
    });
    return namespaces;
  }

  public getDefault(): TNamespace {
    return this.options.default;
  }

  public isProtected(): boolean {
    return this.options.protected;
  }

  public add(namespace: TNamespace) {
    this.options.namespaces.push(namespace);
    this.namespaces.set(namespace, new Caching(this.options.cachingOptions));
  }

  public remove(namespace: TNamespace, move?: TNamespace) {
    this.options.namespaces = this.options.namespaces.filter(
      (ns) => ns !== namespace,
    );
    this.namespaces.delete(namespace);
    if (move) {
      this.move(namespace, move);
    }
  }

  public clear() {
    this.namespaces.clear();
  }

  public size() {
    return this.namespaces.size;
  }

  public move(from: TNamespace, to: TNamespace) {
    const caching = this.namespaces.get(from);
    if (caching) {
      this.namespaces.set(to, caching);
      this.namespaces.delete(from);
    }
  }

  public has(namespace: TNamespace) {
    return this.namespaces.has(namespace);
  }

  public get(namespace: TNamespace, key: CachingKey): CachingValueTypes | null {
    const caching = this.namespaces.get(namespace);
    if (caching) {
      return caching.get(key);
    }
    return null;
  }

  public set(namespace: TNamespace, key: CachingKey, value: CachingValueTypes) {
    let caching = this.namespaces.get(namespace);
    if (!this.options.protected && !caching) {
      this.add(namespace);
      caching = this.namespaces.get(namespace);
    }
    if (caching) {
      caching.set(key, value);
    }
  }

  public delete(namespace: TNamespace, key: CachingKey) {
    const caching = this.namespaces.get(namespace);
    if (caching) {
      caching.delete(key);
    }
  }

  public getNamespace(namespace: TNamespace): Caching | null {
    return this.namespaces.get(namespace) || null;
  }

  public forEach(callback: (caching: Caching, namespace: TNamespace) => void) {
    this.namespaces.forEach(callback);
  }

  public keys(): TNamespaces {
    return Array.from(this.namespaces.keys());
  }

  public values(): Caching[] {
    return Array.from(this.namespaces.values());
  }

  public entries(): [TNamespace, Caching][] {
    return Array.from(this.namespaces.entries());
  }

  public [Symbol.iterator]() {
    return this.namespaces[Symbol.iterator]();
  }

  public getOptions(): NamespacesOptions {
    return this.options;
  }

  public setOptions(options: NamespacesOptions) {
    this.options = { ...this.options, ...options };

    if (!this.options.namespaces.includes(this.options.default)) {
      this.options.namespaces.push(this.options.default);
    }

    this.namespaces.forEach((caching, namespace) => {
      if (
        this.options.protected &&
        !this.options.namespaces.includes(namespace)
      ) {
        this.namespaces.delete(namespace);
      }
    });

    this.options.namespaces.forEach((namespace) => {
      if (!this.namespaces.has(namespace)) {
        this.namespaces.set(
          namespace,
          new Caching(this.options.cachingOptions),
        );
      }
    });
  }
}
