import { SQLFile, SQLOptions } from "./db";

export type CachingForEachFn = (
  value: CachingValueTypes,
  key: CachingKey,
) => void;

export type CachingValueTypes = string | number | boolean | object;

export type CachingKey = string;

// export interface CachingValue {
//   value: CachingValueTypes;
//   ttl: number;
//   createdAt: number;
// }

// export type CachingMap = Map<CachingKey, CachingValue>;

export interface CachingOptions {
  ttl?: number;
  sql?: SQLOptions | SQLFile;
}

export type CachingJson = Record<CachingKey, CachingValueTypes>;
