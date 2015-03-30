// :: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Polyfill

Array.prototype.filter =
  Array.prototype.filter || function (fn, thisArg = void 0) {

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    if (typeof fn !== 'function') {
      throw new TypeError();
    }

    let t = Object(this);
    let len = t.length >>> 0;
    let result = [];

    for (let idx = 0 ; idx < len ; i++) {
      if (i in t) {
        let val = t[i];
        if (fn.call(thisArg, val, idx, t)) {
          result.push(val);
        }
      }
    }

    return result;
  };