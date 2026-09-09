/* Independent sound/music gates for the embedded Cocos game. */
System.register([], function (exports) {
  "use strict";
  return { execute: function () {
    exports("installAudioSettings", function (cc) {
      var preferences = { sound: true, music: true };
      var gates = [];
      var managers = new WeakSet();

      // Gate the public AudioSource APIs so asynchronous clip loads and round
      // callbacks cannot start a disabled channel or restore its volume.
      function gate(source, channel) {
        if (!source) return;
        var prototype = source;
        var descriptor;
        while (prototype && !descriptor) {
          descriptor = Object.getOwnPropertyDescriptor(prototype, "volume");
          prototype = Object.getPrototypeOf(prototype);
        }
        if (!descriptor || !descriptor.get || !descriptor.set) return;
        var volume = source.volume;
        var play = source.play.bind(source);
        var oneShot = source.playOneShot.bind(source);
        Object.defineProperty(source, "volume", {
          configurable: true,
          get: function () { return descriptor.get.call(source); },
          set: function (next) { volume = next; descriptor.set.call(source, preferences[channel] ? next : 0); }
        });
        source.play = function () { if (preferences[channel]) play(); };
        source.playOneShot = function (clip, scale) { if (preferences[channel]) oneShot(clip, scale); };
        gates.push(function () { descriptor.set.call(source, preferences[channel] ? volume : 0); });
      }

      function install() {
        var scene = cc.director.getScene();
        if (!scene) return;
        scene.getComponentsInChildren("SoundManager").forEach(function (manager) {
          if (managers.has(manager)) return;
          managers.add(manager);
          gate(manager.sfxSource, "sound");
          gate(manager.engineSource, "sound");
          gate(manager.musicSource, "music");
          gate(manager.ambienceSource, "music");
        });
        gates.forEach(function (apply) { apply(); });
      }

      window.addEventListener("message", function (event) {
        if (event.origin !== window.location.origin || event.source !== window.parent) return;
        var data = event.data;
        if (!data || data.source !== "AVIATOR_NEXT" || data.type !== "AUDIO_SETTINGS") return;
        if (typeof data.payload?.sound !== "boolean" || typeof data.payload?.music !== "boolean") return;
        preferences = { sound: data.payload.sound, music: data.payload.music };
        install();
        // Resume loops through the existing manager after a user enables audio.
        var scene = cc.director.getScene();
        if (scene) scene.getComponentsInChildren("SoundManager").forEach(function (manager) { manager.unlockAudio(); });
      });
      cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, install);
      install();
      window.parent.postMessage({ source: "AVIATOR_COCOS", type: "AUDIO_READY" }, window.location.origin);
    });
  } };
});
