import contextWrapper from '../utils/audioContextWrapper.es6';

/**
 *  Encapsulates common functionality required for interfacing with audio
 */
class acAudioSourceNode {

  constructor () {
    this.__context = contextWrapper.getContext();
  }

  createSource () {
    return this.__context.createBufferSource();
  }
}

export default acAudioSourceNode;