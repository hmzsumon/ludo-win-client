import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import ts from "typescript";

const effects = [], refs = [], messages = [], listeners = {}, socketHandlers = {};
const requests = [];
let checkStale;
const frame = { postMessage: (data) => messages.push(data) };
const react = {
  useRef: (value) => { const ref = { current: refs.length ? value : { contentWindow: frame } }; refs.push(ref); return ref; },
  useState: (value) => [value, () => {}],
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  useEffect: (fn) => effects.push(fn),
  createElement: () => null,
};
const source = ts.transpileModule(fs.readFileSync("components/aviator/AviatorBridge.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
}).outputText;
const exports = {};
vm.runInNewContext(source, {
  exports, React: react,
  window: { location: { origin: "https://game.example" }, addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener() {}, setInterval: (fn) => { checkStale = fn; return 1; }, clearInterval() {} },
  document: { visibilityState: "visible", addEventListener() {}, removeEventListener() {} },
  localStorage: { getItem: () => null },
  require: (name) => {
    if (name === "react") return react;
    if (name === "next/navigation") return { useRouter: () => ({}) };
    if (name === "socket.io-client") return { io: () => ({ connected: true, on: (name, fn) => { socketHandlers[name] = fn; }, emit: (name) => requests.push(name), disconnect() {} }) };
    if (name.includes("authApi")) return { useLoadUserQuery: () => ({ refetch() {} }) };
    if (name === "./types") return { EMPTY_AVIATOR_GAME: { roundId: "", phase: "WAITING", bets: [] } };
    if (name === "./participantReveal") return { scheduleParticipantReveal() {} };
    return {};
  },
});
exports.default();
effects.forEach(fn => fn());
listeners.focus();
listeners.pageshow();
assert.deepEqual(requests, ["AVIATOR_JOIN", "AVIATOR_JOIN"]);
checkStale();
assert.equal(requests.length, 2, "fresh connections should not poll");
const snapshot = { roundId: "live-1", phase: "RUNNING", multiplier: 2, startsAt: 100, bets: [] };
socketHandlers.AVIATOR_SNAPSHOT(snapshot);
messages.length = 0;
const ready = { origin: "https://game.example", source: frame, data: { source: "AVIATOR_COCOS", type: "COCOS_READY" } };
listeners.message({ ...ready, origin: "https://untrusted.example" });
listeners.message({ ...ready, source: {} });
assert.equal(messages.length, 0);
listeners.message(ready);
assert.deepEqual(messages.map(m => m.type), ["ROUND_STATE", "ROUND_TICK", "LIVE_BETS"]);
assert.equal(messages[0].payload.phase, "RUNNING");
messages.length = 0;
socketHandlers.AVIATOR_SNAPSHOT({ ...snapshot, multiplier: 3 });
assert.deepEqual(messages.map(m => m.type), ["ROUND_TICK"]);
socketHandlers.AVIATOR_TICK({ multiplier: 4 });
messages.length = 0;
listeners.message(ready);
assert.equal(messages[0].payload.multiplier, 4);
socketHandlers.AVIATOR_SNAPSHOT({ ...snapshot, phase: "CRASHED", multiplier: 4 });
messages.length = 0;
listeners.message(ready);
assert.deepEqual(messages.map(m => m.type), ["ROUND_STATE", "ROUND_TICK", "ROUND_CRASHED", "LIVE_BETS"]);
console.log("PASS: delayed canvas/reload synchronization, trusted ready messages, latest tick/crash replay, and no reset on bet snapshots");
messages.length = 0;
socketHandlers.AVIATOR_TICK({ roundId: "live-2", multiplier: 1.25 });
assert.equal(messages[0].type, "ROUND_STATE");
assert.equal(messages[0].payload.phase, "RUNNING");
assert.equal(messages[0].payload.roundId, "live-2");
socketHandlers.AVIATOR_CRASHED({ roundId: "live-2", crashPoint: 1.5 });
messages.length = 0;
listeners.message(ready);
assert.equal(messages[0].payload.phase, "CRASHED");
assert.equal(messages[0].payload.multiplier, 1.5);
console.log("PASS: missed RUNNING snapshot recovery and crash synchronization on re-entry");
