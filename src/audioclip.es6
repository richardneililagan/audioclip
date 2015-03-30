//require('babelify/polyfill');

import {} from './utils/polyfills/catalog.es6';

import contextWrapper from './utils/audioContextWrapper.es6';

import acAudioBuffer from './classes/AudioBuffer.es6';
import acAudioCabinet from './classes/AudioCabinet.es6';




/**
 * Primary export.
 * @param  {String} file   URL to the audio file to play.
 * @return {Function}      Prototype that plays the audiofile.
 */
let audioclip = (url) => {
  let thing = new acAudioBuffer(url);

  // :: failsafe
  thing.__promise
    .catch(err => {
      // TODO something more ... elegant, maybe?
      throw new Error(err.msg);
    });

  var clip = (time, offset, duration) => {
    thing.play(time, offset, duration);
  };

  clip.buffer = thing;

  return clip;
};

/**
 * Creates an AudioCabinet.
 * @return {AudioCabinet} A brand spankin' new AudioCabinet!
 */
audioclip.createCabinet = () => new acAudioCabinet();


(window || exports).audioclip = audioclip;
