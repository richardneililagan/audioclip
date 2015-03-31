/*! audioclip v0.0.0 | Richard Neil A Ilagan | license : MIT */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
'use strict';

module.exports = require('./lib/core.js')
require('./lib/done.js')
require('./lib/es6-extensions.js')
require('./lib/node-extensions.js')
},{"./lib/core.js":3,"./lib/done.js":4,"./lib/es6-extensions.js":5,"./lib/node-extensions.js":6}],3:[function(require,module,exports){
'use strict';

var asap = require('asap')

module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new self.constructor(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":7}],4:[function(require,module,exports){
'use strict';

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}
},{"./core.js":3,"asap":7}],5:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Promise.prototype

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":3,"asap":7}],6:[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions that are only useful for node.js interop

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      var res = fn.apply(self, args)
      if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
        resolve(res)
      }
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    var ctx = this
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback.call(ctx, ex)
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value)
    })
  }, function (err) {
    asap(function () {
      callback.call(ctx, err)
    })
  })
}

},{"./core.js":3,"asap":7}],7:[function(require,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,require('_process'))
},{"_process":1}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

//require('babelify/polyfill');

require("./utils/polyfills/catalog.es6");

var contextWrapper = _interopRequire(require("./utils/audioContextWrapper.es6"));

var acAudioBuffer = _interopRequire(require("./classes/AudioBuffer.es6"));

var acAudioCabinet = _interopRequire(require("./classes/AudioCabinet.es6"));

/**
 * Primary export.
 * @param  {String} file   URL to the audio file to play.
 * @return {Function}      Prototype that plays the audiofile.
 */
var audioclip = function (url) {
  var thing = new acAudioBuffer(url);

  // :: failsafe
  thing.__promise["catch"](function (err) {
    // TODO something more ... elegant, maybe?
    throw new Error(err.msg);
  });

  var clip = function (time, offset, duration) {
    thing.play(time, offset, duration);
  };

  clip.buffer = thing;

  return clip;
};

/**
 * Creates an AudioCabinet.
 * @return {AudioCabinet} A brand spankin' new AudioCabinet!
 */
audioclip.createCabinet = function () {
  return new acAudioCabinet();
};

(window || exports).audioclip = audioclip;

},{"./classes/AudioBuffer.es6":9,"./classes/AudioCabinet.es6":11,"./utils/audioContextWrapper.es6":13,"./utils/polyfills/catalog.es6":15}],9:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Promise = _interopRequire(require("promise"));

var acAudioSourceNode = _interopRequire(require("./AudioSourceNode.es6"));

/**
 *  Encapsulates a single audio clip's buffer.
 */

var acAudioBuffer = (function (acAudioSourceNode) {
  function acAudioBuffer(url) {
    var _this = this;

    _classCallCheck(this, acAudioBuffer);

    _get(Object.getPrototypeOf(acAudioBuffer.prototype), "constructor", this).call(this);

    // prepare the audio buffer that this particular instance represents
    this.__promise = new Promise(function (resolve, reject) {

      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";

      // :: perform decode once the audio data has been received
      request.onload = function () {
        _this.__context.decodeAudioData(request.response,

        // :: on success
        function (buffer) {
          _this.__buffer = buffer;

          // :: create the initial source node
          _this.init();

          resolve(buffer);
        },

        // :: on failure
        function (err) {
          reject({
            err: err,
            msg: "Error while fetching audio file : " + url
          });
        });
      };

      request.send();
    });
  }

  _inherits(acAudioBuffer, acAudioSourceNode);

  _prototypeProperties(acAudioBuffer, {
    resolve: {

      /**
       * Resolves a [possible] acAudioBuffer object into an equivalent acAudioBuffer.
       * @param  {String|Function|acAudioBuffer}   buffer   Something that _should_ evaluate into an acAudioBuffer
       * @return {acAudioBuffer}                            The resultant acAudioBuffer.
       */

      value: function resolve(buffer) {
        var __buffer = undefined;

        if (buffer instanceof acAudioBuffer) {
          __buffer = buffer;
        }

        // :: if buffer is a function returned by calling audioclip()
        else if (typeof buffer === "function" && buffer.buffer instanceof acAudioBuffer) {
          __buffer = buffer.buffer;
        } else {
          // :: this is a weird type
          //    try to resolve this by attempting to create an acAudioBuffer
          __buffer = new acAudioBuffer(buffer);

          // TODO this makes this function unusable by the constructor
          //      as it potentially introduces an infinite loop.
        }

        return __buffer;
      },
      writable: true,
      configurable: true
    }
  }, {
    init: {

      /**
       * Initializes a buffer for playing audio clip.
       * @return {acAudioBuffer} itself.
       */

      value: function init() {

        var source = this.createSource();

        source.buffer = this.__buffer;
        source.connect(this.__context.destination);

        this.__sourcenode = source;

        return this;
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
        var _this = this;

        var time = arguments[0] === undefined ? 0 : arguments[0];
        var offset = arguments[1] === undefined ? 0 : arguments[1];
        var duration = arguments[2] === undefined ? this.__buffer.duration - offset : arguments[2];
        return (function () {

          _this.__sourcenode.start(_this.__context.currentTime + time, offset, duration);

          return _this.init();
        })();
      },
      writable: true,
      configurable: true
    }
  });

  return acAudioBuffer;
})(acAudioSourceNode);

