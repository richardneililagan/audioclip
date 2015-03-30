import acAudioBuffer from './AudioBuffer.es6';
import acAudioSourceNode from './AudioSourceNode.es6';

/**
 *  Evaluates effects for an audio buffer.
 */
class acAudioBufferEffector extends acAudioSourceNode {

  constructor (buffer) {

    super();

    this.buffer = acAudioBuffer.resolve(buffer);

    // :: failsafe
    if (!this.buffer instanceof acAudioBuffer) {
      throw new TypeError('buffer is not a valid audio buffer.');
    }

    this.__timings = [];
  }

  beat (...beats) {
    Array.prototype.push.apply(
      this.__timings,
      beats.filter(n => Number.isFinite(n) && n >= 0)
      );
    // :: sort in ascending order
    this.__timings.sort((a,b) => a - b);
  }

  play (beattime = 60 / 120) {

    //let currentTime = this.__context.currentTime;
    let len = this.__timings.length >>> 0;

    // :: process when to play according to timings
    for (let idx = 0 ; idx < len; idx++) {

      let resolvedTime = this.__timings[idx] * beattime;
      this.buffer.play(resolvedTime);
    }

  }
}

export default acAudioBufferEffector;