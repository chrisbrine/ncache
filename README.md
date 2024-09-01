# nCache

This is a basic caching library with namespace support and TTL expire support. This stores in an SQL database and can be done in either memory or in a specified file.

## How to use

There are two classes, [Caching] and [CachingSpaces].

Caching is just for basic caching without namespaces. If you want namespaces, then use CachingSpaces.

## Whats New in 1.0.0

Finally, a full version. The previous version is not compatible with this one but this is a more final form. Reason? Added promises and async/await support to the functions and classes. This will remain in place and is the final form for v1.

### Caching

Basic functionality would be:
`const caching = new Caching(Options)`

Options:

```
{
  ttl: number for time until expiry
  sql: filename for sql database
}
```

- Options would include an option of `ttl` in order to set the amount of time until a caching setting expires
- Can also set an option on the caching options of 'sql' which directs to an SQL file, otherwise it will store in memory
  `caching.set(Key, Value)`
- Key is the key value for what to set it to. It tends to be a string.
- Value is the value to set the key to which can be a string, number, boolean, array, or object
  `caching.get(Key)`
- Will get the current cache value for the given key
  `caching.delete(Key)`
- Will delete the current cache for the given key

There are others if you look at the class, but those are the basic functions.

### CachingSpaces

The basic functionality for this would be:
`const spaces = new CachingSpaces(Options)`

- Options include:

```
{
  namespaces: string[] // a list of namespace names first available
  default: string // the default namespace to use
  protected: boolean // protects from creating namespaces when setting a value if set true
  cachingOptions: {} // set to the caching options for the Caching class
}
```

`spaces.add(namespace)`

- Adds a new namespace
  `spaces.remove(namespace)`
- Removes a namespace
  `spaces.get(namespace, key)`
- Gets the caching key from the given namespace
  `spaces.set(namespace, key, value)`
- Sets the caching value to the caching key within the given namespace
  `spaces.delete(namespace, key)`
- Deletes the given caching key from the given namespace
