import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

let install, message;
const parent = { postMessage() {} };
class Source {
  currentVolume = 0.8;
  plays = 0;
  shots = 0;
  get volume() { return this.currentVolume; }
  set volume(value) { this.currentVolume = value; }
  play() { this.plays++; }
  playOneShot() { this.shots++; }
}
const manager = { sfxSource: new Source(), engineSource: new Source(), musicSource: new Source(), ambienceSource: new Source(), unlockAudio() {} };
const cc = { Director: { EVENT_AFTER_SCENE_LAUNCH: "scene" }, director: { on() {}, getScene: () => ({ getComponentsInChildren: () => [manager] }) } };
vm.runInNewContext(fs.readFileSync("public/games/aviator/audio-settings.js", "utf8"), {
  System: { register: (_, factory) => factory((_, fn) => { install = fn; }).execute() },
  window: { parent, location: { origin: "https://game.example" }, addEventListener: (_, fn) => { message = fn; } },
});
install(cc);
const send = (sound, music, origin = "https://game.example", source = parent) => message({ origin, source, data: { source: "AVIATOR_NEXT", type: "AUDIO_SETTINGS", payload: { sound, music } } });
send(false, false, "https://untrusted.example");
assert.equal(manager.sfxSource.volume, 0.8);
send(false, false, "https://game.example", {});
assert.equal(manager.sfxSource.volume, 0.8);
send(false, true);
assert.equal(manager.sfxSource.volume, 0);
assert.equal(manager.engineSource.volume, 0);
assert.equal(manager.musicSource.volume, 0.8);
manager.sfxSource.playOneShot({});
manager.engineSource.play();
assert.equal(manager.sfxSource.shots, 0);
assert.equal(manager.engineSource.plays, 0);
manager.engineSource.volume = 0.4;
assert.equal(manager.engineSource.volume, 0);
send(true, false);
assert.equal(manager.engineSource.volume, 0.4);
assert.equal(manager.musicSource.volume, 0);
assert.equal(manager.ambienceSource.volume, 0);
manager.sfxSource.playOneShot({});
assert.equal(manager.sfxSource.shots, 1);
manager.musicSource.play();
assert.equal(manager.musicSource.plays, 0);
send(true, true);
assert.equal(manager.musicSource.volume, 0.8);
console.log("PASS: independent audio channels, muted future playback, retained volume, and parent/origin validation");
