import { SnowflakeNanoId, encode, decode } from 'snowflake-nanoid';

const gen = new SnowflakeNanoId({ nodeId: 42 });

for (let i = 0; i < 10; i++) {
  const id = gen.nextId();
  const encoded = encode(id);
  const decoded = decode(encoded);
  const unpacked = gen.unpack(id);
  const date = new Date(Number(unpacked.timestampMs));

  console.log(`Iteration ${i}:`);
  console.log(`  ID (BigInt): ${id}`);
  console.log(`  Encoded:     ${encoded}`);
  console.log(`  Decoded:     ${decoded}`);
  console.log(`  Unpacked:    `, unpacked);
  console.log(`  Date timestampMs UTC: ${date.toISOString()}`);
  console.log(`  Date timestampMs IST Local: ${date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log('---');
}

// output 

// npm start
// Iteration 0:
// ID(BigInt): 354289273912074240
// Encoded: QAeDLSun6e
// Decoded: 354289273912074240
// Unpacked: { timestampMs: 1788536345277n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.277Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 1:
// ID(BigInt): 354289274000154624
// Encoded: QAeDLYsMq0
// Decoded: 354289274000154624
// Unpacked: { timestampMs: 1788536345298n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.298Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 2:
// ID(BigInt): 354289274004348928
// Encoded: QAeDLZ9xy4
// Decoded: 354289274004348928
// Unpacked: { timestampMs: 1788536345299n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.299Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 3:
// ID(BigInt): 354289274008543232
// Encoded: QAeDLZRZ68
// Decoded: 354289274008543232
// Unpacked: { timestampMs: 1788536345300n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.300Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 4:
// ID(BigInt): 354289274012737536
// Encoded: QAeDLZjAEC
// Decoded: 354289274012737536
// Unpacked: { timestampMs: 1788536345301n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.301Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 5:
// ID(BigInt): 354289274016931840
// Encoded: QAeDLa0lMG
// Decoded: 354289274016931840
// Unpacked: { timestampMs: 1788536345302n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.302Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 6:
// ID(BigInt): 354289274016931841
// Encoded: QAeDLa0lMH
// Decoded: 354289274016931841
// Unpacked: { timestampMs: 1788536345302n, nodeId: 42n, sequence: 1n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.302Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 7:
// ID(BigInt): 354289274021126144
// Encoded: QAeDLaIMUK
// Decoded: 354289274021126144
// Unpacked: { timestampMs: 1788536345303n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.303Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 8:
// ID(BigInt): 354289274025320448
// Encoded: QAeDLaZxcO
// Decoded: 354289274025320448
// Unpacked: { timestampMs: 1788536345304n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.304Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---
//   Iteration 9:
// ID(BigInt): 354289274029514752
// Encoded: QAeDLarYkS
// Decoded: 354289274029514752
// Unpacked: { timestampMs: 1788536345305n, nodeId: 42n, sequence: 0n }
//   Date timestampMs UTC: 2026 -09-04T15: 39:05.305Z
//   Date timestampMs IST Local: 4 / 9 / 2026, 9:09:05 pm
// ---