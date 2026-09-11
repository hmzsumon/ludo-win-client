import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
let now = 0, callback, cancelled = false, count = 0;
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/aviator/participantReveal.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  module, exports: module.exports, Date: { now: () => now }, Math,
  setTimeout: fn => { callback = fn; return 1; }, clearTimeout: () => { cancelled = true; },
});
const schedule = module.exports.scheduleParticipantReveal;
const cleanup = schedule('WAITING', 1000, 0, 500, () => count++);
now = 100; callback(); assert.equal(count, 1);
// Callback queued while waiting cannot add entries at or after progress completion.
now = 1000; callback(); assert.equal(count, 1);
now = 1100; callback(); assert.equal(count, 1);
assert.equal(schedule('WAITING', 1000, 1, 500, () => count++), undefined);
now = 0;
assert.equal(schedule('RUNNING', 1000, 1, 500, () => count++), undefined);
assert.equal(schedule('CRASHED', 1000, 1, 500, () => count++), undefined);
assert.equal(schedule('WAITING', 1000, 500, 500, () => count++), undefined);
cleanup(); assert.equal(cancelled, true);
schedule('WAITING', 2000, 0, 500, () => count++); callback(); assert.equal(count, 2);
console.log('PASS: waiting-only reveal, exact deadline, delayed callbacks, running/crashed freeze, cancellation and next round');