module.exports = acAudioBuffer;

},{"./AudioSourceNode.es6":12,"promise":2}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var acAudioBuffer = _interopRequire(require("./AudioBuffer.es6"));

var acAudioSourceNode = _interopRequire(require("./AudioSourceNode.es6"));

/**
 *  Evaluates effects for an audio buffer.
 */

var acAudioBufferEffector = (function (acAudioSourceNode) {
  function acAudioBufferEffector(buffer) {
    _classCallCheck(this, acAudioBufferEffector);

    _get(Object.getPrototypeOf(acAudioBufferEffector.prototype), "constructor", this).call(this);

    this.buffer = acAudioBuffer.resolve(buffer);

    // :: failsafe
    if (!this.buffer instanceof acAudioBuffer) {
      throw new TypeError("buffer is not a valid audio buffer.");
    }

    this.__timings = [];
  }

  _inherits(acAudioBufferEffector, acAudioSourceNode);

  _prototypeProperties(acAudioBufferEffector, null, {
    beat: {
      value: function beat() {
        for (var _len = arguments.length, beats = Array(_len), _key = 0; _key < _len; _key++) {
          beats[_key] = arguments[_key];
        }

        // return the currently registered beats when no argument is specified
        if (!beats.length) {
          return this.__timings;
        }

        Array.prototype.push.apply(this.__timings, beats.filter(function (n) {
          return Number.isFinite(n) && n >= 0;
        }));
        // :: sort in ascending order
        this.__timings.sort(function (a, b) {
          return a - b;
        });
        // :: remove duplicates
        this.__timings = this.__timings.filter(function (item, idx, collection) {
          return collection.indexOf(item) === idx;
        });
      },
      writable: true,
      configurable: true
    },
    play: {
      value: function play() {
        var beattime = arguments[0] === undefined ? 60 / 120 : arguments[0];

        var len = this.__timings.length >>> 0;

        // :: if there are no registered beat times,
        //    then play this clip once at the start
        if (len === 0) {
          this.buffer.play();
        } else {
          // :: process when to play according to timings
          for (var idx = 0; idx < len; idx++) {

            var resolvedTime = this.__timings[idx] * beattime;
            this.buffer.play(resolvedTime);
          }
        }
      },
      writable: true,
      configurable: true
    }
  });

  return acAudioBufferEffector;
})(acAudioSourceNode);

module.exports = acAudioBufferEffector;

},{"./AudioBuffer.es6":9,"./AudioSourceNode.es6":12}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var contextWrapper = _interopRequire(require("../utils/audioContextWrapper.es6"));

var acAudioBuffer = _interopRequire(require("./AudioBuffer.es6"));

var acAudioBufferEffector = _interopRequire(require("./AudioBufferEffector.es6"));

