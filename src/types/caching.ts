export type CachingValueTypes = string | number | boolean | object;

export type CachingKey = string;

export interface CachingValue {
  value: CachingValueTypes;
  ttl: number;
  createdAt: number;
}

export type CachingMap = Map<CachingKey, CachingValue>;

export interface CachingOptions {
  ttl: number;
}

export type CachingJson = {
  [key: CachingKey]: CachingValueTypes;
};
