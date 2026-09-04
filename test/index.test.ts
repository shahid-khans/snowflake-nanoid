import { describe, it, expect } from "vitest";
import {
  SnowflakeNanoId,
  encode,
  decode,
  defaultGenerator,
} from "../src/index.js";

describe("base62 encode/decode", () => {
  it("round-trips edge and random values", () => {
    const samples = [0n, 1n, 61n, 62n, 63n, 3843n, 3844n, (1n << 63n) - 1n];
    for (const v of samples) {
      expect(decode(encode(v))).toBe(v);
    }
    for (let i = 0; i < 5000; i++) {
      const v = BigInt(Math.floor(Math.random() * 2 ** 40));
      expect(decode(encode(v))).toBe(v);
    }
  });

  it("encodes zero as the first alphabet char", () => {
    expect(encode(0n)).toBe("0");
  });

  it("never exceeds 11 chars for 63-bit values", () => {
    expect(encode((1n << 63n) - 1n).length).toBeLessThanOrEqual(11);
  });

  it("rejects negative input", () => {
    expect(() => encode(-1n)).toThrow(RangeError);
  });

  it("rejects invalid decode chars", () => {
    expect(() => decode("!!")).toThrow(SyntaxError);
  });
});

describe("SnowflakeNanoId", () => {
  it("produces strictly increasing ids", () => {
    const gen = new SnowflakeNanoId({ nodeId: 1 });
    let prev = gen.nextId();
    for (let i = 0; i < 200_000; i++) {
      const cur = gen.nextId();
      expect(cur > prev).toBe(true);
      prev = cur;
    }
  });

  it("generates no duplicates in a large burst", () => {
    const gen = new SnowflakeNanoId({ nodeId: 1 });
    const codes = new Set<string>();
    const total = 500_000;
    for (let i = 0; i < total; i++) {
      codes.add(gen.nextCode());
    }
    expect(codes.size).toBe(total);
  });

  it("unpacks fields correctly", () => {
    const gen = new SnowflakeNanoId({ nodeId: 7 });
    const before = BigInt(Date.now());
    const id = gen.nextId();
    const after = BigInt(Date.now());
    const { timestampMs, nodeId, sequence } = gen.unpack(id);
    expect(nodeId).toBe(7n);
    expect(timestampMs >= before && timestampMs <= after).toBe(true);
    expect(sequence >= 0n && sequence <= 4095n).toBe(true);
  });

  it("rejects out-of-range nodeId", () => {
    expect(() => new SnowflakeNanoId({ nodeId: 2000 })).toThrow(RangeError);
    expect(() => new SnowflakeNanoId({ nodeId: -1 })).toThrow(RangeError);
  });

  it("codes decode back to the original id", () => {
    const gen = new SnowflakeNanoId({ nodeId: 3 });
    for (let i = 0; i < 10_000; i++) {
      const id = gen.nextId();
      expect(decode(encode(id))).toBe(id);
    }
  });

  it("codes decode back to the original id 5", () => {
    const gen3 = new SnowflakeNanoId({ nodeId: 3 });
    const gen0 = new SnowflakeNanoId({ nodeId: 0 });
    // newFunction(gen3, 3);
    // newFunction(gen0, 0);
    newFunction(defaultGenerator, 1);
    function newFunction(gen: SnowflakeNanoId, nodeId: number) {
      for (let i = 0; i < 10; i++) {
        const id = gen.nextId();
        console.log("i =", i, "Original ID:", id);
        console.log("Encoded ID:", encode(id));
        console.log("Decoded ID:", decode(encode(id)));
        const { timestampMs, nodeId, sequence } = gen.unpack(id);
        console.log("Unpacked ID:", { timestampMs, nodeId, sequence });
        const date = new Date(Number(timestampMs));
        console.log("Date from timestampMs:", date);
        console.log(date.toString());
        expect(decode(encode(id))).toBe(id);
      }
    }
  });

  it("keeps ids distinct across different nodeIds", () => {
    const a = new SnowflakeNanoId({ nodeId: 1 });
    const b = new SnowflakeNanoId({ nodeId: 2 });
    const all = new Set<bigint>();
    for (let i = 0; i < 10_000; i++) {
      all.add(a.nextId());
      all.add(b.nextId());
    }
    expect(all.size).toBe(20_000);
  });
});
