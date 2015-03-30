import contextWrapper from '../utils/audioContextWrapper.es6';
import acAudioBuffer from './AudioBuffer.es6';
import acAudioBufferEffector from './AudioBufferEffector.es6';

class acAudioCabinet {

  constructor (bpm) {

    this.__clips = {};

    this
      // :: create initial buffersource
      .init()
      // :: set initial bpm
      .bpm(bpm)
      ;
  }


  /**
   * Initialize an AudioBufferSourceNode for this cabinet.
   * @return {[type]} [description]
   */
  init () {
    let context = contextWrapper.getContext();
    let source =  context.createBufferSource();
    source.connect(context.destination);

    this.__source = source;

    return this;
  }

  /**
   * Sets the BPM (beats per minute) for this audio cabinet,
   * effectively setting [beattime].
   * @param  {Number} beatsperminute    BPM measure. Defaults to high moderato (120).
   * @return {AudioCabinet}             itself.
   */
  bpm (beatsperminute = 120) {
    // :: (1 min / bpm) * (60 sec / 1 min)
    this.__beattime = 60 / beatsperminute;

    return this;
  }

  /**
   * Jack in an audio clip for syncing with this cabinet.
   * @param  {String} name                            A key to keep track of this clip.
   * @param  {String|acAudioBuffer|Function} buffer   A URL to a sound file, or an acAudioBuffer instance
   * @return {acAudioBufferSchedule}                  A scheduler for this audio clip.
   */
  clip (name, buffer) {

    let schedule = new acAudioBufferEffector(buffer);

    if (this.__clips[name]) {
      console.warn('An audio clip is already registered under the name ', name);
    }
    this.__clips[name] = schedule;

    return schedule;
  }

  play () {
    let keys = Object.keys(this.__clips);
    let len = keys.length >>> 0;

    for (let idx = 0 ; idx < len ; idx++) {
      this.__clips[keys[idx]].play(this.__beattime);
    }
  }
}

export default acAudioCabinet;