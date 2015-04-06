import Promise from 'promise';

import acAudioSourceNode from './AudioSourceNode.es6';

/**
 *  Encapsulates a single audio clip's buffer.
 */
class acAudioBuffer extends acAudioSourceNode {

  constructor (url) {

    super();

    // prepare the audio buffer that this particular instance represents
    this.__promise = new Promise((resolve, reject) => {

      let request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      // :: perform decode once the audio data has been received
      request.onload = () => {
        this.__context
          .decodeAudioData(
            request.response,

            // :: on success
            buffer => {
              this.__buffer = buffer;

              // :: create the initial source node
              this.init();

              resolve(buffer);
            },

            // :: on failure
            err => {
              reject({
                err : err,
                msg : 'Error while fetching audio file : ' + url
              });
            }

          );
      };

      request.send();
    });
  }

  /**
   * Resolves a [possible] acAudioBuffer object into an equivalent acAudioBuffer.
   * @param  {String|Function|acAudioBuffer}   buffer   Something that _should_ evaluate into an acAudioBuffer
   * @return {acAudioBuffer}                            The resultant acAudioBuffer.
   */
  static resolve (buffer) {
    let __buffer;

    if (buffer instanceof acAudioBuffer) {
      __buffer = buffer;
    }

    // :: if buffer is a function returned by calling audioclip()
    else if (typeof buffer === 'function' && buffer.buffer instanceof acAudioBuffer) {
      __buffer = buffer.buffer;
    }

    else {
      // :: this is a weird type
      //    try to resolve this by attempting to create an acAudioBuffer
      __buffer = new acAudioBuffer(buffer);

      // TODO this makes this function unusable by the constructor
      //      as it potentially introduces an infinite loop.
    }

    return __buffer;
  }

  /**
   * Initializes a buffer for playing audio clip.
   * @return {acAudioBuffer} itself.
   */
  init () {

    let source = this.createSource();

    source.buffer = this.__buffer;
    source.connect(this.__context.destination);

    this.__sourcenode = source;

    return this;
  }

  /**
   * Plays this sound one time.
   * @return {AudioThing} itself.
   */
  play (time = 0, offset = 0, duration = this.__buffer.duration - offset) {

    // :: failsafe
    time = Number.isFinite(time) ? time : 0;

    offset = Math.max(0,
      Math.min(this.__buffer.duration, Number.isFinite(offset) ? offset : 0)
      );

    duration = Number.isFinite(duration) ? duration : this.__buffer.duration - offset;

    console.log(time);

    this.__sourcenode.start(
      this.__context.currentTime + time,
      offset,
      duration
      );

    return this.init();
  }
}

export default acAudioBuffer;