import contextWrapper from '../utils/audioContextWrapper.es6';

const SYMBOLS = {
  buffer : Symbol('buffer'),
  promise : Symbol('loadbuffer')
};

class AudioThing {

  constructor (url) {

    // prepare the audio buffer that this particular instance represents
    this[SYMBOLS.promise] = new Promise((resolve, reject) => {

      let request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      // :: perform decode once the audio data has been received
      request.onload = () => {
        contextWrapper
          .getContext()
          .decodeAudioData(
            request.response,
            // :: on success
            (buffer) => {
              this[SYMBOLS.buffer] = buffer;
              resolve(buffer);
            },
            // :: on failure
            (err) => {
              console.error('Error while fetching audio file :', url);
              reject(err);
            }
          );
      };

      request.send();
    });
  }

  getBuffer () {
    return this[SYMBOLS.buffer];
  }

  /**
   * This promise gets resolved when the audio buffer is ready to be used.
   * @return {Promise}
   */
  promise () {
    return this[SYMBOLS.promise];
  }

  /**
   * Plays this sound one time.
   * @return {AudioThing} itself.
   */
  play () {
    let context = contextWrapper.getContext();
    let source = context.createBufferSource();

    source.buffer = this.getBuffer();
    source.connect(context.destination);

    source.start(0);
  }
}

export default AudioThing;