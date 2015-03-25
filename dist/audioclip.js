/*! audioclip v0.0.0 | Richard Neil A Ilagan | license : MIT */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var contextWrapper = _interopRequire(require("./utils/audioContextWrapper.es6"));

var AudioThing = _interopRequire(require("./classes/AudioThing.es6"));

console.log(contextWrapper.getContext());

/**
 * Primary export.
 * @param  {String} file   URL to the audio file to play.
 * @return {Function}      Prototype that plays the audiofile.
 */
var audioclip = function (url) {
  var thing = new AudioThing(url);
  return function () {
    // console.log(thing.getBuffer());
    thing.play();
  };
};

(window || exports).audioclip = audioclip;

},{"./classes/AudioThing.es6":2,"./utils/audioContextWrapper.es6":3}],2:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var contextWrapper = _interopRequire(require("../utils/audioContextWrapper.es6"));

var SYMBOLS = {
  buffer: Symbol("buffer"),
  promise: Symbol("loadbuffer")
};

var AudioThing = (function () {
  function AudioThing(url) {
    var _this = this;

    _classCallCheck(this, AudioThing);

    // prepare the audio buffer that this particular instance represents
    this[SYMBOLS.promise] = new Promise(function (resolve, reject) {

      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";

      // :: perform decode once the audio data has been received
      request.onload = function () {
        contextWrapper.getContext().decodeAudioData(request.response,
        // :: on success
        function (buffer) {
          _this[SYMBOLS.buffer] = buffer;
          resolve(buffer);
        },
        // :: on failure
        function (err) {
          console.error("Error while fetching audio file :", url);
          reject(err);
        });
      };

      request.send();
    });
  }

  _prototypeProperties(AudioThing, null, {
    getBuffer: {
      value: function getBuffer() {
        return this[SYMBOLS.buffer];
      },
      writable: true,
      configurable: true
    },
    promise: {

      /**
       * This promise gets resolved when the audio buffer is ready to be used.
       * @return {Promise}
       */

      value: function promise() {
        return this[SYMBOLS.promise];
      },
      writable: true,
      configurable: true
    },
    play: {

      /**
       * Plays this sound one time.
       * @return {AudioThing} itself.
       */

      value: function play() {
        var context = contextWrapper.getContext();
        var source = context.createBufferSource();

        source.buffer = this.getBuffer();
        source.connect(context.destination);

        source.start(0);
      },
      writable: true,
      configurable: true
    }
  });

  return AudioThing;
})();

module.exports = AudioThing;

},{"../utils/audioContextWrapper.es6":3}],3:[function(require,module,exports){
"use strict";

// create a singleton HTML5 AudioContext
var context = undefined;
try {
  context = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.error("This browser does not support the Web Audio API.");
}

module.exports = {
  getContext: function () {
    if (!context) {
      throw new Error("This browser does not support the Web Audio API.");
    }

    return context;
  }
};

},{}]},{},[1]);
