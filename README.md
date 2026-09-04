# snowflake-nanoid

Unique, time-ordered, url friendly short codes — a Snowflake-style ID generator for Node.js / TypeScript.

## Features

- 🔢 **Unique** 63-bit ids, packed as `[ 41 timestamp | 10 node | 12 sequence ]`
- ⏱️ **Time-ordered** — ids and codes sort by creation time
- 🔡 **Alphanumeric short codes** — ≤ 11 characters, URL-safe
- 🧵 **Collision-free** — up to 4,096 ids/ms/node, 1,024 nodes
- 📦 **Zero runtime dependencies**, ESM + CJS + types

## Install

```bash
npm install snowflake-nanoid
```

## Usage

```ts
import { SnowflakeNanoId, encode, decode } from "snowflake-nanoid";

// nodeId: 0..1023, must be unique per process/instance
const gen = new SnowflakeNanoId({ nodeId: 1 });

const id = gen.nextId();     // 1234567890123n (bigint) unix time in milliseconds from epoch
const code = gen.nextCode(); // "aZ4k9P" (Alphanumeric string)

decode(encode(id)) === id;   // true
gen.unpack(id);              // { timestampMs, nodeId, sequence }
```

### Custom epoch

```ts
// Lower the epoch only if you must generate timestamps before current time
const gen = new SnowflakeNanoId({ nodeId: 1, epochMs: 1_577_836_800_000n }); // 2020-01-01
```

## ID layout

```
| 41 bits timestamp | 10 bits node id | 12 bits sequence |
```

| Scope | Capacity |
|-------|----------|
| Per node / ms | 4,096 ids |
| Per node / sec | ~4.1 million ids |
| Nodes | 1,024 |
| Lifespan | ~69 years from the given epoch |

> ⚠️ Each running process **must** use a **unique `nodeId`** to guarantee cross-instance uniqueness.

## Notes on the port

- Packed ids use **`bigint`** because JS `number` is only exact up to 2⁵³, while ids are 63-bit.
- Node.js is single-threaded, so `nextId()` is atomic without a compare-and-swap loop.

## License

MIT Shahid