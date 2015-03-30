// :: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill

Object.keys = Object.keys || (() => {

  let hasOwnProperty = Object.prototype.hasOwnProperty;
  let hasDontEnumBug = !({ toString : null }).propertyIsEnumerable('toString');
  let dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
  ];
  let dontEnumsLength = dontEnums.length;

  return function (obj) {

    // :: failsafe
    if (
      typeof obj !== 'object' &&
      (typeof obj !== 'function' || obj === null)
    ) {
      throw new TypeError('Object.keys called on non-object');
    }

    let result = [];

    for (let prop in obj) {
      if (hasOwnProperty.call(obj, prop)) {
        result.push(prop);
      }
    }

    if (hasDontEnumBug) {
      for (let idx = 0 ; idx < dontEnumsLength ; idx++) {
        if (hasOwnProperty.call(obj, dontEnums[idx])) {
          result.push(dontEnums[idx]);
        }
      }
    }

    return result;
  };

})();