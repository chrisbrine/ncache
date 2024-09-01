import { getSQLDatabase, parseSQLOptions } from "../db";
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
  ForEachSpacesFn,
  IDatabase,
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
  private db: IDatabase;
  private namespaces: NamespaceMap;
  private default: TNamespace;
  private options: NamespacesOptions;

  constructor(options = {} as NamespacesOptions) {
    this.options = { ...defaultOptions, ...options };
    this.namespaces = new Map<TNamespace, Caching>();
    this.db = getSQLDatabase(
      parseSQLOptions(this.options?.cachingOptions?.sql),
    );
    this.default = this.options.default || "default";

    if (!this.options?.namespaces?.includes(this.default)) {
      if (!this.options.namespaces) {
        this.options.namespaces = [];
      }
      this.options.namespaces.push(this.default);
    }

    this.options.namespaces.forEach((namespace) => {
      this.add(namespace);
    });

    // this.setOptions(options);
  }

  // public all(): NamespaceMap {
  //   return this.namespaces;
  // }

  private async getSpace(
    space: string,
    allowCreate = true,
  ): Promise<Caching | undefined> {
    if (this.namespaces.has(space)) {
      return this.namespaces.get(space);
    } else if (await this.db.hasSpace(space)) {
      this.add(space);
      return this.namespaces.get(space);
    } else if (!this.options.protected && allowCreate) {
      await this.db.addSpace(space);
      this.add(space);
      return this.namespaces.get(space);
    } else {
      return undefined;
    }
  }

  public async json(all = false): Promise<NamespaceJson> {
    const namespaces: NamespaceJson = {};
    const spaces = await this.db.keysSpaces();
    for (const space of spaces) {
      const item = await this.getSpace(space);
      if (all && item) {
        namespaces[space] = all ? await item.json() : item;
      }
    }
    return namespaces;
    // this.namespaces.forEach((caching, namespace) => {
    //   namespaces[namespace] = all ? caching.json() : caching;
    // });
    // return namespaces;
  }

  public getDefault(): TNamespace {
    return this.default;
  }

  public isProtected(): boolean {
    return this.options?.protected || false;
  }

  public add(namespace: TNamespace) {
    if (!this.options.namespaces) {
      this.options.namespaces = [];
    }
    this.options.namespaces.push(namespace);
    this.namespaces.set(
      namespace,
      new Caching(namespace, this.options.cachingOptions),
    );
  }

  // public remove(namespace: TNamespace, move?: TNamespace) {
  public async remove(namespace: TNamespace) {
    if (!this.options.namespaces) {
      this.options.namespaces = [];
    }
    this.options.namespaces = this.options.namespaces.filter(
      (ns) => ns !== namespace,
    );
    this.namespaces.delete(namespace);
    await this.db.deleteSpace(namespace);
    // if (move) {
    //   this.move(namespace, move);
    // }
  }

  public clear() {
    this.namespaces.clear();
  }

  public size() {
    return this.namespaces.size;
  }

  // public move(from: TNamespace, to: TNamespace) {
  //   const caching = this.namespaces.get(from);
  //   if (caching) {
  //     this.namespaces.set(to, caching);
  //     this.namespaces.delete(from);
  //   }
  // }

  public async has(namespace: TNamespace) {
    return await this.db.hasSpace(namespace);
    // return this.namespaces.has(namespace);
  }

  public async get(
    namespace: TNamespace,
    key: CachingKey,
  ): Promise<CachingValueTypes | null> {
    const caching = await this.getSpace(namespace, false);
    if (caching) {
      return await caching.get(key);
    }
    return null;
  }

  public async set(
    namespace: TNamespace,
    key: CachingKey,
    value: CachingValueTypes,
  ) {
    const caching = await this.getSpace(namespace);
    if (caching) {
      await caching.set(key, value);
    }
  }

  public async delete(namespace: TNamespace, key: CachingKey) {
    const caching = await this.getSpace(namespace, false);
    if (caching) {
      await caching.delete(key);
    }
  }

  public async getNamespace(
    namespace: TNamespace,
  ): Promise<Caching | undefined> {
    return await this.getSpace(namespace, false);
  }

  public async forEach(callback: ForEachSpacesFn) {
    await this.db.forEachSpace(async (space) => {
      const item = await this.getSpace(space);
      if (item) {
        callback(item, space);
      }
    });
    // this.namespaces.forEach(callback);
  }

  public async keys(): Promise<TNamespaces> {
    return await this.db.keysSpaces();
    // return Array.from(this.namespaces.keys());
  }

  public async values(): Promise<Caching[]> {
    const values: Caching[] = [];
    await this.db.forEachSpace(async (space) => {
      const item = await this.getSpace(space);
      if (item) {
        values.push(item);
      }
    });
    return values;
    // return Array.from(this.namespaces.values());
  }

  public async entries(): Promise<[TNamespace, Caching][]> {
    const entries: [TNamespace, Caching][] = [];
    await this.db.forEachSpace(async (space) => {
      const item = await this.getSpace(space);
      if (item) {
        entries.push([space, item]);
      }
    });
    return entries;
    // return Array.from(this.namespaces.entries());
  }

  // public [Symbol.iterator]() {
  //   return this.namespaces[Symbol.iterator]();
  // }

  public getOptions(): NamespacesOptions {
    return this.options;
  }

  // public setOptions(options: NamespacesOptions) {
  //   this.options = { ...this.options, ...options };
  //   const spaces = this.db.keysSpaces();

  //   if (!this.options.namespaces.includes(this.options.default)) {
  //     this.options.namespaces.push(this.options.default);
  //     this.add(this.options.default);
  //   }

  //   this.namespaces.forEach((caching, namespace) => {
  //     if (
  //       this.options.protected &&
  //       !this.options.namespaces.includes(namespace)
  //     ) {
  //       this.namespaces.delete(namespace);
  //     }
  //   });

  //   this.options.namespaces.forEach((namespace) => {
  //     if (!this.namespaces.has(namespace)) {
  //       this.namespaces.set(
  //         namespace,
  //         new Caching(namespace, this.options.cachingOptions),
  //       );
  //     }
  //   });
  // }
}
