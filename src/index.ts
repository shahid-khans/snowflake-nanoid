/**
 * Snowflake-style unique nanoId generator with alphanumberic short codes.
 *
 * Packed 63-bit layout:  [ 41 timestamp bits | 10 node bits | 12 sequence bits ]
 *
 * Node.js runs JavaScript on a single thread, so id generation is inherently
 * atomic (a synchronous function cannot be interrupted mid-execution). Uniqueness
 * therefore relies on the timestamp + monotonic sequence, exactly like the Java
 * version, without needing an actual compare-and-swap loop.
 *
 * JavaScript `number` is only safe up to 2^53 - 1, but the id is 63 bits wide,
 * so packed ids are represented as `bigint` to preserve exact values.
 */

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = BigInt(ALPHABET.length); // 62n

const CHAR_TO_INDEX: Record<string, bigint> = {};
for (let i = 0; i < ALPHABET.length; i++) {
  CHAR_TO_INDEX[ALPHABET[i]] = BigInt(i);
}

const NODE_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;

const MAX_NODE_ID = (1n << NODE_ID_BITS) - 1n; // 1023
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n; // 4095

const NODE_SHIFT = SEQUENCE_BITS; // 12
const TIMESTAMP_SHIFT = SEQUENCE_BITS + NODE_ID_BITS; // 22

/** Default custom epoch: 2024-01-01T00:00:00Z (compact ids, ~69 year lifespan). */
export const DEFAULT_EPOCH_MS = 1_704_067_200_000n;

export interface SnowflakeOptions {
  /** Worker/instance id in range [0, 1023]. Must be unique per process. */
  nodeId?: number;
  /** Custom epoch in ms. Must be <= the earliest timestamp you will generate. */
  epochMs?: bigint;
}

export interface UnpackedId {
  timestampMs: bigint;
  nodeId: bigint;
  sequence: bigint;
}
/**
 * SnowflakeNanoId generates unique, time-ordered 63-bit IDs using a combination of the current timestamp, a node ID, and a sequence number within the same millisecond. The IDs can be encoded as Base62 strings for compact representation.
 * options - configuration for the SnowflakeNanoId, including the node ID and custom epoch.
 * Returns: the next unique 63-bit ID as a bigint.
 */
export class SnowflakeNanoId {
  private readonly nodeId: bigint;
  private readonly epochMs: bigint;
  private lastTimestamp = -1n;
  private sequence = 0n;

  constructor(options: SnowflakeOptions = {}) {
    const nodeId = BigInt(options.nodeId ?? 1);
    if (nodeId < 0n || nodeId > MAX_NODE_ID) {
      throw new RangeError(`nodeId must be in [0, ${MAX_NODE_ID}]`);
    }
    this.nodeId = nodeId;
    this.epochMs = options.epochMs ?? DEFAULT_EPOCH_MS;
  }

  private currentRelativeMillis(): bigint {
    return BigInt(Date.now()) - this.epochMs;
  }

  /** Busy-waits until the clock advances past {@code last} (relative millis). */
  private waitForNextMillis(last: bigint): bigint {
    let ts = this.currentRelativeMillis();
    while (ts <= last) {
      ts = this.currentRelativeMillis();
    }
    return ts;
  }

  /** Generates the next unique, time-ordered 63-bit id as a bigint. */
  nextId(): bigint {
    let timestamp = this.currentRelativeMillis();

    if (timestamp > this.lastTimestamp) {
      // Fresh millisecond: restart the sequence.
      this.sequence = 0n;
    } else if (timestamp === this.lastTimestamp) {
      // Same millisecond: advance the sequence, rolling to the next ms on overflow.
      this.sequence = (this.sequence + 1n) & MAX_SEQUENCE;
      if (this.sequence === 0n) {
        timestamp = this.waitForNextMillis(this.lastTimestamp);
      }
    } else {
      // Clock moved backwards: stay monotonic by reusing the last timestamp.
      timestamp = this.lastTimestamp;
      this.sequence = (this.sequence + 1n) & MAX_SEQUENCE;
      if (this.sequence === 0n) {
        timestamp = this.waitForNextMillis(this.lastTimestamp);
      }
    }

    this.lastTimestamp = timestamp;
    return (
      (timestamp << TIMESTAMP_SHIFT) |
      (this.nodeId << NODE_SHIFT) |
      this.sequence
    );
  }

  /** Generates the next id already encoded as a Base62 short code. */
  nextCode(): string {
    return encode(this.nextId());
  }

  /** Splits a packed id back into its absolute timestamp, node id and sequence. */
  unpack(id: bigint): UnpackedId {
    const sequence = id & MAX_SEQUENCE;
    const nodeId = (id >> NODE_SHIFT) & MAX_NODE_ID;
    const timestampMs = (id >> TIMESTAMP_SHIFT) + this.epochMs;
    return { timestampMs, nodeId, sequence };
  }
}

/** Base62-encodes a non-negative bigint. */
export function encode(value: bigint): string {
  if (value < 0n) throw new RangeError("value must be non-negative");
  if (value === 0n) return ALPHABET[0];
  let result = "";
  let n = value;
  while (n > 0n) {
    const rem = Number(n % BASE);
    result = ALPHABET[rem] + result;
    n = n / BASE;
  }
  return result;
}

/** Decodes a Base62 string back into a bigint. */
export function decode(code: string): bigint {
  let acc = 0n;
  for (const ch of code) {
    const idx = CHAR_TO_INDEX[ch];
    if (idx === undefined) {
      throw new SyntaxError(`invalid base62 char: '${ch}'`);
    }
    acc = acc * BASE + idx;
  }
  return acc;
}

/** Convenience singleton (nodeId = 1, or NODE_ID env var if present). */
export const defaultGenerator = new SnowflakeNanoId({
  nodeId: process.env.NODE_ID ? Number(process.env.NODE_ID) : 1,
});