var acAudioCabinet = (function () {
  function acAudioCabinet(bpm) {
    _classCallCheck(this, acAudioCabinet);

    this.__clips = {};

    this
    // :: create initial buffersource
    .init()
    // :: set initial bpm
    .bpm(bpm);
  }

  _prototypeProperties(acAudioCabinet, null, {
    init: {

      /**
       * Initialize an AudioBufferSourceNode for this cabinet.
       * @return {[type]} [description]
       */

      value: function init() {
        var context = contextWrapper.getContext();
        var source = context.createBufferSource();
        source.connect(context.destination);

        this.__source = source;

        return this;
      },
      writable: true,
      configurable: true
    },
    bpm: {

      /**
       * Sets the BPM (beats per minute) for this audio cabinet,
       * effectively setting [beattime].
       * @param  {Number} beatsperminute    BPM measure. Defaults to high moderato (120).
       * @return {AudioCabinet}             itself.
       */

      value: function bpm() {
        var beatsperminute = arguments[0] === undefined ? 120 : arguments[0];

        // :: (1 min / bpm) * (60 sec / 1 min)
        this.__beattime = 60 / beatsperminute;

        return this;
      },
      writable: true,
      configurable: true
    },
    clip: {

      /**
       * Jack in an audio clip for syncing with this cabinet.
       * @param  {String} name                            A key to keep track of this clip.
       * @param  {String|acAudioBuffer|Function} buffer   A URL to a sound file, or an acAudioBuffer instance
       * @return {acAudioBufferSchedule}                  A scheduler for this audio clip.
       */

      value: function clip(name, buffer) {

        var schedule = new acAudioBufferEffector(buffer);

        if (this.__clips[name]) {
          console.warn("An audio clip is already registered under the name ", name);
        }
        this.__clips[name] = schedule;

        return schedule;
      },
      writable: true,
      configurable: true
    },
    play: {
      value: function play() {
        var keys = Object.keys(this.__clips);
        var len = keys.length >>> 0;

        for (var idx = 0; idx < len; idx++) {
          this.__clips[keys[idx]].play(this.__beattime);
        }
      },
      writable: true,
      configurable: true
    }
  });

  return acAudioCabinet;
})();

module.exports = acAudioCabinet;

},{"../utils/audioContextWrapper.es6":13,"./AudioBuffer.es6":9,"./AudioBufferEffector.es6":10}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var contextWrapper = _interopRequire(require("../utils/audioContextWrapper.es6"));

/**
 *  Encapsulates common functionality required for interfacing with audio
 */

var acAudioSourceNode = (function () {
  function acAudioSourceNode() {
    _classCallCheck(this, acAudioSourceNode);

    this.__context = contextWrapper.getContext();
  }

  _prototypeProperties(acAudioSourceNode, null, {
    createSource: {
      value: function createSource() {
        return this.__context.createBufferSource();
      },
      writable: true,
      configurable: true
    }
  });

  return acAudioSourceNode;
})();

module.exports = acAudioSourceNode;

},{"../utils/audioContextWrapper.es6":13}],13:[function(require,module,exports){
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
  },
  isContextSupported: function () {
    return !!context;
  }
};

},{}],14:[function(require,module,exports){
"use strict";

// :: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Polyfill

Array.prototype.filter = Array.prototype.filter || function (fn) {
  var thisArg = arguments[1] === undefined ? void 0 : arguments[1];

  if (this === void 0 || this === null) {
    throw new TypeError();
  }

  if (typeof fn !== "function") {
    throw new TypeError();
  }

  var t = Object(this);
  var len = t.length >>> 0;
  var result = [];

  for (var idx = 0; idx < len; i++) {
    if (i in t) {
      var val = t[i];
      if (fn.call(thisArg, val, idx, t)) {
        result.push(val);
      }
    }
  }

  return result;
};

},{}],15:[function(require,module,exports){
"use strict";

// :: Arrays

require("./array/filter.polyfill.es6");

// :: Objects

require("./object/keys.polyfill.es6");

},{"./array/filter.polyfill.es6":14,"./object/keys.polyfill.es6":16}],16:[function(require,module,exports){
"use strict";

// :: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill

Object.keys = Object.keys || (function () {

  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable("toString");
  var dontEnums = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"];
  var dontEnumsLength = dontEnums.length;

  return function (obj) {

    // :: failsafe
    if (typeof obj !== "object" && (typeof obj !== "function" || obj === null)) {
      throw new TypeError("Object.keys called on non-object");
    }

    var result = [];

    for (var prop in obj) {
      if (hasOwnProperty.call(obj, prop)) {
        result.push(prop);
      }
    }

    if (hasDontEnumBug) {
      for (var idx = 0; idx < dontEnumsLength; idx++) {
        if (hasOwnProperty.call(obj, dontEnums[idx])) {
          result.push(dontEnums[idx]);
        }
      }
    }

    return result;
  };
})();

},{}]},{},[8]);
