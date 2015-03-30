
// create a singleton HTML5 AudioContext
let context;
try {
  context = new (window.AudioContext || window.webkitAudioContext)();
}
catch (e) {
  console.error('This browser does not support the Web Audio API.');
}


export default {
  getContext : () => {
    if (!context) {
      throw new Error('This browser does not support the Web Audio API.');
    }

    return context;
  },
  isContextSupported : () => !!context
}