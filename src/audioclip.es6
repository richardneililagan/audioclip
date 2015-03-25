import contextWrapper from './utils/audioContextWrapper.es6';
import AudioThing from './classes/AudioThing.es6';

console.log(contextWrapper.getContext());





/**
 * Primary export.
 * @param  {String} file   URL to the audio file to play.
 * @return {Function}      Prototype that plays the audiofile.
 */
let audioclip = (url) => {
  let thing = new AudioThing(url);
  return () => {
    // console.log(thing.getBuffer());
    thing.play();
  }
};



(window || exports).audioclip = audioclip;
