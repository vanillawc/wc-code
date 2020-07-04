// node_modules/codemirror/src/util/browser.js
let userAgent = navigator.userAgent;
let platform = navigator.platform;
let gecko = /gecko\/\d/i.test(userAgent);
let ie_upto10 = /MSIE \d/.test(userAgent);
let ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
let edge = /Edge\/(\d+)/.exec(userAgent);
let ie = ie_upto10 || ie_11up || edge;
let ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]);
let webkit = !edge && /WebKit\//.test(userAgent);
let qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
let chrome = !edge && /Chrome\//.test(userAgent);
let presto = /Opera\//.test(userAgent);
let safari = /Apple Computer/.test(navigator.vendor);
let mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
let phantom = /PhantomJS/.test(userAgent);
let ios = !edge && /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent);
let android = /Android/.test(userAgent);
let mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
let mac = ios || /Mac/.test(platform);
let chromeOS = /\bCrOS\b/.test(userAgent);
let windows = /win/i.test(platform);
let presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
if (presto_version) presto_version = Number(presto_version[1]);

if (presto_version && presto_version >= 15) {
  presto = false;
  webkit = true;
}

let flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
let captureRightClick = gecko || ie && ie_version >= 9; // node_modules/codemirror/src/util/dom.js

function classTest(cls) {
  return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*");
}

let rmClass = function rmClass(node, cls) {
  let current = node.className;
  let match = classTest(cls).exec(current);

  if (match) {
    let after = current.slice(match.index + match[0].length);
    node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
  }
};

function removeChildren(e) {
  for (let count = e.childNodes.length; count > 0; --count) e.removeChild(e.firstChild);

  return e;
}

function removeChildrenAndAdd(parent, e) {
  return removeChildren(parent).appendChild(e);
}

function elt(tag, content, className, style) {
  let e = document.createElement(tag);
  if (className) e.className = className;
  if (style) e.style.cssText = style;
  if (typeof content == "string") e.appendChild(document.createTextNode(content));else if (content) for (let i = 0; i < content.length; ++i) e.appendChild(content[i]);
  return e;
}

function eltP(tag, content, className, style) {
  let e = elt(tag, content, className, style);
  e.setAttribute("role", "presentation");
  return e;
}

let range;
if (document.createRange) range = function (node, start, end, endNode) {
  let r = document.createRange();
  r.setEnd(endNode || node, end);
  r.setStart(node, start);
  return r;
};else range = function (node, start, end) {
  let r = document.body.createTextRange();

  try {
    r.moveToElementText(node.parentNode);
  } catch (e) {
    return r;
  }

  r.collapse(true);
  r.moveEnd("character", end);
  r.moveStart("character", start);
  return r;
};

function contains(parent, child) {
  if (child.nodeType == 3) child = child.parentNode;
  if (parent.contains) return parent.contains(child);

  do {
    if (child.nodeType == 11) child = child.host;
    if (child == parent) return true;
  } while (child = child.parentNode);
}

function activeElt() {
  let activeElement;

  try {
    activeElement = document.activeElement;
  } catch (e) {
    activeElement = document.body || null;
  }

  while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement) activeElement = activeElement.shadowRoot.activeElement;

  return activeElement;
}

function addClass(node, cls) {
  let current = node.className;
  if (!classTest(cls).test(current)) node.className += (current ? " " : "") + cls;
}

function joinClasses(a, b) {
  let as = a.split(" ");

  for (let i = 0; i < as.length; i++) if (as[i] && !classTest(as[i]).test(b)) b += " " + as[i];

  return b;
}

let _selectInput = function selectInput(node) {
  node.select();
};

if (ios) _selectInput = function (node) {
  node.selectionStart = 0;
  node.selectionEnd = node.value.length;
};else if (ie) _selectInput = function (node) {
  try {
    node.select();
  } catch (_e) {}
}; // node_modules/codemirror/src/util/misc.js

function bind(f) {
  let args = Array.prototype.slice.call(arguments, 1);
  return function () {
    return f.apply(null, args);
  };
}

function copyObj(obj, target, overwrite) {
  if (!target) target = {};

  for (let prop in obj) if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop))) target[prop] = obj[prop];

  return target;
}

function countColumn(string, end, tabSize, startIndex, startValue) {
  if (end == null) {
    end = string.search(/[^\s\u00a0]/);
    if (end == -1) end = string.length;
  }

  for (let i = startIndex || 0, n = startValue || 0;;) {
    let nextTab = string.indexOf("	", i);
    if (nextTab < 0 || nextTab >= end) return n + (end - i);
    n += nextTab - i;
    n += tabSize - n % tabSize;
    i = nextTab + 1;
  }
}

class Delayed {
  constructor() {
    this.id = null;
    this.f = null;
    this.time = 0;
    this.handler = bind(this.onTimeout, this);
  }

  onTimeout(self2) {
    self2.id = 0;

    if (self2.time <= +new Date()) {
      self2.f();
    } else {
      setTimeout(self2.handler, self2.time - +new Date());
    }
  }

  set(ms, f) {
    this.f = f;
    const time = +new Date() + ms;

    if (!this.id || time < this.time) {
      clearTimeout(this.id);
      this.id = setTimeout(this.handler, ms);
      this.time = time;
    }
  }}



function indexOf(array, elt2) {
  for (let i = 0; i < array.length; ++i) if (array[i] == elt2) return i;

  return -1;
}

let scrollerGap = 50;
let Pass = {
  toString: function () {
    return "CodeMirror.Pass";
  } };

let sel_dontScroll = {
  scroll: false };

let sel_mouse = {
  origin: "*mouse" };

let sel_move = {
  origin: "+move" };


function findColumn(string, goal, tabSize) {
  for (let pos26 = 0, col = 0;;) {
    let nextTab = string.indexOf("	", pos26);
    if (nextTab == -1) nextTab = string.length;
    let skipped = nextTab - pos26;
    if (nextTab == string.length || col + skipped >= goal) return pos26 + Math.min(skipped, goal - col);
    col += nextTab - pos26;
    col += tabSize - col % tabSize;
    pos26 = nextTab + 1;
    if (col >= goal) return pos26;
  }
}

let spaceStrs = [""];

function spaceStr(n) {
  while (spaceStrs.length <= n) spaceStrs.push(lst(spaceStrs) + " ");

  return spaceStrs[n];
}

function lst(arr) {
  return arr[arr.length - 1];
}

function map(array, f) {
  let out = [];

  for (let i = 0; i < array.length; i++) out[i] = f(array[i], i);

  return out;
}

function insertSorted(array, value, score) {
  let pos26 = 0,
  priority = score(value);

  while (pos26 < array.length && score(array[pos26]) <= priority) pos26++;

  array.splice(pos26, 0, value);
}

function nothing() {}

function createObj(base, props) {
  let inst;

  if (Object.create) {
    inst = Object.create(base);
  } else {
    nothing.prototype = base;
    inst = new nothing();
  }

  if (props) copyObj(props, inst);
  return inst;
}

let nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;

function isWordCharBasic(ch) {
  return /\w/.test(ch) || ch > "" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
}

function isWordChar(ch, helper) {
  if (!helper) return isWordCharBasic(ch);
  if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) return true;
  return helper.test(ch);
}

function isEmpty(obj) {
  for (let n in obj) if (obj.hasOwnProperty(n) && obj[n]) return false;

  return true;
}

let extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;

function isExtendingChar(ch) {
  return ch.charCodeAt(0) >= 768 && extendingChars.test(ch);
}

function skipExtendingChars(str, pos26, dir) {
  while ((dir < 0 ? pos26 > 0 : pos26 < str.length) && isExtendingChar(str.charAt(pos26))) pos26 += dir;

  return pos26;
}

function findFirst(pred, from, to) {
  let dir = from > to ? -1 : 1;

  for (;;) {
    if (from == to) return from;
    let midF = (from + to) / 2,
    mid = dir < 0 ? Math.ceil(midF) : Math.floor(midF);
    if (mid == from) return pred(mid) ? from : to;
    if (pred(mid)) to = mid;else from = mid + dir;
  }
} // node_modules/codemirror/src/util/bidi.js


function iterateBidiSections(order, from, to, f) {
  if (!order) return f(from, to, "ltr", 0);
  let found = false;

  for (let i = 0; i < order.length; ++i) {
    let part = order[i];

    if (part.from < to && part.to > from || from == to && part.to == from) {
      f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr", i);
      found = true;
    }
  }

  if (!found) f(from, to, "ltr");
}

let bidiOther = null;

function getBidiPartAt(order, ch, sticky) {
  let found;
  bidiOther = null;

  for (let i = 0; i < order.length; ++i) {
    let cur = order[i];
    if (cur.from < ch && cur.to > ch) return i;

    if (cur.to == ch) {
      if (cur.from != cur.to && sticky == "before") found = i;else bidiOther = i;
    }

    if (cur.from == ch) {
      if (cur.from != cur.to && sticky != "before") found = i;else bidiOther = i;
    }
  }

  return found != null ? found : bidiOther;
}

let bidiOrdering = function () {
  let lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
  let arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";

  function charType(code) {
    if (code <= 247) return lowTypes.charAt(code);else if (1424 <= code && code <= 1524) return "R";else if (1536 <= code && code <= 1785) return arabicTypes.charAt(code - 1536);else if (1774 <= code && code <= 2220) return "r";else if (8192 <= code && code <= 8203) return "w";else if (code == 8204) return "b";else return "L";
  }

  let bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  let isNeutral = /[stwN]/,
  isStrong = /[LRr]/,
  countsAsLeft = /[Lb1n]/,
  countsAsNum = /[1n]/;

  function BidiSpan(level, from, to) {
    this.level = level;
    this.from = from;
    this.to = to;
  }

  return function (str, direction) {
    let outerType = direction == "ltr" ? "L" : "R";
    if (str.length == 0 || direction == "ltr" && !bidiRE.test(str)) return false;
    let len = str.length,
    types = [];

    for (let i = 0; i < len; ++i) types.push(charType(str.charCodeAt(i)));

    for (let i = 0, prev = outerType; i < len; ++i) {
      let type = types[i];
      if (type == "m") types[i] = prev;else prev = type;
    }

    for (let i = 0, cur = outerType; i < len; ++i) {
      let type = types[i];
      if (type == "1" && cur == "r") types[i] = "n";else if (isStrong.test(type)) {
        cur = type;
        if (type == "r") types[i] = "R";
      }
    }

    for (let i = 1, prev = types[0]; i < len - 1; ++i) {
      let type = types[i];
      if (type == "+" && prev == "1" && types[i + 1] == "1") types[i] = "1";else if (type == "," && prev == types[i + 1] && (prev == "1" || prev == "n")) types[i] = prev;
      prev = type;
    }

    for (let i = 0; i < len; ++i) {
      let type = types[i];
      if (type == ",") types[i] = "N";else if (type == "%") {
        let end;

        for (end = i + 1; end < len && types[end] == "%"; ++end) {}

        let replace = i && types[i - 1] == "!" || end < len && types[end] == "1" ? "1" : "N";

        for (let j = i; j < end; ++j) types[j] = replace;

        i = end - 1;
      }
    }

    for (let i = 0, cur = outerType; i < len; ++i) {
      let type = types[i];
      if (cur == "L" && type == "1") types[i] = "L";else if (isStrong.test(type)) cur = type;
    }

    for (let i = 0; i < len; ++i) {
      if (isNeutral.test(types[i])) {
        let end;

        for (end = i + 1; end < len && isNeutral.test(types[end]); ++end) {}

        let before = (i ? types[i - 1] : outerType) == "L";
        let after = (end < len ? types[end] : outerType) == "L";
        let replace = before == after ? before ? "L" : "R" : outerType;

        for (let j = i; j < end; ++j) types[j] = replace;

        i = end - 1;
      }
    }

    let order = [],
    m;

    for (let i = 0; i < len;) {
      if (countsAsLeft.test(types[i])) {
        let start = i;

        for (++i; i < len && countsAsLeft.test(types[i]); ++i) {}

        order.push(new BidiSpan(0, start, i));
      } else {
        let pos26 = i,
        at = order.length,
        isRTL = direction == "rtl" ? 1 : 0;

        for (++i; i < len && types[i] != "L"; ++i) {}

        for (let j = pos26; j < i;) {
          if (countsAsNum.test(types[j])) {
            if (pos26 < j) {
              order.splice(at, 0, new BidiSpan(1, pos26, j));
              at += isRTL;
            }

            let nstart = j;

            for (++j; j < i && countsAsNum.test(types[j]); ++j) {}

            order.splice(at, 0, new BidiSpan(2, nstart, j));
            at += isRTL;
            pos26 = j;
          } else ++j;
        }

        if (pos26 < i) order.splice(at, 0, new BidiSpan(1, pos26, i));
      }
    }

    if (direction == "ltr") {
      if (order[0].level == 1 && (m = str.match(/^\s+/))) {
        order[0].from = m[0].length;
        order.unshift(new BidiSpan(0, 0, m[0].length));
      }

      if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
        lst(order).to -= m[0].length;
        order.push(new BidiSpan(0, len - m[0].length, len));
      }
    }

    return direction == "rtl" ? order.reverse() : order;
  };
}();

function getOrder(line, direction) {
  let order = line.order;
  if (order == null) order = line.order = bidiOrdering(line.text, direction);
  return order;
} // node_modules/codemirror/src/util/event.js


const noHandlers = [];

let on = function on(emitter, type, f) {
  if (emitter.addEventListener) {
    emitter.addEventListener(type, f, false);
  } else if (emitter.attachEvent) {
    emitter.attachEvent("on" + type, f);
  } else {
    let map2 = emitter._handlers || (emitter._handlers = {});
    map2[type] = (map2[type] || noHandlers).concat(f);
  }
};

function getHandlers(emitter, type) {
  return emitter._handlers && emitter._handlers[type] || noHandlers;
}

function off(emitter, type, f) {
  if (emitter.removeEventListener) {
    emitter.removeEventListener(type, f, false);
  } else if (emitter.detachEvent) {
    emitter.detachEvent("on" + type, f);
  } else {
    let map2 = emitter._handlers,
    arr = map2 && map2[type];

    if (arr) {
      let index = indexOf(arr, f);
      if (index > -1) map2[type] = arr.slice(0, index).concat(arr.slice(index + 1));
    }
  }
}

function signal(emitter, type) {
  let handlers = getHandlers(emitter, type);
  if (!handlers.length) return;
  let args = Array.prototype.slice.call(arguments, 2);

  for (let i = 0; i < handlers.length; ++i) handlers[i].apply(null, args);
}

function signalDOMEvent(cm, e, override) {
  if (typeof e == "string") e = {
    type: e,
    preventDefault: function () {
      this.defaultPrevented = true;
    } };

  signal(cm, override || e.type, cm, e);
  return e_defaultPrevented(e) || e.codemirrorIgnore;
}

function signalCursorActivity(cm) {
  let arr = cm._handlers && cm._handlers.cursorActivity;
  if (!arr) return;
  let set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);

  for (let i = 0; i < arr.length; ++i) if (indexOf(set, arr[i]) == -1) set.push(arr[i]);
}

function hasHandler(emitter, type) {
  return getHandlers(emitter, type).length > 0;
}

function eventMixin(ctor) {
  ctor.prototype.on = function (type, f) {
    on(this, type, f);
  };

  ctor.prototype.off = function (type, f) {
    off(this, type, f);
  };
}

function e_preventDefault(e) {
  if (e.preventDefault) e.preventDefault();else e.returnValue = false;
}

function e_stopPropagation(e) {
  if (e.stopPropagation) e.stopPropagation();else e.cancelBubble = true;
}

function e_defaultPrevented(e) {
  return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
}

function e_stop(e) {
  e_preventDefault(e);
  e_stopPropagation(e);
}

function e_target(e) {
  return e.target || e.srcElement;
}

function e_button(e) {
  let b = e.which;

  if (b == null) {
    if (e.button & 1) b = 1;else if (e.button & 2) b = 3;else if (e.button & 4) b = 2;
  }

  if (mac && e.ctrlKey && b == 1) b = 3;
  return b;
} // node_modules/codemirror/src/util/feature_detection.js


let dragAndDrop = function () {
  if (ie && ie_version < 9) return false;
  let div = elt("div");
  return "draggable" in div || "dragDrop" in div;
}();

let zwspSupported;

function zeroWidthElement(measure) {
  if (zwspSupported == null) {
    let test = elt("span", "​");
    removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
    if (measure.firstChild.offsetHeight != 0) zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8);
  }

  let node = zwspSupported ? elt("span", "​") : elt("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
  node.setAttribute("cm-text", "");
  return node;
}

let badBidiRects;

function hasBadBidiRects(measure) {
  if (badBidiRects != null) return badBidiRects;
  let txt = removeChildrenAndAdd(measure, document.createTextNode("AخA"));
  let r0 = range(txt, 0, 1).getBoundingClientRect();
  let r1 = range(txt, 1, 2).getBoundingClientRect();
  removeChildren(measure);
  if (!r0 || r0.left == r0.right) return false;
  return badBidiRects = r1.right - r0.right < 3;
}

let splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? string => {
  let pos26 = 0,
  result = [],
  l = string.length;

  while (pos26 <= l) {
    let nl = string.indexOf("\n", pos26);
    if (nl == -1) nl = string.length;
    let line = string.slice(pos26, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
    let rt = line.indexOf("\r");

    if (rt != -1) {
      result.push(line.slice(0, rt));
      pos26 += rt + 1;
    } else {
      result.push(line);
      pos26 = nl + 1;
    }
  }

  return result;
} : string => string.split(/\r\n?|\n/);
let hasSelection = window.getSelection ? te => {
  try {
    return te.selectionStart != te.selectionEnd;
  } catch (e) {
    return false;
  }
} : te => {
  let range2;

  try {
    range2 = te.ownerDocument.selection.createRange();
  } catch (e) {}

  if (!range2 || range2.parentElement() != te) return false;
  return range2.compareEndPoints("StartToEnd", range2) != 0;
};

let hasCopyEvent = (() => {
  let e = elt("div");
  if ("oncopy" in e) return true;
  e.setAttribute("oncopy", "return;");
  return typeof e.oncopy == "function";
})();

let badZoomedRects = null;

function hasBadZoomedRects(measure) {
  if (badZoomedRects != null) return badZoomedRects;
  let node = removeChildrenAndAdd(measure, elt("span", "x"));
  let normal = node.getBoundingClientRect();
  let fromRange = range(node, 0, 1).getBoundingClientRect();
  return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1;
} // node_modules/codemirror/src/modes.js


let modes4 = {};
let mimeModes = {};

function defineMode(name, mode) {
  if (arguments.length > 2) mode.dependencies = Array.prototype.slice.call(arguments, 2);
  modes4[name] = mode;
}

function defineMIME(mime, spec) {
  mimeModes[mime] = spec;
}

function resolveMode(spec) {
  if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
    spec = mimeModes[spec];
  } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
    let found = mimeModes[spec.name];
    if (typeof found == "string") found = {
      name: found };

    spec = createObj(found, spec);
    spec.name = found.name;
  } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
    return resolveMode("application/xml");
  } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
    return resolveMode("application/json");
  }

  if (typeof spec == "string") return {
    name: spec };else
  return spec || {
    name: "null" };

}

function getMode(options3, spec) {
  spec = resolveMode(spec);
  let mfactory = modes4[spec.name];
  if (!mfactory) return getMode(options3, "text/plain");
  let modeObj = mfactory(options3, spec);

  if (modeExtensions.hasOwnProperty(spec.name)) {
    let exts = modeExtensions[spec.name];

    for (let prop in exts) {
      if (!exts.hasOwnProperty(prop)) continue;
      if (modeObj.hasOwnProperty(prop)) modeObj["_" + prop] = modeObj[prop];
      modeObj[prop] = exts[prop];
    }
  }

  modeObj.name = spec.name;
  if (spec.helperType) modeObj.helperType = spec.helperType;
  if (spec.modeProps) for (let prop in spec.modeProps) modeObj[prop] = spec.modeProps[prop];
  return modeObj;
}

let modeExtensions = {};

function extendMode(mode, properties) {
  let exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : modeExtensions[mode] = {};
  copyObj(properties, exts);
}

function copyState(mode, state) {
  if (state === true) return state;
  if (mode.copyState) return mode.copyState(state);
  let nstate = {};

  for (let n in state) {
    let val = state[n];
    if (val instanceof Array) val = val.concat([]);
    nstate[n] = val;
  }

  return nstate;
}

function innerMode(mode, state) {
  let info;

  while (mode.innerMode) {
    info = mode.innerMode(state);
    if (!info || info.mode == mode) break;
    state = info.state;
    mode = info.mode;
  }

  return info || {
    mode,
    state };

}

function startState(mode, a1, a2) {
  return mode.startState ? mode.startState(a1, a2) : true;
} // node_modules/codemirror/src/util/StringStream.js


class StringStream3 {
  constructor(string, tabSize, lineOracle) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
    this.lineOracle = lineOracle;
  }

  eol() {
    return this.pos >= this.string.length;
  }

  sol() {
    return this.pos == this.lineStart;
  }

  peek() {
    return this.string.charAt(this.pos) || void 0;
  }

  next() {
    if (this.pos < this.string.length) return this.string.charAt(this.pos++);
  }

  eat(match) {
    let ch = this.string.charAt(this.pos);
    let ok;
    if (typeof match == "string") ok = ch == match;else ok = ch && (match.test ? match.test(ch) : match(ch));

    if (ok) {
      ++this.pos;
      return ch;
    }
  }

  eatWhile(match) {
    let start = this.pos;

    while (this.eat(match)) {}

    return this.pos > start;
  }

  eatSpace() {
    let start = this.pos;

    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;

    return this.pos > start;
  }

  skipToEnd() {
    this.pos = this.string.length;
  }

  skipTo(ch) {
    let found = this.string.indexOf(ch, this.pos);

    if (found > -1) {
      this.pos = found;
      return true;
    }
  }

  backUp(n) {
    this.pos -= n;
  }

  column() {
    if (this.lastColumnPos < this.start) {
      this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
      this.lastColumnPos = this.start;
    }

    return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  }

  indentation() {
    return countColumn(this.string, null, this.tabSize) - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  }

  match(pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
      let cased = str => caseInsensitive ? str.toLowerCase() : str;

      let substr = this.string.substr(this.pos, pattern.length);

      if (cased(substr) == cased(pattern)) {
        if (consume !== false) this.pos += pattern.length;
        return true;
      }
    } else {
      let match = this.string.slice(this.pos).match(pattern);
      if (match && match.index > 0) return null;
      if (match && consume !== false) this.pos += match[0].length;
      return match;
    }
  }

  current() {
    return this.string.slice(this.start, this.pos);
  }

  hideFirstChars(n, inner) {
    this.lineStart += n;

    try {
      return inner();
    } finally {
      this.lineStart -= n;
    }
  }

  lookAhead(n) {
    let oracle = this.lineOracle;
    return oracle && oracle.lookAhead(n);
  }

  baseToken() {
    let oracle = this.lineOracle;
    return oracle && oracle.baseToken(this.pos);
  }}



const StringStream_default = StringStream3; // node_modules/codemirror/src/line/utils_line.js

function getLine(doc, n) {
  n -= doc.first;
  if (n < 0 || n >= doc.size) throw new Error("There is no line " + (n + doc.first) + " in the document.");
  let chunk2 = doc;

  while (!chunk2.lines) {
    for (let i = 0;; ++i) {
      let child = chunk2.children[i],
      sz = child.chunkSize();

      if (n < sz) {
        chunk2 = child;
        break;
      }

      n -= sz;
    }
  }

  return chunk2.lines[n];
}

function getBetween(doc, start, end) {
  let out = [],
  n = start.line;
  doc.iter(start.line, end.line + 1, line => {
    let text = line.text;
    if (n == end.line) text = text.slice(0, end.ch);
    if (n == start.line) text = text.slice(start.ch);
    out.push(text);
    ++n;
  });
  return out;
}

function getLines(doc, from, to) {
  let out = [];
  doc.iter(from, to, line => {
    out.push(line.text);
  });
  return out;
}

function updateLineHeight(line, height) {
  let diff = height - line.height;
  if (diff) for (let n = line; n; n = n.parent) n.height += diff;
}

function lineNo(line) {
  if (line.parent == null) return null;
  let cur = line.parent,
  no = indexOf(cur.lines, line);

  for (let chunk2 = cur.parent; chunk2; cur = chunk2, chunk2 = chunk2.parent) {
    for (let i = 0;; ++i) {
      if (chunk2.children[i] == cur) break;
      no += chunk2.children[i].chunkSize();
    }
  }

  return no + cur.first;
}

function lineAtHeight(chunk2, h) {
  let n = chunk2.first;

  outer: do {
    for (let i2 = 0; i2 < chunk2.children.length; ++i2) {
      let child = chunk2.children[i2],
      ch = child.height;

      if (h < ch) {
        chunk2 = child;
        continue outer;
      }

      h -= ch;
      n += child.chunkSize();
    }

    return n;
  } while (!chunk2.lines);

  let i = 0;

  for (; i < chunk2.lines.length; ++i) {
    let line = chunk2.lines[i],
    lh = line.height;
    if (h < lh) break;
    h -= lh;
  }

  return n + i;
}

function isLine(doc, l) {
  return l >= doc.first && l < doc.first + doc.size;
}

function lineNumberFor(options3, i) {
  return String(options3.lineNumberFormatter(i + options3.firstLineNumber));
} // node_modules/codemirror/src/line/pos.js


function Pos(line, ch, sticky = null) {
  if (!(this instanceof Pos)) return new Pos(line, ch, sticky);
  this.line = line;
  this.ch = ch;
  this.sticky = sticky;
}

function cmp(a, b) {
  return a.line - b.line || a.ch - b.ch;
}

function equalCursorPos(a, b) {
  return a.sticky == b.sticky && cmp(a, b) == 0;
}

function copyPos(x) {
  return Pos(x.line, x.ch);
}

function maxPos(a, b) {
  return cmp(a, b) < 0 ? b : a;
}

function minPos(a, b) {
  return cmp(a, b) < 0 ? a : b;
}

function clipLine(doc, n) {
  return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));
}

function clipPos(doc, pos26) {
  if (pos26.line < doc.first) return Pos(doc.first, 0);
  let last = doc.first + doc.size - 1;
  if (pos26.line > last) return Pos(last, getLine(doc, last).text.length);
  return clipToLen(pos26, getLine(doc, pos26.line).text.length);
}

function clipToLen(pos26, linelen) {
  let ch = pos26.ch;
  if (ch == null || ch > linelen) return Pos(pos26.line, linelen);else if (ch < 0) return Pos(pos26.line, 0);else return pos26;
}

function clipPosArray(doc, array) {
  let out = [];

  for (let i = 0; i < array.length; i++) out[i] = clipPos(doc, array[i]);

  return out;
} // node_modules/codemirror/src/line/highlight.js


class SavedContext {
  constructor(state, lookAhead) {
    this.state = state;
    this.lookAhead = lookAhead;
  }}



class Context {
  constructor(doc, state, line, lookAhead) {
    this.state = state;
    this.doc = doc;
    this.line = line;
    this.maxLookAhead = lookAhead || 0;
    this.baseTokens = null;
    this.baseTokenPos = 1;
  }

  lookAhead(n) {
    let line = this.doc.getLine(this.line + n);
    if (line != null && n > this.maxLookAhead) this.maxLookAhead = n;
    return line;
  }

  baseToken(n) {
    if (!this.baseTokens) return null;

    while (this.baseTokens[this.baseTokenPos] <= n) this.baseTokenPos += 2;

    let type = this.baseTokens[this.baseTokenPos + 1];
    return {
      type: type && type.replace(/( |^)overlay .*/, ""),
      size: this.baseTokens[this.baseTokenPos] - n };

  }

  nextLine() {
    this.line++;
    if (this.maxLookAhead > 0) this.maxLookAhead--;
  }

  static fromSaved(doc, saved, line) {
    if (saved instanceof SavedContext) return new Context(doc, copyState(doc.mode, saved.state), line, saved.lookAhead);else return new Context(doc, copyState(doc.mode, saved), line);
  }

  save(copy) {
    let state = copy !== false ? copyState(this.doc.mode, this.state) : this.state;
    return this.maxLookAhead > 0 ? new SavedContext(state, this.maxLookAhead) : state;
  }}



function highlightLine(cm, line, context, forceToEnd) {
  let st = [cm.state.modeGen],
  lineClasses = {};
  runMode(cm, line.text, cm.doc.mode, context, (end, style) => st.push(end, style), lineClasses, forceToEnd);
  let state = context.state;

  for (let o = 0; o < cm.state.overlays.length; ++o) {
    context.baseTokens = st;
    let overlay = cm.state.overlays[o],
    i = 1,
    at = 0;
    context.state = true;
    runMode(cm, line.text, overlay.mode, context, (end, style) => {
      let start = i;

      while (at < end) {
        let i_end = st[i];
        if (i_end > end) st.splice(i, 1, end, st[i + 1], i_end);
        i += 2;
        at = Math.min(end, i_end);
      }

      if (!style) return;

      if (overlay.opaque) {
        st.splice(start, i - start, end, "overlay " + style);
        i = start + 2;
      } else {
        for (; start < i; start += 2) {
          let cur = st[start + 1];
          st[start + 1] = (cur ? cur + " " : "") + "overlay " + style;
        }
      }
    }, lineClasses);
    context.state = state;
    context.baseTokens = null;
    context.baseTokenPos = 1;
  }

  return {
    styles: st,
    classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null };

}

function getLineStyles(cm, line, updateFrontier) {
  if (!line.styles || line.styles[0] != cm.state.modeGen) {
    let context = getContextBefore(cm, lineNo(line));
    let resetState = line.text.length > cm.options.maxHighlightLength && copyState(cm.doc.mode, context.state);
    let result = highlightLine(cm, line, context);
    if (resetState) context.state = resetState;
    line.stateAfter = context.save(!resetState);
    line.styles = result.styles;
    if (result.classes) line.styleClasses = result.classes;else if (line.styleClasses) line.styleClasses = null;
    if (updateFrontier === cm.doc.highlightFrontier) cm.doc.modeFrontier = Math.max(cm.doc.modeFrontier, ++cm.doc.highlightFrontier);
  }

  return line.styles;
}

function getContextBefore(cm, n, precise) {
  let doc = cm.doc,
  display = cm.display;
  if (!doc.mode.startState) return new Context(doc, true, n);
  let start = findStartLine(cm, n, precise);
  let saved = start > doc.first && getLine(doc, start - 1).stateAfter;
  let context = saved ? Context.fromSaved(doc, saved, start) : new Context(doc, startState(doc.mode), start);
  doc.iter(start, n, line => {
    processLine(cm, line.text, context);
    let pos26 = context.line;
    line.stateAfter = pos26 == n - 1 || pos26 % 5 == 0 || pos26 >= display.viewFrom && pos26 < display.viewTo ? context.save() : null;
    context.nextLine();
  });
  if (precise) doc.modeFrontier = context.line;
  return context;
}

function processLine(cm, text, context, startAt) {
  let mode = cm.doc.mode;
  let stream = new StringStream_default(text, cm.options.tabSize, context);
  stream.start = stream.pos = startAt || 0;
  if (text == "") callBlankLine(mode, context.state);

  while (!stream.eol()) {
    readToken(mode, stream, context.state);
    stream.start = stream.pos;
  }
}

function callBlankLine(mode, state) {
  if (mode.blankLine) return mode.blankLine(state);
  if (!mode.innerMode) return;
  let inner = innerMode(mode, state);
  if (inner.mode.blankLine) return inner.mode.blankLine(inner.state);
}

function readToken(mode, stream, state, inner) {
  for (let i = 0; i < 10; i++) {
    if (inner) inner[0] = innerMode(mode, state).mode;
    let style = mode.token(stream, state);
    if (stream.pos > stream.start) return style;
  }

  throw new Error("Mode " + mode.name + " failed to advance stream.");
}

class Token {
  constructor(stream, type, state) {
    this.start = stream.start;
    this.end = stream.pos;
    this.string = stream.current();
    this.type = type || null;
    this.state = state;
  }}



function takeToken(cm, pos26, precise, asArray) {
  let doc = cm.doc,
  mode = doc.mode,
  style;
  pos26 = clipPos(doc, pos26);
  let line = getLine(doc, pos26.line),
  context = getContextBefore(cm, pos26.line, precise);
  let stream = new StringStream_default(line.text, cm.options.tabSize, context),
  tokens;
  if (asArray) tokens = [];

  while ((asArray || stream.pos < pos26.ch) && !stream.eol()) {
    stream.start = stream.pos;
    style = readToken(mode, stream, context.state);
    if (asArray) tokens.push(new Token(stream, style, copyState(doc.mode, context.state)));
  }

  return asArray ? tokens : new Token(stream, style, context.state);
}

function extractLineClasses(type, output) {
  if (type) for (;;) {
    let lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
    if (!lineClass) break;
    type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
    let prop = lineClass[1] ? "bgClass" : "textClass";
    if (output[prop] == null) output[prop] = lineClass[2];else if (!new RegExp("(?:^|\\s)" + lineClass[2] + "(?:$|\\s)").test(output[prop])) output[prop] += " " + lineClass[2];
  }
  return type;
}

function runMode(cm, text, mode, context, f, lineClasses, forceToEnd) {
  let flattenSpans = mode.flattenSpans;
  if (flattenSpans == null) flattenSpans = cm.options.flattenSpans;
  let curStart = 0,
  curStyle = null;
  let stream = new StringStream_default(text, cm.options.tabSize, context),
  style;
  let inner = cm.options.addModeClass && [null];
  if (text == "") extractLineClasses(callBlankLine(mode, context.state), lineClasses);

  while (!stream.eol()) {
    if (stream.pos > cm.options.maxHighlightLength) {
      flattenSpans = false;
      if (forceToEnd) processLine(cm, text, context, stream.pos);
      stream.pos = text.length;
      style = null;
    } else {
      style = extractLineClasses(readToken(mode, stream, context.state, inner), lineClasses);
    }

    if (inner) {
      let mName = inner[0].name;
      if (mName) style = "m-" + (style ? mName + " " + style : mName);
    }

    if (!flattenSpans || curStyle != style) {
      while (curStart < stream.start) {
        curStart = Math.min(stream.start, curStart + 5e3);
        f(curStart, curStyle);
      }

      curStyle = style;
    }

    stream.start = stream.pos;
  }

  while (curStart < stream.pos) {
    let pos26 = Math.min(stream.pos, curStart + 5e3);
    f(pos26, curStyle);
    curStart = pos26;
  }
}

function findStartLine(cm, n, precise) {
  let minindent,
  minline,
  doc = cm.doc;
  let lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1e3 : 100);

  for (let search = n; search > lim; --search) {
    if (search <= doc.first) return doc.first;
    let line = getLine(doc, search - 1),
    after = line.stateAfter;
    if (after && (!precise || search + (after instanceof SavedContext ? after.lookAhead : 0) <= doc.modeFrontier)) return search;
    let indented = countColumn(line.text, null, cm.options.tabSize);

    if (minline == null || minindent > indented) {
      minline = search - 1;
      minindent = indented;
    }
  }

  return minline;
}

function retreatFrontier(doc, n) {
  doc.modeFrontier = Math.min(doc.modeFrontier, n);
  if (doc.highlightFrontier < n - 10) return;
  let start = doc.first;

  for (let line = n - 1; line > start; line--) {
    let saved = getLine(doc, line).stateAfter;

    if (saved && (!(saved instanceof SavedContext) || line + saved.lookAhead < n)) {
      start = line + 1;
      break;
    }
  }

  doc.highlightFrontier = Math.min(doc.highlightFrontier, start);
} // node_modules/codemirror/src/line/saw_special_spans.js


let sawReadOnlySpans = false;
let sawCollapsedSpans = false;

function seeReadOnlySpans() {
  sawReadOnlySpans = true;
}

function seeCollapsedSpans() {
  sawCollapsedSpans = true;
} // node_modules/codemirror/src/line/spans.js


function MarkedSpan(marker, from, to) {
  this.marker = marker;
  this.from = from;
  this.to = to;
}

function getMarkedSpanFor(spans17, marker) {
  if (spans17) for (let i = 0; i < spans17.length; ++i) {
    let span = spans17[i];
    if (span.marker == marker) return span;
  }
}

function removeMarkedSpan(spans17, span) {
  let r;

  for (let i = 0; i < spans17.length; ++i) if (spans17[i] != span) (r || (r = [])).push(spans17[i]);

  return r;
}

function addMarkedSpan(line, span) {
  line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
  span.marker.attachLine(line);
}

function markedSpansBefore(old, startCh, isInsert) {
  let nw;
  if (old) for (let i = 0; i < old.length; ++i) {
    let span = old[i],
    marker = span.marker;
    let startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);

    if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
      let endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
      (nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
    }
  }
  return nw;
}

function markedSpansAfter(old, endCh, isInsert) {
  let nw;
  if (old) for (let i = 0; i < old.length; ++i) {
    let span = old[i],
    marker = span.marker;
    let endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);

    if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
      let startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
      (nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh, span.to == null ? null : span.to - endCh));
    }
  }
  return nw;
}

function stretchSpansOverChange(doc, change) {
  if (change.full) return null;
  let oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
  let oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
  if (!oldFirst && !oldLast) return null;
  let startCh = change.from.ch,
  endCh = change.to.ch,
  isInsert = cmp(change.from, change.to) == 0;
  let first = markedSpansBefore(oldFirst, startCh, isInsert);
  let last = markedSpansAfter(oldLast, endCh, isInsert);
  let sameLine = change.text.length == 1,
  offset = lst(change.text).length + (sameLine ? startCh : 0);

  if (first) {
    for (let i = 0; i < first.length; ++i) {
      let span = first[i];

      if (span.to == null) {
        let found = getMarkedSpanFor(last, span.marker);
        if (!found) span.to = startCh;else if (sameLine) span.to = found.to == null ? null : found.to + offset;
      }
    }
  }

  if (last) {
    for (let i = 0; i < last.length; ++i) {
      let span = last[i];
      if (span.to != null) span.to += offset;

      if (span.from == null) {
        let found = getMarkedSpanFor(first, span.marker);

        if (!found) {
          span.from = offset;
          if (sameLine) (first || (first = [])).push(span);
        }
      } else {
        span.from += offset;
        if (sameLine) (first || (first = [])).push(span);
      }
    }
  }

  if (first) first = clearEmptySpans(first);
  if (last && last != first) last = clearEmptySpans(last);
  let newMarkers = [first];

  if (!sameLine) {
    let gap = change.text.length - 2,
    gapMarkers;

    if (gap > 0 && first) {
      for (let i = 0; i < first.length; ++i) if (first[i].to == null) (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i].marker, null, null));
    }

    for (let i = 0; i < gap; ++i) newMarkers.push(gapMarkers);

    newMarkers.push(last);
  }

  return newMarkers;
}

function clearEmptySpans(spans17) {
  for (let i = 0; i < spans17.length; ++i) {
    let span = spans17[i];
    if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false) spans17.splice(i--, 1);
  }

  if (!spans17.length) return null;
  return spans17;
}

function removeReadOnlyRanges(doc, from, to) {
  let markers = null;
  doc.iter(from.line, to.line + 1, line => {
    if (line.markedSpans) for (let i = 0; i < line.markedSpans.length; ++i) {
      let mark = line.markedSpans[i].marker;
      if (mark.readOnly && (!markers || indexOf(markers, mark) == -1)) (markers || (markers = [])).push(mark);
    }
  });
  if (!markers) return null;
  let parts = [{
    from,
    to }];


  for (let i = 0; i < markers.length; ++i) {
    let mk = markers[i],
    m = mk.find(0);

    for (let j = 0; j < parts.length; ++j) {
      let p = parts[j];
      if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) continue;
      let newParts = [j, 1],
      dfrom = cmp(p.from, m.from),
      dto = cmp(p.to, m.to);
      if (dfrom < 0 || !mk.inclusiveLeft && !dfrom) newParts.push({
        from: p.from,
        to: m.from });

      if (dto > 0 || !mk.inclusiveRight && !dto) newParts.push({
        from: m.to,
        to: p.to });

      parts.splice.apply(parts, newParts);
      j += newParts.length - 3;
    }
  }

  return parts;
}

function detachMarkedSpans(line) {
  let spans17 = line.markedSpans;
  if (!spans17) return;

  for (let i = 0; i < spans17.length; ++i) spans17[i].marker.detachLine(line);

  line.markedSpans = null;
}

function attachMarkedSpans(line, spans17) {
  if (!spans17) return;

  for (let i = 0; i < spans17.length; ++i) spans17[i].marker.attachLine(line);

  line.markedSpans = spans17;
}

function extraLeft(marker) {
  return marker.inclusiveLeft ? -1 : 0;
}

function extraRight(marker) {
  return marker.inclusiveRight ? 1 : 0;
}

function compareCollapsedMarkers(a, b) {
  let lenDiff = a.lines.length - b.lines.length;
  if (lenDiff != 0) return lenDiff;
  let aPos = a.find(),
  bPos = b.find();
  let fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
  if (fromCmp) return -fromCmp;
  let toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
  if (toCmp) return toCmp;
  return b.id - a.id;
}

function collapsedSpanAtSide(line, start) {
  let sps = sawCollapsedSpans && line.markedSpans,
  found;
  if (sps) for (let sp, i = 0; i < sps.length; ++i) {
    sp = sps[i];
    if (sp.marker.collapsed && (start ? sp.from : sp.to) == null && (!found || compareCollapsedMarkers(found, sp.marker) < 0)) found = sp.marker;
  }
  return found;
}

function collapsedSpanAtStart(line) {
  return collapsedSpanAtSide(line, true);
}

function collapsedSpanAtEnd(line) {
  return collapsedSpanAtSide(line, false);
}

function collapsedSpanAround(line, ch) {
  let sps = sawCollapsedSpans && line.markedSpans,
  found;
  if (sps) for (let i = 0; i < sps.length; ++i) {
    let sp = sps[i];
    if (sp.marker.collapsed && (sp.from == null || sp.from < ch) && (sp.to == null || sp.to > ch) && (!found || compareCollapsedMarkers(found, sp.marker) < 0)) found = sp.marker;
  }
  return found;
}

function conflictingCollapsedRange(doc, lineNo2, from, to, marker) {
  let line = getLine(doc, lineNo2);
  let sps = sawCollapsedSpans && line.markedSpans;
  if (sps) for (let i = 0; i < sps.length; ++i) {
    let sp = sps[i];
    if (!sp.marker.collapsed) continue;
    let found = sp.marker.find(0);
    let fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
    let toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
    if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) continue;
    if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) || fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0)) return true;
  }
}

function visualLine(line) {
  let merged;

  while (merged = collapsedSpanAtStart(line)) line = merged.find(-1, true).line;

  return line;
}

function visualLineEnd(line) {
  let merged;

  while (merged = collapsedSpanAtEnd(line)) line = merged.find(1, true).line;

  return line;
}

function visualLineContinued(line) {
  let merged, lines;

  while (merged = collapsedSpanAtEnd(line)) {
    line = merged.find(1, true).line;
    (lines || (lines = [])).push(line);
  }

  return lines;
}

function visualLineNo(doc, lineN) {
  let line = getLine(doc, lineN),
  vis = visualLine(line);
  if (line == vis) return lineN;
  return lineNo(vis);
}

function visualLineEndNo(doc, lineN) {
  if (lineN > doc.lastLine()) return lineN;
  let line = getLine(doc, lineN),
  merged;
  if (!lineIsHidden(doc, line)) return lineN;

  while (merged = collapsedSpanAtEnd(line)) line = merged.find(1, true).line;

  return lineNo(line) + 1;
}

function lineIsHidden(doc, line) {
  let sps = sawCollapsedSpans && line.markedSpans;
  if (sps) for (let sp, i = 0; i < sps.length; ++i) {
    sp = sps[i];
    if (!sp.marker.collapsed) continue;
    if (sp.from == null) return true;
    if (sp.marker.widgetNode) continue;
    if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp)) return true;
  }
}

function lineIsHiddenInner(doc, line, span) {
  if (span.to == null) {
    let end = span.marker.find(1, true);
    return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
  }

  if (span.marker.inclusiveRight && span.to == line.text.length) return true;

  for (let sp, i = 0; i < line.markedSpans.length; ++i) {
    sp = line.markedSpans[i];
    if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to && (sp.to == null || sp.to != span.from) && (sp.marker.inclusiveLeft || span.marker.inclusiveRight) && lineIsHiddenInner(doc, line, sp)) return true;
  }
}

function heightAtLine(lineObj) {
  lineObj = visualLine(lineObj);
  let h = 0,
  chunk2 = lineObj.parent;

  for (let i = 0; i < chunk2.lines.length; ++i) {
    let line = chunk2.lines[i];
    if (line == lineObj) break;else h += line.height;
  }

  for (let p = chunk2.parent; p; chunk2 = p, p = chunk2.parent) {
    for (let i = 0; i < p.children.length; ++i) {
      let cur = p.children[i];
      if (cur == chunk2) break;else h += cur.height;
    }
  }

  return h;
}

function lineLength(line) {
  if (line.height == 0) return 0;
  let len = line.text.length,
  merged,
  cur = line;

  while (merged = collapsedSpanAtStart(cur)) {
    let found = merged.find(0, true);
    cur = found.from.line;
    len += found.from.ch - found.to.ch;
  }

  cur = line;

  while (merged = collapsedSpanAtEnd(cur)) {
    let found = merged.find(0, true);
    len -= cur.text.length - found.from.ch;
    cur = found.to.line;
    len += cur.text.length - found.to.ch;
  }

  return len;
}

function findMaxLine(cm) {
  let d = cm.display,
  doc = cm.doc;
  d.maxLine = getLine(doc, doc.first);
  d.maxLineLength = lineLength(d.maxLine);
  d.maxLineChanged = true;
  doc.iter(line => {
    let len = lineLength(line);

    if (len > d.maxLineLength) {
      d.maxLineLength = len;
      d.maxLine = line;
    }
  });
} // node_modules/codemirror/src/line/line_data.js


class Line {
  constructor(text, markedSpans, estimateHeight2) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight2 ? estimateHeight2(this) : 1;
  }

  lineNo() {
    return lineNo(this);
  }}



eventMixin(Line);

function updateLine(line, text, markedSpans, estimateHeight2) {
  line.text = text;
  if (line.stateAfter) line.stateAfter = null;
  if (line.styles) line.styles = null;
  if (line.order != null) line.order = null;
  detachMarkedSpans(line);
  attachMarkedSpans(line, markedSpans);
  let estHeight = estimateHeight2 ? estimateHeight2(line) : 1;
  if (estHeight != line.height) updateLineHeight(line, estHeight);
}

function cleanUpLine(line) {
  line.parent = null;
  detachMarkedSpans(line);
}

let styleToClassCache = {};
let styleToClassCacheWithMode = {};

function interpretTokenStyle(style, options3) {
  if (!style || /^\s*$/.test(style)) return null;
  let cache = options3.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
  return cache[style] || (cache[style] = style.replace(/\S+/g, "cm-$&"));
}

function buildLineContent(cm, lineView) {
  let content = eltP("span", null, null, webkit ? "padding-right: .1px" : null);
  let builder = {
    pre: eltP("pre", [content], "CodeMirror-line"),
    content,
    col: 0,
    pos: 0,
    cm,
    trailingSpace: false,
    splitSpaces: cm.getOption("lineWrapping") };

  lineView.measure = {};

  for (let i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
    let line = i ? lineView.rest[i - 1] : lineView.line,
    order;
    builder.pos = 0;
    builder.addToken = buildToken;
    if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction))) builder.addToken = buildTokenBadBidi(builder.addToken, order);
    builder.map = [];
    let allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
    insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));

    if (line.styleClasses) {
      if (line.styleClasses.bgClass) builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
      if (line.styleClasses.textClass) builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
    }

    if (builder.map.length == 0) builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));

    if (i == 0) {
      lineView.measure.map = builder.map;
      lineView.measure.cache = {};
    } else {
      (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
      (lineView.measure.caches || (lineView.measure.caches = [])).push({});
    }
  }

  if (webkit) {
    let last = builder.content.lastChild;
    if (/\bcm-tab\b/.test(last.className) || last.querySelector && last.querySelector(".cm-tab")) builder.content.className = "cm-tab-wrap-hack";
  }

  signal(cm, "renderLine", cm, lineView.line, builder.pre);
  if (builder.pre.className) builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");
  return builder;
}

function defaultSpecialCharPlaceholder(ch) {
  let token = elt("span", "•", "cm-invalidchar");
  token.title = "\\u" + ch.charCodeAt(0).toString(16);
  token.setAttribute("aria-label", token.title);
  return token;
}

function buildToken(builder, text, style, startStyle, endStyle, css, attributes) {
  if (!text) return;
  let displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
  let special = builder.cm.state.specialChars,
  mustWrap = false;
  let content;

  if (!special.test(text)) {
    builder.col += text.length;
    content = document.createTextNode(displayText);
    builder.map.push(builder.pos, builder.pos + text.length, content);
    if (ie && ie_version < 9) mustWrap = true;
    builder.pos += text.length;
  } else {
    content = document.createDocumentFragment();
    let pos26 = 0;

    while (true) {
      special.lastIndex = pos26;
      let m = special.exec(text);
      let skipped = m ? m.index - pos26 : text.length - pos26;

      if (skipped) {
        let txt2 = document.createTextNode(displayText.slice(pos26, pos26 + skipped));
        if (ie && ie_version < 9) content.appendChild(elt("span", [txt2]));else content.appendChild(txt2);
        builder.map.push(builder.pos, builder.pos + skipped, txt2);
        builder.col += skipped;
        builder.pos += skipped;
      }

      if (!m) break;
      pos26 += skipped + 1;
      let txt;

      if (m[0] == "	") {
        let tabSize = builder.cm.options.tabSize,
        tabWidth = tabSize - builder.col % tabSize;
        txt = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
        txt.setAttribute("role", "presentation");
        txt.setAttribute("cm-text", "	");
        builder.col += tabWidth;
      } else if (m[0] == "\r" || m[0] == "\n") {
        txt = content.appendChild(elt("span", m[0] == "\r" ? "␍" : "␤", "cm-invalidchar"));
        txt.setAttribute("cm-text", m[0]);
        builder.col += 1;
      } else {
        txt = builder.cm.options.specialCharPlaceholder(m[0]);
        txt.setAttribute("cm-text", m[0]);
        if (ie && ie_version < 9) content.appendChild(elt("span", [txt]));else content.appendChild(txt);
        builder.col += 1;
      }

      builder.map.push(builder.pos, builder.pos + 1, txt);
      builder.pos++;
    }
  }

  builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;

  if (style || startStyle || endStyle || mustWrap || css) {
    let fullStyle = style || "";
    if (startStyle) fullStyle += startStyle;
    if (endStyle) fullStyle += endStyle;
    let token = elt("span", [content], fullStyle, css);

    if (attributes) {
      for (let attr in attributes) if (attributes.hasOwnProperty(attr) && attr != "style" && attr != "class") token.setAttribute(attr, attributes[attr]);
    }

    return builder.content.appendChild(token);
  }

  builder.content.appendChild(content);
}

function splitSpaces(text, trailingBefore) {
  if (text.length > 1 && !/  /.test(text)) return text;
  let spaceBefore = trailingBefore,
  result = "";

  for (let i = 0; i < text.length; i++) {
    let ch = text.charAt(i);
    if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32)) ch = " ";
    result += ch;
    spaceBefore = ch == " ";
  }

  return result;
}

function buildTokenBadBidi(inner, order) {
  return (builder, text, style, startStyle, endStyle, css, attributes) => {
    style = style ? style + " cm-force-border" : "cm-force-border";
    let start = builder.pos,
    end = start + text.length;

    for (;;) {
      let part;

      for (let i = 0; i < order.length; i++) {
        part = order[i];
        if (part.to > start && part.from <= start) break;
      }

      if (part.to >= end) return inner(builder, text, style, startStyle, endStyle, css, attributes);
      inner(builder, text.slice(0, part.to - start), style, startStyle, null, css, attributes);
      startStyle = null;
      text = text.slice(part.to - start);
      start = part.to;
    }
  };
}

function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
  let widget = !ignoreWidget && marker.widgetNode;
  if (widget) builder.map.push(builder.pos, builder.pos + size, widget);

  if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
    if (!widget) widget = builder.content.appendChild(document.createElement("span"));
    widget.setAttribute("cm-marker", marker.id);
  }

  if (widget) {
    builder.cm.display.input.setUneditable(widget);
    builder.content.appendChild(widget);
  }

  builder.pos += size;
  builder.trailingSpace = false;
}

function insertLineContent(line, builder, styles) {
  let spans17 = line.markedSpans,
  allText = line.text,
  at = 0;

  if (!spans17) {
    for (let i2 = 1; i2 < styles.length; i2 += 2) builder.addToken(builder, allText.slice(at, at = styles[i2]), interpretTokenStyle(styles[i2 + 1], builder.cm.options));

    return;
  }

  let len = allText.length,
  pos26 = 0,
  i = 1,
  text = "",
  style,
  css;
  let nextChange = 0,
  spanStyle,
  spanEndStyle,
  spanStartStyle,
  collapsed,
  attributes;

  for (;;) {
    if (nextChange == pos26) {
      spanStyle = spanEndStyle = spanStartStyle = css = "";
      attributes = null;
      collapsed = null;
      nextChange = Infinity;
      let foundBookmarks = [],
      endStyles;

      for (let j = 0; j < spans17.length; ++j) {
        let sp = spans17[j],
        m = sp.marker;

        if (m.type == "bookmark" && sp.from == pos26 && m.widgetNode) {
          foundBookmarks.push(m);
        } else if (sp.from <= pos26 && (sp.to == null || sp.to > pos26 || m.collapsed && sp.to == pos26 && sp.from == pos26)) {
          if (sp.to != null && sp.to != pos26 && nextChange > sp.to) {
            nextChange = sp.to;
            spanEndStyle = "";
          }

          if (m.className) spanStyle += " " + m.className;
          if (m.css) css = (css ? css + ";" : "") + m.css;
          if (m.startStyle && sp.from == pos26) spanStartStyle += " " + m.startStyle;
          if (m.endStyle && sp.to == nextChange) (endStyles || (endStyles = [])).push(m.endStyle, sp.to);
          if (m.title) (attributes || (attributes = {})).title = m.title;

          if (m.attributes) {
            for (let attr in m.attributes) (attributes || (attributes = {}))[attr] = m.attributes[attr];
          }

          if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0)) collapsed = sp;
        } else if (sp.from > pos26 && nextChange > sp.from) {
          nextChange = sp.from;
        }
      }

      if (endStyles) {
        for (let j = 0; j < endStyles.length; j += 2) if (endStyles[j + 1] == nextChange) spanEndStyle += " " + endStyles[j];
      }

      if (!collapsed || collapsed.from == pos26) for (let j = 0; j < foundBookmarks.length; ++j) buildCollapsedSpan(builder, 0, foundBookmarks[j]);

      if (collapsed && (collapsed.from || 0) == pos26) {
        buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos26, collapsed.marker, collapsed.from == null);
        if (collapsed.to == null) return;
        if (collapsed.to == pos26) collapsed = false;
      }
    }

    if (pos26 >= len) break;
    let upto = Math.min(len, nextChange);

    while (true) {
      if (text) {
        let end = pos26 + text.length;

        if (!collapsed) {
          let tokenText = end > upto ? text.slice(0, upto - pos26) : text;
          builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle, spanStartStyle, pos26 + tokenText.length == nextChange ? spanEndStyle : "", css, attributes);
        }

        if (end >= upto) {
          text = text.slice(upto - pos26);
          pos26 = upto;
          break;
        }

        pos26 = end;
        spanStartStyle = "";
      }

      text = allText.slice(at, at = styles[i++]);
      style = interpretTokenStyle(styles[i++], builder.cm.options);
    }
  }
}

function LineView(doc, line, lineN) {
  this.line = line;
  this.rest = visualLineContinued(line);
  this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
  this.node = this.text = null;
  this.hidden = lineIsHidden(doc, line);
}

function buildViewArray(cm, from, to) {
  let array = [],
  nextPos;

  for (let pos26 = from; pos26 < to; pos26 = nextPos) {
    let view = new LineView(cm.doc, getLine(cm.doc, pos26), pos26);
    nextPos = pos26 + view.size;
    array.push(view);
  }

  return array;
} // node_modules/codemirror/src/util/operation_group.js


let operationGroup = null;

function pushOperation(op) {
  if (operationGroup) {
    operationGroup.ops.push(op);
  } else {
    op.ownsGroup = operationGroup = {
      ops: [op],
      delayedCallbacks: [] };

  }
}

function fireCallbacksForOps(group) {
  let callbacks = group.delayedCallbacks,
  i = 0;

  do {
    for (; i < callbacks.length; i++) callbacks[i].call(null);

    for (let j = 0; j < group.ops.length; j++) {
      let op = group.ops[j];
      if (op.cursorActivityHandlers) while (op.cursorActivityCalled < op.cursorActivityHandlers.length) op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm);
    }
  } while (i < callbacks.length);
}

function finishOperation(op, endCb) {
  let group = op.ownsGroup;
  if (!group) return;

  try {
    fireCallbacksForOps(group);
  } finally {
    operationGroup = null;
    endCb(group);
  }
}

let orphanDelayedCallbacks = null;

function signalLater(emitter, type) {
  let arr = getHandlers(emitter, type);
  if (!arr.length) return;
  let args = Array.prototype.slice.call(arguments, 2),
  list;

  if (operationGroup) {
    list = operationGroup.delayedCallbacks;
  } else if (orphanDelayedCallbacks) {
    list = orphanDelayedCallbacks;
  } else {
    list = orphanDelayedCallbacks = [];
    setTimeout(fireOrphanDelayed, 0);
  }

  for (let i = 0; i < arr.length; ++i) list.push(() => arr[i].apply(null, args));
}

function fireOrphanDelayed() {
  let delayed = orphanDelayedCallbacks;
  orphanDelayedCallbacks = null;

  for (let i = 0; i < delayed.length; ++i) delayed[i]();
} // node_modules/codemirror/src/display/update_line.js


function updateLineForChanges(cm, lineView, lineN, dims) {
  for (let j = 0; j < lineView.changes.length; j++) {
    let type = lineView.changes[j];
    if (type == "text") updateLineText(cm, lineView);else if (type == "gutter") updateLineGutter(cm, lineView, lineN, dims);else if (type == "class") updateLineClasses(cm, lineView);else if (type == "widget") updateLineWidgets(cm, lineView, dims);
  }

  lineView.changes = null;
}

function ensureLineWrapped(lineView) {
  if (lineView.node == lineView.text) {
    lineView.node = elt("div", null, null, "position: relative");
    if (lineView.text.parentNode) lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
    lineView.node.appendChild(lineView.text);
    if (ie && ie_version < 8) lineView.node.style.zIndex = 2;
  }

  return lineView.node;
}

function updateLineBackground(cm, lineView) {
  let cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
  if (cls) cls += " CodeMirror-linebackground";

  if (lineView.background) {
    if (cls) lineView.background.className = cls;else {
      lineView.background.parentNode.removeChild(lineView.background);
      lineView.background = null;
    }
  } else if (cls) {
    let wrap = ensureLineWrapped(lineView);
    lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
    cm.display.input.setUneditable(lineView.background);
  }
}

function getLineContent(cm, lineView) {
  let ext = cm.display.externalMeasured;

  if (ext && ext.line == lineView.line) {
    cm.display.externalMeasured = null;
    lineView.measure = ext.measure;
    return ext.built;
  }

  return buildLineContent(cm, lineView);
}

function updateLineText(cm, lineView) {
  let cls = lineView.text.className;
  let built = getLineContent(cm, lineView);
  if (lineView.text == lineView.node) lineView.node = built.pre;
  lineView.text.parentNode.replaceChild(built.pre, lineView.text);
  lineView.text = built.pre;

  if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
    lineView.bgClass = built.bgClass;
    lineView.textClass = built.textClass;
    updateLineClasses(cm, lineView);
  } else if (cls) {
    lineView.text.className = cls;
  }
}

function updateLineClasses(cm, lineView) {
  updateLineBackground(cm, lineView);
  if (lineView.line.wrapClass) ensureLineWrapped(lineView).className = lineView.line.wrapClass;else if (lineView.node != lineView.text) lineView.node.className = "";
  let textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
  lineView.text.className = textClass || "";
}

function updateLineGutter(cm, lineView, lineN, dims) {
  if (lineView.gutter) {
    lineView.node.removeChild(lineView.gutter);
    lineView.gutter = null;
  }

  if (lineView.gutterBackground) {
    lineView.node.removeChild(lineView.gutterBackground);
    lineView.gutterBackground = null;
  }

  if (lineView.line.gutterClass) {
    let wrap = ensureLineWrapped(lineView);
    lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass, `left: ${cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth}px; width: ${dims.gutterTotalWidth}px`);
    cm.display.input.setUneditable(lineView.gutterBackground);
    wrap.insertBefore(lineView.gutterBackground, lineView.text);
  }

  let markers = lineView.line.gutterMarkers;

  if (cm.options.lineNumbers || markers) {
    let wrap = ensureLineWrapped(lineView);
    let gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", `left: ${cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth}px`);
    cm.display.input.setUneditable(gutterWrap);
    wrap.insertBefore(gutterWrap, lineView.text);
    if (lineView.line.gutterClass) gutterWrap.className += " " + lineView.line.gutterClass;
    if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"])) lineView.lineNumber = gutterWrap.appendChild(elt("div", lineNumberFor(cm.options, lineN), "CodeMirror-linenumber CodeMirror-gutter-elt", `left: ${dims.gutterLeft["CodeMirror-linenumbers"]}px; width: ${cm.display.lineNumInnerWidth}px`));
    if (markers) for (let k = 0; k < cm.display.gutterSpecs.length; ++k) {
      let id = cm.display.gutterSpecs[k].className,
      found = markers.hasOwnProperty(id) && markers[id];
      if (found) gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", `left: ${dims.gutterLeft[id]}px; width: ${dims.gutterWidth[id]}px`));
    }
  }
}

function updateLineWidgets(cm, lineView, dims) {
  if (lineView.alignable) lineView.alignable = null;
  let isWidget = classTest("CodeMirror-linewidget");

  for (let node = lineView.node.firstChild, next; node; node = next) {
    next = node.nextSibling;
    if (isWidget.test(node.className)) lineView.node.removeChild(node);
  }

  insertLineWidgets(cm, lineView, dims);
}

function buildLineElement(cm, lineView, lineN, dims) {
  let built = getLineContent(cm, lineView);
  lineView.text = lineView.node = built.pre;
  if (built.bgClass) lineView.bgClass = built.bgClass;
  if (built.textClass) lineView.textClass = built.textClass;
  updateLineClasses(cm, lineView);
  updateLineGutter(cm, lineView, lineN, dims);
  insertLineWidgets(cm, lineView, dims);
  return lineView.node;
}

function insertLineWidgets(cm, lineView, dims) {
  insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
  if (lineView.rest) for (let i = 0; i < lineView.rest.length; i++) insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false);
}

function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
  if (!line.widgets) return;
  let wrap = ensureLineWrapped(lineView);

  for (let i = 0, ws = line.widgets; i < ws.length; ++i) {
    let widget = ws[i],
    node = elt("div", [widget.node], "CodeMirror-linewidget" + (widget.className ? " " + widget.className : ""));
    if (!widget.handleMouseEvents) node.setAttribute("cm-ignore-events", "true");
    positionLineWidget(widget, node, lineView, dims);
    cm.display.input.setUneditable(node);
    if (allowAbove && widget.above) wrap.insertBefore(node, lineView.gutter || lineView.text);else wrap.appendChild(node);
    signalLater(widget, "redraw");
  }
}

function positionLineWidget(widget, node, lineView, dims) {
  if (widget.noHScroll) {
    (lineView.alignable || (lineView.alignable = [])).push(node);
    let width = dims.wrapperWidth;
    node.style.left = dims.fixedPos + "px";

    if (!widget.coverGutter) {
      width -= dims.gutterTotalWidth;
      node.style.paddingLeft = dims.gutterTotalWidth + "px";
    }

    node.style.width = width + "px";
  }

  if (widget.coverGutter) {
    node.style.zIndex = 5;
    node.style.position = "relative";
    if (!widget.noHScroll) node.style.marginLeft = -dims.gutterTotalWidth + "px";
  }
} // node_modules/codemirror/src/measurement/widgets.js


function widgetHeight(widget) {
  if (widget.height != null) return widget.height;
  let cm = widget.doc.cm;
  if (!cm) return 0;

  if (!contains(document.body, widget.node)) {
    let parentStyle = "position: relative;";
    if (widget.coverGutter) parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;";
    if (widget.noHScroll) parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;";
    removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
  }

  return widget.height = widget.node.parentNode.offsetHeight;
}

function eventInWidget(display, e) {
  for (let n = e_target(e); n != display.wrapper; n = n.parentNode) {
    if (!n || n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true" || n.parentNode == display.sizer && n != display.mover) return true;
  }
} // node_modules/codemirror/src/measurement/position_measurement.js


function paddingTop(display) {
  return display.lineSpace.offsetTop;
}

function paddingVert(display) {
  return display.mover.offsetHeight - display.lineSpace.offsetHeight;
}

function paddingH(display) {
  if (display.cachedPaddingH) return display.cachedPaddingH;
  let e = removeChildrenAndAdd(display.measure, elt("pre", "x", "CodeMirror-line-like"));
  let style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
  let data = {
    left: parseInt(style.paddingLeft),
    right: parseInt(style.paddingRight) };

  if (!isNaN(data.left) && !isNaN(data.right)) display.cachedPaddingH = data;
  return data;
}

function scrollGap(cm) {
  return scrollerGap - cm.display.nativeBarWidth;
}

function displayWidth(cm) {
  return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth;
}

function displayHeight(cm) {
  return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight;
}

function ensureLineHeights(cm, lineView, rect) {
  let wrapping = cm.options.lineWrapping;
  let curWidth = wrapping && displayWidth(cm);

  if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
    let heights = lineView.measure.heights = [];

    if (wrapping) {
      lineView.measure.width = curWidth;
      let rects = lineView.text.firstChild.getClientRects();

      for (let i = 0; i < rects.length - 1; i++) {
        let cur = rects[i],
        next = rects[i + 1];
        if (Math.abs(cur.bottom - next.bottom) > 2) heights.push((cur.bottom + next.top) / 2 - rect.top);
      }
    }

    heights.push(rect.bottom - rect.top);
  }
}

function mapFromLineView(lineView, line, lineN) {
  if (lineView.line == line) return {
    map: lineView.measure.map,
    cache: lineView.measure.cache };


  for (let i = 0; i < lineView.rest.length; i++) if (lineView.rest[i] == line) return {
    map: lineView.measure.maps[i],
    cache: lineView.measure.caches[i] };


  for (let i = 0; i < lineView.rest.length; i++) if (lineNo(lineView.rest[i]) > lineN) return {
    map: lineView.measure.maps[i],
    cache: lineView.measure.caches[i],
    before: true };

}

function updateExternalMeasurement(cm, line) {
  line = visualLine(line);
  let lineN = lineNo(line);
  let view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
  view.lineN = lineN;
  let built = view.built = buildLineContent(cm, view);
  view.text = built.pre;
  removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
  return view;
}

function measureChar(cm, line, ch, bias) {
  return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
}

function findViewForLine(cm, lineN) {
  if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo) return cm.display.view[findViewIndex(cm, lineN)];
  let ext = cm.display.externalMeasured;
  if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size) return ext;
}

function prepareMeasureForLine(cm, line) {
  let lineN = lineNo(line);
  let view = findViewForLine(cm, lineN);

  if (view && !view.text) {
    view = null;
  } else if (view && view.changes) {
    updateLineForChanges(cm, view, lineN, getDimensions(cm));
    cm.curOp.forceUpdate = true;
  }

  if (!view) view = updateExternalMeasurement(cm, line);
  let info = mapFromLineView(view, line, lineN);
  return {
    line,
    view,
    rect: null,
    map: info.map,
    cache: info.cache,
    before: info.before,
    hasHeights: false };

}

function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
  if (prepared.before) ch = -1;
  let key = ch + (bias || ""),
  found;

  if (prepared.cache.hasOwnProperty(key)) {
    found = prepared.cache[key];
  } else {
    if (!prepared.rect) prepared.rect = prepared.view.text.getBoundingClientRect();

    if (!prepared.hasHeights) {
      ensureLineHeights(cm, prepared.view, prepared.rect);
      prepared.hasHeights = true;
    }

    found = measureCharInner(cm, prepared, ch, bias);
    if (!found.bogus) prepared.cache[key] = found;
  }

  return {
    left: found.left,
    right: found.right,
    top: varHeight ? found.rtop : found.top,
    bottom: varHeight ? found.rbottom : found.bottom };

}

let nullRect = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0 };


function nodeAndOffsetInLineMap(map2, ch, bias) {
  let node, start, end, collapse, mStart, mEnd;

  for (let i = 0; i < map2.length; i += 3) {
    mStart = map2[i];
    mEnd = map2[i + 1];

    if (ch < mStart) {
      start = 0;
      end = 1;
      collapse = "left";
    } else if (ch < mEnd) {
      start = ch - mStart;
      end = start + 1;
    } else if (i == map2.length - 3 || ch == mEnd && map2[i + 3] > ch) {
      end = mEnd - mStart;
      start = end - 1;
      if (ch >= mEnd) collapse = "right";
    }

    if (start != null) {
      node = map2[i + 2];
      if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right")) collapse = bias;
      if (bias == "left" && start == 0) while (i && map2[i - 2] == map2[i - 3] && map2[i - 1].insertLeft) {
        node = map2[(i -= 3) + 2];
        collapse = "left";
      }
      if (bias == "right" && start == mEnd - mStart) while (i < map2.length - 3 && map2[i + 3] == map2[i + 4] && !map2[i + 5].insertLeft) {
        node = map2[(i += 3) + 2];
        collapse = "right";
      }
      break;
    }
  }

  return {
    node,
    start,
    end,
    collapse,
    coverStart: mStart,
    coverEnd: mEnd };

}

function getUsefulRect(rects, bias) {
  let rect = nullRect;
  if (bias == "left") for (let i = 0; i < rects.length; i++) {
    if ((rect = rects[i]).left != rect.right) break;
  } else for (let i = rects.length - 1; i >= 0; i--) {
    if ((rect = rects[i]).left != rect.right) break;
  }
  return rect;
}

function measureCharInner(cm, prepared, ch, bias) {
  let place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
  let node = place.node,
  start = place.start,
  end = place.end,
  collapse = place.collapse;
  let rect;

  if (node.nodeType == 3) {
    for (let i2 = 0; i2 < 4; i2++) {
      while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) --start;

      while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) ++end;

      if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart) rect = node.parentNode.getBoundingClientRect();else rect = getUsefulRect(range(node, start, end).getClientRects(), bias);
      if (rect.left || rect.right || start == 0) break;
      end = start;
      start = start - 1;
      collapse = "right";
    }

    if (ie && ie_version < 11) rect = maybeUpdateRectForZooming(cm.display.measure, rect);
  } else {
    if (start > 0) collapse = bias = "right";
    let rects;
    if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1) rect = rects[bias == "right" ? rects.length - 1 : 0];else rect = node.getBoundingClientRect();
  }

  if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
    let rSpan = node.parentNode.getClientRects()[0];
    if (rSpan) rect = {
      left: rSpan.left,
      right: rSpan.left + charWidth(cm.display),
      top: rSpan.top,
      bottom: rSpan.bottom };else
    rect = nullRect;
  }

  let rtop = rect.top - prepared.rect.top,
  rbot = rect.bottom - prepared.rect.top;
  let mid = (rtop + rbot) / 2;
  let heights = prepared.view.measure.heights;
  let i = 0;

  for (; i < heights.length - 1; i++) if (mid < heights[i]) break;

  let top = i ? heights[i - 1] : 0,
  bot = heights[i];
  let result = {
    left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
    right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
    top,
    bottom: bot };

  if (!rect.left && !rect.right) result.bogus = true;

  if (!cm.options.singleCursorHeightPerLine) {
    result.rtop = rtop;
    result.rbottom = rbot;
  }

  return result;
}

function maybeUpdateRectForZooming(measure, rect) {
  if (!window.screen || screen.logicalXDPI == null || screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure)) return rect;
  let scaleX = screen.logicalXDPI / screen.deviceXDPI;
  let scaleY = screen.logicalYDPI / screen.deviceYDPI;
  return {
    left: rect.left * scaleX,
    right: rect.right * scaleX,
    top: rect.top * scaleY,
    bottom: rect.bottom * scaleY };

}

function clearLineMeasurementCacheFor(lineView) {
  if (lineView.measure) {
    lineView.measure.cache = {};
    lineView.measure.heights = null;
    if (lineView.rest) for (let i = 0; i < lineView.rest.length; i++) lineView.measure.caches[i] = {};
  }
}

function clearLineMeasurementCache(cm) {
  cm.display.externalMeasure = null;
  removeChildren(cm.display.lineMeasure);

  for (let i = 0; i < cm.display.view.length; i++) clearLineMeasurementCacheFor(cm.display.view[i]);
}

function clearCaches(cm) {
  clearLineMeasurementCache(cm);
  cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
  if (!cm.options.lineWrapping) cm.display.maxLineChanged = true;
  cm.display.lineNumChars = null;
}

function pageScrollX() {
  if (chrome && android) return -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft));
  return window.pageXOffset || (document.documentElement || document.body).scrollLeft;
}

function pageScrollY() {
  if (chrome && android) return -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop));
  return window.pageYOffset || (document.documentElement || document.body).scrollTop;
}

function widgetTopHeight(lineObj) {
  let height = 0;

  if (lineObj.widgets) {
    for (let i = 0; i < lineObj.widgets.length; ++i) if (lineObj.widgets[i].above) height += widgetHeight(lineObj.widgets[i]);
  }

  return height;
}

function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
  if (!includeWidgets) {
    let height = widgetTopHeight(lineObj);
    rect.top += height;
    rect.bottom += height;
  }

  if (context == "line") return rect;
  if (!context) context = "local";
  let yOff = heightAtLine(lineObj);
  if (context == "local") yOff += paddingTop(cm.display);else yOff -= cm.display.viewOffset;

  if (context == "page" || context == "window") {
    let lOff = cm.display.lineSpace.getBoundingClientRect();
    yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
    let xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
    rect.left += xOff;
    rect.right += xOff;
  }

  rect.top += yOff;
  rect.bottom += yOff;
  return rect;
}

function fromCoordSystem(cm, coords, context) {
  if (context == "div") return coords;
  let left = coords.left,
  top = coords.top;

  if (context == "page") {
    left -= pageScrollX();
    top -= pageScrollY();
  } else if (context == "local" || !context) {
    let localBox = cm.display.sizer.getBoundingClientRect();
    left += localBox.left;
    top += localBox.top;
  }

  let lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
  return {
    left: left - lineSpaceBox.left,
    top: top - lineSpaceBox.top };

}

function charCoords(cm, pos26, context, lineObj, bias) {
  if (!lineObj) lineObj = getLine(cm.doc, pos26.line);
  return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos26.ch, bias), context);
}

function cursorCoords(cm, pos26, context, lineObj, preparedMeasure, varHeight) {
  lineObj = lineObj || getLine(cm.doc, pos26.line);
  if (!preparedMeasure) preparedMeasure = prepareMeasureForLine(cm, lineObj);

  function get(ch2, right) {
    let m = measureCharPrepared(cm, preparedMeasure, ch2, right ? "right" : "left", varHeight);
    if (right) m.left = m.right;else m.right = m.left;
    return intoCoordSystem(cm, lineObj, m, context);
  }

  let order = getOrder(lineObj, cm.doc.direction),
  ch = pos26.ch,
  sticky = pos26.sticky;

  if (ch >= lineObj.text.length) {
    ch = lineObj.text.length;
    sticky = "before";
  } else if (ch <= 0) {
    ch = 0;
    sticky = "after";
  }

  if (!order) return get(sticky == "before" ? ch - 1 : ch, sticky == "before");

  function getBidi(ch2, partPos2, invert) {
    let part = order[partPos2],
    right = part.level == 1;
    return get(invert ? ch2 - 1 : ch2, right != invert);
  }

  let partPos = getBidiPartAt(order, ch, sticky);
  let other = bidiOther;
  let val = getBidi(ch, partPos, sticky == "before");
  if (other != null) val.other = getBidi(ch, other, sticky != "before");
  return val;
}

function estimateCoords(cm, pos26) {
  let left = 0;
  pos26 = clipPos(cm.doc, pos26);
  if (!cm.options.lineWrapping) left = charWidth(cm.display) * pos26.ch;
  let lineObj = getLine(cm.doc, pos26.line);
  let top = heightAtLine(lineObj) + paddingTop(cm.display);
  return {
    left,
    right: left,
    top,
    bottom: top + lineObj.height };

}

function PosWithInfo(line, ch, sticky, outside, xRel) {
  let pos26 = Pos(line, ch, sticky);
  pos26.xRel = xRel;
  if (outside) pos26.outside = outside;
  return pos26;
}

function coordsChar(cm, x, y) {
  let doc = cm.doc;
  y += cm.display.viewOffset;
  if (y < 0) return PosWithInfo(doc.first, 0, null, -1, -1);
  let lineN = lineAtHeight(doc, y),
  last = doc.first + doc.size - 1;
  if (lineN > last) return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, 1, 1);
  if (x < 0) x = 0;
  let lineObj = getLine(doc, lineN);

  for (;;) {
    let found = coordsCharInner(cm, lineObj, lineN, x, y);
    let collapsed = collapsedSpanAround(lineObj, found.ch + (found.xRel > 0 || found.outside > 0 ? 1 : 0));
    if (!collapsed) return found;
    let rangeEnd = collapsed.find(1);
    if (rangeEnd.line == lineN) return rangeEnd;
    lineObj = getLine(doc, lineN = rangeEnd.line);
  }
}

function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
  y -= widgetTopHeight(lineObj);
  let end = lineObj.text.length;
  let begin = findFirst(ch => measureCharPrepared(cm, preparedMeasure, ch - 1).bottom <= y, end, 0);
  end = findFirst(ch => measureCharPrepared(cm, preparedMeasure, ch).top > y, begin, end);
  return {
    begin,
    end };

}

function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
  if (!preparedMeasure) preparedMeasure = prepareMeasureForLine(cm, lineObj);
  let targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
  return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop);
}

function boxIsAfter(box, x, y, left) {
  return box.bottom <= y ? false : box.top > y ? true : (left ? box.left : box.right) > x;
}

function coordsCharInner(cm, lineObj, lineNo2, x, y) {
  y -= heightAtLine(lineObj);
  let preparedMeasure = prepareMeasureForLine(cm, lineObj);
  let widgetHeight2 = widgetTopHeight(lineObj);
  let begin = 0,
  end = lineObj.text.length,
  ltr = true;
  let order = getOrder(lineObj, cm.doc.direction);

  if (order) {
    let part = (cm.options.lineWrapping ? coordsBidiPartWrapped : coordsBidiPart)(cm, lineObj, lineNo2, preparedMeasure, order, x, y);
    ltr = part.level != 1;
    begin = ltr ? part.from : part.to - 1;
    end = ltr ? part.to : part.from - 1;
  }

  let chAround = null,
  boxAround = null;
  let ch = findFirst(ch2 => {
    let box = measureCharPrepared(cm, preparedMeasure, ch2);
    box.top += widgetHeight2;
    box.bottom += widgetHeight2;
    if (!boxIsAfter(box, x, y, false)) return false;

    if (box.top <= y && box.left <= x) {
      chAround = ch2;
      boxAround = box;
    }

    return true;
  }, begin, end);
  let baseX,
  sticky,
  outside = false;

  if (boxAround) {
    let atLeft = x - boxAround.left < boxAround.right - x,
    atStart = atLeft == ltr;
    ch = chAround + (atStart ? 0 : 1);
    sticky = atStart ? "after" : "before";
    baseX = atLeft ? boxAround.left : boxAround.right;
  } else {
    if (!ltr && (ch == end || ch == begin)) ch++;
    sticky = ch == 0 ? "after" : ch == lineObj.text.length ? "before" : measureCharPrepared(cm, preparedMeasure, ch - (ltr ? 1 : 0)).bottom + widgetHeight2 <= y == ltr ? "after" : "before";
    let coords = cursorCoords(cm, Pos(lineNo2, ch, sticky), "line", lineObj, preparedMeasure);
    baseX = coords.left;
    outside = y < coords.top ? -1 : y >= coords.bottom ? 1 : 0;
  }

  ch = skipExtendingChars(lineObj.text, ch, 1);
  return PosWithInfo(lineNo2, ch, sticky, outside, x - baseX);
}

function coordsBidiPart(cm, lineObj, lineNo2, preparedMeasure, order, x, y) {
  let index = findFirst(i => {
    let part2 = order[i],
    ltr = part2.level != 1;
    return boxIsAfter(cursorCoords(cm, Pos(lineNo2, ltr ? part2.to : part2.from, ltr ? "before" : "after"), "line", lineObj, preparedMeasure), x, y, true);
  }, 0, order.length - 1);
  let part = order[index];

  if (index > 0) {
    let ltr = part.level != 1;
    let start = cursorCoords(cm, Pos(lineNo2, ltr ? part.from : part.to, ltr ? "after" : "before"), "line", lineObj, preparedMeasure);
    if (boxIsAfter(start, x, y, true) && start.top > y) part = order[index - 1];
  }

  return part;
}

function coordsBidiPartWrapped(cm, lineObj, _lineNo, preparedMeasure, order, x, y) {
  let {
    begin,
    end } =
  wrappedLineExtent(cm, lineObj, preparedMeasure, y);
  if (/\s/.test(lineObj.text.charAt(end - 1))) end--;
  let part = null,
  closestDist = null;

  for (let i = 0; i < order.length; i++) {
    let p = order[i];
    if (p.from >= end || p.to <= begin) continue;
    let ltr = p.level != 1;
    let endX = measureCharPrepared(cm, preparedMeasure, ltr ? Math.min(end, p.to) - 1 : Math.max(begin, p.from)).right;
    let dist = endX < x ? x - endX + 1e9 : endX - x;

    if (!part || closestDist > dist) {
      part = p;
      closestDist = dist;
    }
  }

  if (!part) part = order[order.length - 1];
  if (part.from < begin) part = {
    from: begin,
    to: part.to,
    level: part.level };

  if (part.to > end) part = {
    from: part.from,
    to: end,
    level: part.level };

  return part;
}

let measureText;

function textHeight(display) {
  if (display.cachedTextHeight != null) return display.cachedTextHeight;

  if (measureText == null) {
    measureText = elt("pre", null, "CodeMirror-line-like");

    for (let i = 0; i < 49; ++i) {
      measureText.appendChild(document.createTextNode("x"));
      measureText.appendChild(elt("br"));
    }

    measureText.appendChild(document.createTextNode("x"));
  }

  removeChildrenAndAdd(display.measure, measureText);
  let height = measureText.offsetHeight / 50;
  if (height > 3) display.cachedTextHeight = height;
  removeChildren(display.measure);
  return height || 1;
}

function charWidth(display) {
  if (display.cachedCharWidth != null) return display.cachedCharWidth;
  let anchor = elt("span", "xxxxxxxxxx");
  let pre = elt("pre", [anchor], "CodeMirror-line-like");
  removeChildrenAndAdd(display.measure, pre);
  let rect = anchor.getBoundingClientRect(),
  width = (rect.right - rect.left) / 10;
  if (width > 2) display.cachedCharWidth = width;
  return width || 10;
}

function getDimensions(cm) {
  let d = cm.display,
  left = {},
  width = {};
  let gutterLeft = d.gutters.clientLeft;

  for (let n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
    let id = cm.display.gutterSpecs[i].className;
    left[id] = n.offsetLeft + n.clientLeft + gutterLeft;
    width[id] = n.clientWidth;
  }

  return {
    fixedPos: compensateForHScroll(d),
    gutterTotalWidth: d.gutters.offsetWidth,
    gutterLeft: left,
    gutterWidth: width,
    wrapperWidth: d.wrapper.clientWidth };

}

function compensateForHScroll(display) {
  return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
}

function estimateHeight(cm) {
  let th = textHeight(cm.display),
  wrapping = cm.options.lineWrapping;
  let perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
  return line => {
    if (lineIsHidden(cm.doc, line)) return 0;
    let widgetsHeight = 0;
    if (line.widgets) for (let i = 0; i < line.widgets.length; i++) {
      if (line.widgets[i].height) widgetsHeight += line.widgets[i].height;
    }
    if (wrapping) return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;else return widgetsHeight + th;
  };
}

function estimateLineHeights(cm) {
  let doc = cm.doc,
  est = estimateHeight(cm);
  doc.iter(line => {
    let estHeight = est(line);
    if (estHeight != line.height) updateLineHeight(line, estHeight);
  });
}

function posFromMouse(cm, e, liberal, forRect) {
  let display = cm.display;
  if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") return null;
  let x,
  y,
  space = display.lineSpace.getBoundingClientRect();

  try {
    x = e.clientX - space.left;
    y = e.clientY - space.top;
  } catch (e2) {
    return null;
  }

  let coords = coordsChar(cm, x, y),
  line;

  if (forRect && coords.xRel > 0 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
    let colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
    coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
  }

  return coords;
}

function findViewIndex(cm, n) {
  if (n >= cm.display.viewTo) return null;
  n -= cm.display.viewFrom;
  if (n < 0) return null;
  let view = cm.display.view;

  for (let i = 0; i < view.length; i++) {
    n -= view[i].size;
    if (n < 0) return i;
  }
} // node_modules/codemirror/src/display/view_tracking.js


function regChange(cm, from, to, lendiff) {
  if (from == null) from = cm.doc.first;
  if (to == null) to = cm.doc.first + cm.doc.size;
  if (!lendiff) lendiff = 0;
  let display = cm.display;
  if (lendiff && to < display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers > from)) display.updateLineNumbers = from;
  cm.curOp.viewChanged = true;

  if (from >= display.viewTo) {
    if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo) resetView(cm);
  } else if (to <= display.viewFrom) {
    if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
      resetView(cm);
    } else {
      display.viewFrom += lendiff;
      display.viewTo += lendiff;
    }
  } else if (from <= display.viewFrom && to >= display.viewTo) {
    resetView(cm);
  } else if (from <= display.viewFrom) {
    let cut = viewCuttingPoint(cm, to, to + lendiff, 1);

    if (cut) {
      display.view = display.view.slice(cut.index);
      display.viewFrom = cut.lineN;
      display.viewTo += lendiff;
    } else {
      resetView(cm);
    }
  } else if (to >= display.viewTo) {
    let cut = viewCuttingPoint(cm, from, from, -1);

    if (cut) {
      display.view = display.view.slice(0, cut.index);
      display.viewTo = cut.lineN;
    } else {
      resetView(cm);
    }
  } else {
    let cutTop = viewCuttingPoint(cm, from, from, -1);
    let cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);

    if (cutTop && cutBot) {
      display.view = display.view.slice(0, cutTop.index).concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN)).concat(display.view.slice(cutBot.index));
      display.viewTo += lendiff;
    } else {
      resetView(cm);
    }
  }

  let ext = display.externalMeasured;

  if (ext) {
    if (to < ext.lineN) ext.lineN += lendiff;else if (from < ext.lineN + ext.size) display.externalMeasured = null;
  }
}

function regLineChange(cm, line, type) {
  cm.curOp.viewChanged = true;
  let display = cm.display,
  ext = cm.display.externalMeasured;
  if (ext && line >= ext.lineN && line < ext.lineN + ext.size) display.externalMeasured = null;
  if (line < display.viewFrom || line >= display.viewTo) return;
  let lineView = display.view[findViewIndex(cm, line)];
  if (lineView.node == null) return;
  let arr = lineView.changes || (lineView.changes = []);
  if (indexOf(arr, type) == -1) arr.push(type);
}

function resetView(cm) {
  cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
  cm.display.view = [];
  cm.display.viewOffset = 0;
}

function viewCuttingPoint(cm, oldN, newN, dir) {
  let index = findViewIndex(cm, oldN),
  diff,
  view = cm.display.view;
  if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size) return {
    index,
    lineN: newN };

  let n = cm.display.viewFrom;

  for (let i = 0; i < index; i++) n += view[i].size;

  if (n != oldN) {
    if (dir > 0) {
      if (index == view.length - 1) return null;
      diff = n + view[index].size - oldN;
      index++;
    } else {
      diff = n - oldN;
    }

    oldN += diff;
    newN += diff;
  }

  while (visualLineNo(cm.doc, newN) != newN) {
    if (index == (dir < 0 ? 0 : view.length - 1)) return null;
    newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
    index += dir;
  }

  return {
    index,
    lineN: newN };

}

function adjustView(cm, from, to) {
  let display = cm.display,
  view = display.view;

  if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
    display.view = buildViewArray(cm, from, to);
    display.viewFrom = from;
  } else {
    if (display.viewFrom > from) display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);else if (display.viewFrom < from) display.view = display.view.slice(findViewIndex(cm, from));
    display.viewFrom = from;
    if (display.viewTo < to) display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));else if (display.viewTo > to) display.view = display.view.slice(0, findViewIndex(cm, to));
  }

  display.viewTo = to;
}

function countDirtyView(cm) {
  let view = cm.display.view,
  dirty = 0;

  for (let i = 0; i < view.length; i++) {
    let lineView = view[i];
    if (!lineView.hidden && (!lineView.node || lineView.changes)) ++dirty;
  }

  return dirty;
} // node_modules/codemirror/src/display/selection.js


function updateSelection(cm) {
  cm.display.input.showSelection(cm.display.input.prepareSelection());
}

function prepareSelection(cm, primary = true) {
  let doc = cm.doc,
  result = {};
  let curFragment = result.cursors = document.createDocumentFragment();
  let selFragment = result.selection = document.createDocumentFragment();

  for (let i = 0; i < doc.sel.ranges.length; i++) {
    if (!primary && i == doc.sel.primIndex) continue;
    let range2 = doc.sel.ranges[i];
    if (range2.from().line >= cm.display.viewTo || range2.to().line < cm.display.viewFrom) continue;
    let collapsed = range2.empty();
    if (collapsed || cm.options.showCursorWhenSelecting) drawSelectionCursor(cm, range2.head, curFragment);
    if (!collapsed) drawSelectionRange(cm, range2, selFragment);
  }

  return result;
}

function drawSelectionCursor(cm, head, output) {
  let pos26 = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);
  let cursor = output.appendChild(elt("div", " ", "CodeMirror-cursor"));
  cursor.style.left = pos26.left + "px";
  cursor.style.top = pos26.top + "px";
  cursor.style.height = Math.max(0, pos26.bottom - pos26.top) * cm.options.cursorHeight + "px";

  if (pos26.other) {
    let otherCursor = output.appendChild(elt("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
    otherCursor.style.display = "";
    otherCursor.style.left = pos26.other.left + "px";
    otherCursor.style.top = pos26.other.top + "px";
    otherCursor.style.height = (pos26.other.bottom - pos26.other.top) * 0.85 + "px";
  }
}

function cmpCoords(a, b) {
  return a.top - b.top || a.left - b.left;
}

function drawSelectionRange(cm, range2, output) {
  let display = cm.display,
  doc = cm.doc;
  let fragment = document.createDocumentFragment();
  let padding = paddingH(cm.display),
  leftSide = padding.left;
  let rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;
  let docLTR = doc.direction == "ltr";

  function add(left, top, width, bottom) {
    if (top < 0) top = 0;
    top = Math.round(top);
    bottom = Math.round(bottom);
    fragment.appendChild(elt("div", null, "CodeMirror-selected", `position: absolute; left: ${left}px;
                             top: ${top}px; width: ${width == null ? rightSide - left : width}px;
                             height: ${bottom - top}px`));
  }

  function drawForLine(line, fromArg, toArg) {
    let lineObj = getLine(doc, line);
    let lineLen = lineObj.text.length;
    let start, end;

    function coords(ch, bias) {
      return charCoords(cm, Pos(line, ch), "div", lineObj, bias);
    }

    function wrapX(pos26, dir, side) {
      let extent = wrappedLineExtentChar(cm, lineObj, null, pos26);
      let prop = dir == "ltr" == (side == "after") ? "left" : "right";
      let ch = side == "after" ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1);
      return coords(ch, prop)[prop];
    }

    let order = getOrder(lineObj, doc.direction);
    iterateBidiSections(order, fromArg || 0, toArg == null ? lineLen : toArg, (from, to, dir, i) => {
      let ltr = dir == "ltr";
      let fromPos = coords(from, ltr ? "left" : "right");
      let toPos = coords(to - 1, ltr ? "right" : "left");
      let openStart = fromArg == null && from == 0,
      openEnd = toArg == null && to == lineLen;
      let first = i == 0,
      last = !order || i == order.length - 1;

      if (toPos.top - fromPos.top <= 3) {
        let openLeft = (docLTR ? openStart : openEnd) && first;
        let openRight = (docLTR ? openEnd : openStart) && last;
        let left = openLeft ? leftSide : (ltr ? fromPos : toPos).left;
        let right = openRight ? rightSide : (ltr ? toPos : fromPos).right;
        add(left, fromPos.top, right - left, fromPos.bottom);
      } else {
        let topLeft, topRight, botLeft, botRight;

        if (ltr) {
          topLeft = docLTR && openStart && first ? leftSide : fromPos.left;
          topRight = docLTR ? rightSide : wrapX(from, dir, "before");
          botLeft = docLTR ? leftSide : wrapX(to, dir, "after");
          botRight = docLTR && openEnd && last ? rightSide : toPos.right;
        } else {
          topLeft = !docLTR ? leftSide : wrapX(from, dir, "before");
          topRight = !docLTR && openStart && first ? rightSide : fromPos.right;
          botLeft = !docLTR && openEnd && last ? leftSide : toPos.left;
          botRight = !docLTR ? rightSide : wrapX(to, dir, "after");
        }

        add(topLeft, fromPos.top, topRight - topLeft, fromPos.bottom);
        if (fromPos.bottom < toPos.top) add(leftSide, fromPos.bottom, null, toPos.top);
        add(botLeft, toPos.top, botRight - botLeft, toPos.bottom);
      }

      if (!start || cmpCoords(fromPos, start) < 0) start = fromPos;
      if (cmpCoords(toPos, start) < 0) start = toPos;
      if (!end || cmpCoords(fromPos, end) < 0) end = fromPos;
      if (cmpCoords(toPos, end) < 0) end = toPos;
    });
    return {
      start,
      end };

  }

  let sFrom = range2.from(),
  sTo = range2.to();

  if (sFrom.line == sTo.line) {
    drawForLine(sFrom.line, sFrom.ch, sTo.ch);
  } else {
    let fromLine = getLine(doc, sFrom.line),
    toLine = getLine(doc, sTo.line);
    let singleVLine = visualLine(fromLine) == visualLine(toLine);
    let leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
    let rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;

    if (singleVLine) {
      if (leftEnd.top < rightStart.top - 2) {
        add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
        add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
      } else {
        add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
      }
    }

    if (leftEnd.bottom < rightStart.top) add(leftSide, leftEnd.bottom, null, rightStart.top);
  }

  output.appendChild(fragment);
}

function restartBlink(cm) {
  if (!cm.state.focused) return;
  let display = cm.display;
  clearInterval(display.blinker);
  let on2 = true;
  display.cursorDiv.style.visibility = "";
  if (cm.options.cursorBlinkRate > 0) display.blinker = setInterval(() => display.cursorDiv.style.visibility = (on2 = !on2) ? "" : "hidden", cm.options.cursorBlinkRate);else if (cm.options.cursorBlinkRate < 0) display.cursorDiv.style.visibility = "hidden";
} // node_modules/codemirror/src/display/focus.js


function ensureFocus(cm) {
  if (!cm.state.focused) {
    cm.display.input.focus();
    onFocus(cm);
  }
}

function delayBlurEvent(cm) {
  cm.state.delayingBlurEvent = true;
  setTimeout(() => {
    if (cm.state.delayingBlurEvent) {
      cm.state.delayingBlurEvent = false;
      onBlur(cm);
    }
  }, 100);
}

function onFocus(cm, e) {
  if (cm.state.delayingBlurEvent) cm.state.delayingBlurEvent = false;
  if (cm.options.readOnly == "nocursor") return;

  if (!cm.state.focused) {
    signal(cm, "focus", cm, e);
    cm.state.focused = true;
    addClass(cm.display.wrapper, "CodeMirror-focused");

    if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
      cm.display.input.reset();
      if (webkit) setTimeout(() => cm.display.input.reset(true), 20);
    }

    cm.display.input.receivedFocus();
  }

  restartBlink(cm);
}

function onBlur(cm, e) {
  if (cm.state.delayingBlurEvent) return;

  if (cm.state.focused) {
    signal(cm, "blur", cm, e);
    cm.state.focused = false;
    rmClass(cm.display.wrapper, "CodeMirror-focused");
  }

  clearInterval(cm.display.blinker);
  setTimeout(() => {
    if (!cm.state.focused) cm.display.shift = false;
  }, 150);
} // node_modules/codemirror/src/display/update_lines.js


function updateHeightsInViewport(cm) {
  let display = cm.display;
  let prevBottom = display.lineDiv.offsetTop;

  for (let i = 0; i < display.view.length; i++) {
    let cur = display.view[i],
    wrapping = cm.options.lineWrapping;
    let height,
    width = 0;
    if (cur.hidden) continue;

    if (ie && ie_version < 8) {
      let bot = cur.node.offsetTop + cur.node.offsetHeight;
      height = bot - prevBottom;
      prevBottom = bot;
    } else {
      let box = cur.node.getBoundingClientRect();
      height = box.bottom - box.top;
      if (!wrapping && cur.text.firstChild) width = cur.text.firstChild.getBoundingClientRect().right - box.left - 1;
    }

    let diff = cur.line.height - height;

    if (diff > 5e-3 || diff < -5e-3) {
      updateLineHeight(cur.line, height);
      updateWidgetHeight(cur.line);
      if (cur.rest) for (let j = 0; j < cur.rest.length; j++) updateWidgetHeight(cur.rest[j]);
    }

    if (width > cm.display.sizerWidth) {
      let chWidth = Math.ceil(width / charWidth(cm.display));

      if (chWidth > cm.display.maxLineLength) {
        cm.display.maxLineLength = chWidth;
        cm.display.maxLine = cur.line;
        cm.display.maxLineChanged = true;
      }
    }
  }
}

function updateWidgetHeight(line) {
  if (line.widgets) for (let i = 0; i < line.widgets.length; ++i) {
    let w = line.widgets[i],
    parent = w.node.parentNode;
    if (parent) w.height = parent.offsetHeight;
  }
}

function visibleLines(display, doc, viewport) {
  let top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
  top = Math.floor(top - paddingTop(display));
  let bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;
  let from = lineAtHeight(doc, top),
  to = lineAtHeight(doc, bottom);

  if (viewport && viewport.ensure) {
    let ensureFrom = viewport.ensure.from.line,
    ensureTo = viewport.ensure.to.line;

    if (ensureFrom < from) {
      from = ensureFrom;
      to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
    } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
      from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
      to = ensureTo;
    }
  }

  return {
    from,
    to: Math.max(to, from + 1) };

} // node_modules/codemirror/src/display/scrolling.js


function maybeScrollWindow(cm, rect) {
  if (signalDOMEvent(cm, "scrollCursorIntoView")) return;
  let display = cm.display,
  box = display.sizer.getBoundingClientRect(),
  doScroll = null;
  if (rect.top + box.top < 0) doScroll = true;else if (rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) doScroll = false;

  if (doScroll != null && !phantom) {
    let scrollNode = elt("div", "​", null, `position: absolute;
                         top: ${rect.top - display.viewOffset - paddingTop(cm.display)}px;
                         height: ${rect.bottom - rect.top + scrollGap(cm) + display.barHeight}px;
                         left: ${rect.left}px; width: ${Math.max(2, rect.right - rect.left)}px;`);
    cm.display.lineSpace.appendChild(scrollNode);
    scrollNode.scrollIntoView(doScroll);
    cm.display.lineSpace.removeChild(scrollNode);
  }
}

function scrollPosIntoView(cm, pos26, end, margin) {
  if (margin == null) margin = 0;
  let rect;

  if (!cm.options.lineWrapping && pos26 == end) {
    pos26 = pos26.ch ? Pos(pos26.line, pos26.sticky == "before" ? pos26.ch - 1 : pos26.ch, "after") : pos26;
    end = pos26.sticky == "before" ? Pos(pos26.line, pos26.ch + 1, "before") : pos26;
  }

  for (let limit = 0; limit < 5; limit++) {
    let changed = false;
    let coords = cursorCoords(cm, pos26);
    let endCoords = !end || end == pos26 ? coords : cursorCoords(cm, end);
    rect = {
      left: Math.min(coords.left, endCoords.left),
      top: Math.min(coords.top, endCoords.top) - margin,
      right: Math.max(coords.left, endCoords.left),
      bottom: Math.max(coords.bottom, endCoords.bottom) + margin };

    let scrollPos = calculateScrollPos(cm, rect);
    let startTop = cm.doc.scrollTop,
    startLeft = cm.doc.scrollLeft;

    if (scrollPos.scrollTop != null) {
      updateScrollTop(cm, scrollPos.scrollTop);
      if (Math.abs(cm.doc.scrollTop - startTop) > 1) changed = true;
    }

    if (scrollPos.scrollLeft != null) {
      setScrollLeft(cm, scrollPos.scrollLeft);
      if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) changed = true;
    }

    if (!changed) break;
  }

  return rect;
}

function scrollIntoView(cm, rect) {
  let scrollPos = calculateScrollPos(cm, rect);
  if (scrollPos.scrollTop != null) updateScrollTop(cm, scrollPos.scrollTop);
  if (scrollPos.scrollLeft != null) setScrollLeft(cm, scrollPos.scrollLeft);
}

function calculateScrollPos(cm, rect) {
  let display = cm.display,
  snapMargin = textHeight(cm.display);
  if (rect.top < 0) rect.top = 0;
  let screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
  let screen2 = displayHeight(cm),
  result = {};
  if (rect.bottom - rect.top > screen2) rect.bottom = rect.top + screen2;
  let docBottom = cm.doc.height + paddingVert(display);
  let atTop = rect.top < snapMargin,
  atBottom = rect.bottom > docBottom - snapMargin;

  if (rect.top < screentop) {
    result.scrollTop = atTop ? 0 : rect.top;
  } else if (rect.bottom > screentop + screen2) {
    let newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen2);
    if (newTop != screentop) result.scrollTop = newTop;
  }

  let screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
  let screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
  let tooWide = rect.right - rect.left > screenw;
  if (tooWide) rect.right = rect.left + screenw;
  if (rect.left < 10) result.scrollLeft = 0;else if (rect.left < screenleft) result.scrollLeft = Math.max(0, rect.left - (tooWide ? 0 : 10));else if (rect.right > screenw + screenleft - 3) result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw;
  return result;
}

function addToScrollTop(cm, top) {
  if (top == null) return;
  resolveScrollToPos(cm);
  cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
}

function ensureCursorVisible(cm) {
  resolveScrollToPos(cm);
  let cur = cm.getCursor();
  cm.curOp.scrollToPos = {
    from: cur,
    to: cur,
    margin: cm.options.cursorScrollMargin };

}

function scrollToCoords(cm, x, y) {
  if (x != null || y != null) resolveScrollToPos(cm);
  if (x != null) cm.curOp.scrollLeft = x;
  if (y != null) cm.curOp.scrollTop = y;
}

function scrollToRange(cm, range2) {
  resolveScrollToPos(cm);
  cm.curOp.scrollToPos = range2;
}

function resolveScrollToPos(cm) {
  let range2 = cm.curOp.scrollToPos;

  if (range2) {
    cm.curOp.scrollToPos = null;
    let from = estimateCoords(cm, range2.from),
    to = estimateCoords(cm, range2.to);
    scrollToCoordsRange(cm, from, to, range2.margin);
  }
}

function scrollToCoordsRange(cm, from, to, margin) {
  let sPos = calculateScrollPos(cm, {
    left: Math.min(from.left, to.left),
    top: Math.min(from.top, to.top) - margin,
    right: Math.max(from.right, to.right),
    bottom: Math.max(from.bottom, to.bottom) + margin });

  scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop);
}

function updateScrollTop(cm, val) {
  if (Math.abs(cm.doc.scrollTop - val) < 2) return;
  if (!gecko) updateDisplaySimple(cm, {
    top: val });

  setScrollTop(cm, val, true);
  if (gecko) updateDisplaySimple(cm);
  startWorker(cm, 100);
}

function setScrollTop(cm, val, forceScroll) {
  val = Math.max(0, Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val));
  if (cm.display.scroller.scrollTop == val && !forceScroll) return;
  cm.doc.scrollTop = val;
  cm.display.scrollbars.setScrollTop(val);
  if (cm.display.scroller.scrollTop != val) cm.display.scroller.scrollTop = val;
}

function setScrollLeft(cm, val, isScroller, forceScroll) {
  val = Math.max(0, Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth));
  if ((isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) && !forceScroll) return;
  cm.doc.scrollLeft = val;
  alignHorizontally(cm);
  if (cm.display.scroller.scrollLeft != val) cm.display.scroller.scrollLeft = val;
  cm.display.scrollbars.setScrollLeft(val);
} // node_modules/codemirror/src/display/scrollbars.js


function measureForScrollbars(cm) {
  let d = cm.display,
  gutterW = d.gutters.offsetWidth;
  let docH = Math.round(cm.doc.height + paddingVert(cm.display));
  return {
    clientHeight: d.scroller.clientHeight,
    viewHeight: d.wrapper.clientHeight,
    scrollWidth: d.scroller.scrollWidth,
    clientWidth: d.scroller.clientWidth,
    viewWidth: d.wrapper.clientWidth,
    barLeft: cm.options.fixedGutter ? gutterW : 0,
    docHeight: docH,
    scrollHeight: docH + scrollGap(cm) + d.barHeight,
    nativeBarWidth: d.nativeBarWidth,
    gutterWidth: gutterW };

}

class NativeScrollbars {
  constructor(place, scroll, cm) {
    this.cm = cm;
    let vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    let horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    vert.tabIndex = horiz.tabIndex = -1;
    place(vert);
    place(horiz);
    on(vert, "scroll", () => {
      if (vert.clientHeight) scroll(vert.scrollTop, "vertical");
    });
    on(horiz, "scroll", () => {
      if (horiz.clientWidth) scroll(horiz.scrollLeft, "horizontal");
    });
    this.checkedZeroWidth = false;
    if (ie && ie_version < 8) this.horiz.style.minHeight = this.vert.style.minWidth = "18px";
  }

  update(measure) {
    let needsH = measure.scrollWidth > measure.clientWidth + 1;
    let needsV = measure.scrollHeight > measure.clientHeight + 1;
    let sWidth = measure.nativeBarWidth;

    if (needsV) {
      this.vert.style.display = "block";
      this.vert.style.bottom = needsH ? sWidth + "px" : "0";
      let totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
      this.vert.firstChild.style.height = Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
    } else {
      this.vert.style.display = "";
      this.vert.firstChild.style.height = "0";
    }

    if (needsH) {
      this.horiz.style.display = "block";
      this.horiz.style.right = needsV ? sWidth + "px" : "0";
      this.horiz.style.left = measure.barLeft + "px";
      let totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
      this.horiz.firstChild.style.width = Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
    } else {
      this.horiz.style.display = "";
      this.horiz.firstChild.style.width = "0";
    }

    if (!this.checkedZeroWidth && measure.clientHeight > 0) {
      if (sWidth == 0) this.zeroWidthHack();
      this.checkedZeroWidth = true;
    }

    return {
      right: needsV ? sWidth : 0,
      bottom: needsH ? sWidth : 0 };

  }

  setScrollLeft(pos26) {
    if (this.horiz.scrollLeft != pos26) this.horiz.scrollLeft = pos26;
    if (this.disableHoriz) this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz");
  }

  setScrollTop(pos26) {
    if (this.vert.scrollTop != pos26) this.vert.scrollTop = pos26;
    if (this.disableVert) this.enableZeroWidthBar(this.vert, this.disableVert, "vert");
  }

  zeroWidthHack() {
    let w = mac && !mac_geMountainLion ? "12px" : "18px";
    this.horiz.style.height = this.vert.style.width = w;
    this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
    this.disableHoriz = new Delayed();
    this.disableVert = new Delayed();
  }

  enableZeroWidthBar(bar, delay, type) {
    bar.style.pointerEvents = "auto";

    function maybeDisable() {
      let box = bar.getBoundingClientRect();
      let elt2 = type == "vert" ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2) : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);
      if (elt2 != bar) bar.style.pointerEvents = "none";else delay.set(1e3, maybeDisable);
    }

    delay.set(1e3, maybeDisable);
  }

  clear() {
    let parent = this.horiz.parentNode;
    parent.removeChild(this.horiz);
    parent.removeChild(this.vert);
  }}



class NullScrollbars {
  update() {
    return {
      bottom: 0,
      right: 0 };

  }

  setScrollLeft() {}

  setScrollTop() {}

  clear() {}}



function updateScrollbars(cm, measure) {
  if (!measure) measure = measureForScrollbars(cm);
  let startWidth = cm.display.barWidth,
  startHeight = cm.display.barHeight;
  updateScrollbarsInner(cm, measure);

  for (let i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
    if (startWidth != cm.display.barWidth && cm.options.lineWrapping) updateHeightsInViewport(cm);
    updateScrollbarsInner(cm, measureForScrollbars(cm));
    startWidth = cm.display.barWidth;
    startHeight = cm.display.barHeight;
  }
}

function updateScrollbarsInner(cm, measure) {
  let d = cm.display;
  let sizes = d.scrollbars.update(measure);
  d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
  d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
  d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";

  if (sizes.right && sizes.bottom) {
    d.scrollbarFiller.style.display = "block";
    d.scrollbarFiller.style.height = sizes.bottom + "px";
    d.scrollbarFiller.style.width = sizes.right + "px";
  } else d.scrollbarFiller.style.display = "";

  if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
    d.gutterFiller.style.display = "block";
    d.gutterFiller.style.height = sizes.bottom + "px";
    d.gutterFiller.style.width = measure.gutterWidth + "px";
  } else d.gutterFiller.style.display = "";
}

let scrollbarModel = {
  native: NativeScrollbars,
  null: NullScrollbars };


function initScrollbars(cm) {
  if (cm.display.scrollbars) {
    cm.display.scrollbars.clear();
    if (cm.display.scrollbars.addClass) rmClass(cm.display.wrapper, cm.display.scrollbars.addClass);
  }

  cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](node => {
    cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
    on(node, "mousedown", () => {
      if (cm.state.focused) setTimeout(() => cm.display.input.focus(), 0);
    });
    node.setAttribute("cm-not-content", "true");
  }, (pos26, axis) => {
    if (axis == "horizontal") setScrollLeft(cm, pos26);else updateScrollTop(cm, pos26);
  }, cm);
  if (cm.display.scrollbars.addClass) addClass(cm.display.wrapper, cm.display.scrollbars.addClass);
} // node_modules/codemirror/src/display/operations.js


let nextOpId = 0;

function startOperation(cm) {
  cm.curOp = {
    cm,
    viewChanged: false,
    startHeight: cm.doc.height,
    forceUpdate: false,
    updateInput: 0,
    typing: false,
    changeObjs: null,
    cursorActivityHandlers: null,
    cursorActivityCalled: 0,
    selectionChanged: false,
    updateMaxLine: false,
    scrollLeft: null,
    scrollTop: null,
    scrollToPos: null,
    focus: false,
    id: ++nextOpId };

  pushOperation(cm.curOp);
}

function endOperation(cm) {
  let op = cm.curOp;
  if (op) finishOperation(op, group => {
    for (let i = 0; i < group.ops.length; i++) group.ops[i].cm.curOp = null;

    endOperations(group);
  });
}

function endOperations(group) {
  let ops = group.ops;

  for (let i = 0; i < ops.length; i++) endOperation_R1(ops[i]);

  for (let i = 0; i < ops.length; i++) endOperation_W1(ops[i]);

  for (let i = 0; i < ops.length; i++) endOperation_R2(ops[i]);

  for (let i = 0; i < ops.length; i++) endOperation_W2(ops[i]);

  for (let i = 0; i < ops.length; i++) endOperation_finish(ops[i]);
}

function endOperation_R1(op) {
  let cm = op.cm,
  display = cm.display;
  maybeClipScrollbars(cm);
  if (op.updateMaxLine) findMaxLine(cm);
  op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null || op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom || op.scrollToPos.to.line >= display.viewTo) || display.maxLineChanged && cm.options.lineWrapping;
  op.update = op.mustUpdate && new DisplayUpdate(cm, op.mustUpdate && {
    top: op.scrollTop,
    ensure: op.scrollToPos },
  op.forceUpdate);
}

function endOperation_W1(op) {
  op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
}

function endOperation_R2(op) {
  let cm = op.cm,
  display = cm.display;
  if (op.updatedDisplay) updateHeightsInViewport(cm);
  op.barMeasure = measureForScrollbars(cm);

  if (display.maxLineChanged && !cm.options.lineWrapping) {
    op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
    cm.display.sizerWidth = op.adjustWidthTo;
    op.barMeasure.scrollWidth = Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
    op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
  }

  if (op.updatedDisplay || op.selectionChanged) op.preparedSelection = display.input.prepareSelection();
}

function endOperation_W2(op) {
  let cm = op.cm;

  if (op.adjustWidthTo != null) {
    cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
    if (op.maxScrollLeft < cm.doc.scrollLeft) setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
    cm.display.maxLineChanged = false;
  }

  let takeFocus = op.focus && op.focus == activeElt();
  if (op.preparedSelection) cm.display.input.showSelection(op.preparedSelection, takeFocus);
  if (op.updatedDisplay || op.startHeight != cm.doc.height) updateScrollbars(cm, op.barMeasure);
  if (op.updatedDisplay) setDocumentHeight(cm, op.barMeasure);
  if (op.selectionChanged) restartBlink(cm);
  if (cm.state.focused && op.updateInput) cm.display.input.reset(op.typing);
  if (takeFocus) ensureFocus(op.cm);
}

function endOperation_finish(op) {
  let cm = op.cm,
  display = cm.display,
  doc = cm.doc;
  if (op.updatedDisplay) postUpdateDisplay(cm, op.update);
  if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos)) display.wheelStartX = display.wheelStartY = null;
  if (op.scrollTop != null) setScrollTop(cm, op.scrollTop, op.forceScroll);
  if (op.scrollLeft != null) setScrollLeft(cm, op.scrollLeft, true, true);

  if (op.scrollToPos) {
    let rect = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from), clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
    maybeScrollWindow(cm, rect);
  }

  let hidden = op.maybeHiddenMarkers,
  unhidden = op.maybeUnhiddenMarkers;

  if (hidden) {
    for (let i = 0; i < hidden.length; ++i) if (!hidden[i].lines.length) signal(hidden[i], "hide");
  }

  if (unhidden) {
    for (let i = 0; i < unhidden.length; ++i) if (unhidden[i].lines.length) signal(unhidden[i], "unhide");
  }

  if (display.wrapper.offsetHeight) doc.scrollTop = cm.display.scroller.scrollTop;
  if (op.changeObjs) signal(cm, "changes", cm, op.changeObjs);
  if (op.update) op.update.finish();
}

function runInOp(cm, f) {
  if (cm.curOp) return f();
  startOperation(cm);

  try {
    return f();
  } finally {
    endOperation(cm);
  }
}

function operation(cm, f) {
  return function () {
    if (cm.curOp) return f.apply(cm, arguments);
    startOperation(cm);

    try {
      return f.apply(cm, arguments);
    } finally {
      endOperation(cm);
    }
  };
}

function methodOp(f) {
  return function () {
    if (this.curOp) return f.apply(this, arguments);
    startOperation(this);

    try {
      return f.apply(this, arguments);
    } finally {
      endOperation(this);
    }
  };
}

function docMethodOp(f) {
  return function () {
    let cm = this.cm;
    if (!cm || cm.curOp) return f.apply(this, arguments);
    startOperation(cm);

    try {
      return f.apply(this, arguments);
    } finally {
      endOperation(cm);
    }
  };
} // node_modules/codemirror/src/display/highlight_worker.js


function startWorker(cm, time) {
  if (cm.doc.highlightFrontier < cm.display.viewTo) cm.state.highlight.set(time, bind(highlightWorker, cm));
}

function highlightWorker(cm) {
  let doc = cm.doc;
  if (doc.highlightFrontier >= cm.display.viewTo) return;
  let end = +new Date() + cm.options.workTime;
  let context = getContextBefore(cm, doc.highlightFrontier);
  let changedLines = [];
  doc.iter(context.line, Math.min(doc.first + doc.size, cm.display.viewTo + 500), line => {
    if (context.line >= cm.display.viewFrom) {
      let oldStyles = line.styles;
      let resetState = line.text.length > cm.options.maxHighlightLength ? copyState(doc.mode, context.state) : null;
      let highlighted = highlightLine(cm, line, context, true);
      if (resetState) context.state = resetState;
      line.styles = highlighted.styles;
      let oldCls = line.styleClasses,
      newCls = highlighted.classes;
      if (newCls) line.styleClasses = newCls;else if (oldCls) line.styleClasses = null;
      let ischange = !oldStyles || oldStyles.length != line.styles.length || oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);

      for (let i = 0; !ischange && i < oldStyles.length; ++i) ischange = oldStyles[i] != line.styles[i];

      if (ischange) changedLines.push(context.line);
      line.stateAfter = context.save();
      context.nextLine();
    } else {
      if (line.text.length <= cm.options.maxHighlightLength) processLine(cm, line.text, context);
      line.stateAfter = context.line % 5 == 0 ? context.save() : null;
      context.nextLine();
    }

    if (+new Date() > end) {
      startWorker(cm, cm.options.workDelay);
      return true;
    }
  });
  doc.highlightFrontier = context.line;
  doc.modeFrontier = Math.max(doc.modeFrontier, context.line);
  if (changedLines.length) runInOp(cm, () => {
    for (let i = 0; i < changedLines.length; i++) regLineChange(cm, changedLines[i], "text");
  });
} // node_modules/codemirror/src/display/update_display.js


class DisplayUpdate {
  constructor(cm, viewport, force) {
    let display = cm.display;
    this.viewport = viewport;
    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
    this.events = [];
  }

  signal(emitter, type) {
    if (hasHandler(emitter, type)) this.events.push(arguments);
  }

  finish() {
    for (let i = 0; i < this.events.length; i++) signal.apply(null, this.events[i]);
  }}



function maybeClipScrollbars(cm) {
  let display = cm.display;

  if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
    display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
    display.heightForcer.style.height = scrollGap(cm) + "px";
    display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
    display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
    display.scrollbarsClipped = true;
  }
}

function selectionSnapshot(cm) {
  if (cm.hasFocus()) return null;
  let active = activeElt();
  if (!active || !contains(cm.display.lineDiv, active)) return null;
  let result = {
    activeElt: active };


  if (window.getSelection) {
    let sel = window.getSelection();

    if (sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode)) {
      result.anchorNode = sel.anchorNode;
      result.anchorOffset = sel.anchorOffset;
      result.focusNode = sel.focusNode;
      result.focusOffset = sel.focusOffset;
    }
  }

  return result;
}

function restoreSelection(snapshot) {
  if (!snapshot || !snapshot.activeElt || snapshot.activeElt == activeElt()) return;
  snapshot.activeElt.focus();

  if (!/^(INPUT|TEXTAREA)$/.test(snapshot.activeElt.nodeName) && snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode)) {
    let sel = window.getSelection(),
    range2 = document.createRange();
    range2.setEnd(snapshot.anchorNode, snapshot.anchorOffset);
    range2.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range2);
    sel.extend(snapshot.focusNode, snapshot.focusOffset);
  }
}

function updateDisplayIfNeeded(cm, update) {
  let display = cm.display,
  doc = cm.doc;

  if (update.editorIsHidden) {
    resetView(cm);
    return false;
  }

  if (!update.force && update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) && display.renderedView == display.view && countDirtyView(cm) == 0) return false;

  if (maybeUpdateLineNumberWidth(cm)) {
    resetView(cm);
    update.dims = getDimensions(cm);
  }

  let end = doc.first + doc.size;
  let from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
  let to = Math.min(end, update.visible.to + cm.options.viewportMargin);
  if (display.viewFrom < from && from - display.viewFrom < 20) from = Math.max(doc.first, display.viewFrom);
  if (display.viewTo > to && display.viewTo - to < 20) to = Math.min(end, display.viewTo);

  if (sawCollapsedSpans) {
    from = visualLineNo(cm.doc, from);
    to = visualLineEndNo(cm.doc, to);
  }

  let different = from != display.viewFrom || to != display.viewTo || display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
  adjustView(cm, from, to);
  display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
  cm.display.mover.style.top = display.viewOffset + "px";
  let toUpdate = countDirtyView(cm);
  if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo)) return false;
  let selSnapshot = selectionSnapshot(cm);
  if (toUpdate > 4) display.lineDiv.style.display = "none";
  patchDisplay(cm, display.updateLineNumbers, update.dims);
  if (toUpdate > 4) display.lineDiv.style.display = "";
  display.renderedView = display.view;
  restoreSelection(selSnapshot);
  removeChildren(display.cursorDiv);
  removeChildren(display.selectionDiv);
  display.gutters.style.height = display.sizer.style.minHeight = 0;

  if (different) {
    display.lastWrapHeight = update.wrapperHeight;
    display.lastWrapWidth = update.wrapperWidth;
    startWorker(cm, 400);
  }

  display.updateLineNumbers = null;
  return true;
}

function postUpdateDisplay(cm, update) {
  let viewport = update.viewport;

  for (let first = true;; first = false) {
    if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
      if (viewport && viewport.top != null) viewport = {
        top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top) };

      update.visible = visibleLines(cm.display, cm.doc, viewport);
      if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo) break;
    } else if (first) {
      update.visible = visibleLines(cm.display, cm.doc, viewport);
    }

    if (!updateDisplayIfNeeded(cm, update)) break;
    updateHeightsInViewport(cm);
    let barMeasure = measureForScrollbars(cm);
    updateSelection(cm);
    updateScrollbars(cm, barMeasure);
    setDocumentHeight(cm, barMeasure);
    update.force = false;
  }

  update.signal(cm, "update", cm);

  if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
    update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
    cm.display.reportedViewFrom = cm.display.viewFrom;
    cm.display.reportedViewTo = cm.display.viewTo;
  }
}

function updateDisplaySimple(cm, viewport) {
  let update = new DisplayUpdate(cm, viewport);

  if (updateDisplayIfNeeded(cm, update)) {
    updateHeightsInViewport(cm);
    postUpdateDisplay(cm, update);
    let barMeasure = measureForScrollbars(cm);
    updateSelection(cm);
    updateScrollbars(cm, barMeasure);
    setDocumentHeight(cm, barMeasure);
    update.finish();
  }
}

function patchDisplay(cm, updateNumbersFrom, dims) {
  let display = cm.display,
  lineNumbers = cm.options.lineNumbers;
  let container = display.lineDiv,
  cur = container.firstChild;

  function rm(node) {
    let next = node.nextSibling;
    if (webkit && mac && cm.display.currentWheelTarget == node) node.style.display = "none";else node.parentNode.removeChild(node);
    return next;
  }

  let view = display.view,
  lineN = display.viewFrom;

  for (let i = 0; i < view.length; i++) {
    let lineView = view[i];
    if (lineView.hidden) ;else if (!lineView.node || lineView.node.parentNode != container) {
      let node = buildLineElement(cm, lineView, lineN, dims);
      container.insertBefore(node, cur);
    } else {
      while (cur != lineView.node) cur = rm(cur);

      let updateNumber = lineNumbers && updateNumbersFrom != null && updateNumbersFrom <= lineN && lineView.lineNumber;

      if (lineView.changes) {
        if (indexOf(lineView.changes, "gutter") > -1) updateNumber = false;
        updateLineForChanges(cm, lineView, lineN, dims);
      }

      if (updateNumber) {
        removeChildren(lineView.lineNumber);
        lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
      }

      cur = lineView.node.nextSibling;
    }
    lineN += lineView.size;
  }

  while (cur) cur = rm(cur);
}

function updateGutterSpace(display) {
  let width = display.gutters.offsetWidth;
  display.sizer.style.marginLeft = width + "px";
}

function setDocumentHeight(cm, measure) {
  cm.display.sizer.style.minHeight = measure.docHeight + "px";
  cm.display.heightForcer.style.top = measure.docHeight + "px";
  cm.display.gutters.style.height = measure.docHeight + cm.display.barHeight + scrollGap(cm) + "px";
} // node_modules/codemirror/src/display/line_numbers.js


function alignHorizontally(cm) {
  let display = cm.display,
  view = display.view;
  if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) return;
  let comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
  let gutterW = display.gutters.offsetWidth,
  left = comp + "px";

  for (let i = 0; i < view.length; i++) if (!view[i].hidden) {
    if (cm.options.fixedGutter) {
      if (view[i].gutter) view[i].gutter.style.left = left;
      if (view[i].gutterBackground) view[i].gutterBackground.style.left = left;
    }

    let align = view[i].alignable;
    if (align) for (let j = 0; j < align.length; j++) align[j].style.left = left;
  }

  if (cm.options.fixedGutter) display.gutters.style.left = comp + gutterW + "px";
}

function maybeUpdateLineNumberWidth(cm) {
  if (!cm.options.lineNumbers) return false;
  let doc = cm.doc,
  last = lineNumberFor(cm.options, doc.first + doc.size - 1),
  display = cm.display;

  if (last.length != display.lineNumChars) {
    let test = display.measure.appendChild(elt("div", [elt("div", last)], "CodeMirror-linenumber CodeMirror-gutter-elt"));
    let innerW = test.firstChild.offsetWidth,
    padding = test.offsetWidth - innerW;
    display.lineGutter.style.width = "";
    display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
    display.lineNumWidth = display.lineNumInnerWidth + padding;
    display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
    display.lineGutter.style.width = display.lineNumWidth + "px";
    updateGutterSpace(cm.display);
    return true;
  }

  return false;
} // node_modules/codemirror/src/display/gutters.js


function getGutters(gutters3, lineNumbers) {
  let result = [],
  sawLineNumbers = false;

  for (let i = 0; i < gutters3.length; i++) {
    let name = gutters3[i],
    style = null;

    if (typeof name != "string") {
      style = name.style;
      name = name.className;
    }

    if (name == "CodeMirror-linenumbers") {
      if (!lineNumbers) continue;else sawLineNumbers = true;
    }

    result.push({
      className: name,
      style });

  }

  if (lineNumbers && !sawLineNumbers) result.push({
    className: "CodeMirror-linenumbers",
    style: null });

  return result;
}

function renderGutters(display) {
  let gutters3 = display.gutters,
  specs = display.gutterSpecs;
  removeChildren(gutters3);
  display.lineGutter = null;

  for (let i = 0; i < specs.length; ++i) {
    let {
      className,
      style } =
    specs[i];
    let gElt = gutters3.appendChild(elt("div", null, "CodeMirror-gutter " + className));
    if (style) gElt.style.cssText = style;

    if (className == "CodeMirror-linenumbers") {
      display.lineGutter = gElt;
      gElt.style.width = (display.lineNumWidth || 1) + "px";
    }
  }

  gutters3.style.display = specs.length ? "" : "none";
  updateGutterSpace(display);
}

function updateGutters(cm) {
  renderGutters(cm.display);
  regChange(cm);
  alignHorizontally(cm);
} // node_modules/codemirror/src/display/Display.js


function Display(place, doc, input4, options3) {
  let d = this;
  this.input = input4;
  d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
  d.scrollbarFiller.setAttribute("cm-not-content", "true");
  d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
  d.gutterFiller.setAttribute("cm-not-content", "true");
  d.lineDiv = eltP("div", null, "CodeMirror-code");
  d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
  d.cursorDiv = elt("div", null, "CodeMirror-cursors");
  d.measure = elt("div", null, "CodeMirror-measure");
  d.lineMeasure = elt("div", null, "CodeMirror-measure");
  d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv], null, "position: relative; outline: none");
  let lines = eltP("div", [d.lineSpace], "CodeMirror-lines");
  d.mover = elt("div", [lines], null, "position: relative");
  d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
  d.sizerWidth = null;
  d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
  d.gutters = elt("div", null, "CodeMirror-gutters");
  d.lineGutter = null;
  d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
  d.scroller.setAttribute("tabIndex", "-1");
  d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

  if (ie && ie_version < 8) {
    d.gutters.style.zIndex = -1;
    d.scroller.style.paddingRight = 0;
  }

  if (!webkit && !(gecko && mobile)) d.scroller.draggable = true;

  if (place) {
    if (place.appendChild) place.appendChild(d.wrapper);else place(d.wrapper);
  }

  d.viewFrom = d.viewTo = doc.first;
  d.reportedViewFrom = d.reportedViewTo = doc.first;
  d.view = [];
  d.renderedView = null;
  d.externalMeasured = null;
  d.viewOffset = 0;
  d.lastWrapHeight = d.lastWrapWidth = 0;
  d.updateLineNumbers = null;
  d.nativeBarWidth = d.barHeight = d.barWidth = 0;
  d.scrollbarsClipped = false;
  d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
  d.alignWidgets = false;
  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
  d.maxLine = null;
  d.maxLineLength = 0;
  d.maxLineChanged = false;
  d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;
  d.shift = false;
  d.selForContextMenu = null;
  d.activeTouch = null;
  d.gutterSpecs = getGutters(options3.gutters, options3.lineNumbers);
  renderGutters(d);
  input4.init(d);
} // node_modules/codemirror/src/display/scroll_events.js


let wheelSamples = 0;
let wheelPixelsPerUnit = null;
if (ie) wheelPixelsPerUnit = -0.53;else if (gecko) wheelPixelsPerUnit = 15;else if (chrome) wheelPixelsPerUnit = -0.7;else if (safari) wheelPixelsPerUnit = -1 / 3;

function wheelEventDelta(e) {
  let dx = e.wheelDeltaX,
  dy = e.wheelDeltaY;
  if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) dx = e.detail;
  if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) dy = e.detail;else if (dy == null) dy = e.wheelDelta;
  return {
    x: dx,
    y: dy };

}

function wheelEventPixels(e) {
  let delta = wheelEventDelta(e);
  delta.x *= wheelPixelsPerUnit;
  delta.y *= wheelPixelsPerUnit;
  return delta;
}

function onScrollWheel(cm, e) {
  let delta = wheelEventDelta(e),
  dx = delta.x,
  dy = delta.y;
  let display = cm.display,
  scroll = display.scroller;
  let canScrollX = scroll.scrollWidth > scroll.clientWidth;
  let canScrollY = scroll.scrollHeight > scroll.clientHeight;
  if (!(dx && canScrollX || dy && canScrollY)) return;

  if (dy && mac && webkit) {
    outer: for (let cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
      for (let i = 0; i < view.length; i++) {
        if (view[i].node == cur) {
          cm.display.currentWheelTarget = cur;
          break outer;
        }
      }
    }
  }

  if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
    if (dy && canScrollY) updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * wheelPixelsPerUnit));
    setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * wheelPixelsPerUnit));
    if (!dy || dy && canScrollY) e_preventDefault(e);
    display.wheelStartX = null;
    return;
  }

  if (dy && wheelPixelsPerUnit != null) {
    let pixels = dy * wheelPixelsPerUnit;
    let top = cm.doc.scrollTop,
    bot = top + display.wrapper.clientHeight;
    if (pixels < 0) top = Math.max(0, top + pixels - 50);else bot = Math.min(cm.doc.height, bot + pixels + 50);
    updateDisplaySimple(cm, {
      top,
      bottom: bot });

  }

  if (wheelSamples < 20) {
    if (display.wheelStartX == null) {
      display.wheelStartX = scroll.scrollLeft;
      display.wheelStartY = scroll.scrollTop;
      display.wheelDX = dx;
      display.wheelDY = dy;
      setTimeout(() => {
        if (display.wheelStartX == null) return;
        let movedX = scroll.scrollLeft - display.wheelStartX;
        let movedY = scroll.scrollTop - display.wheelStartY;
        let sample = movedY && display.wheelDY && movedY / display.wheelDY || movedX && display.wheelDX && movedX / display.wheelDX;
        display.wheelStartX = display.wheelStartY = null;
        if (!sample) return;
        wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
        ++wheelSamples;
      }, 200);
    } else {
      display.wheelDX += dx;
      display.wheelDY += dy;
    }
  }
} // node_modules/codemirror/src/model/selection.js


class Selection {
  constructor(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  }

  primary() {
    return this.ranges[this.primIndex];
  }

  equals(other) {
    if (other == this) return true;
    if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) return false;

    for (let i = 0; i < this.ranges.length; i++) {
      let here = this.ranges[i],
      there = other.ranges[i];
      if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head)) return false;
    }

    return true;
  }

  deepCopy() {
    let out = [];

    for (let i = 0; i < this.ranges.length; i++) out[i] = new Range(copyPos(this.ranges[i].anchor), copyPos(this.ranges[i].head));

    return new Selection(out, this.primIndex);
  }

  somethingSelected() {
    for (let i = 0; i < this.ranges.length; i++) if (!this.ranges[i].empty()) return true;

    return false;
  }

  contains(pos26, end) {
    if (!end) end = pos26;

    for (let i = 0; i < this.ranges.length; i++) {
      let range2 = this.ranges[i];
      if (cmp(end, range2.from()) >= 0 && cmp(pos26, range2.to()) <= 0) return i;
    }

    return -1;
  }}



class Range {
  constructor(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  }

  from() {
    return minPos(this.anchor, this.head);
  }

  to() {
    return maxPos(this.anchor, this.head);
  }

  empty() {
    return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
  }}



function normalizeSelection(cm, ranges, primIndex) {
  let mayTouch = cm && cm.options.selectionsMayTouch;
  let prim = ranges[primIndex];
  ranges.sort((a, b) => cmp(a.from(), b.from()));
  primIndex = indexOf(ranges, prim);

  for (let i = 1; i < ranges.length; i++) {
    let cur = ranges[i],
    prev = ranges[i - 1];
    let diff = cmp(prev.to(), cur.from());

    if (mayTouch && !cur.empty() ? diff > 0 : diff >= 0) {
      let from = minPos(prev.from(), cur.from()),
      to = maxPos(prev.to(), cur.to());
      let inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
      if (i <= primIndex) --primIndex;
      ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
    }
  }

  return new Selection(ranges, primIndex);
}

function simpleSelection(anchor, head) {
  return new Selection([new Range(anchor, head || anchor)], 0);
} // node_modules/codemirror/src/model/change_measurement.js


function changeEnd(change) {
  if (!change.text) return change.to;
  return Pos(change.from.line + change.text.length - 1, lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
}

function adjustForChange(pos26, change) {
  if (cmp(pos26, change.from) < 0) return pos26;
  if (cmp(pos26, change.to) <= 0) return changeEnd(change);
  let line = pos26.line + change.text.length - (change.to.line - change.from.line) - 1,
  ch = pos26.ch;
  if (pos26.line == change.to.line) ch += changeEnd(change).ch - change.to.ch;
  return Pos(line, ch);
}

function computeSelAfterChange(doc, change) {
  let out = [];

  for (let i = 0; i < doc.sel.ranges.length; i++) {
    let range2 = doc.sel.ranges[i];
    out.push(new Range(adjustForChange(range2.anchor, change), adjustForChange(range2.head, change)));
  }

  return normalizeSelection(doc.cm, out, doc.sel.primIndex);
}

function offsetPos(pos26, old, nw) {
  if (pos26.line == old.line) return Pos(nw.line, pos26.ch - old.ch + nw.ch);else return Pos(nw.line + (pos26.line - old.line), pos26.ch);
}

function computeReplacedSel(doc, changes9, hint) {
  let out = [];
  let oldPrev = Pos(doc.first, 0),
  newPrev = oldPrev;

  for (let i = 0; i < changes9.length; i++) {
    let change = changes9[i];
    let from = offsetPos(change.from, oldPrev, newPrev);
    let to = offsetPos(changeEnd(change), oldPrev, newPrev);
    oldPrev = change.to;
    newPrev = to;

    if (hint == "around") {
      let range2 = doc.sel.ranges[i],
      inv = cmp(range2.head, range2.anchor) < 0;
      out[i] = new Range(inv ? to : from, inv ? from : to);
    } else {
      out[i] = new Range(from, from);
    }
  }

  return new Selection(out, doc.sel.primIndex);
} // node_modules/codemirror/src/display/mode_state.js


function loadMode(cm) {
  cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
  resetModeState(cm);
}

function resetModeState(cm) {
  cm.doc.iter(line => {
    if (line.stateAfter) line.stateAfter = null;
    if (line.styles) line.styles = null;
  });
  cm.doc.modeFrontier = cm.doc.highlightFrontier = cm.doc.first;
  startWorker(cm, 100);
  cm.state.modeGen++;
  if (cm.curOp) regChange(cm);
} // node_modules/codemirror/src/model/document_data.js


function isWholeLineUpdate(doc, change) {
  return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" && (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
}

function updateDoc(doc, change, markedSpans, estimateHeight2) {
  function spansFor(n) {
    return markedSpans ? markedSpans[n] : null;
  }

  function update(line, text2, spans17) {
    updateLine(line, text2, spans17, estimateHeight2);
    signalLater(line, "change", line, change);
  }

  function linesFor(start, end) {
    let result = [];

    for (let i = start; i < end; ++i) result.push(new Line(text[i], spansFor(i), estimateHeight2));

    return result;
  }

  let from = change.from,
  to = change.to,
  text = change.text;
  let firstLine = getLine(doc, from.line),
  lastLine = getLine(doc, to.line);
  let lastText = lst(text),
  lastSpans = spansFor(text.length - 1),
  nlines = to.line - from.line;

  if (change.full) {
    doc.insert(0, linesFor(0, text.length));
    doc.remove(text.length, doc.size - text.length);
  } else if (isWholeLineUpdate(doc, change)) {
    let added = linesFor(0, text.length - 1);
    update(lastLine, lastLine.text, lastSpans);
    if (nlines) doc.remove(from.line, nlines);
    if (added.length) doc.insert(from.line, added);
  } else if (firstLine == lastLine) {
    if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
    } else {
      let added = linesFor(1, text.length - 1);
      added.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight2));
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      doc.insert(from.line + 1, added);
    }
  } else if (text.length == 1) {
    update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
    doc.remove(from.line + 1, nlines);
  } else {
    update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
    update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
    let added = linesFor(1, text.length - 1);
    if (nlines > 1) doc.remove(from.line + 1, nlines - 1);
    doc.insert(from.line + 1, added);
  }

  signalLater(doc, "change", doc, change);
}

function linkedDocs(doc, f, sharedHistOnly) {
  function propagate(doc2, skip, sharedHist) {
    if (doc2.linked) for (let i = 0; i < doc2.linked.length; ++i) {
      let rel = doc2.linked[i];
      if (rel.doc == skip) continue;
      let shared = sharedHist && rel.sharedHist;
      if (sharedHistOnly && !shared) continue;
      f(rel.doc, shared);
      propagate(rel.doc, doc2, shared);
    }
  }

  propagate(doc, null, true);
}

function attachDoc(cm, doc) {
  if (doc.cm) throw new Error("This document is already in use.");
  cm.doc = doc;
  doc.cm = cm;
  estimateLineHeights(cm);
  loadMode(cm);
  setDirectionClass(cm);
  if (!cm.options.lineWrapping) findMaxLine(cm);
  cm.options.mode = doc.modeOption;
  regChange(cm);
}

function setDirectionClass(cm) {
  (cm.doc.direction == "rtl" ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl");
}

function directionChanged(cm) {
  runInOp(cm, () => {
    setDirectionClass(cm);
    regChange(cm);
  });
} // node_modules/codemirror/src/model/history.js


function History(startGen) {
  this.done = [];
  this.undone = [];
  this.undoDepth = Infinity;
  this.lastModTime = this.lastSelTime = 0;
  this.lastOp = this.lastSelOp = null;
  this.lastOrigin = this.lastSelOrigin = null;
  this.generation = this.maxGeneration = startGen || 1;
}

function historyChangeFromChange(doc, change) {
  let histChange = {
    from: copyPos(change.from),
    to: changeEnd(change),
    text: getBetween(doc, change.from, change.to) };

  attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
  linkedDocs(doc, doc2 => attachLocalSpans(doc2, histChange, change.from.line, change.to.line + 1), true);
  return histChange;
}

function clearSelectionEvents(array) {
  while (array.length) {
    let last = lst(array);
    if (last.ranges) array.pop();else break;
  }
}

function lastChangeEvent(hist, force) {
  if (force) {
    clearSelectionEvents(hist.done);
    return lst(hist.done);
  } else if (hist.done.length && !lst(hist.done).ranges) {
    return lst(hist.done);
  } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
    hist.done.pop();
    return lst(hist.done);
  }
}

function addChangeToHistory(doc, change, selAfter, opId) {
  let hist = doc.history;
  hist.undone.length = 0;
  let time = +new Date(),
  cur;
  let last;

  if ((hist.lastOp == opId || hist.lastOrigin == change.origin && change.origin && (change.origin.charAt(0) == "+" && hist.lastModTime > time - (doc.cm ? doc.cm.options.historyEventDelay : 500) || change.origin.charAt(0) == "*")) && (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
    last = lst(cur.changes);

    if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
      last.to = changeEnd(change);
    } else {
      cur.changes.push(historyChangeFromChange(doc, change));
    }
  } else {
    let before = lst(hist.done);
    if (!before || !before.ranges) pushSelectionToHistory(doc.sel, hist.done);
    cur = {
      changes: [historyChangeFromChange(doc, change)],
      generation: hist.generation };

    hist.done.push(cur);

    while (hist.done.length > hist.undoDepth) {
      hist.done.shift();
      if (!hist.done[0].ranges) hist.done.shift();
    }
  }

  hist.done.push(selAfter);
  hist.generation = ++hist.maxGeneration;
  hist.lastModTime = hist.lastSelTime = time;
  hist.lastOp = hist.lastSelOp = opId;
  hist.lastOrigin = hist.lastSelOrigin = change.origin;
  if (!last) signal(doc, "historyAdded");
}

function selectionEventCanBeMerged(doc, origin, prev, sel) {
  let ch = origin.charAt(0);
  return ch == "*" || ch == "+" && prev.ranges.length == sel.ranges.length && prev.somethingSelected() == sel.somethingSelected() && new Date() - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
}

function addSelectionToHistory(doc, sel, opId, options3) {
  let hist = doc.history,
  origin = options3 && options3.origin;
  if (opId == hist.lastSelOp || origin && hist.lastSelOrigin == origin && (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin || selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))) hist.done[hist.done.length - 1] = sel;else pushSelectionToHistory(sel, hist.done);
  hist.lastSelTime = +new Date();
  hist.lastSelOrigin = origin;
  hist.lastSelOp = opId;
  if (options3 && options3.clearRedo !== false) clearSelectionEvents(hist.undone);
}

function pushSelectionToHistory(sel, dest) {
  let top = lst(dest);
  if (!(top && top.ranges && top.equals(sel))) dest.push(sel);
}

function attachLocalSpans(doc, change, from, to) {
  let existing = change["spans_" + doc.id],
  n = 0;
  doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), line => {
    if (line.markedSpans) (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
    ++n;
  });
}

function removeClearedSpans(spans17) {
  if (!spans17) return null;
  let out;

  for (let i = 0; i < spans17.length; ++i) {
    if (spans17[i].marker.explicitlyCleared) {
      if (!out) out = spans17.slice(0, i);
    } else if (out) out.push(spans17[i]);
  }

  return !out ? spans17 : out.length ? out : null;
}

function getOldSpans(doc, change) {
  let found = change["spans_" + doc.id];
  if (!found) return null;
  let nw = [];

  for (let i = 0; i < change.text.length; ++i) nw.push(removeClearedSpans(found[i]));

  return nw;
}

function mergeOldSpans(doc, change) {
  let old = getOldSpans(doc, change);
  let stretched = stretchSpansOverChange(doc, change);
  if (!old) return stretched;
  if (!stretched) return old;

  for (let i = 0; i < old.length; ++i) {
    let oldCur = old[i],
    stretchCur = stretched[i];

    if (oldCur && stretchCur) {
      spans: for (let j = 0; j < stretchCur.length; ++j) {
        let span = stretchCur[j];

        for (let k = 0; k < oldCur.length; ++k) if (oldCur[k].marker == span.marker) continue spans;

        oldCur.push(span);
      }
    } else if (stretchCur) {
      old[i] = stretchCur;
    }
  }

  return old;
}

function copyHistoryArray(events, newGroup, instantiateSel) {
  let copy = [];

  for (let i = 0; i < events.length; ++i) {
    let event28 = events[i];

    if (event28.ranges) {
      copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event28) : event28);
      continue;
    }

    let changes9 = event28.changes,
    newChanges = [];
    copy.push({
      changes: newChanges });


    for (let j = 0; j < changes9.length; ++j) {
      let change = changes9[j],
      m;
      newChanges.push({
        from: change.from,
        to: change.to,
        text: change.text });


      if (newGroup) {
        for (var prop in change) if (m = prop.match(/^spans_(\d+)$/)) {
          if (indexOf(newGroup, Number(m[1])) > -1) {
            lst(newChanges)[prop] = change[prop];
            delete change[prop];
          }
        }
      }
    }
  }

  return copy;
} // node_modules/codemirror/src/model/selection_updates.js


function extendRange(range2, head, other, extend) {
  if (extend) {
    let anchor = range2.anchor;

    if (other) {
      let posBefore = cmp(head, anchor) < 0;

      if (posBefore != cmp(other, anchor) < 0) {
        anchor = head;
        head = other;
      } else if (posBefore != cmp(head, other) < 0) {
        head = other;
      }
    }

    return new Range(anchor, head);
  } else {
    return new Range(other || head, head);
  }
}

function extendSelection(doc, head, other, options3, extend) {
  if (extend == null) extend = doc.cm && (doc.cm.display.shift || doc.extend);
  setSelection(doc, new Selection([extendRange(doc.sel.primary(), head, other, extend)], 0), options3);
}

function extendSelections(doc, heads, options3) {
  let out = [];
  let extend = doc.cm && (doc.cm.display.shift || doc.extend);

  for (let i = 0; i < doc.sel.ranges.length; i++) out[i] = extendRange(doc.sel.ranges[i], heads[i], null, extend);

  let newSel = normalizeSelection(doc.cm, out, doc.sel.primIndex);
  setSelection(doc, newSel, options3);
}

function replaceOneSelection(doc, i, range2, options3) {
  let ranges = doc.sel.ranges.slice(0);
  ranges[i] = range2;
  setSelection(doc, normalizeSelection(doc.cm, ranges, doc.sel.primIndex), options3);
}

function setSimpleSelection(doc, anchor, head, options3) {
  setSelection(doc, simpleSelection(anchor, head), options3);
}

function filterSelectionChange(doc, sel, options3) {
  let obj = {
    ranges: sel.ranges,
    update: function (ranges) {
      this.ranges = [];

      for (let i = 0; i < ranges.length; i++) this.ranges[i] = new Range(clipPos(doc, ranges[i].anchor), clipPos(doc, ranges[i].head));
    },
    origin: options3 && options3.origin };

  signal(doc, "beforeSelectionChange", doc, obj);
  if (doc.cm) signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
  if (obj.ranges != sel.ranges) return normalizeSelection(doc.cm, obj.ranges, obj.ranges.length - 1);else return sel;
}

function setSelectionReplaceHistory(doc, sel, options3) {
  let done = doc.history.done,
  last = lst(done);

  if (last && last.ranges) {
    done[done.length - 1] = sel;
    setSelectionNoUndo(doc, sel, options3);
  } else {
    setSelection(doc, sel, options3);
  }
}

function setSelection(doc, sel, options3) {
  setSelectionNoUndo(doc, sel, options3);
  addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options3);
}

function setSelectionNoUndo(doc, sel, options3) {
  if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange")) sel = filterSelectionChange(doc, sel, options3);
  let bias = options3 && options3.bias || (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
  setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));
  if (!(options3 && options3.scroll === false) && doc.cm) ensureCursorVisible(doc.cm);
}

function setSelectionInner(doc, sel) {
  if (sel.equals(doc.sel)) return;
  doc.sel = sel;

  if (doc.cm) {
    doc.cm.curOp.updateInput = 1;
    doc.cm.curOp.selectionChanged = true;
    signalCursorActivity(doc.cm);
  }

  signalLater(doc, "cursorActivity", doc);
}

function reCheckSelection(doc) {
  setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false));
}

function skipAtomicInSelection(doc, sel, bias, mayClear) {
  let out;

  for (let i = 0; i < sel.ranges.length; i++) {
    let range2 = sel.ranges[i];
    let old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
    let newAnchor = skipAtomic(doc, range2.anchor, old && old.anchor, bias, mayClear);
    let newHead = skipAtomic(doc, range2.head, old && old.head, bias, mayClear);

    if (out || newAnchor != range2.anchor || newHead != range2.head) {
      if (!out) out = sel.ranges.slice(0, i);
      out[i] = new Range(newAnchor, newHead);
    }
  }

  return out ? normalizeSelection(doc.cm, out, sel.primIndex) : sel;
}

function skipAtomicInner(doc, pos26, oldPos, dir, mayClear) {
  let line = getLine(doc, pos26.line);
  if (line.markedSpans) for (let i = 0; i < line.markedSpans.length; ++i) {
    let sp = line.markedSpans[i],
    m = sp.marker;
    let preventCursorLeft = "selectLeft" in m ? !m.selectLeft : m.inclusiveLeft;
    let preventCursorRight = "selectRight" in m ? !m.selectRight : m.inclusiveRight;

    if ((sp.from == null || (preventCursorLeft ? sp.from <= pos26.ch : sp.from < pos26.ch)) && (sp.to == null || (preventCursorRight ? sp.to >= pos26.ch : sp.to > pos26.ch))) {
      if (mayClear) {
        signal(m, "beforeCursorEnter");

        if (m.explicitlyCleared) {
          if (!line.markedSpans) break;else {
            --i;
            continue;
          }
        }
      }

      if (!m.atomic) continue;

      if (oldPos) {
        let near = m.find(dir < 0 ? 1 : -1),
        diff;
        if (dir < 0 ? preventCursorRight : preventCursorLeft) near = movePos(doc, near, -dir, near && near.line == pos26.line ? line : null);
        if (near && near.line == pos26.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0)) return skipAtomicInner(doc, near, pos26, dir, mayClear);
      }

      let far = m.find(dir < 0 ? -1 : 1);
      if (dir < 0 ? preventCursorLeft : preventCursorRight) far = movePos(doc, far, dir, far.line == pos26.line ? line : null);
      return far ? skipAtomicInner(doc, far, pos26, dir, mayClear) : null;
    }
  }
  return pos26;
}

function skipAtomic(doc, pos26, oldPos, bias, mayClear) {
  let dir = bias || 1;
  let found = skipAtomicInner(doc, pos26, oldPos, dir, mayClear) || !mayClear && skipAtomicInner(doc, pos26, oldPos, dir, true) || skipAtomicInner(doc, pos26, oldPos, -dir, mayClear) || !mayClear && skipAtomicInner(doc, pos26, oldPos, -dir, true);

  if (!found) {
    doc.cantEdit = true;
    return Pos(doc.first, 0);
  }

  return found;
}

function movePos(doc, pos26, dir, line) {
  if (dir < 0 && pos26.ch == 0) {
    if (pos26.line > doc.first) return clipPos(doc, Pos(pos26.line - 1));else return null;
  } else if (dir > 0 && pos26.ch == (line || getLine(doc, pos26.line)).text.length) {
    if (pos26.line < doc.first + doc.size - 1) return Pos(pos26.line + 1, 0);else return null;
  } else {
    return new Pos(pos26.line, pos26.ch + dir);
  }
}

function selectAll(cm) {
  cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);
} // node_modules/codemirror/src/model/changes.js


function filterChange(doc, change, update) {
  let obj = {
    canceled: false,
    from: change.from,
    to: change.to,
    text: change.text,
    origin: change.origin,
    cancel: () => obj.canceled = true };

  if (update) obj.update = (from, to, text, origin) => {
    if (from) obj.from = clipPos(doc, from);
    if (to) obj.to = clipPos(doc, to);
    if (text) obj.text = text;
    if (origin !== void 0) obj.origin = origin;
  };
  signal(doc, "beforeChange", doc, obj);
  if (doc.cm) signal(doc.cm, "beforeChange", doc.cm, obj);

  if (obj.canceled) {
    if (doc.cm) doc.cm.curOp.updateInput = 2;
    return null;
  }

  return {
    from: obj.from,
    to: obj.to,
    text: obj.text,
    origin: obj.origin };

}

function makeChange(doc, change, ignoreReadOnly) {
  if (doc.cm) {
    if (!doc.cm.curOp) return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
    if (doc.cm.state.suppressEdits) return;
  }

  if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
    change = filterChange(doc, change, true);
    if (!change) return;
  }

  let split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);

  if (split) {
    for (let i = split.length - 1; i >= 0; --i) makeChangeInner(doc, {
      from: split[i].from,
      to: split[i].to,
      text: i ? [""] : change.text,
      origin: change.origin });

  } else {
    makeChangeInner(doc, change);
  }
}

function makeChangeInner(doc, change) {
  if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) return;
  let selAfter = computeSelAfterChange(doc, change);
  addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);
  makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
  let rebased = [];
  linkedDocs(doc, (doc2, sharedHist) => {
    if (!sharedHist && indexOf(rebased, doc2.history) == -1) {
      rebaseHist(doc2.history, change);
      rebased.push(doc2.history);
    }

    makeChangeSingleDoc(doc2, change, null, stretchSpansOverChange(doc2, change));
  });
}

function makeChangeFromHistory(doc, type, allowSelectionOnly) {
  let suppress = doc.cm && doc.cm.state.suppressEdits;
  if (suppress && !allowSelectionOnly) return;
  let hist = doc.history,
  event28,
  selAfter = doc.sel;
  let source = type == "undo" ? hist.done : hist.undone,
  dest = type == "undo" ? hist.undone : hist.done;
  let i = 0;

  for (; i < source.length; i++) {
    event28 = source[i];
    if (allowSelectionOnly ? event28.ranges && !event28.equals(doc.sel) : !event28.ranges) break;
  }

  if (i == source.length) return;
  hist.lastOrigin = hist.lastSelOrigin = null;

  for (;;) {
    event28 = source.pop();

    if (event28.ranges) {
      pushSelectionToHistory(event28, dest);

      if (allowSelectionOnly && !event28.equals(doc.sel)) {
        setSelection(doc, event28, {
          clearRedo: false });

        return;
      }

      selAfter = event28;
    } else if (suppress) {
      source.push(event28);
      return;
    } else break;
  }

  let antiChanges = [];
  pushSelectionToHistory(selAfter, dest);
  dest.push({
    changes: antiChanges,
    generation: hist.generation });

  hist.generation = event28.generation || ++hist.maxGeneration;
  let filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

  for (let i2 = event28.changes.length - 1; i2 >= 0; --i2) {
    let change = event28.changes[i2];
    change.origin = type;

    if (filter && !filterChange(doc, change, false)) {
      source.length = 0;
      return;
    }

    antiChanges.push(historyChangeFromChange(doc, change));
    let after = i2 ? computeSelAfterChange(doc, change) : lst(source);
    makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
    if (!i2 && doc.cm) doc.cm.scrollIntoView({
      from: change.from,
      to: changeEnd(change) });

    let rebased = [];
    linkedDocs(doc, (doc2, sharedHist) => {
      if (!sharedHist && indexOf(rebased, doc2.history) == -1) {
        rebaseHist(doc2.history, change);
        rebased.push(doc2.history);
      }

      makeChangeSingleDoc(doc2, change, null, mergeOldSpans(doc2, change));
    });
  }
}

function shiftDoc(doc, distance) {
  if (distance == 0) return;
  doc.first += distance;
  doc.sel = new Selection(map(doc.sel.ranges, range2 => new Range(Pos(range2.anchor.line + distance, range2.anchor.ch), Pos(range2.head.line + distance, range2.head.ch))), doc.sel.primIndex);

  if (doc.cm) {
    regChange(doc.cm, doc.first, doc.first - distance, distance);

    for (let d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++) regLineChange(doc.cm, l, "gutter");
  }
}

function makeChangeSingleDoc(doc, change, selAfter, spans17) {
  if (doc.cm && !doc.cm.curOp) return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans17);

  if (change.to.line < doc.first) {
    shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
    return;
  }

  if (change.from.line > doc.lastLine()) return;

  if (change.from.line < doc.first) {
    let shift = change.text.length - 1 - (doc.first - change.from.line);
    shiftDoc(doc, shift);
    change = {
      from: Pos(doc.first, 0),
      to: Pos(change.to.line + shift, change.to.ch),
      text: [lst(change.text)],
      origin: change.origin };

  }

  let last = doc.lastLine();

  if (change.to.line > last) {
    change = {
      from: change.from,
      to: Pos(last, getLine(doc, last).text.length),
      text: [change.text[0]],
      origin: change.origin };

  }

  change.removed = getBetween(doc, change.from, change.to);
  if (!selAfter) selAfter = computeSelAfterChange(doc, change);
  if (doc.cm) makeChangeSingleDocInEditor(doc.cm, change, spans17);else updateDoc(doc, change, spans17);
  setSelectionNoUndo(doc, selAfter, sel_dontScroll);
  if (doc.cantEdit && skipAtomic(doc, Pos(doc.firstLine(), 0))) doc.cantEdit = false;
}

function makeChangeSingleDocInEditor(cm, change, spans17) {
  let doc = cm.doc,
  display = cm.display,
  from = change.from,
  to = change.to;
  let recomputeMaxLength = false,
  checkWidthStart = from.line;

  if (!cm.options.lineWrapping) {
    checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
    doc.iter(checkWidthStart, to.line + 1, line => {
      if (line == display.maxLine) {
        recomputeMaxLength = true;
        return true;
      }
    });
  }

  if (doc.sel.contains(change.from, change.to) > -1) signalCursorActivity(cm);
  updateDoc(doc, change, spans17, estimateHeight(cm));

  if (!cm.options.lineWrapping) {
    doc.iter(checkWidthStart, from.line + change.text.length, line => {
      let len = lineLength(line);

      if (len > display.maxLineLength) {
        display.maxLine = line;
        display.maxLineLength = len;
        display.maxLineChanged = true;
        recomputeMaxLength = false;
      }
    });
    if (recomputeMaxLength) cm.curOp.updateMaxLine = true;
  }

  retreatFrontier(doc, from.line);
  startWorker(cm, 400);
  let lendiff = change.text.length - (to.line - from.line) - 1;
  if (change.full) regChange(cm);else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change)) regLineChange(cm, from.line, "text");else regChange(cm, from.line, to.line + 1, lendiff);
  let changesHandler = hasHandler(cm, "changes"),
  changeHandler = hasHandler(cm, "change");

  if (changeHandler || changesHandler) {
    let obj = {
      from,
      to,
      text: change.text,
      removed: change.removed,
      origin: change.origin };

    if (changeHandler) signalLater(cm, "change", cm, obj);
    if (changesHandler) (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
  }

  cm.display.selForContextMenu = null;
}

function replaceRange(doc, code, from, to, origin) {
  if (!to) to = from;
  if (cmp(to, from) < 0) [from, to] = [to, from];
  if (typeof code == "string") code = doc.splitLines(code);
  makeChange(doc, {
    from,
    to,
    text: code,
    origin });

}

function rebaseHistSelSingle(pos26, from, to, diff) {
  if (to < pos26.line) {
    pos26.line += diff;
  } else if (from < pos26.line) {
    pos26.line = from;
    pos26.ch = 0;
  }
}

function rebaseHistArray(array, from, to, diff) {
  for (let i = 0; i < array.length; ++i) {
    let sub = array[i],
    ok = true;

    if (sub.ranges) {
      if (!sub.copied) {
        sub = array[i] = sub.deepCopy();
        sub.copied = true;
      }

      for (let j = 0; j < sub.ranges.length; j++) {
        rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
        rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
      }

      continue;
    }

    for (let j = 0; j < sub.changes.length; ++j) {
      let cur = sub.changes[j];

      if (to < cur.from.line) {
        cur.from = Pos(cur.from.line + diff, cur.from.ch);
        cur.to = Pos(cur.to.line + diff, cur.to.ch);
      } else if (from <= cur.to.line) {
        ok = false;
        break;
      }
    }

    if (!ok) {
      array.splice(0, i + 1);
      i = 0;
    }
  }
}

function rebaseHist(hist, change) {
  let from = change.from.line,
  to = change.to.line,
  diff = change.text.length - (to - from) - 1;
  rebaseHistArray(hist.done, from, to, diff);
  rebaseHistArray(hist.undone, from, to, diff);
}

function changeLine(doc, handle, changeType, op) {
  let no = handle,
  line = handle;
  if (typeof handle == "number") line = getLine(doc, clipLine(doc, handle));else no = lineNo(handle);
  if (no == null) return null;
  if (op(line, no) && doc.cm) regLineChange(doc.cm, no, changeType);
  return line;
} // node_modules/codemirror/src/model/chunk.js


function LeafChunk(lines) {
  this.lines = lines;
  this.parent = null;
  let height = 0;

  for (let i = 0; i < lines.length; ++i) {
    lines[i].parent = this;
    height += lines[i].height;
  }

  this.height = height;
}

LeafChunk.prototype = {
  chunkSize() {
    return this.lines.length;
  },

  removeInner(at, n) {
    for (let i = at, e = at + n; i < e; ++i) {
      let line = this.lines[i];
      this.height -= line.height;
      cleanUpLine(line);
      signalLater(line, "delete");
    }

    this.lines.splice(at, n);
  },

  collapse(lines) {
    lines.push.apply(lines, this.lines);
  },

  insertInner(at, lines, height) {
    this.height += height;
    this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));

    for (let i = 0; i < lines.length; ++i) lines[i].parent = this;
  },

  iterN(at, n, op) {
    for (let e = at + n; at < e; ++at) if (op(this.lines[at])) return true;
  } };



function BranchChunk(children) {
  this.children = children;
  let size = 0,
  height = 0;

  for (let i = 0; i < children.length; ++i) {
    let ch = children[i];
    size += ch.chunkSize();
    height += ch.height;
    ch.parent = this;
  }

  this.size = size;
  this.height = height;
  this.parent = null;
}

BranchChunk.prototype = {
  chunkSize() {
    return this.size;
  },

  removeInner(at, n) {
    this.size -= n;

    for (let i = 0; i < this.children.length; ++i) {
      let child = this.children[i],
      sz = child.chunkSize();

      if (at < sz) {
        let rm = Math.min(n, sz - at),
        oldHeight = child.height;
        child.removeInner(at, rm);
        this.height -= oldHeight - child.height;

        if (sz == rm) {
          this.children.splice(i--, 1);
          child.parent = null;
        }

        if ((n -= rm) == 0) break;
        at = 0;
      } else at -= sz;
    }

    if (this.size - n < 25 && (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
      let lines = [];
      this.collapse(lines);
      this.children = [new LeafChunk(lines)];
      this.children[0].parent = this;
    }
  },

  collapse(lines) {
    for (let i = 0; i < this.children.length; ++i) this.children[i].collapse(lines);
  },

  insertInner(at, lines, height) {
    this.size += lines.length;
    this.height += height;

    for (let i = 0; i < this.children.length; ++i) {
      let child = this.children[i],
      sz = child.chunkSize();

      if (at <= sz) {
        child.insertInner(at, lines, height);

        if (child.lines && child.lines.length > 50) {
          let remaining = child.lines.length % 25 + 25;

          for (let pos26 = remaining; pos26 < child.lines.length;) {
            let leaf = new LeafChunk(child.lines.slice(pos26, pos26 += 25));
            child.height -= leaf.height;
            this.children.splice(++i, 0, leaf);
            leaf.parent = this;
          }

          child.lines = child.lines.slice(0, remaining);
          this.maybeSpill();
        }

        break;
      }

      at -= sz;
    }
  },

  maybeSpill() {
    if (this.children.length <= 10) return;
    let me = this;

    do {
      let spilled = me.children.splice(me.children.length - 5, 5);
      let sibling = new BranchChunk(spilled);

      if (!me.parent) {
        let copy = new BranchChunk(me.children);
        copy.parent = me;
        me.children = [copy, sibling];
        me = copy;
      } else {
        me.size -= sibling.size;
        me.height -= sibling.height;
        let myIndex = indexOf(me.parent.children, me);
        me.parent.children.splice(myIndex + 1, 0, sibling);
      }

      sibling.parent = me.parent;
    } while (me.children.length > 10);

    me.parent.maybeSpill();
  },

  iterN(at, n, op) {
    for (let i = 0; i < this.children.length; ++i) {
      let child = this.children[i],
      sz = child.chunkSize();

      if (at < sz) {
        let used = Math.min(n, sz - at);
        if (child.iterN(at, used, op)) return true;
        if ((n -= used) == 0) break;
        at = 0;
      } else at -= sz;
    }
  } };

// node_modules/codemirror/src/model/line_widget.js

class LineWidget {
  constructor(doc, node, options3) {
    if (options3) {
      for (let opt in options3) if (options3.hasOwnProperty(opt)) this[opt] = options3[opt];
    }

    this.doc = doc;
    this.node = node;
  }

  clear() {
    let cm = this.doc.cm,
    ws = this.line.widgets,
    line = this.line,
    no = lineNo(line);
    if (no == null || !ws) return;

    for (let i = 0; i < ws.length; ++i) if (ws[i] == this) ws.splice(i--, 1);

    if (!ws.length) line.widgets = null;
    let height = widgetHeight(this);
    updateLineHeight(line, Math.max(0, line.height - height));

    if (cm) {
      runInOp(cm, () => {
        adjustScrollWhenAboveVisible(cm, line, -height);
        regLineChange(cm, no, "widget");
      });
      signalLater(cm, "lineWidgetCleared", cm, this, no);
    }
  }

  changed() {
    let oldH = this.height,
    cm = this.doc.cm,
    line = this.line;
    this.height = null;
    let diff = widgetHeight(this) - oldH;
    if (!diff) return;
    if (!lineIsHidden(this.doc, line)) updateLineHeight(line, line.height + diff);

    if (cm) {
      runInOp(cm, () => {
        cm.curOp.forceUpdate = true;
        adjustScrollWhenAboveVisible(cm, line, diff);
        signalLater(cm, "lineWidgetChanged", cm, this, lineNo(line));
      });
    }
  }}



eventMixin(LineWidget);

function adjustScrollWhenAboveVisible(cm, line, diff) {
  if (heightAtLine(line) < (cm.curOp && cm.curOp.scrollTop || cm.doc.scrollTop)) addToScrollTop(cm, diff);
}

function addLineWidget(doc, handle, node, options3) {
  let widget = new LineWidget(doc, node, options3);
  let cm = doc.cm;
  if (cm && widget.noHScroll) cm.display.alignWidgets = true;
  changeLine(doc, handle, "widget", line => {
    let widgets9 = line.widgets || (line.widgets = []);
    if (widget.insertAt == null) widgets9.push(widget);else widgets9.splice(Math.min(widgets9.length - 1, Math.max(0, widget.insertAt)), 0, widget);
    widget.line = line;

    if (cm && !lineIsHidden(doc, line)) {
      let aboveVisible = heightAtLine(line) < doc.scrollTop;
      updateLineHeight(line, line.height + widgetHeight(widget));
      if (aboveVisible) addToScrollTop(cm, widget.height);
      cm.curOp.forceUpdate = true;
    }

    return true;
  });
  if (cm) signalLater(cm, "lineWidgetAdded", cm, widget, typeof handle == "number" ? handle : lineNo(handle));
  return widget;
} // node_modules/codemirror/src/model/mark_text.js


let nextMarkerId = 0;

class TextMarker {
  constructor(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
    this.id = ++nextMarkerId;
  }

  clear() {
    if (this.explicitlyCleared) return;
    let cm = this.doc.cm,
    withOp = cm && !cm.curOp;
    if (withOp) startOperation(cm);

    if (hasHandler(this, "clear")) {
      let found = this.find();
      if (found) signalLater(this, "clear", found.from, found.to);
    }

    let min = null,
    max = null;

    for (let i = 0; i < this.lines.length; ++i) {
      let line = this.lines[i];
      let span = getMarkedSpanFor(line.markedSpans, this);
      if (cm && !this.collapsed) regLineChange(cm, lineNo(line), "text");else if (cm) {
        if (span.to != null) max = lineNo(line);
        if (span.from != null) min = lineNo(line);
      }
      line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      if (span.from == null && this.collapsed && !lineIsHidden(this.doc, line) && cm) updateLineHeight(line, textHeight(cm.display));
    }

    if (cm && this.collapsed && !cm.options.lineWrapping) for (let i = 0; i < this.lines.length; ++i) {
      let visual = visualLine(this.lines[i]),
      len = lineLength(visual);

      if (len > cm.display.maxLineLength) {
        cm.display.maxLine = visual;
        cm.display.maxLineLength = len;
        cm.display.maxLineChanged = true;
      }
    }
    if (min != null && cm && this.collapsed) regChange(cm, min, max + 1);
    this.lines.length = 0;
    this.explicitlyCleared = true;

    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;
      if (cm) reCheckSelection(cm.doc);
    }

    if (cm) signalLater(cm, "markerCleared", cm, this, min, max);
    if (withOp) endOperation(cm);
    if (this.parent) this.parent.clear();
  }

  find(side, lineObj) {
    if (side == null && this.type == "bookmark") side = 1;
    let from, to;

    for (let i = 0; i < this.lines.length; ++i) {
      let line = this.lines[i];
      let span = getMarkedSpanFor(line.markedSpans, this);

      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);
        if (side == -1) return from;
      }

      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);
        if (side == 1) return to;
      }
    }

    return from && {
      from,
      to };

  }

  changed() {
    let pos26 = this.find(-1, true),
    widget = this,
    cm = this.doc.cm;
    if (!pos26 || !cm) return;
    runInOp(cm, () => {
      let line = pos26.line,
      lineN = lineNo(pos26.line);
      let view = findViewForLine(cm, lineN);

      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }

      cm.curOp.updateMaxLine = true;

      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        let oldHeight = widget.height;
        widget.height = null;
        let dHeight = widgetHeight(widget) - oldHeight;
        if (dHeight) updateLineHeight(line, line.height + dHeight);
      }

      signalLater(cm, "markerChanged", cm, this);
    });
  }

  attachLine(line) {
    if (!this.lines.length && this.doc.cm) {
      let op = this.doc.cm.curOp;
      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1) (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
    }

    this.lines.push(line);
  }

  detachLine(line) {
    this.lines.splice(indexOf(this.lines, line), 1);

    if (!this.lines.length && this.doc.cm) {
      let op = this.doc.cm.curOp;
      (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  }}



eventMixin(TextMarker);

function markText(doc, from, to, options3, type) {
  if (options3 && options3.shared) return markTextShared(doc, from, to, options3, type);
  if (doc.cm && !doc.cm.curOp) return operation(doc.cm, markText)(doc, from, to, options3, type);
  let marker = new TextMarker(doc, type),
  diff = cmp(from, to);
  if (options3) copyObj(options3, marker, false);
  if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false) return marker;

  if (marker.replacedWith) {
    marker.collapsed = true;
    marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget");
    if (!options3.handleMouseEvents) marker.widgetNode.setAttribute("cm-ignore-events", "true");
    if (options3.insertLeft) marker.widgetNode.insertLeft = true;
  }

  if (marker.collapsed) {
    if (conflictingCollapsedRange(doc, from.line, from, to, marker) || from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker)) throw new Error("Inserting collapsed marker partially overlapping an existing one");
    seeCollapsedSpans();
  }

  if (marker.addToHistory) addChangeToHistory(doc, {
    from,
    to,
    origin: "markText" },
  doc.sel, NaN);
  let curLine = from.line,
  cm = doc.cm,
  updateMaxLine;
  doc.iter(curLine, to.line + 1, line => {
    if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine) updateMaxLine = true;
    if (marker.collapsed && curLine != from.line) updateLineHeight(line, 0);
    addMarkedSpan(line, new MarkedSpan(marker, curLine == from.line ? from.ch : null, curLine == to.line ? to.ch : null));
    ++curLine;
  });
  if (marker.collapsed) doc.iter(from.line, to.line + 1, line => {
    if (lineIsHidden(doc, line)) updateLineHeight(line, 0);
  });
  if (marker.clearOnEnter) on(marker, "beforeCursorEnter", () => marker.clear());

  if (marker.readOnly) {
    seeReadOnlySpans();
    if (doc.history.done.length || doc.history.undone.length) doc.clearHistory();
  }

  if (marker.collapsed) {
    marker.id = ++nextMarkerId;
    marker.atomic = true;
  }

  if (cm) {
    if (updateMaxLine) cm.curOp.updateMaxLine = true;
    if (marker.collapsed) regChange(cm, from.line, to.line + 1);else if (marker.className || marker.startStyle || marker.endStyle || marker.css || marker.attributes || marker.title) for (let i = from.line; i <= to.line; i++) regLineChange(cm, i, "text");
    if (marker.atomic) reCheckSelection(cm.doc);
    signalLater(cm, "markerAdded", cm, marker);
  }

  return marker;
}

class SharedTextMarker {
  constructor(markers, primary) {
    this.markers = markers;
    this.primary = primary;

    for (let i = 0; i < markers.length; ++i) markers[i].parent = this;
  }

  clear() {
    if (this.explicitlyCleared) return;
    this.explicitlyCleared = true;

    for (let i = 0; i < this.markers.length; ++i) this.markers[i].clear();

    signalLater(this, "clear");
  }

  find(side, lineObj) {
    return this.primary.find(side, lineObj);
  }}



eventMixin(SharedTextMarker);

function markTextShared(doc, from, to, options3, type) {
  options3 = copyObj(options3);
  options3.shared = false;
  let markers = [markText(doc, from, to, options3, type)],
  primary = markers[0];
  let widget = options3.widgetNode;
  linkedDocs(doc, doc2 => {
    if (widget) options3.widgetNode = widget.cloneNode(true);
    markers.push(markText(doc2, clipPos(doc2, from), clipPos(doc2, to), options3, type));

    for (let i = 0; i < doc2.linked.length; ++i) if (doc2.linked[i].isParent) return;

    primary = lst(markers);
  });
  return new SharedTextMarker(markers, primary);
}

function findSharedMarkers(doc) {
  return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), m => m.parent);
}

function copySharedMarkers(doc, markers) {
  for (let i = 0; i < markers.length; i++) {
    let marker = markers[i],
    pos26 = marker.find();
    let mFrom = doc.clipPos(pos26.from),
    mTo = doc.clipPos(pos26.to);

    if (cmp(mFrom, mTo)) {
      let subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
      marker.markers.push(subMark);
      subMark.parent = marker;
    }
  }
}

function detachSharedMarkers(markers) {
  for (let i = 0; i < markers.length; i++) {
    let marker = markers[i],
    linked = [marker.primary.doc];
    linkedDocs(marker.primary.doc, d => linked.push(d));

    for (let j = 0; j < marker.markers.length; j++) {
      let subMarker = marker.markers[j];

      if (indexOf(linked, subMarker.doc) == -1) {
        subMarker.parent = null;
        marker.markers.splice(j--, 1);
      }
    }
  }
} // node_modules/codemirror/src/model/Doc.js


let nextDocId = 0;

let Doc4 = function Doc4(text, mode, firstLine, lineSep, direction) {
  if (!(this instanceof Doc4)) return new Doc4(text, mode, firstLine, lineSep, direction);
  if (firstLine == null) firstLine = 0;
  BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
  this.first = firstLine;
  this.scrollTop = this.scrollLeft = 0;
  this.cantEdit = false;
  this.cleanGeneration = 1;
  this.modeFrontier = this.highlightFrontier = firstLine;
  let start = Pos(firstLine, 0);
  this.sel = simpleSelection(start);
  this.history = new History(null);
  this.id = ++nextDocId;
  this.modeOption = mode;
  this.lineSep = lineSep;
  this.direction = direction == "rtl" ? "rtl" : "ltr";
  this.extend = false;
  if (typeof text == "string") text = this.splitLines(text);
  updateDoc(this, {
    from: start,
    to: start,
    text });

  setSelection(this, simpleSelection(start), sel_dontScroll);
};

Doc4.prototype = createObj(BranchChunk.prototype, {
  constructor: Doc4,
  iter: function (from, to, op) {
    if (op) this.iterN(from - this.first, to - from, op);else this.iterN(this.first, this.first + this.size, from);
  },
  insert: function (at, lines) {
    let height = 0;

    for (let i = 0; i < lines.length; ++i) height += lines[i].height;

    this.insertInner(at - this.first, lines, height);
  },
  remove: function (at, n) {
    this.removeInner(at - this.first, n);
  },
  getValue: function (lineSep) {
    let lines = getLines(this, this.first, this.first + this.size);
    if (lineSep === false) return lines;
    return lines.join(lineSep || this.lineSeparator());
  },
  setValue: docMethodOp(function (code) {
    let top = Pos(this.first, 0),
    last = this.first + this.size - 1;
    makeChange(this, {
      from: top,
      to: Pos(last, getLine(this, last).text.length),
      text: this.splitLines(code),
      origin: "setValue",
      full: true },
    true);
    if (this.cm) scrollToCoords(this.cm, 0, 0);
    setSelection(this, simpleSelection(top), sel_dontScroll);
  }),
  replaceRange: function (code, from, to, origin) {
    from = clipPos(this, from);
    to = to ? clipPos(this, to) : from;
    replaceRange(this, code, from, to, origin);
  },
  getRange: function (from, to, lineSep) {
    let lines = getBetween(this, clipPos(this, from), clipPos(this, to));
    if (lineSep === false) return lines;
    return lines.join(lineSep || this.lineSeparator());
  },
  getLine: function (line) {
    let l = this.getLineHandle(line);
    return l && l.text;
  },
  getLineHandle: function (line) {
    if (isLine(this, line)) return getLine(this, line);
  },
  getLineNumber: function (line) {
    return lineNo(line);
  },
  getLineHandleVisualStart: function (line) {
    if (typeof line == "number") line = getLine(this, line);
    return visualLine(line);
  },
  lineCount: function () {
    return this.size;
  },
  firstLine: function () {
    return this.first;
  },
  lastLine: function () {
    return this.first + this.size - 1;
  },
  clipPos: function (pos26) {
    return clipPos(this, pos26);
  },
  getCursor: function (start) {
    let range2 = this.sel.primary(),
    pos26;
    if (start == null || start == "head") pos26 = range2.head;else if (start == "anchor") pos26 = range2.anchor;else if (start == "end" || start == "to" || start === false) pos26 = range2.to();else pos26 = range2.from();
    return pos26;
  },
  listSelections: function () {
    return this.sel.ranges;
  },
  somethingSelected: function () {
    return this.sel.somethingSelected();
  },
  setCursor: docMethodOp(function (line, ch, options3) {
    setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options3);
  }),
  setSelection: docMethodOp(function (anchor, head, options3) {
    setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options3);
  }),
  extendSelection: docMethodOp(function (head, other, options3) {
    extendSelection(this, clipPos(this, head), other && clipPos(this, other), options3);
  }),
  extendSelections: docMethodOp(function (heads, options3) {
    extendSelections(this, clipPosArray(this, heads), options3);
  }),
  extendSelectionsBy: docMethodOp(function (f, options3) {
    let heads = map(this.sel.ranges, f);
    extendSelections(this, clipPosArray(this, heads), options3);
  }),
  setSelections: docMethodOp(function (ranges, primary, options3) {
    if (!ranges.length) return;
    let out = [];

    for (let i = 0; i < ranges.length; i++) out[i] = new Range(clipPos(this, ranges[i].anchor), clipPos(this, ranges[i].head));

    if (primary == null) primary = Math.min(ranges.length - 1, this.sel.primIndex);
    setSelection(this, normalizeSelection(this.cm, out, primary), options3);
  }),
  addSelection: docMethodOp(function (anchor, head, options3) {
    let ranges = this.sel.ranges.slice(0);
    ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
    setSelection(this, normalizeSelection(this.cm, ranges, ranges.length - 1), options3);
  }),
  getSelection: function (lineSep) {
    let ranges = this.sel.ranges,
    lines;

    for (let i = 0; i < ranges.length; i++) {
      let sel = getBetween(this, ranges[i].from(), ranges[i].to());
      lines = lines ? lines.concat(sel) : sel;
    }

    if (lineSep === false) return lines;else return lines.join(lineSep || this.lineSeparator());
  },
  getSelections: function (lineSep) {
    let parts = [],
    ranges = this.sel.ranges;

    for (let i = 0; i < ranges.length; i++) {
      let sel = getBetween(this, ranges[i].from(), ranges[i].to());
      if (lineSep !== false) sel = sel.join(lineSep || this.lineSeparator());
      parts[i] = sel;
    }

    return parts;
  },
  replaceSelection: function (code, collapse, origin) {
    let dup = [];

    for (let i = 0; i < this.sel.ranges.length; i++) dup[i] = code;

    this.replaceSelections(dup, collapse, origin || "+input");
  },
  replaceSelections: docMethodOp(function (code, collapse, origin) {
    let changes9 = [],
    sel = this.sel;

    for (let i = 0; i < sel.ranges.length; i++) {
      let range2 = sel.ranges[i];
      changes9[i] = {
        from: range2.from(),
        to: range2.to(),
        text: this.splitLines(code[i]),
        origin };

    }

    let newSel = collapse && collapse != "end" && computeReplacedSel(this, changes9, collapse);

    for (let i = changes9.length - 1; i >= 0; i--) makeChange(this, changes9[i]);

    if (newSel) setSelectionReplaceHistory(this, newSel);else if (this.cm) ensureCursorVisible(this.cm);
  }),
  undo: docMethodOp(function () {
    makeChangeFromHistory(this, "undo");
  }),
  redo: docMethodOp(function () {
    makeChangeFromHistory(this, "redo");
  }),
  undoSelection: docMethodOp(function () {
    makeChangeFromHistory(this, "undo", true);
  }),
  redoSelection: docMethodOp(function () {
    makeChangeFromHistory(this, "redo", true);
  }),
  setExtending: function (val) {
    this.extend = val;
  },
  getExtending: function () {
    return this.extend;
  },
  historySize: function () {
    let hist = this.history,
    done = 0,
    undone = 0;

    for (let i = 0; i < hist.done.length; i++) if (!hist.done[i].ranges) ++done;

    for (let i = 0; i < hist.undone.length; i++) if (!hist.undone[i].ranges) ++undone;

    return {
      undo: done,
      redo: undone };

  },
  clearHistory: function () {
    this.history = new History(this.history.maxGeneration);
    linkedDocs(this, doc => doc.history = this.history, true);
  },
  markClean: function () {
    this.cleanGeneration = this.changeGeneration(true);
  },
  changeGeneration: function (forceSplit) {
    if (forceSplit) this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
    return this.history.generation;
  },
  isClean: function (gen) {
    return this.history.generation == (gen || this.cleanGeneration);
  },
  getHistory: function () {
    return {
      done: copyHistoryArray(this.history.done),
      undone: copyHistoryArray(this.history.undone) };

  },
  setHistory: function (histData) {
    let hist = this.history = new History(this.history.maxGeneration);
    hist.done = copyHistoryArray(histData.done.slice(0), null, true);
    hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
  },
  setGutterMarker: docMethodOp(function (line, gutterID, value) {
    return changeLine(this, line, "gutter", line2 => {
      let markers = line2.gutterMarkers || (line2.gutterMarkers = {});
      markers[gutterID] = value;
      if (!value && isEmpty(markers)) line2.gutterMarkers = null;
      return true;
    });
  }),
  clearGutter: docMethodOp(function (gutterID) {
    this.iter(line => {
      if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
        changeLine(this, line, "gutter", () => {
          line.gutterMarkers[gutterID] = null;
          if (isEmpty(line.gutterMarkers)) line.gutterMarkers = null;
          return true;
        });
      }
    });
  }),
  lineInfo: function (line) {
    let n;

    if (typeof line == "number") {
      if (!isLine(this, line)) return null;
      n = line;
      line = getLine(this, line);
      if (!line) return null;
    } else {
      n = lineNo(line);
      if (n == null) return null;
    }

    return {
      line: n,
      handle: line,
      text: line.text,
      gutterMarkers: line.gutterMarkers,
      textClass: line.textClass,
      bgClass: line.bgClass,
      wrapClass: line.wrapClass,
      widgets: line.widgets };

  },
  addLineClass: docMethodOp(function (handle, where, cls) {
    return changeLine(this, handle, where == "gutter" ? "gutter" : "class", line => {
      let prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
      if (!line[prop]) line[prop] = cls;else if (classTest(cls).test(line[prop])) return false;else line[prop] += " " + cls;
      return true;
    });
  }),
  removeLineClass: docMethodOp(function (handle, where, cls) {
    return changeLine(this, handle, where == "gutter" ? "gutter" : "class", line => {
      let prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
      let cur = line[prop];
      if (!cur) return false;else if (cls == null) line[prop] = null;else {
        let found = cur.match(classTest(cls));
        if (!found) return false;
        let end = found.index + found[0].length;
        line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
      }
      return true;
    });
  }),
  addLineWidget: docMethodOp(function (handle, node, options3) {
    return addLineWidget(this, handle, node, options3);
  }),
  removeLineWidget: function (widget) {
    widget.clear();
  },
  markText: function (from, to, options3) {
    return markText(this, clipPos(this, from), clipPos(this, to), options3, options3 && options3.type || "range");
  },
  setBookmark: function (pos26, options3) {
    let realOpts = {
      replacedWith: options3 && (options3.nodeType == null ? options3.widget : options3),
      insertLeft: options3 && options3.insertLeft,
      clearWhenEmpty: false,
      shared: options3 && options3.shared,
      handleMouseEvents: options3 && options3.handleMouseEvents };

    pos26 = clipPos(this, pos26);
    return markText(this, pos26, pos26, realOpts, "bookmark");
  },
  findMarksAt: function (pos26) {
    pos26 = clipPos(this, pos26);
    let markers = [],
    spans17 = getLine(this, pos26.line).markedSpans;
    if (spans17) for (let i = 0; i < spans17.length; ++i) {
      let span = spans17[i];
      if ((span.from == null || span.from <= pos26.ch) && (span.to == null || span.to >= pos26.ch)) markers.push(span.marker.parent || span.marker);
    }
    return markers;
  },
  findMarks: function (from, to, filter) {
    from = clipPos(this, from);
    to = clipPos(this, to);
    let found = [],
    lineNo2 = from.line;
    this.iter(from.line, to.line + 1, line => {
      let spans17 = line.markedSpans;
      if (spans17) for (let i = 0; i < spans17.length; i++) {
        let span = spans17[i];
        if (!(span.to != null && lineNo2 == from.line && from.ch >= span.to || span.from == null && lineNo2 != from.line || span.from != null && lineNo2 == to.line && span.from >= to.ch) && (!filter || filter(span.marker))) found.push(span.marker.parent || span.marker);
      }
      ++lineNo2;
    });
    return found;
  },
  getAllMarks: function () {
    let markers = [];
    this.iter(line => {
      let sps = line.markedSpans;

      if (sps) {
        for (let i = 0; i < sps.length; ++i) if (sps[i].from != null) markers.push(sps[i].marker);
      }
    });
    return markers;
  },
  posFromIndex: function (off2) {
    let ch,
    lineNo2 = this.first,
    sepSize = this.lineSeparator().length;
    this.iter(line => {
      let sz = line.text.length + sepSize;

      if (sz > off2) {
        ch = off2;
        return true;
      }

      off2 -= sz;
      ++lineNo2;
    });
    return clipPos(this, Pos(lineNo2, ch));
  },
  indexFromPos: function (coords) {
    coords = clipPos(this, coords);
    let index = coords.ch;
    if (coords.line < this.first || coords.ch < 0) return 0;
    let sepSize = this.lineSeparator().length;
    this.iter(this.first, coords.line, line => {
      index += line.text.length + sepSize;
    });
    return index;
  },
  copy: function (copyHistory) {
    let doc = new Doc4(getLines(this, this.first, this.first + this.size), this.modeOption, this.first, this.lineSep, this.direction);
    doc.scrollTop = this.scrollTop;
    doc.scrollLeft = this.scrollLeft;
    doc.sel = this.sel;
    doc.extend = false;

    if (copyHistory) {
      doc.history.undoDepth = this.history.undoDepth;
      doc.setHistory(this.getHistory());
    }

    return doc;
  },
  linkedDoc: function (options3) {
    if (!options3) options3 = {};
    let from = this.first,
    to = this.first + this.size;
    if (options3.from != null && options3.from > from) from = options3.from;
    if (options3.to != null && options3.to < to) to = options3.to;
    let copy = new Doc4(getLines(this, from, to), options3.mode || this.modeOption, from, this.lineSep, this.direction);
    if (options3.sharedHist) copy.history = this.history;
    (this.linked || (this.linked = [])).push({
      doc: copy,
      sharedHist: options3.sharedHist });

    copy.linked = [{
      doc: this,
      isParent: true,
      sharedHist: options3.sharedHist }];

    copySharedMarkers(copy, findSharedMarkers(this));
    return copy;
  },
  unlinkDoc: function (other) {
    if (other instanceof CodeMirror_default) other = other.doc;
    if (this.linked) for (let i = 0; i < this.linked.length; ++i) {
      let link = this.linked[i];
      if (link.doc != other) continue;
      this.linked.splice(i, 1);
      other.unlinkDoc(this);
      detachSharedMarkers(findSharedMarkers(this));
      break;
    }

    if (other.history == this.history) {
      let splitIds = [other.id];
      linkedDocs(other, doc => splitIds.push(doc.id), true);
      other.history = new History(null);
      other.history.done = copyHistoryArray(this.history.done, splitIds);
      other.history.undone = copyHistoryArray(this.history.undone, splitIds);
    }
  },
  iterLinkedDocs: function (f) {
    linkedDocs(this, f);
  },
  getMode: function () {
    return this.mode;
  },
  getEditor: function () {
    return this.cm;
  },
  splitLines: function (str) {
    if (this.lineSep) return str.split(this.lineSep);
    return splitLinesAuto(str);
  },
  lineSeparator: function () {
    return this.lineSep || "\n";
  },
  setDirection: docMethodOp(function (dir) {
    if (dir != "rtl") dir = "ltr";
    if (dir == this.direction) return;
    this.direction = dir;
    this.iter(line => line.order = null);
    if (this.cm) directionChanged(this.cm);
  }) });

Doc4.prototype.eachLine = Doc4.prototype.iter;
const Doc_default = Doc4; // node_modules/codemirror/src/edit/drop_events.js

let lastDrop = 0;

function onDrop(e) {
  let cm = this;
  clearDragCursor(cm);
  if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) return;
  e_preventDefault(e);
  if (ie) lastDrop = +new Date();
  let pos26 = posFromMouse(cm, e, true),
  files = e.dataTransfer.files;
  if (!pos26 || cm.isReadOnly()) return;

  if (files && files.length && window.FileReader && window.File) {
    let n = files.length,
    text = Array(n),
    read = 0;

    const markAsReadAndPasteIfAllFilesAreRead = () => {
      if (++read == n) {
        operation(cm, () => {
          pos26 = clipPos(cm.doc, pos26);
          let change = {
            from: pos26,
            to: pos26,
            text: cm.doc.splitLines(text.filter(t => t != null).join(cm.doc.lineSeparator())),
            origin: "paste" };

          makeChange(cm.doc, change);
          setSelectionReplaceHistory(cm.doc, simpleSelection(clipPos(cm.doc, pos26), clipPos(cm.doc, changeEnd(change))));
        })();
      }
    };

    const readTextFromFile = (file, i) => {
      if (cm.options.allowDropFileTypes && indexOf(cm.options.allowDropFileTypes, file.type) == -1) {
        markAsReadAndPasteIfAllFilesAreRead();
        return;
      }

      let reader = new FileReader();

      reader.onerror = () => markAsReadAndPasteIfAllFilesAreRead();

      reader.onload = () => {
        let content = reader.result;

        if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) {
          markAsReadAndPasteIfAllFilesAreRead();
          return;
        }

        text[i] = content;
        markAsReadAndPasteIfAllFilesAreRead();
      };

      reader.readAsText(file);
    };

    for (let i = 0; i < files.length; i++) readTextFromFile(files[i], i);
  } else {
    if (cm.state.draggingText && cm.doc.sel.contains(pos26) > -1) {
      cm.state.draggingText(e);
      setTimeout(() => cm.display.input.focus(), 20);
      return;
    }

    try {
      let text = e.dataTransfer.getData("Text");

      if (text) {
        let selected;
        if (cm.state.draggingText && !cm.state.draggingText.copy) selected = cm.listSelections();
        setSelectionNoUndo(cm.doc, simpleSelection(pos26, pos26));
        if (selected) for (let i = 0; i < selected.length; ++i) replaceRange(cm.doc, "", selected[i].anchor, selected[i].head, "drag");
        cm.replaceSelection(text, "around", "paste");
        cm.display.input.focus();
      }
    } catch (e2) {}
  }
}

function onDragStart(cm, e) {
  if (ie && (!cm.state.draggingText || +new Date() - lastDrop < 100)) {
    e_stop(e);
    return;
  }

  if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) return;
  e.dataTransfer.setData("Text", cm.getSelection());
  e.dataTransfer.effectAllowed = "copyMove";

  if (e.dataTransfer.setDragImage && !safari) {
    let img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
    img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

    if (presto) {
      img.width = img.height = 1;
      cm.display.wrapper.appendChild(img);
      img._top = img.offsetTop;
    }

    e.dataTransfer.setDragImage(img, 0, 0);
    if (presto) img.parentNode.removeChild(img);
  }
}

function onDragOver(cm, e) {
  let pos26 = posFromMouse(cm, e);
  if (!pos26) return;
  let frag = document.createDocumentFragment();
  drawSelectionCursor(cm, pos26, frag);

  if (!cm.display.dragCursor) {
    cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
    cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
  }

  removeChildrenAndAdd(cm.display.dragCursor, frag);
}

function clearDragCursor(cm) {
  if (cm.display.dragCursor) {
    cm.display.lineSpace.removeChild(cm.display.dragCursor);
    cm.display.dragCursor = null;
  }
} // node_modules/codemirror/src/edit/global_events.js


function forEachCodeMirror(f) {
  if (!document.getElementsByClassName) return;
  let byClass = document.getElementsByClassName("CodeMirror"),
  editors = [];

  for (let i = 0; i < byClass.length; i++) {
    let cm = byClass[i].CodeMirror;
    if (cm) editors.push(cm);
  }

  if (editors.length) editors[0].operation(() => {
    for (let i = 0; i < editors.length; i++) f(editors[i]);
  });
}

let globalsRegistered = false;

function ensureGlobalHandlers() {
  if (globalsRegistered) return;
  registerGlobalHandlers();
  globalsRegistered = true;
}

function registerGlobalHandlers() {
  let resizeTimer;
  on(window, "resize", () => {
    if (resizeTimer == null) resizeTimer = setTimeout(() => {
      resizeTimer = null;
      forEachCodeMirror(onResize);
    }, 100);
  });
  on(window, "blur", () => forEachCodeMirror(onBlur));
}

function onResize(cm) {
  let d = cm.display;
  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
  d.scrollbarsClipped = false;
  cm.setSize();
} // node_modules/codemirror/src/input/keynames.js


let keyNames = {
  3: "Pause",
  8: "Backspace",
  9: "Tab",
  13: "Enter",
  16: "Shift",
  17: "Ctrl",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Esc",
  32: "Space",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "Left",
  38: "Up",
  39: "Right",
  40: "Down",
  44: "PrintScrn",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Mod",
  92: "Mod",
  93: "Mod",
  106: "*",
  107: "=",
  109: "-",
  110: ".",
  111: "/",
  145: "ScrollLock",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'",
  63232: "Up",
  63233: "Down",
  63234: "Left",
  63235: "Right",
  63272: "Delete",
  63273: "Home",
  63275: "End",
  63276: "PageUp",
  63277: "PageDown",
  63302: "Insert" };


for (let i = 0; i < 10; i++) keyNames[i + 48] = keyNames[i + 96] = String(i);

for (let i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);

for (let i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i; // node_modules/codemirror/src/input/keymap.js


let keyMap = {};
keyMap.basic = {
  Left: "goCharLeft",
  Right: "goCharRight",
  Up: "goLineUp",
  Down: "goLineDown",
  End: "goLineEnd",
  Home: "goLineStartSmart",
  PageUp: "goPageUp",
  PageDown: "goPageDown",
  Delete: "delCharAfter",
  Backspace: "delCharBefore",
  "Shift-Backspace": "delCharBefore",
  Tab: "defaultTab",
  "Shift-Tab": "indentAuto",
  Enter: "newlineAndIndent",
  Insert: "toggleOverwrite",
  Esc: "singleSelection" };

keyMap.pcDefault = {
  "Ctrl-A": "selectAll",
  "Ctrl-D": "deleteLine",
  "Ctrl-Z": "undo",
  "Shift-Ctrl-Z": "redo",
  "Ctrl-Y": "redo",
  "Ctrl-Home": "goDocStart",
  "Ctrl-End": "goDocEnd",
  "Ctrl-Up": "goLineUp",
  "Ctrl-Down": "goLineDown",
  "Ctrl-Left": "goGroupLeft",
  "Ctrl-Right": "goGroupRight",
  "Alt-Left": "goLineStart",
  "Alt-Right": "goLineEnd",
  "Ctrl-Backspace": "delGroupBefore",
  "Ctrl-Delete": "delGroupAfter",
  "Ctrl-S": "save",
  "Ctrl-F": "find",
  "Ctrl-G": "findNext",
  "Shift-Ctrl-G": "findPrev",
  "Shift-Ctrl-F": "replace",
  "Shift-Ctrl-R": "replaceAll",
  "Ctrl-[": "indentLess",
  "Ctrl-]": "indentMore",
  "Ctrl-U": "undoSelection",
  "Shift-Ctrl-U": "redoSelection",
  "Alt-U": "redoSelection",
  fallthrough: "basic" };

keyMap.emacsy = {
  "Ctrl-F": "goCharRight",
  "Ctrl-B": "goCharLeft",
  "Ctrl-P": "goLineUp",
  "Ctrl-N": "goLineDown",
  "Alt-F": "goWordRight",
  "Alt-B": "goWordLeft",
  "Ctrl-A": "goLineStart",
  "Ctrl-E": "goLineEnd",
  "Ctrl-V": "goPageDown",
  "Shift-Ctrl-V": "goPageUp",
  "Ctrl-D": "delCharAfter",
  "Ctrl-H": "delCharBefore",
  "Alt-D": "delWordAfter",
  "Alt-Backspace": "delWordBefore",
  "Ctrl-K": "killLine",
  "Ctrl-T": "transposeChars",
  "Ctrl-O": "openLine" };

keyMap.macDefault = {
  "Cmd-A": "selectAll",
  "Cmd-D": "deleteLine",
  "Cmd-Z": "undo",
  "Shift-Cmd-Z": "redo",
  "Cmd-Y": "redo",
  "Cmd-Home": "goDocStart",
  "Cmd-Up": "goDocStart",
  "Cmd-End": "goDocEnd",
  "Cmd-Down": "goDocEnd",
  "Alt-Left": "goGroupLeft",
  "Alt-Right": "goGroupRight",
  "Cmd-Left": "goLineLeft",
  "Cmd-Right": "goLineRight",
  "Alt-Backspace": "delGroupBefore",
  "Ctrl-Alt-Backspace": "delGroupAfter",
  "Alt-Delete": "delGroupAfter",
  "Cmd-S": "save",
  "Cmd-F": "find",
  "Cmd-G": "findNext",
  "Shift-Cmd-G": "findPrev",
  "Cmd-Alt-F": "replace",
  "Shift-Cmd-Alt-F": "replaceAll",
  "Cmd-[": "indentLess",
  "Cmd-]": "indentMore",
  "Cmd-Backspace": "delWrappedLineLeft",
  "Cmd-Delete": "delWrappedLineRight",
  "Cmd-U": "undoSelection",
  "Shift-Cmd-U": "redoSelection",
  "Ctrl-Up": "goDocStart",
  "Ctrl-Down": "goDocEnd",
  fallthrough: ["basic", "emacsy"] };

keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

function normalizeKeyName(name) {
  let parts = name.split(/-(?!$)/);
  name = parts[parts.length - 1];
  let alt, ctrl, shift, cmd;

  for (let i = 0; i < parts.length - 1; i++) {
    let mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) cmd = true;else if (/^a(lt)?$/i.test(mod)) alt = true;else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;else if (/^s(hift)?$/i.test(mod)) shift = true;else throw new Error("Unrecognized modifier name: " + mod);
  }

  if (alt) name = "Alt-" + name;
  if (ctrl) name = "Ctrl-" + name;
  if (cmd) name = "Cmd-" + name;
  if (shift) name = "Shift-" + name;
  return name;
}

function normalizeKeyMap(keymap6) {
  let copy = {};

  for (let keyname in keymap6) if (keymap6.hasOwnProperty(keyname)) {
    let value = keymap6[keyname];
    if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) continue;

    if (value == "...") {
      delete keymap6[keyname];
      continue;
    }

    let keys = map(keyname.split(" "), normalizeKeyName);

    for (let i = 0; i < keys.length; i++) {
      let val, name;

      if (i == keys.length - 1) {
        name = keys.join(" ");
        val = value;
      } else {
        name = keys.slice(0, i + 1).join(" ");
        val = "...";
      }

      let prev = copy[name];
      if (!prev) copy[name] = val;else if (prev != val) throw new Error("Inconsistent bindings for " + name);
    }

    delete keymap6[keyname];
  }

  for (let prop in copy) keymap6[prop] = copy[prop];

  return keymap6;
}

function lookupKey(key, map2, handle, context) {
  map2 = getKeyMap(map2);
  let found = map2.call ? map2.call(key, context) : map2[key];
  if (found === false) return "nothing";
  if (found === "...") return "multi";
  if (found != null && handle(found)) return "handled";

  if (map2.fallthrough) {
    if (Object.prototype.toString.call(map2.fallthrough) != "[object Array]") return lookupKey(key, map2.fallthrough, handle, context);

    for (let i = 0; i < map2.fallthrough.length; i++) {
      let result = lookupKey(key, map2.fallthrough[i], handle, context);
      if (result) return result;
    }
  }
}

function isModifierKey(value) {
  let name = typeof value == "string" ? value : keyNames[value.keyCode];
  return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
}

function addModifierNames(name, event28, noShift) {
  let base = name;
  if (event28.altKey && base != "Alt") name = "Alt-" + name;
  if ((flipCtrlCmd ? event28.metaKey : event28.ctrlKey) && base != "Ctrl") name = "Ctrl-" + name;
  if ((flipCtrlCmd ? event28.ctrlKey : event28.metaKey) && base != "Cmd") name = "Cmd-" + name;
  if (!noShift && event28.shiftKey && base != "Shift") name = "Shift-" + name;
  return name;
}

function keyName(event28, noShift) {
  if (presto && event28.keyCode == 34 && event28["char"]) return false;
  let name = keyNames[event28.keyCode];
  if (name == null || event28.altGraphKey) return false;
  if (event28.keyCode == 3 && event28.code) name = event28.code;
  return addModifierNames(name, event28, noShift);
}

function getKeyMap(val) {
  return typeof val == "string" ? keyMap[val] : val;
} // node_modules/codemirror/src/edit/deleteNearSelection.js


function deleteNearSelection2(cm, compute) {
  let ranges = cm.doc.sel.ranges,
  kill = [];

  for (let i = 0; i < ranges.length; i++) {
    let toKill = compute(ranges[i]);

    while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
      let replaced = kill.pop();

      if (cmp(replaced.from, toKill.from) < 0) {
        toKill.from = replaced.from;
        break;
      }
    }

    kill.push(toKill);
  }

  runInOp(cm, () => {
    for (let i = kill.length - 1; i >= 0; i--) replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");

    ensureCursorVisible(cm);
  });
} // node_modules/codemirror/src/input/movement.js


function moveCharLogically(line, ch, dir) {
  let target = skipExtendingChars(line.text, ch + dir, dir);
  return target < 0 || target > line.text.length ? null : target;
}

function moveLogically(line, start, dir) {
  let ch = moveCharLogically(line, start.ch, dir);
  return ch == null ? null : new Pos(start.line, ch, dir < 0 ? "after" : "before");
}

function endOfLine(visually, cm, lineObj, lineNo2, dir) {
  if (visually) {
    if (cm.doc.direction == "rtl") dir = -dir;
    let order = getOrder(lineObj, cm.doc.direction);

    if (order) {
      let part = dir < 0 ? lst(order) : order[0];
      let moveInStorageOrder = dir < 0 == (part.level == 1);
      let sticky = moveInStorageOrder ? "after" : "before";
      let ch;

      if (part.level > 0 || cm.doc.direction == "rtl") {
        let prep = prepareMeasureForLine(cm, lineObj);
        ch = dir < 0 ? lineObj.text.length - 1 : 0;
        let targetTop = measureCharPrepared(cm, prep, ch).top;
        ch = findFirst(ch2 => measureCharPrepared(cm, prep, ch2).top == targetTop, dir < 0 == (part.level == 1) ? part.from : part.to - 1, ch);
        if (sticky == "before") ch = moveCharLogically(lineObj, ch, 1);
      } else ch = dir < 0 ? part.to : part.from;

      return new Pos(lineNo2, ch, sticky);
    }
  }

  return new Pos(lineNo2, dir < 0 ? lineObj.text.length : 0, dir < 0 ? "before" : "after");
}

function moveVisually(cm, line, start, dir) {
  let bidi8 = getOrder(line, cm.doc.direction);
  if (!bidi8) return moveLogically(line, start, dir);

  if (start.ch >= line.text.length) {
    start.ch = line.text.length;
    start.sticky = "before";
  } else if (start.ch <= 0) {
    start.ch = 0;
    start.sticky = "after";
  }

  let partPos = getBidiPartAt(bidi8, start.ch, start.sticky),
  part = bidi8[partPos];

  if (cm.doc.direction == "ltr" && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch)) {
    return moveLogically(line, start, dir);
  }

  let mv = (pos26, dir2) => moveCharLogically(line, pos26 instanceof Pos ? pos26.ch : pos26, dir2);

  let prep;

  let getWrappedLineExtent = ch => {
    if (!cm.options.lineWrapping) return {
      begin: 0,
      end: line.text.length };

    prep = prep || prepareMeasureForLine(cm, line);
    return wrappedLineExtentChar(cm, line, prep, ch);
  };

  let wrappedLineExtent2 = getWrappedLineExtent(start.sticky == "before" ? mv(start, -1) : start.ch);

  if (cm.doc.direction == "rtl" || part.level == 1) {
    let moveInStorageOrder = part.level == 1 == dir < 0;
    let ch = mv(start, moveInStorageOrder ? 1 : -1);

    if (ch != null && (!moveInStorageOrder ? ch >= part.from && ch >= wrappedLineExtent2.begin : ch <= part.to && ch <= wrappedLineExtent2.end)) {
      let sticky = moveInStorageOrder ? "before" : "after";
      return new Pos(start.line, ch, sticky);
    }
  }

  let searchInVisualLine = (partPos2, dir2, wrappedLineExtent3) => {
    let getRes = (ch, moveInStorageOrder) => moveInStorageOrder ? new Pos(start.line, mv(ch, 1), "before") : new Pos(start.line, ch, "after");

    for (; partPos2 >= 0 && partPos2 < bidi8.length; partPos2 += dir2) {
      let part2 = bidi8[partPos2];
      let moveInStorageOrder = dir2 > 0 == (part2.level != 1);
      let ch = moveInStorageOrder ? wrappedLineExtent3.begin : mv(wrappedLineExtent3.end, -1);
      if (part2.from <= ch && ch < part2.to) return getRes(ch, moveInStorageOrder);
      ch = moveInStorageOrder ? part2.from : mv(part2.to, -1);
      if (wrappedLineExtent3.begin <= ch && ch < wrappedLineExtent3.end) return getRes(ch, moveInStorageOrder);
    }
  };

  let res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent2);
  if (res) return res;
  let nextCh = dir > 0 ? wrappedLineExtent2.end : mv(wrappedLineExtent2.begin, -1);

  if (nextCh != null && !(dir > 0 && nextCh == line.text.length)) {
    res = searchInVisualLine(dir > 0 ? 0 : bidi8.length - 1, dir, getWrappedLineExtent(nextCh));
    if (res) return res;
  }

  return null;
} // node_modules/codemirror/src/edit/commands.js


let commands = {
  selectAll,
  singleSelection: cm => cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll),
  killLine: cm => deleteNearSelection2(cm, range2 => {
    if (range2.empty()) {
      let len = getLine(cm.doc, range2.head.line).text.length;
      if (range2.head.ch == len && range2.head.line < cm.lastLine()) return {
        from: range2.head,
        to: Pos(range2.head.line + 1, 0) };else
      return {
        from: range2.head,
        to: Pos(range2.head.line, len) };

    } else {
      return {
        from: range2.from(),
        to: range2.to() };

    }
  }),
  deleteLine: cm => deleteNearSelection2(cm, range2 => ({
    from: Pos(range2.from().line, 0),
    to: clipPos(cm.doc, Pos(range2.to().line + 1, 0)) })),

  delLineLeft: cm => deleteNearSelection2(cm, range2 => ({
    from: Pos(range2.from().line, 0),
    to: range2.from() })),

  delWrappedLineLeft: cm => deleteNearSelection2(cm, range2 => {
    let top = cm.charCoords(range2.head, "div").top + 5;
    let leftPos = cm.coordsChar({
      left: 0,
      top },
    "div");
    return {
      from: leftPos,
      to: range2.from() };

  }),
  delWrappedLineRight: cm => deleteNearSelection2(cm, range2 => {
    let top = cm.charCoords(range2.head, "div").top + 5;
    let rightPos = cm.coordsChar({
      left: cm.display.lineDiv.offsetWidth + 100,
      top },
    "div");
    return {
      from: range2.from(),
      to: rightPos };

  }),
  undo: cm => cm.undo(),
  redo: cm => cm.redo(),
  undoSelection: cm => cm.undoSelection(),
  redoSelection: cm => cm.redoSelection(),
  goDocStart: cm => cm.extendSelection(Pos(cm.firstLine(), 0)),
  goDocEnd: cm => cm.extendSelection(Pos(cm.lastLine())),
  goLineStart: cm => cm.extendSelectionsBy(range2 => lineStart(cm, range2.head.line), {
    origin: "+move",
    bias: 1 }),

  goLineStartSmart: cm => cm.extendSelectionsBy(range2 => lineStartSmart(cm, range2.head), {
    origin: "+move",
    bias: 1 }),

  goLineEnd: cm => cm.extendSelectionsBy(range2 => lineEnd(cm, range2.head.line), {
    origin: "+move",
    bias: -1 }),

  goLineRight: cm => cm.extendSelectionsBy(range2 => {
    let top = cm.cursorCoords(range2.head, "div").top + 5;
    return cm.coordsChar({
      left: cm.display.lineDiv.offsetWidth + 100,
      top },
    "div");
  }, sel_move),
  goLineLeft: cm => cm.extendSelectionsBy(range2 => {
    let top = cm.cursorCoords(range2.head, "div").top + 5;
    return cm.coordsChar({
      left: 0,
      top },
    "div");
  }, sel_move),
  goLineLeftSmart: cm => cm.extendSelectionsBy(range2 => {
    let top = cm.cursorCoords(range2.head, "div").top + 5;
    let pos26 = cm.coordsChar({
      left: 0,
      top },
    "div");
    if (pos26.ch < cm.getLine(pos26.line).search(/\S/)) return lineStartSmart(cm, range2.head);
    return pos26;
  }, sel_move),
  goLineUp: cm => cm.moveV(-1, "line"),
  goLineDown: cm => cm.moveV(1, "line"),
  goPageUp: cm => cm.moveV(-1, "page"),
  goPageDown: cm => cm.moveV(1, "page"),
  goCharLeft: cm => cm.moveH(-1, "char"),
  goCharRight: cm => cm.moveH(1, "char"),
  goColumnLeft: cm => cm.moveH(-1, "column"),
  goColumnRight: cm => cm.moveH(1, "column"),
  goWordLeft: cm => cm.moveH(-1, "word"),
  goGroupRight: cm => cm.moveH(1, "group"),
  goGroupLeft: cm => cm.moveH(-1, "group"),
  goWordRight: cm => cm.moveH(1, "word"),
  delCharBefore: cm => cm.deleteH(-1, "char"),
  delCharAfter: cm => cm.deleteH(1, "char"),
  delWordBefore: cm => cm.deleteH(-1, "word"),
  delWordAfter: cm => cm.deleteH(1, "word"),
  delGroupBefore: cm => cm.deleteH(-1, "group"),
  delGroupAfter: cm => cm.deleteH(1, "group"),
  indentAuto: cm => cm.indentSelection("smart"),
  indentMore: cm => cm.indentSelection("add"),
  indentLess: cm => cm.indentSelection("subtract"),
  insertTab: cm => cm.replaceSelection("	"),
  insertSoftTab: cm => {
    let spaces = [],
    ranges = cm.listSelections(),
    tabSize = cm.options.tabSize;

    for (let i = 0; i < ranges.length; i++) {
      let pos26 = ranges[i].from();
      let col = countColumn(cm.getLine(pos26.line), pos26.ch, tabSize);
      spaces.push(spaceStr(tabSize - col % tabSize));
    }

    cm.replaceSelections(spaces);
  },
  defaultTab: cm => {
    if (cm.somethingSelected()) cm.indentSelection("add");else cm.execCommand("insertTab");
  },
  transposeChars: cm => runInOp(cm, () => {
    let ranges = cm.listSelections(),
    newSel = [];

    for (let i = 0; i < ranges.length; i++) {
      if (!ranges[i].empty()) continue;
      let cur = ranges[i].head,
      line = getLine(cm.doc, cur.line).text;

      if (line) {
        if (cur.ch == line.length) cur = new Pos(cur.line, cur.ch - 1);

        if (cur.ch > 0) {
          cur = new Pos(cur.line, cur.ch + 1);
          cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2), Pos(cur.line, cur.ch - 2), cur, "+transpose");
        } else if (cur.line > cm.doc.first) {
          let prev = getLine(cm.doc, cur.line - 1).text;

          if (prev) {
            cur = new Pos(cur.line, 1);
            cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() + prev.charAt(prev.length - 1), Pos(cur.line - 1, prev.length - 1), cur, "+transpose");
          }
        }
      }

      newSel.push(new Range(cur, cur));
    }

    cm.setSelections(newSel);
  }),
  newlineAndIndent: cm => runInOp(cm, () => {
    let sels = cm.listSelections();

    for (let i = sels.length - 1; i >= 0; i--) cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input");

    sels = cm.listSelections();

    for (let i = 0; i < sels.length; i++) cm.indentLine(sels[i].from().line, null, true);

    ensureCursorVisible(cm);
  }),
  openLine: cm => cm.replaceSelection("\n", "start"),
  toggleOverwrite: cm => cm.toggleOverwrite() };


function lineStart(cm, lineN) {
  let line = getLine(cm.doc, lineN);
  let visual = visualLine(line);
  if (visual != line) lineN = lineNo(visual);
  return endOfLine(true, cm, visual, lineN, 1);
}

function lineEnd(cm, lineN) {
  let line = getLine(cm.doc, lineN);
  let visual = visualLineEnd(line);
  if (visual != line) lineN = lineNo(visual);
  return endOfLine(true, cm, line, lineN, -1);
}

function lineStartSmart(cm, pos26) {
  let start = lineStart(cm, pos26.line);
  let line = getLine(cm.doc, start.line);
  let order = getOrder(line, cm.doc.direction);

  if (!order || order[0].level == 0) {
    let firstNonWS = Math.max(start.ch, line.text.search(/\S/));
    let inWS = pos26.line == start.line && pos26.ch <= firstNonWS && pos26.ch;
    return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky);
  }

  return start;
} // node_modules/codemirror/src/edit/key_events.js


function doHandleBinding(cm, bound, dropShift) {
  if (typeof bound == "string") {
    bound = commands[bound];
    if (!bound) return false;
  }

  cm.display.input.ensurePolled();
  let prevShift = cm.display.shift,
  done = false;

  try {
    if (cm.isReadOnly()) cm.state.suppressEdits = true;
    if (dropShift) cm.display.shift = false;
    done = bound(cm) != Pass;
  } finally {
    cm.display.shift = prevShift;
    cm.state.suppressEdits = false;
  }

  return done;
}

function lookupKeyForEditor(cm, name, handle) {
  for (let i = 0; i < cm.state.keyMaps.length; i++) {
    let result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
    if (result) return result;
  }

  return cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm) || lookupKey(name, cm.options.keyMap, handle, cm);
}

let stopSeq = new Delayed();

function dispatchKey(cm, name, e, handle) {
  let seq = cm.state.keySeq;

  if (seq) {
    if (isModifierKey(name)) return "handled";
    if (/\'$/.test(name)) cm.state.keySeq = null;else stopSeq.set(50, () => {
      if (cm.state.keySeq == seq) {
        cm.state.keySeq = null;
        cm.display.input.reset();
      }
    });
    if (dispatchKeyInner(cm, seq + " " + name, e, handle)) return true;
  }

  return dispatchKeyInner(cm, name, e, handle);
}

function dispatchKeyInner(cm, name, e, handle) {
  let result = lookupKeyForEditor(cm, name, handle);
  if (result == "multi") cm.state.keySeq = name;
  if (result == "handled") signalLater(cm, "keyHandled", cm, name, e);

  if (result == "handled" || result == "multi") {
    e_preventDefault(e);
    restartBlink(cm);
  }

  return !!result;
}

function handleKeyBinding(cm, e) {
  let name = keyName(e, true);
  if (!name) return false;

  if (e.shiftKey && !cm.state.keySeq) {
    return dispatchKey(cm, "Shift-" + name, e, b => doHandleBinding(cm, b, true)) || dispatchKey(cm, name, e, b => {
      if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion) return doHandleBinding(cm, b);
    });
  } else {
    return dispatchKey(cm, name, e, b => doHandleBinding(cm, b));
  }
}

function handleCharBinding(cm, e, ch) {
  return dispatchKey(cm, "'" + ch + "'", e, b => doHandleBinding(cm, b, true));
}

let lastStoppedKey = null;

function onKeyDown(e) {
  let cm = this;
  if (e.target && e.target != cm.display.input.getField()) return;
  cm.curOp.focus = activeElt();
  if (signalDOMEvent(cm, e)) return;
  if (ie && ie_version < 11 && e.keyCode == 27) e.returnValue = false;
  let code = e.keyCode;
  cm.display.shift = code == 16 || e.shiftKey;
  let handled = handleKeyBinding(cm, e);

  if (presto) {
    lastStoppedKey = handled ? code : null;
    if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey)) cm.replaceSelection("", null, "cut");
  }

  if (gecko && !mac && !handled && code == 46 && e.shiftKey && !e.ctrlKey && document.execCommand) document.execCommand("cut");
  if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className)) showCrossHair(cm);
}

function showCrossHair(cm) {
  let lineDiv = cm.display.lineDiv;
  addClass(lineDiv, "CodeMirror-crosshair");

  function up(e) {
    if (e.keyCode == 18 || !e.altKey) {
      rmClass(lineDiv, "CodeMirror-crosshair");
      off(document, "keyup", up);
      off(document, "mouseover", up);
    }
  }

  on(document, "keyup", up);
  on(document, "mouseover", up);
}

function onKeyUp(e) {
  if (e.keyCode == 16) this.doc.sel.shift = false;
  signalDOMEvent(this, e);
}

function onKeyPress(e) {
  let cm = this;
  if (e.target && e.target != cm.display.input.getField()) return;
  if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) return;
  let keyCode = e.keyCode,
  charCode = e.charCode;

  if (presto && keyCode == lastStoppedKey) {
    lastStoppedKey = null;
    e_preventDefault(e);
    return;
  }

  if (presto && (!e.which || e.which < 10) && handleKeyBinding(cm, e)) return;
  let ch = String.fromCharCode(charCode == null ? keyCode : charCode);
  if (ch == "\b") return;
  if (handleCharBinding(cm, e, ch)) return;
  cm.display.input.onKeyPress(e);
} // node_modules/codemirror/src/edit/mouse_events.js


const DOUBLECLICK_DELAY = 400;

class PastClick {
  constructor(time, pos26, button) {
    this.time = time;
    this.pos = pos26;
    this.button = button;
  }

  compare(time, pos26, button) {
    return this.time + DOUBLECLICK_DELAY > time && cmp(pos26, this.pos) == 0 && button == this.button;
  }}



let lastClick;
let lastDoubleClick;

function clickRepeat(pos26, button) {
  let now = +new Date();

  if (lastDoubleClick && lastDoubleClick.compare(now, pos26, button)) {
    lastClick = lastDoubleClick = null;
    return "triple";
  } else if (lastClick && lastClick.compare(now, pos26, button)) {
    lastDoubleClick = new PastClick(now, pos26, button);
    lastClick = null;
    return "double";
  } else {
    lastClick = new PastClick(now, pos26, button);
    lastDoubleClick = null;
    return "single";
  }
}

function onMouseDown(e) {
  let cm = this,
  display = cm.display;
  if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) return;
  display.input.ensurePolled();
  display.shift = e.shiftKey;

  if (eventInWidget(display, e)) {
    if (!webkit) {
      display.scroller.draggable = false;
      setTimeout(() => display.scroller.draggable = true, 100);
    }

    return;
  }

  if (clickInGutter(cm, e)) return;
  let pos26 = posFromMouse(cm, e),
  button = e_button(e),
  repeat = pos26 ? clickRepeat(pos26, button) : "single";
  window.focus();
  if (button == 1 && cm.state.selectingText) cm.state.selectingText(e);
  if (pos26 && handleMappedButton(cm, button, pos26, repeat, e)) return;

  if (button == 1) {
    if (pos26) leftButtonDown(cm, pos26, repeat, e);else if (e_target(e) == display.scroller) e_preventDefault(e);
  } else if (button == 2) {
    if (pos26) extendSelection(cm.doc, pos26);
    setTimeout(() => display.input.focus(), 20);
  } else if (button == 3) {
    if (captureRightClick) cm.display.input.onContextMenu(e);else delayBlurEvent(cm);
  }
}

function handleMappedButton(cm, button, pos26, repeat, event28) {
  let name = "Click";
  if (repeat == "double") name = "Double" + name;else if (repeat == "triple") name = "Triple" + name;
  name = (button == 1 ? "Left" : button == 2 ? "Middle" : "Right") + name;
  return dispatchKey(cm, addModifierNames(name, event28), event28, bound => {
    if (typeof bound == "string") bound = commands[bound];
    if (!bound) return false;
    let done = false;

    try {
      if (cm.isReadOnly()) cm.state.suppressEdits = true;
      done = bound(cm, pos26) != Pass;
    } finally {
      cm.state.suppressEdits = false;
    }

    return done;
  });
}

function configureMouse(cm, repeat, event28) {
  let option = cm.getOption("configureMouse");
  let value = option ? option(cm, repeat, event28) : {};

  if (value.unit == null) {
    let rect = chromeOS ? event28.shiftKey && event28.metaKey : event28.altKey;
    value.unit = rect ? "rectangle" : repeat == "single" ? "char" : repeat == "double" ? "word" : "line";
  }

  if (value.extend == null || cm.doc.extend) value.extend = cm.doc.extend || event28.shiftKey;
  if (value.addNew == null) value.addNew = mac ? event28.metaKey : event28.ctrlKey;
  if (value.moveOnDrag == null) value.moveOnDrag = !(mac ? event28.altKey : event28.ctrlKey);
  return value;
}

function leftButtonDown(cm, pos26, repeat, event28) {
  if (ie) setTimeout(bind(ensureFocus, cm), 0);else cm.curOp.focus = activeElt();
  let behavior = configureMouse(cm, repeat, event28);
  let sel = cm.doc.sel,
  contained;
  if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() && repeat == "single" && (contained = sel.contains(pos26)) > -1 && (cmp((contained = sel.ranges[contained]).from(), pos26) < 0 || pos26.xRel > 0) && (cmp(contained.to(), pos26) > 0 || pos26.xRel < 0)) leftButtonStartDrag(cm, event28, pos26, behavior);else leftButtonSelect(cm, event28, pos26, behavior);
}

function leftButtonStartDrag(cm, event28, pos26, behavior) {
  let display = cm.display,
  moved = false;
  let dragEnd = operation(cm, e => {
    if (webkit) display.scroller.draggable = false;
    cm.state.draggingText = false;
    off(display.wrapper.ownerDocument, "mouseup", dragEnd);
    off(display.wrapper.ownerDocument, "mousemove", mouseMove);
    off(display.scroller, "dragstart", dragStart);
    off(display.scroller, "drop", dragEnd);

    if (!moved) {
      e_preventDefault(e);
      if (!behavior.addNew) extendSelection(cm.doc, pos26, null, null, behavior.extend);
      if (webkit && !safari || ie && ie_version == 9) setTimeout(() => {
        display.wrapper.ownerDocument.body.focus({
          preventScroll: true });

        display.input.focus();
      }, 20);else display.input.focus();
    }
  });

  let mouseMove = function mouseMove(e2) {
    moved = moved || Math.abs(event28.clientX - e2.clientX) + Math.abs(event28.clientY - e2.clientY) >= 10;
  };

  let dragStart = () => moved = true;

  if (webkit) display.scroller.draggable = true;
  cm.state.draggingText = dragEnd;
  dragEnd.copy = !behavior.moveOnDrag;
  if (display.scroller.dragDrop) display.scroller.dragDrop();
  on(display.wrapper.ownerDocument, "mouseup", dragEnd);
  on(display.wrapper.ownerDocument, "mousemove", mouseMove);
  on(display.scroller, "dragstart", dragStart);
  on(display.scroller, "drop", dragEnd);
  delayBlurEvent(cm);
  setTimeout(() => display.input.focus(), 20);
}

function rangeForUnit(cm, pos26, unit) {
  if (unit == "char") return new Range(pos26, pos26);
  if (unit == "word") return cm.findWordAt(pos26);
  if (unit == "line") return new Range(Pos(pos26.line, 0), clipPos(cm.doc, Pos(pos26.line + 1, 0)));
  let result = unit(cm, pos26);
  return new Range(result.from, result.to);
}

function leftButtonSelect(cm, event28, start, behavior) {
  let display = cm.display,
  doc = cm.doc;
  e_preventDefault(event28);
  let ourRange,
  ourIndex,
  startSel = doc.sel,
  ranges = startSel.ranges;

  if (behavior.addNew && !behavior.extend) {
    ourIndex = doc.sel.contains(start);
    if (ourIndex > -1) ourRange = ranges[ourIndex];else ourRange = new Range(start, start);
  } else {
    ourRange = doc.sel.primary();
    ourIndex = doc.sel.primIndex;
  }

  if (behavior.unit == "rectangle") {
    if (!behavior.addNew) ourRange = new Range(start, start);
    start = posFromMouse(cm, event28, true, true);
    ourIndex = -1;
  } else {
    let range2 = rangeForUnit(cm, start, behavior.unit);
    if (behavior.extend) ourRange = extendRange(ourRange, range2.anchor, range2.head, behavior.extend);else ourRange = range2;
  }

  if (!behavior.addNew) {
    ourIndex = 0;
    setSelection(doc, new Selection([ourRange], 0), sel_mouse);
    startSel = doc.sel;
  } else if (ourIndex == -1) {
    ourIndex = ranges.length;
    setSelection(doc, normalizeSelection(cm, ranges.concat([ourRange]), ourIndex), {
      scroll: false,
      origin: "*mouse" });

  } else if (ranges.length > 1 && ranges[ourIndex].empty() && behavior.unit == "char" && !behavior.extend) {
    setSelection(doc, normalizeSelection(cm, ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0), {
      scroll: false,
      origin: "*mouse" });

    startSel = doc.sel;
  } else {
    replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
  }

  let lastPos = start;

  function extendTo(pos26) {
    if (cmp(lastPos, pos26) == 0) return;
    lastPos = pos26;

    if (behavior.unit == "rectangle") {
      let ranges2 = [],
      tabSize = cm.options.tabSize;
      let startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
      let posCol = countColumn(getLine(doc, pos26.line).text, pos26.ch, tabSize);
      let left = Math.min(startCol, posCol),
      right = Math.max(startCol, posCol);

      for (let line = Math.min(start.line, pos26.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos26.line)); line <= end; line++) {
        let text = getLine(doc, line).text,
        leftPos = findColumn(text, left, tabSize);
        if (left == right) ranges2.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));else if (text.length > leftPos) ranges2.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
      }

      if (!ranges2.length) ranges2.push(new Range(start, start));
      setSelection(doc, normalizeSelection(cm, startSel.ranges.slice(0, ourIndex).concat(ranges2), ourIndex), {
        origin: "*mouse",
        scroll: false });

      cm.scrollIntoView(pos26);
    } else {
      let oldRange = ourRange;
      let range2 = rangeForUnit(cm, pos26, behavior.unit);
      let anchor = oldRange.anchor,
      head;

      if (cmp(range2.anchor, anchor) > 0) {
        head = range2.head;
        anchor = minPos(oldRange.from(), range2.anchor);
      } else {
        head = range2.anchor;
        anchor = maxPos(oldRange.to(), range2.head);
      }

      let ranges2 = startSel.ranges.slice(0);
      ranges2[ourIndex] = bidiSimplify(cm, new Range(clipPos(doc, anchor), head));
      setSelection(doc, normalizeSelection(cm, ranges2, ourIndex), sel_mouse);
    }
  }

  let editorSize = display.wrapper.getBoundingClientRect();
  let counter = 0;

  function extend(e) {
    let curCount = ++counter;
    let cur = posFromMouse(cm, e, true, behavior.unit == "rectangle");
    if (!cur) return;

    if (cmp(cur, lastPos) != 0) {
      cm.curOp.focus = activeElt();
      extendTo(cur);
      let visible = visibleLines(display, doc);
      if (cur.line >= visible.to || cur.line < visible.from) setTimeout(operation(cm, () => {
        if (counter == curCount) extend(e);
      }), 150);
    } else {
      let outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
      if (outside) setTimeout(operation(cm, () => {
        if (counter != curCount) return;
        display.scroller.scrollTop += outside;
        extend(e);
      }), 50);
    }
  }

  function done(e) {
    cm.state.selectingText = false;
    counter = Infinity;

    if (e) {
      e_preventDefault(e);
      display.input.focus();
    }

    off(display.wrapper.ownerDocument, "mousemove", move);
    off(display.wrapper.ownerDocument, "mouseup", up);
    doc.history.lastSelOrigin = null;
  }

  let move = operation(cm, e => {
    if (e.buttons === 0 || !e_button(e)) done(e);else extend(e);
  });
  let up = operation(cm, done);
  cm.state.selectingText = up;
  on(display.wrapper.ownerDocument, "mousemove", move);
  on(display.wrapper.ownerDocument, "mouseup", up);
}

function bidiSimplify(cm, range2) {
  let {
    anchor,
    head } =
  range2,
  anchorLine = getLine(cm.doc, anchor.line);
  if (cmp(anchor, head) == 0 && anchor.sticky == head.sticky) return range2;
  let order = getOrder(anchorLine);
  if (!order) return range2;
  let index = getBidiPartAt(order, anchor.ch, anchor.sticky),
  part = order[index];
  if (part.from != anchor.ch && part.to != anchor.ch) return range2;
  let boundary = index + (part.from == anchor.ch == (part.level != 1) ? 0 : 1);
  if (boundary == 0 || boundary == order.length) return range2;
  let leftSide;

  if (head.line != anchor.line) {
    leftSide = (head.line - anchor.line) * (cm.doc.direction == "ltr" ? 1 : -1) > 0;
  } else {
    let headIndex = getBidiPartAt(order, head.ch, head.sticky);
    let dir = headIndex - index || (head.ch - anchor.ch) * (part.level == 1 ? -1 : 1);
    if (headIndex == boundary - 1 || headIndex == boundary) leftSide = dir < 0;else leftSide = dir > 0;
  }

  let usePart = order[boundary + (leftSide ? -1 : 0)];
  let from = leftSide == (usePart.level == 1);
  let ch = from ? usePart.from : usePart.to,
  sticky = from ? "after" : "before";
  return anchor.ch == ch && anchor.sticky == sticky ? range2 : new Range(new Pos(anchor.line, ch, sticky), head);
}

function gutterEvent(cm, e, type, prevent) {
  let mX, mY;

  if (e.touches) {
    mX = e.touches[0].clientX;
    mY = e.touches[0].clientY;
  } else {
    try {
      mX = e.clientX;
      mY = e.clientY;
    } catch (e2) {
      return false;
    }
  }

  if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) return false;
  if (prevent) e_preventDefault(e);
  let display = cm.display;
  let lineBox = display.lineDiv.getBoundingClientRect();
  if (mY > lineBox.bottom || !hasHandler(cm, type)) return e_defaultPrevented(e);
  mY -= lineBox.top - display.viewOffset;

  for (let i = 0; i < cm.display.gutterSpecs.length; ++i) {
    let g = display.gutters.childNodes[i];

    if (g && g.getBoundingClientRect().right >= mX) {
      let line = lineAtHeight(cm.doc, mY);
      let gutter = cm.display.gutterSpecs[i];
      signal(cm, type, cm, line, gutter.className, e);
      return e_defaultPrevented(e);
    }
  }
}

function clickInGutter(cm, e) {
  return gutterEvent(cm, e, "gutterClick", true);
}

function onContextMenu(cm, e) {
  if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) return;
  if (signalDOMEvent(cm, e, "contextmenu")) return;
  if (!captureRightClick) cm.display.input.onContextMenu(e);
}

function contextMenuInGutter(cm, e) {
  if (!hasHandler(cm, "gutterContextMenu")) return false;
  return gutterEvent(cm, e, "gutterContextMenu", false);
} // node_modules/codemirror/src/edit/utils.js


function themeChanged(cm) {
  cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
  clearCaches(cm);
} // node_modules/codemirror/src/edit/options.js


let Init = {
  toString: function () {
    return "CodeMirror.Init";
  } };

let defaults = {};
let optionHandlers = {};

function defineOptions(CodeMirror6) {
  let optionHandlers2 = CodeMirror6.optionHandlers;

  function option(name, deflt, handle, notOnInit) {
    CodeMirror6.defaults[name] = deflt;
    if (handle) optionHandlers2[name] = notOnInit ? (cm, val, old) => {
      if (old != Init) handle(cm, val, old);
    } : handle;
  }

  CodeMirror6.defineOption = option;
  CodeMirror6.Init = Init;
  option("value", "", (cm, val) => cm.setValue(val), true);
  option("mode", null, (cm, val) => {
    cm.doc.modeOption = val;
    loadMode(cm);
  }, true);
  option("indentUnit", 2, loadMode, true);
  option("indentWithTabs", false);
  option("smartIndent", true);
  option("tabSize", 4, cm => {
    resetModeState(cm);
    clearCaches(cm);
    regChange(cm);
  }, true);
  option("lineSeparator", null, (cm, val) => {
    cm.doc.lineSep = val;
    if (!val) return;
    let newBreaks = [],
    lineNo2 = cm.doc.first;
    cm.doc.iter(line => {
      for (let pos26 = 0;;) {
        let found = line.text.indexOf(val, pos26);
        if (found == -1) break;
        pos26 = found + val.length;
        newBreaks.push(Pos(lineNo2, found));
      }

      lineNo2++;
    });

    for (let i = newBreaks.length - 1; i >= 0; i--) replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length));
  });
  option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/g, (cm, val, old) => {
    cm.state.specialChars = new RegExp(val.source + (val.test("	") ? "" : "|	"), "g");
    if (old != Init) cm.refresh();
  });
  option("specialCharPlaceholder", defaultSpecialCharPlaceholder, cm => cm.refresh(), true);
  option("electricChars", true);
  option("inputStyle", mobile ? "contenteditable" : "textarea", () => {
    throw new Error("inputStyle can not (yet) be changed in a running editor");
  }, true);
  option("spellcheck", false, (cm, val) => cm.getInputField().spellcheck = val, true);
  option("autocorrect", false, (cm, val) => cm.getInputField().autocorrect = val, true);
  option("autocapitalize", false, (cm, val) => cm.getInputField().autocapitalize = val, true);
  option("rtlMoveVisually", !windows);
  option("wholeLineUpdateBefore", true);
  option("theme", "default", cm => {
    themeChanged(cm);
    updateGutters(cm);
  }, true);
  option("keyMap", "default", (cm, val, old) => {
    let next = getKeyMap(val);
    let prev = old != Init && getKeyMap(old);
    if (prev && prev.detach) prev.detach(cm, next);
    if (next.attach) next.attach(cm, prev || null);
  });
  option("extraKeys", null);
  option("configureMouse", null);
  option("lineWrapping", false, wrappingChanged, true);
  option("gutters", [], (cm, val) => {
    cm.display.gutterSpecs = getGutters(val, cm.options.lineNumbers);
    updateGutters(cm);
  }, true);
  option("fixedGutter", true, (cm, val) => {
    cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
    cm.refresh();
  }, true);
  option("coverGutterNextToScrollbar", false, cm => updateScrollbars(cm), true);
  option("scrollbarStyle", "native", cm => {
    initScrollbars(cm);
    updateScrollbars(cm);
    cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
    cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
  }, true);
  option("lineNumbers", false, (cm, val) => {
    cm.display.gutterSpecs = getGutters(cm.options.gutters, val);
    updateGutters(cm);
  }, true);
  option("firstLineNumber", 1, updateGutters, true);
  option("lineNumberFormatter", integer => integer, updateGutters, true);
  option("showCursorWhenSelecting", false, updateSelection, true);
  option("resetSelectionOnContextMenu", true);
  option("lineWiseCopyCut", true);
  option("pasteLinesPerSelection", true);
  option("selectionsMayTouch", false);
  option("readOnly", false, (cm, val) => {
    if (val == "nocursor") {
      onBlur(cm);
      cm.display.input.blur();
    }

    cm.display.input.readOnlyChanged(val);
  });
  option("screenReaderLabel", null, (cm, val) => {
    val = val === "" ? null : val;
    cm.display.input.screenReaderLabelChanged(val);
  });
  option("disableInput", false, (cm, val) => {
    if (!val) cm.display.input.reset();
  }, true);
  option("dragDrop", true, dragDropChanged);
  option("allowDropFileTypes", null);
  option("cursorBlinkRate", 530);
  option("cursorScrollMargin", 0);
  option("cursorHeight", 1, updateSelection, true);
  option("singleCursorHeightPerLine", true, updateSelection, true);
  option("workTime", 100);
  option("workDelay", 100);
  option("flattenSpans", true, resetModeState, true);
  option("addModeClass", false, resetModeState, true);
  option("pollInterval", 100);
  option("undoDepth", 200, (cm, val) => cm.doc.history.undoDepth = val);
  option("historyEventDelay", 1250);
  option("viewportMargin", 10, cm => cm.refresh(), true);
  option("maxHighlightLength", 1e4, resetModeState, true);
  option("moveInputWithCursor", true, (cm, val) => {
    if (!val) cm.display.input.resetPosition();
  });
  option("tabindex", null, (cm, val) => cm.display.input.getField().tabIndex = val || "");
  option("autofocus", null);
  option("direction", "ltr", (cm, val) => cm.doc.setDirection(val), true);
  option("phrases", null);
}

function dragDropChanged(cm, value, old) {
  let wasOn = old && old != Init;

  if (!value != !wasOn) {
    let funcs = cm.display.dragFunctions;
    let toggle = value ? on : off;
    toggle(cm.display.scroller, "dragstart", funcs.start);
    toggle(cm.display.scroller, "dragenter", funcs.enter);
    toggle(cm.display.scroller, "dragover", funcs.over);
    toggle(cm.display.scroller, "dragleave", funcs.leave);
    toggle(cm.display.scroller, "drop", funcs.drop);
  }
}

function wrappingChanged(cm) {
  if (cm.options.lineWrapping) {
    addClass(cm.display.wrapper, "CodeMirror-wrap");
    cm.display.sizer.style.minWidth = "";
    cm.display.sizerWidth = null;
  } else {
    rmClass(cm.display.wrapper, "CodeMirror-wrap");
    findMaxLine(cm);
  }

  estimateLineHeights(cm);
  regChange(cm);
  clearCaches(cm);
  setTimeout(() => updateScrollbars(cm), 100);
} // node_modules/codemirror/src/edit/CodeMirror.js


function CodeMirror(place, options3) {
  if (!(this instanceof CodeMirror)) return new CodeMirror(place, options3);
  this.options = options3 = options3 ? copyObj(options3) : {};
  copyObj(defaults, options3, false);
  let doc = options3.value;
  if (typeof doc == "string") doc = new Doc_default(doc, options3.mode, null, options3.lineSeparator, options3.direction);else if (options3.mode) doc.modeOption = options3.mode;
  this.doc = doc;
  let input4 = new CodeMirror.inputStyles[options3.inputStyle](this);
  let display = this.display = new Display(place, doc, input4, options3);
  display.wrapper.CodeMirror = this;
  themeChanged(this);
  if (options3.lineWrapping) this.display.wrapper.className += " CodeMirror-wrap";
  initScrollbars(this);
  this.state = {
    keyMaps: [],
    overlays: [],
    modeGen: 0,
    overwrite: false,
    delayingBlurEvent: false,
    focused: false,
    suppressEdits: false,
    pasteIncoming: -1,
    cutIncoming: -1,
    selectingText: false,
    draggingText: false,
    highlight: new Delayed(),
    keySeq: null,
    specialChars: null };

  if (options3.autofocus && !mobile) display.input.focus();
  if (ie && ie_version < 11) setTimeout(() => this.display.input.reset(true), 20);
  registerEventHandlers(this);
  ensureGlobalHandlers();
  startOperation(this);
  this.curOp.forceUpdate = true;
  attachDoc(this, doc);
  if (options3.autofocus && !mobile || this.hasFocus()) setTimeout(bind(onFocus, this), 20);else onBlur(this);

  for (let opt in optionHandlers) if (optionHandlers.hasOwnProperty(opt)) optionHandlers[opt](this, options3[opt], Init);

  maybeUpdateLineNumberWidth(this);
  if (options3.finishInit) options3.finishInit(this);

  for (let i = 0; i < initHooks.length; ++i) initHooks[i](this);

  endOperation(this);
  if (webkit && options3.lineWrapping && getComputedStyle(display.lineDiv).textRendering == "optimizelegibility") display.lineDiv.style.textRendering = "auto";
}

CodeMirror.defaults = defaults;
CodeMirror.optionHandlers = optionHandlers;
const CodeMirror_default = CodeMirror;

function registerEventHandlers(cm) {
  let d = cm.display;
  on(d.scroller, "mousedown", operation(cm, onMouseDown));
  if (ie && ie_version < 11) on(d.scroller, "dblclick", operation(cm, e => {
    if (signalDOMEvent(cm, e)) return;
    let pos26 = posFromMouse(cm, e);
    if (!pos26 || clickInGutter(cm, e) || eventInWidget(cm.display, e)) return;
    e_preventDefault(e);
    let word = cm.findWordAt(pos26);
    extendSelection(cm.doc, word.anchor, word.head);
  }));else on(d.scroller, "dblclick", e => signalDOMEvent(cm, e) || e_preventDefault(e));
  on(d.scroller, "contextmenu", e => onContextMenu(cm, e));
  on(d.input.getField(), "contextmenu", e => {
    if (!d.scroller.contains(e.target)) onContextMenu(cm, e);
  });
  let touchFinished,
  prevTouch = {
    end: 0 };


  function finishTouch() {
    if (d.activeTouch) {
      touchFinished = setTimeout(() => d.activeTouch = null, 1e3);
      prevTouch = d.activeTouch;
      prevTouch.end = +new Date();
    }
  }

  function isMouseLikeTouchEvent(e) {
    if (e.touches.length != 1) return false;
    let touch = e.touches[0];
    return touch.radiusX <= 1 && touch.radiusY <= 1;
  }

  function farAway(touch, other) {
    if (other.left == null) return true;
    let dx = other.left - touch.left,
    dy = other.top - touch.top;
    return dx * dx + dy * dy > 20 * 20;
  }

  on(d.scroller, "touchstart", e => {
    if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e) && !clickInGutter(cm, e)) {
      d.input.ensurePolled();
      clearTimeout(touchFinished);
      let now = +new Date();
      d.activeTouch = {
        start: now,
        moved: false,
        prev: now - prevTouch.end <= 300 ? prevTouch : null };


      if (e.touches.length == 1) {
        d.activeTouch.left = e.touches[0].pageX;
        d.activeTouch.top = e.touches[0].pageY;
      }
    }
  });
  on(d.scroller, "touchmove", () => {
    if (d.activeTouch) d.activeTouch.moved = true;
  });
  on(d.scroller, "touchend", e => {
    let touch = d.activeTouch;

    if (touch && !eventInWidget(d, e) && touch.left != null && !touch.moved && new Date() - touch.start < 300) {
      let pos26 = cm.coordsChar(d.activeTouch, "page"),
      range2;
      if (!touch.prev || farAway(touch, touch.prev)) range2 = new Range(pos26, pos26);else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) range2 = cm.findWordAt(pos26);else range2 = new Range(Pos(pos26.line, 0), clipPos(cm.doc, Pos(pos26.line + 1, 0)));
      cm.setSelection(range2.anchor, range2.head);
      cm.focus();
      e_preventDefault(e);
    }

    finishTouch();
  });
  on(d.scroller, "touchcancel", finishTouch);
  on(d.scroller, "scroll", () => {
    if (d.scroller.clientHeight) {
      updateScrollTop(cm, d.scroller.scrollTop);
      setScrollLeft(cm, d.scroller.scrollLeft, true);
      signal(cm, "scroll", cm);
    }
  });
  on(d.scroller, "mousewheel", e => onScrollWheel(cm, e));
  on(d.scroller, "DOMMouseScroll", e => onScrollWheel(cm, e));
  on(d.wrapper, "scroll", () => d.wrapper.scrollTop = d.wrapper.scrollLeft = 0);
  d.dragFunctions = {
    enter: e => {
      if (!signalDOMEvent(cm, e)) e_stop(e);
    },
    over: e => {
      if (!signalDOMEvent(cm, e)) {
        onDragOver(cm, e);
        e_stop(e);
      }
    },
    start: e => onDragStart(cm, e),
    drop: operation(cm, onDrop),
    leave: e => {
      if (!signalDOMEvent(cm, e)) {
        clearDragCursor(cm);
      }
    } };

  let inp = d.input.getField();
  on(inp, "keyup", e => onKeyUp.call(cm, e));
  on(inp, "keydown", operation(cm, onKeyDown));
  on(inp, "keypress", operation(cm, onKeyPress));
  on(inp, "focus", e => onFocus(cm, e));
  on(inp, "blur", e => onBlur(cm, e));
}

let initHooks = [];

CodeMirror.defineInitHook = f => initHooks.push(f); // node_modules/codemirror/src/input/indent.js


function indentLine(cm, n, how, aggressive) {
  let doc = cm.doc,
  state;
  if (how == null) how = "add";

  if (how == "smart") {
    if (!doc.mode.indent) how = "prev";else state = getContextBefore(cm, n).state;
  }

  let tabSize = cm.options.tabSize;
  let line = getLine(doc, n),
  curSpace = countColumn(line.text, null, tabSize);
  if (line.stateAfter) line.stateAfter = null;
  let curSpaceString = line.text.match(/^\s*/)[0],
  indentation;

  if (!aggressive && !/\S/.test(line.text)) {
    indentation = 0;
    how = "not";
  } else if (how == "smart") {
    indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);

    if (indentation == Pass || indentation > 150) {
      if (!aggressive) return;
      how = "prev";
    }
  }

  if (how == "prev") {
    if (n > doc.first) indentation = countColumn(getLine(doc, n - 1).text, null, tabSize);else indentation = 0;
  } else if (how == "add") {
    indentation = curSpace + cm.options.indentUnit;
  } else if (how == "subtract") {
    indentation = curSpace - cm.options.indentUnit;
  } else if (typeof how == "number") {
    indentation = curSpace + how;
  }

  indentation = Math.max(0, indentation);
  let indentString = "",
  pos26 = 0;
  if (cm.options.indentWithTabs) for (let i = Math.floor(indentation / tabSize); i; --i) {
    pos26 += tabSize;
    indentString += "	";
  }
  if (pos26 < indentation) indentString += spaceStr(indentation - pos26);

  if (indentString != curSpaceString) {
    replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
    line.stateAfter = null;
    return true;
  } else {
    for (let i = 0; i < doc.sel.ranges.length; i++) {
      let range2 = doc.sel.ranges[i];

      if (range2.head.line == n && range2.head.ch < curSpaceString.length) {
        let pos27 = Pos(n, curSpaceString.length);
        replaceOneSelection(doc, i, new Range(pos27, pos27));
        break;
      }
    }
  }
} // node_modules/codemirror/src/input/input.js


let lastCopied = null;

function setLastCopied(newLastCopied) {
  lastCopied = newLastCopied;
}

function applyTextInput(cm, inserted, deleted, sel, origin) {
  let doc = cm.doc;
  cm.display.shift = false;
  if (!sel) sel = doc.sel;
  let recent = +new Date() - 200;
  let paste = origin == "paste" || cm.state.pasteIncoming > recent;
  let textLines = splitLinesAuto(inserted),
  multiPaste = null;

  if (paste && sel.ranges.length > 1) {
    if (lastCopied && lastCopied.text.join("\n") == inserted) {
      if (sel.ranges.length % lastCopied.text.length == 0) {
        multiPaste = [];

        for (let i = 0; i < lastCopied.text.length; i++) multiPaste.push(doc.splitLines(lastCopied.text[i]));
      }
    } else if (textLines.length == sel.ranges.length && cm.options.pasteLinesPerSelection) {
      multiPaste = map(textLines, l => [l]);
    }
  }

  let updateInput = cm.curOp.updateInput;

  for (let i = sel.ranges.length - 1; i >= 0; i--) {
    let range2 = sel.ranges[i];
    let from = range2.from(),
    to = range2.to();

    if (range2.empty()) {
      if (deleted && deleted > 0) from = Pos(from.line, from.ch - deleted);else if (cm.state.overwrite && !paste) to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));else if (paste && lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted) from = to = Pos(from.line, 0);
    }

    let changeEvent = {
      from,
      to,
      text: multiPaste ? multiPaste[i % multiPaste.length] : textLines,
      origin: origin || (paste ? "paste" : cm.state.cutIncoming > recent ? "cut" : "+input") };

    makeChange(cm.doc, changeEvent);
    signalLater(cm, "inputRead", cm, changeEvent);
  }

  if (inserted && !paste) triggerElectric(cm, inserted);
  ensureCursorVisible(cm);
  if (cm.curOp.updateInput < 2) cm.curOp.updateInput = updateInput;
  cm.curOp.typing = true;
  cm.state.pasteIncoming = cm.state.cutIncoming = -1;
}

function handlePaste(e, cm) {
  let pasted = e.clipboardData && e.clipboardData.getData("Text");

  if (pasted) {
    e.preventDefault();
    if (!cm.isReadOnly() && !cm.options.disableInput) runInOp(cm, () => applyTextInput(cm, pasted, 0, null, "paste"));
    return true;
  }
}

function triggerElectric(cm, inserted) {
  if (!cm.options.electricChars || !cm.options.smartIndent) return;
  let sel = cm.doc.sel;

  for (let i = sel.ranges.length - 1; i >= 0; i--) {
    let range2 = sel.ranges[i];
    if (range2.head.ch > 100 || i && sel.ranges[i - 1].head.line == range2.head.line) continue;
    let mode = cm.getModeAt(range2.head);
    let indented = false;

    if (mode.electricChars) {
      for (let j = 0; j < mode.electricChars.length; j++) if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
        indented = indentLine(cm, range2.head.line, "smart");
        break;
      }
    } else if (mode.electricInput) {
      if (mode.electricInput.test(getLine(cm.doc, range2.head.line).text.slice(0, range2.head.ch))) indented = indentLine(cm, range2.head.line, "smart");
    }

    if (indented) signalLater(cm, "electricInput", cm, range2.head.line);
  }
}

function copyableRanges(cm) {
  let text = [],
  ranges = [];

  for (let i = 0; i < cm.doc.sel.ranges.length; i++) {
    let line = cm.doc.sel.ranges[i].head.line;
    let lineRange = {
      anchor: Pos(line, 0),
      head: Pos(line + 1, 0) };

    ranges.push(lineRange);
    text.push(cm.getRange(lineRange.anchor, lineRange.head));
  }

  return {
    text,
    ranges };

}

function disableBrowserMagic(field, spellcheck, autocorrect, autocapitalize) {
  field.setAttribute("autocorrect", autocorrect ? "" : "off");
  field.setAttribute("autocapitalize", autocapitalize ? "" : "off");
  field.setAttribute("spellcheck", !!spellcheck);
}

function hiddenTextarea() {
  let te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none");
  let div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
  if (webkit) te.style.width = "1000px";else te.setAttribute("wrap", "off");
  if (ios) te.style.border = "1px solid black";
  disableBrowserMagic(te);
  return div;
} // node_modules/codemirror/src/edit/methods.js


function methods_default(CodeMirror6) {
  let optionHandlers2 = CodeMirror6.optionHandlers;
  let helpers = CodeMirror6.helpers = {};
  CodeMirror6.prototype = {
    constructor: CodeMirror6,
    focus: function () {
      window.focus();
      this.display.input.focus();
    },
    setOption: function (option, value) {
      let options3 = this.options,
      old = options3[option];
      if (options3[option] == value && option != "mode") return;
      options3[option] = value;
      if (optionHandlers2.hasOwnProperty(option)) operation(this, optionHandlers2[option])(this, value, old);
      signal(this, "optionChange", this, option);
    },
    getOption: function (option) {
      return this.options[option];
    },
    getDoc: function () {
      return this.doc;
    },
    addKeyMap: function (map2, bottom) {
      this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map2));
    },
    removeKeyMap: function (map2) {
      let maps = this.state.keyMaps;

      for (let i = 0; i < maps.length; ++i) if (maps[i] == map2 || maps[i].name == map2) {
        maps.splice(i, 1);
        return true;
      }
    },
    addOverlay: methodOp(function (spec, options3) {
      let mode = spec.token ? spec : CodeMirror6.getMode(this.options, spec);
      if (mode.startState) throw new Error("Overlays may not be stateful.");
      insertSorted(this.state.overlays, {
        mode,
        modeSpec: spec,
        opaque: options3 && options3.opaque,
        priority: options3 && options3.priority || 0 },
      overlay => overlay.priority);
      this.state.modeGen++;
      regChange(this);
    }),
    removeOverlay: methodOp(function (spec) {
      let overlays = this.state.overlays;

      for (let i = 0; i < overlays.length; ++i) {
        let cur = overlays[i].modeSpec;

        if (cur == spec || typeof spec == "string" && cur.name == spec) {
          overlays.splice(i, 1);
          this.state.modeGen++;
          regChange(this);
          return;
        }
      }
    }),
    indentLine: methodOp(function (n, dir, aggressive) {
      if (typeof dir != "string" && typeof dir != "number") {
        if (dir == null) dir = this.options.smartIndent ? "smart" : "prev";else dir = dir ? "add" : "subtract";
      }

      if (isLine(this.doc, n)) indentLine(this, n, dir, aggressive);
    }),
    indentSelection: methodOp(function (how) {
      let ranges = this.doc.sel.ranges,
      end = -1;

      for (let i = 0; i < ranges.length; i++) {
        let range2 = ranges[i];

        if (!range2.empty()) {
          let from = range2.from(),
          to = range2.to();
          let start = Math.max(end, from.line);
          end = Math.min(this.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;

          for (let j = start; j < end; ++j) indentLine(this, j, how);

          let newRanges = this.doc.sel.ranges;
          if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0) replaceOneSelection(this.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll);
        } else if (range2.head.line > end) {
          indentLine(this, range2.head.line, how, true);
          end = range2.head.line;
          if (i == this.doc.sel.primIndex) ensureCursorVisible(this);
        }
      }
    }),
    getTokenAt: function (pos26, precise) {
      return takeToken(this, pos26, precise);
    },
    getLineTokens: function (line, precise) {
      return takeToken(this, Pos(line), precise, true);
    },
    getTokenTypeAt: function (pos26) {
      pos26 = clipPos(this.doc, pos26);
      let styles = getLineStyles(this, getLine(this.doc, pos26.line));
      let before = 0,
      after = (styles.length - 1) / 2,
      ch = pos26.ch;
      let type;
      if (ch == 0) type = styles[2];else for (;;) {
        let mid = before + after >> 1;
        if ((mid ? styles[mid * 2 - 1] : 0) >= ch) after = mid;else if (styles[mid * 2 + 1] < ch) before = mid + 1;else {
          type = styles[mid * 2 + 2];
          break;
        }
      }
      let cut = type ? type.indexOf("overlay ") : -1;
      return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
    },
    getModeAt: function (pos26) {
      let mode = this.doc.mode;
      if (!mode.innerMode) return mode;
      return CodeMirror6.innerMode(mode, this.getTokenAt(pos26).state).mode;
    },
    getHelper: function (pos26, type) {
      return this.getHelpers(pos26, type)[0];
    },
    getHelpers: function (pos26, type) {
      let found = [];
      if (!helpers.hasOwnProperty(type)) return found;
      let help = helpers[type],
      mode = this.getModeAt(pos26);

      if (typeof mode[type] == "string") {
        if (help[mode[type]]) found.push(help[mode[type]]);
      } else if (mode[type]) {
        for (let i = 0; i < mode[type].length; i++) {
          let val = help[mode[type][i]];
          if (val) found.push(val);
        }
      } else if (mode.helperType && help[mode.helperType]) {
        found.push(help[mode.helperType]);
      } else if (help[mode.name]) {
        found.push(help[mode.name]);
      }

      for (let i = 0; i < help._global.length; i++) {
        let cur = help._global[i];
        if (cur.pred(mode, this) && indexOf(found, cur.val) == -1) found.push(cur.val);
      }

      return found;
    },
    getStateAfter: function (line, precise) {
      let doc = this.doc;
      line = clipLine(doc, line == null ? doc.first + doc.size - 1 : line);
      return getContextBefore(this, line + 1, precise).state;
    },
    cursorCoords: function (start, mode) {
      let pos26,
      range2 = this.doc.sel.primary();
      if (start == null) pos26 = range2.head;else if (typeof start == "object") pos26 = clipPos(this.doc, start);else pos26 = start ? range2.from() : range2.to();
      return cursorCoords(this, pos26, mode || "page");
    },
    charCoords: function (pos26, mode) {
      return charCoords(this, clipPos(this.doc, pos26), mode || "page");
    },
    coordsChar: function (coords, mode) {
      coords = fromCoordSystem(this, coords, mode || "page");
      return coordsChar(this, coords.left, coords.top);
    },
    lineAtHeight: function (height, mode) {
      height = fromCoordSystem(this, {
        top: height,
        left: 0 },
      mode || "page").top;
      return lineAtHeight(this.doc, height + this.display.viewOffset);
    },
    heightAtLine: function (line, mode, includeWidgets) {
      let end = false,
      lineObj;

      if (typeof line == "number") {
        let last = this.doc.first + this.doc.size - 1;
        if (line < this.doc.first) line = this.doc.first;else if (line > last) {
          line = last;
          end = true;
        }
        lineObj = getLine(this.doc, line);
      } else {
        lineObj = line;
      }

      return intoCoordSystem(this, lineObj, {
        top: 0,
        left: 0 },
      mode || "page", includeWidgets || end).top + (end ? this.doc.height - heightAtLine(lineObj) : 0);
    },
    defaultTextHeight: function () {
      return textHeight(this.display);
    },
    defaultCharWidth: function () {
      return charWidth(this.display);
    },
    getViewport: function () {
      return {
        from: this.display.viewFrom,
        to: this.display.viewTo };

    },
    addWidget: function (pos26, node, scroll, vert, horiz) {
      let display = this.display;
      pos26 = cursorCoords(this, clipPos(this.doc, pos26));
      let top = pos26.bottom,
      left = pos26.left;
      node.style.position = "absolute";
      node.setAttribute("cm-ignore-events", "true");
      this.display.input.setUneditable(node);
      display.sizer.appendChild(node);

      if (vert == "over") {
        top = pos26.top;
      } else if (vert == "above" || vert == "near") {
        let vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
        hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
        if ((vert == "above" || pos26.bottom + node.offsetHeight > vspace) && pos26.top > node.offsetHeight) top = pos26.top - node.offsetHeight;else if (pos26.bottom + node.offsetHeight <= vspace) top = pos26.bottom;
        if (left + node.offsetWidth > hspace) left = hspace - node.offsetWidth;
      }

      node.style.top = top + "px";
      node.style.left = node.style.right = "";

      if (horiz == "right") {
        left = display.sizer.clientWidth - node.offsetWidth;
        node.style.right = "0px";
      } else {
        if (horiz == "left") left = 0;else if (horiz == "middle") left = (display.sizer.clientWidth - node.offsetWidth) / 2;
        node.style.left = left + "px";
      }

      if (scroll) scrollIntoView(this, {
        left,
        top,
        right: left + node.offsetWidth,
        bottom: top + node.offsetHeight });

    },
    triggerOnKeyDown: methodOp(onKeyDown),
    triggerOnKeyPress: methodOp(onKeyPress),
    triggerOnKeyUp: onKeyUp,
    triggerOnMouseDown: methodOp(onMouseDown),
    execCommand: function (cmd) {
      if (commands.hasOwnProperty(cmd)) return commands[cmd].call(null, this);
    },
    triggerElectric: methodOp(function (text) {
      triggerElectric(this, text);
    }),
    findPosH: function (from, amount, unit, visually) {
      let dir = 1;

      if (amount < 0) {
        dir = -1;
        amount = -amount;
      }

      let cur = clipPos(this.doc, from);

      for (let i = 0; i < amount; ++i) {
        cur = findPosH(this.doc, cur, dir, unit, visually);
        if (cur.hitSide) break;
      }

      return cur;
    },
    moveH: methodOp(function (dir, unit) {
      this.extendSelectionsBy(range2 => {
        if (this.display.shift || this.doc.extend || range2.empty()) return findPosH(this.doc, range2.head, dir, unit, this.options.rtlMoveVisually);else return dir < 0 ? range2.from() : range2.to();
      }, sel_move);
    }),
    deleteH: methodOp(function (dir, unit) {
      let sel = this.doc.sel,
      doc = this.doc;
      if (sel.somethingSelected()) doc.replaceSelection("", null, "+delete");else deleteNearSelection2(this, range2 => {
        let other = findPosH(doc, range2.head, dir, unit, false);
        return dir < 0 ? {
          from: other,
          to: range2.head } :
        {
          from: range2.head,
          to: other };

      });
    }),
    findPosV: function (from, amount, unit, goalColumn) {
      let dir = 1,
      x = goalColumn;

      if (amount < 0) {
        dir = -1;
        amount = -amount;
      }

      let cur = clipPos(this.doc, from);

      for (let i = 0; i < amount; ++i) {
        let coords = cursorCoords(this, cur, "div");
        if (x == null) x = coords.left;else coords.left = x;
        cur = findPosV(this, coords, dir, unit);
        if (cur.hitSide) break;
      }

      return cur;
    },
    moveV: methodOp(function (dir, unit) {
      let doc = this.doc,
      goals = [];
      let collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
      doc.extendSelectionsBy(range2 => {
        if (collapse) return dir < 0 ? range2.from() : range2.to();
        let headPos = cursorCoords(this, range2.head, "div");
        if (range2.goalColumn != null) headPos.left = range2.goalColumn;
        goals.push(headPos.left);
        let pos26 = findPosV(this, headPos, dir, unit);
        if (unit == "page" && range2 == doc.sel.primary()) addToScrollTop(this, charCoords(this, pos26, "div").top - headPos.top);
        return pos26;
      }, sel_move);
      if (goals.length) for (let i = 0; i < doc.sel.ranges.length; i++) doc.sel.ranges[i].goalColumn = goals[i];
    }),
    findWordAt: function (pos26) {
      let doc = this.doc,
      line = getLine(doc, pos26.line).text;
      let start = pos26.ch,
      end = pos26.ch;

      if (line) {
        let helper = this.getHelper(pos26, "wordChars");
        if ((pos26.sticky == "before" || end == line.length) && start) --start;else ++end;
        let startChar = line.charAt(start);
        let check = isWordChar(startChar, helper) ? ch => isWordChar(ch, helper) : /\s/.test(startChar) ? ch => /\s/.test(ch) : ch => !/\s/.test(ch) && !isWordChar(ch);

        while (start > 0 && check(line.charAt(start - 1))) --start;

        while (end < line.length && check(line.charAt(end))) ++end;
      }

      return new Range(Pos(pos26.line, start), Pos(pos26.line, end));
    },
    toggleOverwrite: function (value) {
      if (value != null && value == this.state.overwrite) return;
      if (this.state.overwrite = !this.state.overwrite) addClass(this.display.cursorDiv, "CodeMirror-overwrite");else rmClass(this.display.cursorDiv, "CodeMirror-overwrite");
      signal(this, "overwriteToggle", this, this.state.overwrite);
    },
    hasFocus: function () {
      return this.display.input.getField() == activeElt();
    },
    isReadOnly: function () {
      return !!(this.options.readOnly || this.doc.cantEdit);
    },
    scrollTo: methodOp(function (x, y) {
      scrollToCoords(this, x, y);
    }),
    getScrollInfo: function () {
      let scroller = this.display.scroller;
      return {
        left: scroller.scrollLeft,
        top: scroller.scrollTop,
        height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
        width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
        clientHeight: displayHeight(this),
        clientWidth: displayWidth(this) };

    },
    scrollIntoView: methodOp(function (range2, margin) {
      if (range2 == null) {
        range2 = {
          from: this.doc.sel.primary().head,
          to: null };

        if (margin == null) margin = this.options.cursorScrollMargin;
      } else if (typeof range2 == "number") {
        range2 = {
          from: Pos(range2, 0),
          to: null };

      } else if (range2.from == null) {
        range2 = {
          from: range2,
          to: null };

      }

      if (!range2.to) range2.to = range2.from;
      range2.margin = margin || 0;

      if (range2.from.line != null) {
        scrollToRange(this, range2);
      } else {
        scrollToCoordsRange(this, range2.from, range2.to, range2.margin);
      }
    }),
    setSize: methodOp(function (width, height) {
      let interpret = val => typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;

      if (width != null) this.display.wrapper.style.width = interpret(width);
      if (height != null) this.display.wrapper.style.height = interpret(height);
      if (this.options.lineWrapping) clearLineMeasurementCache(this);
      let lineNo2 = this.display.viewFrom;
      this.doc.iter(lineNo2, this.display.viewTo, line => {
        if (line.widgets) {
          for (let i = 0; i < line.widgets.length; i++) if (line.widgets[i].noHScroll) {
            regLineChange(this, lineNo2, "widget");
            break;
          }
        }

        ++lineNo2;
      });
      this.curOp.forceUpdate = true;
      signal(this, "refresh", this);
    }),
    operation: function (f) {
      return runInOp(this, f);
    },
    startOperation: function () {
      return startOperation(this);
    },
    endOperation: function () {
      return endOperation(this);
    },
    refresh: methodOp(function () {
      let oldHeight = this.display.cachedTextHeight;
      regChange(this);
      this.curOp.forceUpdate = true;
      clearCaches(this);
      scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop);
      updateGutterSpace(this.display);
      if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > 0.5 || this.options.lineWrapping) estimateLineHeights(this);
      signal(this, "refresh", this);
    }),
    swapDoc: methodOp(function (doc) {
      let old = this.doc;
      old.cm = null;
      if (this.state.selectingText) this.state.selectingText();
      attachDoc(this, doc);
      clearCaches(this);
      this.display.input.reset();
      scrollToCoords(this, doc.scrollLeft, doc.scrollTop);
      this.curOp.forceScroll = true;
      signalLater(this, "swapDoc", this, old);
      return old;
    }),
    phrase: function (phraseText) {
      let phrases = this.options.phrases;
      return phrases && Object.prototype.hasOwnProperty.call(phrases, phraseText) ? phrases[phraseText] : phraseText;
    },
    getInputField: function () {
      return this.display.input.getField();
    },
    getWrapperElement: function () {
      return this.display.wrapper;
    },
    getScrollerElement: function () {
      return this.display.scroller;
    },
    getGutterElement: function () {
      return this.display.gutters;
    } };

  eventMixin(CodeMirror6);

  CodeMirror6.registerHelper = function (type, name, value) {
    if (!helpers.hasOwnProperty(type)) helpers[type] = CodeMirror6[type] = {
      _global: [] };

    helpers[type][name] = value;
  };

  CodeMirror6.registerGlobalHelper = function (type, name, predicate, value) {
    CodeMirror6.registerHelper(type, name, value);

    helpers[type]._global.push({
      pred: predicate,
      val: value });

  };
}

function findPosH(doc, pos26, dir, unit, visually) {
  let oldPos = pos26;
  let origDir = dir;
  let lineObj = getLine(doc, pos26.line);
  let lineDir = visually && doc.direction == "rtl" ? -dir : dir;

  function findNextLine() {
    let l = pos26.line + lineDir;
    if (l < doc.first || l >= doc.first + doc.size) return false;
    pos26 = new Pos(l, pos26.ch, pos26.sticky);
    return lineObj = getLine(doc, l);
  }

  function moveOnce(boundToLine) {
    let next;

    if (visually) {
      next = moveVisually(doc.cm, lineObj, pos26, dir);
    } else {
      next = moveLogically(lineObj, pos26, dir);
    }

    if (next == null) {
      if (!boundToLine && findNextLine()) pos26 = endOfLine(visually, doc.cm, lineObj, pos26.line, lineDir);else return false;
    } else {
      pos26 = next;
    }

    return true;
  }

  if (unit == "char") {
    moveOnce();
  } else if (unit == "column") {
    moveOnce(true);
  } else if (unit == "word" || unit == "group") {
    let sawType = null,
    group = unit == "group";
    let helper = doc.cm && doc.cm.getHelper(pos26, "wordChars");

    for (let first = true;; first = false) {
      if (dir < 0 && !moveOnce(!first)) break;
      let cur = lineObj.text.charAt(pos26.ch) || "\n";
      let type = isWordChar(cur, helper) ? "w" : group && cur == "\n" ? "n" : !group || /\s/.test(cur) ? null : "p";
      if (group && !first && !type) type = "s";

      if (sawType && sawType != type) {
        if (dir < 0) {
          dir = 1;
          moveOnce();
          pos26.sticky = "after";
        }

        break;
      }

      if (type) sawType = type;
      if (dir > 0 && !moveOnce(!first)) break;
    }
  }

  let result = skipAtomic(doc, pos26, oldPos, origDir, true);
  if (equalCursorPos(oldPos, result)) result.hitSide = true;
  return result;
}

function findPosV(cm, pos26, dir, unit) {
  let doc = cm.doc,
  x = pos26.left,
  y;

  if (unit == "page") {
    let pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
    let moveAmount = Math.max(pageSize - 0.5 * textHeight(cm.display), 3);
    y = (dir > 0 ? pos26.bottom : pos26.top) + dir * moveAmount;
  } else if (unit == "line") {
    y = dir > 0 ? pos26.bottom + 3 : pos26.top - 3;
  }

  let target;

  for (;;) {
    target = coordsChar(cm, x, y);
    if (!target.outside) break;

    if (dir < 0 ? y <= 0 : y >= doc.height) {
      target.hitSide = true;
      break;
    }

    y += dir * 5;
  }

  return target;
} // node_modules/codemirror/src/input/ContentEditableInput.js


class ContentEditableInput2 {
  constructor(cm) {
    this.cm = cm;
    this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
    this.polling = new Delayed();
    this.composing = null;
    this.gracePeriod = false;
    this.readDOMTimeout = null;
  }

  init(display) {
    let input4 = this,
    cm = input4.cm;
    let div = input4.div = display.lineDiv;
    disableBrowserMagic(div, cm.options.spellcheck, cm.options.autocorrect, cm.options.autocapitalize);

    function belongsToInput(e) {
      for (let t = e.target; t; t = t.parentNode) {
        if (t == div) return true;
        if (/\bCodeMirror-(?:line)?widget\b/.test(t.className)) break;
      }

      return false;
    }

    on(div, "paste", e => {
      if (!belongsToInput(e) || signalDOMEvent(cm, e) || handlePaste(e, cm)) return;
      if (ie_version <= 11) setTimeout(operation(cm, () => this.updateFromDOM()), 20);
    });
    on(div, "compositionstart", e => {
      this.composing = {
        data: e.data,
        done: false };

    });
    on(div, "compositionupdate", e => {
      if (!this.composing) this.composing = {
        data: e.data,
        done: false };

    });
    on(div, "compositionend", e => {
      if (this.composing) {
        if (e.data != this.composing.data) this.readFromDOMSoon();
        this.composing.done = true;
      }
    });
    on(div, "touchstart", () => input4.forceCompositionEnd());
    on(div, "input", () => {
      if (!this.composing) this.readFromDOMSoon();
    });

    function onCopyCut(e) {
      if (!belongsToInput(e) || signalDOMEvent(cm, e)) return;

      if (cm.somethingSelected()) {
        setLastCopied({
          lineWise: false,
          text: cm.getSelections() });

        if (e.type == "cut") cm.replaceSelection("", null, "cut");
      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        let ranges = copyableRanges(cm);
        setLastCopied({
          lineWise: true,
          text: ranges.text });


        if (e.type == "cut") {
          cm.operation(() => {
            cm.setSelections(ranges.ranges, 0, sel_dontScroll);
            cm.replaceSelection("", null, "cut");
          });
        }
      }

      if (e.clipboardData) {
        e.clipboardData.clearData();
        let content = lastCopied.text.join("\n");
        e.clipboardData.setData("Text", content);

        if (e.clipboardData.getData("Text") == content) {
          e.preventDefault();
          return;
        }
      }

      let kludge = hiddenTextarea(),
      te = kludge.firstChild;
      cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
      te.value = lastCopied.text.join("\n");
      let hadFocus = document.activeElement;

      _selectInput(te);

      setTimeout(() => {
        cm.display.lineSpace.removeChild(kludge);
        hadFocus.focus();
        if (hadFocus == div) input4.showPrimarySelection();
      }, 50);
    }

    on(div, "copy", onCopyCut);
    on(div, "cut", onCopyCut);
  }

  screenReaderLabelChanged(label) {
    if (label) {
      this.div.setAttribute("aria-label", label);
    } else {
      this.div.removeAttribute("aria-label");
    }
  }

  prepareSelection() {
    let result = prepareSelection(this.cm, false);
    result.focus = document.activeElement == this.div;
    return result;
  }

  showSelection(info, takeFocus) {
    if (!info || !this.cm.display.view.length) return;
    if (info.focus || takeFocus) this.showPrimarySelection();
    this.showMultipleSelections(info);
  }

  getSelection() {
    return this.cm.display.wrapper.ownerDocument.getSelection();
  }

  showPrimarySelection() {
    let sel = this.getSelection(),
    cm = this.cm,
    prim = cm.doc.sel.primary();
    let from = prim.from(),
    to = prim.to();

    if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) {
      sel.removeAllRanges();
      return;
    }

    let curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    let curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);
    if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad && cmp(minPos(curAnchor, curFocus), from) == 0 && cmp(maxPos(curAnchor, curFocus), to) == 0) return;
    let view = cm.display.view;
    let start = from.line >= cm.display.viewFrom && posToDOM(cm, from) || {
      node: view[0].measure.map[2],
      offset: 0 };

    let end = to.line < cm.display.viewTo && posToDOM(cm, to);

    if (!end) {
      let measure = view[view.length - 1].measure;
      let map2 = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
      end = {
        node: map2[map2.length - 1],
        offset: map2[map2.length - 2] - map2[map2.length - 3] };

    }

    if (!start || !end) {
      sel.removeAllRanges();
      return;
    }

    let old = sel.rangeCount && sel.getRangeAt(0),
    rng;

    try {
      rng = range(start.node, start.offset, end.offset, end.node);
    } catch (e) {}

    if (rng) {
      if (!gecko && cm.state.focused) {
        sel.collapse(start.node, start.offset);

        if (!rng.collapsed) {
          sel.removeAllRanges();
          sel.addRange(rng);
        }
      } else {
        sel.removeAllRanges();
        sel.addRange(rng);
      }

      if (old && sel.anchorNode == null) sel.addRange(old);else if (gecko) this.startGracePeriod();
    }

    this.rememberSelection();
  }

  startGracePeriod() {
    clearTimeout(this.gracePeriod);
    this.gracePeriod = setTimeout(() => {
      this.gracePeriod = false;
      if (this.selectionChanged()) this.cm.operation(() => this.cm.curOp.selectionChanged = true);
    }, 20);
  }

  showMultipleSelections(info) {
    removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
    removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
  }

  rememberSelection() {
    let sel = this.getSelection();
    this.lastAnchorNode = sel.anchorNode;
    this.lastAnchorOffset = sel.anchorOffset;
    this.lastFocusNode = sel.focusNode;
    this.lastFocusOffset = sel.focusOffset;
  }

  selectionInEditor() {
    let sel = this.getSelection();
    if (!sel.rangeCount) return false;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    return contains(this.div, node);
  }

  focus() {
    if (this.cm.options.readOnly != "nocursor") {
      if (!this.selectionInEditor() || document.activeElement != this.div) this.showSelection(this.prepareSelection(), true);
      this.div.focus();
    }
  }

  blur() {
    this.div.blur();
  }

  getField() {
    return this.div;
  }

  supportsTouch() {
    return true;
  }

  receivedFocus() {
    let input4 = this;
    if (this.selectionInEditor()) this.pollSelection();else runInOp(this.cm, () => input4.cm.curOp.selectionChanged = true);

    function poll() {
      if (input4.cm.state.focused) {
        input4.pollSelection();
        input4.polling.set(input4.cm.options.pollInterval, poll);
      }
    }

    this.polling.set(this.cm.options.pollInterval, poll);
  }

  selectionChanged() {
    let sel = this.getSelection();
    return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset || sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset;
  }

  pollSelection() {
    if (this.readDOMTimeout != null || this.gracePeriod || !this.selectionChanged()) return;
    let sel = this.getSelection(),
    cm = this.cm;

    if (android && chrome && this.cm.display.gutterSpecs.length && isInGutter(sel.anchorNode)) {
      this.cm.triggerOnKeyDown({
        type: "keydown",
        keyCode: 8,
        preventDefault: Math.abs });

      this.blur();
      this.focus();
      return;
    }

    if (this.composing) return;
    this.rememberSelection();
    let anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    let head = domToPos(cm, sel.focusNode, sel.focusOffset);
    if (anchor && head) runInOp(cm, () => {
      setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
      if (anchor.bad || head.bad) cm.curOp.selectionChanged = true;
    });
  }

  pollContent() {
    if (this.readDOMTimeout != null) {
      clearTimeout(this.readDOMTimeout);
      this.readDOMTimeout = null;
    }

    let cm = this.cm,
    display = cm.display,
    sel = cm.doc.sel.primary();
    let from = sel.from(),
    to = sel.to();
    if (from.ch == 0 && from.line > cm.firstLine()) from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length);
    if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine()) to = Pos(to.line + 1, 0);
    if (from.line < display.viewFrom || to.line > display.viewTo - 1) return false;
    let fromIndex, fromLine, fromNode;

    if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
      fromLine = lineNo(display.view[0].line);
      fromNode = display.view[0].node;
    } else {
      fromLine = lineNo(display.view[fromIndex].line);
      fromNode = display.view[fromIndex - 1].node.nextSibling;
    }

    let toIndex = findViewIndex(cm, to.line);
    let toLine, toNode;

    if (toIndex == display.view.length - 1) {
      toLine = display.viewTo - 1;
      toNode = display.lineDiv.lastChild;
    } else {
      toLine = lineNo(display.view[toIndex + 1].line) - 1;
      toNode = display.view[toIndex + 1].node.previousSibling;
    }

    if (!fromNode) return false;
    let newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
    let oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));

    while (newText.length > 1 && oldText.length > 1) {
      if (lst(newText) == lst(oldText)) {
        newText.pop();
        oldText.pop();
        toLine--;
      } else if (newText[0] == oldText[0]) {
        newText.shift();
        oldText.shift();
        fromLine++;
      } else break;
    }

    let cutFront = 0,
    cutEnd = 0;
    let newTop = newText[0],
    oldTop = oldText[0],
    maxCutFront = Math.min(newTop.length, oldTop.length);

    while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront)) ++cutFront;

    let newBot = lst(newText),
    oldBot = lst(oldText);
    let maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0), oldBot.length - (oldText.length == 1 ? cutFront : 0));

    while (cutEnd < maxCutEnd && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) ++cutEnd;

    if (newText.length == 1 && oldText.length == 1 && fromLine == from.line) {
      while (cutFront && cutFront > from.ch && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
        cutFront--;
        cutEnd++;
      }
    }

    newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
    newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");
    let chFrom = Pos(fromLine, cutFront);
    let chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);

    if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
      replaceRange(cm.doc, newText, chFrom, chTo, "+input");
      return true;
    }
  }

  ensurePolled() {
    this.forceCompositionEnd();
  }

  reset() {
    this.forceCompositionEnd();
  }

  forceCompositionEnd() {
    if (!this.composing) return;
    clearTimeout(this.readDOMTimeout);
    this.composing = null;
    this.updateFromDOM();
    this.div.blur();
    this.div.focus();
  }

  readFromDOMSoon() {
    if (this.readDOMTimeout != null) return;
    this.readDOMTimeout = setTimeout(() => {
      this.readDOMTimeout = null;

      if (this.composing) {
        if (this.composing.done) this.composing = null;else return;
      }

      this.updateFromDOM();
    }, 80);
  }

  updateFromDOM() {
    if (this.cm.isReadOnly() || !this.pollContent()) runInOp(this.cm, () => regChange(this.cm));
  }

  setUneditable(node) {
    node.contentEditable = "false";
  }

  onKeyPress(e) {
    if (e.charCode == 0 || this.composing) return;
    e.preventDefault();
    if (!this.cm.isReadOnly()) operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0);
  }

  readOnlyChanged(val) {
    this.div.contentEditable = String(val != "nocursor");
  }

  onContextMenu() {}

  resetPosition() {}}



ContentEditableInput2.prototype.needsContentAttribute = true;

function posToDOM(cm, pos26) {
  let view = findViewForLine(cm, pos26.line);
  if (!view || view.hidden) return null;
  let line = getLine(cm.doc, pos26.line);
  let info = mapFromLineView(view, line, pos26.line);
  let order = getOrder(line, cm.doc.direction),
  side = "left";

  if (order) {
    let partPos = getBidiPartAt(order, pos26.ch);
    side = partPos % 2 ? "right" : "left";
  }

  let result = nodeAndOffsetInLineMap(info.map, pos26.ch, side);
  result.offset = result.collapse == "right" ? result.end : result.start;
  return result;
}

function isInGutter(node) {
  for (let scan = node; scan; scan = scan.parentNode) if (/CodeMirror-gutter-wrapper/.test(scan.className)) return true;

  return false;
}

function badPos(pos26, bad) {
  if (bad) pos26.bad = true;
  return pos26;
}

function domTextBetween(cm, from, to, fromLine, toLine) {
  let text = "",
  closing = false,
  lineSep = cm.doc.lineSeparator(),
  extraLinebreak = false;

  function recognizeMarker(id) {
    return marker => marker.id == id;
  }

  function close() {
    if (closing) {
      text += lineSep;
      if (extraLinebreak) text += lineSep;
      closing = extraLinebreak = false;
    }
  }

  function addText(str) {
    if (str) {
      close();
      text += str;
    }
  }

  function walk(node) {
    if (node.nodeType == 1) {
      let cmText = node.getAttribute("cm-text");

      if (cmText) {
        addText(cmText);
        return;
      }

      let markerID = node.getAttribute("cm-marker"),
      range2;

      if (markerID) {
        let found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
        if (found.length && (range2 = found[0].find(0))) addText(getBetween(cm.doc, range2.from, range2.to).join(lineSep));
        return;
      }

      if (node.getAttribute("contenteditable") == "false") return;
      let isBlock = /^(pre|div|p|li|table|br)$/i.test(node.nodeName);
      if (!/^br$/i.test(node.nodeName) && node.textContent.length == 0) return;
      if (isBlock) close();

      for (let i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);

      if (/^(pre|p)$/i.test(node.nodeName)) extraLinebreak = true;
      if (isBlock) closing = true;
    } else if (node.nodeType == 3) {
      addText(node.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "));
    }
  }

  for (;;) {
    walk(from);
    if (from == to) break;
    from = from.nextSibling;
    extraLinebreak = false;
  }

  return text;
}

function domToPos(cm, node, offset) {
  let lineNode;

  if (node == cm.display.lineDiv) {
    lineNode = cm.display.lineDiv.childNodes[offset];
    if (!lineNode) return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true);
    node = null;
    offset = 0;
  } else {
    for (lineNode = node;; lineNode = lineNode.parentNode) {
      if (!lineNode || lineNode == cm.display.lineDiv) return null;
      if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) break;
    }
  }

  for (let i = 0; i < cm.display.view.length; i++) {
    let lineView = cm.display.view[i];
    if (lineView.node == lineNode) return locateNodeInLineView(lineView, node, offset);
  }
}

function locateNodeInLineView(lineView, node, offset) {
  let wrapper = lineView.text.firstChild,
  bad = false;
  if (!node || !contains(wrapper, node)) return badPos(Pos(lineNo(lineView.line), 0), true);

  if (node == wrapper) {
    bad = true;
    node = wrapper.childNodes[offset];
    offset = 0;

    if (!node) {
      let line = lineView.rest ? lst(lineView.rest) : lineView.line;
      return badPos(Pos(lineNo(line), line.text.length), bad);
    }
  }

  let textNode = node.nodeType == 3 ? node : null,
  topNode = node;

  if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
    textNode = node.firstChild;
    if (offset) offset = textNode.nodeValue.length;
  }

  while (topNode.parentNode != wrapper) topNode = topNode.parentNode;

  let measure = lineView.measure,
  maps = measure.maps;

  function find(textNode2, topNode2, offset2) {
    for (let i = -1; i < (maps ? maps.length : 0); i++) {
      let map2 = i < 0 ? measure.map : maps[i];

      for (let j = 0; j < map2.length; j += 3) {
        let curNode = map2[j + 2];

        if (curNode == textNode2 || curNode == topNode2) {
          let line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
          let ch = map2[j] + offset2;
          if (offset2 < 0 || curNode != textNode2) ch = map2[j + (offset2 ? 1 : 0)];
          return Pos(line, ch);
        }
      }
    }
  }

  let found = find(textNode, topNode, offset);
  if (found) return badPos(found, bad);

  for (let after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
    found = find(after, after.firstChild, 0);
    if (found) return badPos(Pos(found.line, found.ch - dist), bad);else dist += after.textContent.length;
  }

  for (let before = topNode.previousSibling, dist = offset; before; before = before.previousSibling) {
    found = find(before, before.firstChild, -1);
    if (found) return badPos(Pos(found.line, found.ch + dist), bad);else dist += before.textContent.length;
  }
} // node_modules/codemirror/src/input/TextareaInput.js


class TextareaInput2 {
  constructor(cm) {
    this.cm = cm;
    this.prevInput = "";
    this.pollingFast = false;
    this.polling = new Delayed();
    this.hasSelection = false;
    this.composing = null;
  }

  init(display) {
    let input4 = this,
    cm = this.cm;
    this.createField(display);
    const te = this.textarea;
    display.wrapper.insertBefore(this.wrapper, display.wrapper.firstChild);
    if (ios) te.style.width = "0px";
    on(te, "input", () => {
      if (ie && ie_version >= 9 && this.hasSelection) this.hasSelection = null;
      input4.poll();
    });
    on(te, "paste", e => {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) return;
      cm.state.pasteIncoming = +new Date();
      input4.fastPoll();
    });

    function prepareCopyCut(e) {
      if (signalDOMEvent(cm, e)) return;

      if (cm.somethingSelected()) {
        setLastCopied({
          lineWise: false,
          text: cm.getSelections() });

      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        let ranges = copyableRanges(cm);
        setLastCopied({
          lineWise: true,
          text: ranges.text });


        if (e.type == "cut") {
          cm.setSelections(ranges.ranges, null, sel_dontScroll);
        } else {
          input4.prevInput = "";
          te.value = ranges.text.join("\n");

          _selectInput(te);
        }
      }

      if (e.type == "cut") cm.state.cutIncoming = +new Date();
    }

    on(te, "cut", prepareCopyCut);
    on(te, "copy", prepareCopyCut);
    on(display.scroller, "paste", e => {
      if (eventInWidget(display, e) || signalDOMEvent(cm, e)) return;

      if (!te.dispatchEvent) {
        cm.state.pasteIncoming = +new Date();
        input4.focus();
        return;
      }

      const event28 = new Event("paste");
      event28.clipboardData = e.clipboardData;
      te.dispatchEvent(event28);
    });
    on(display.lineSpace, "selectstart", e => {
      if (!eventInWidget(display, e)) e_preventDefault(e);
    });
    on(te, "compositionstart", () => {
      let start = cm.getCursor("from");
      if (input4.composing) input4.composing.range.clear();
      input4.composing = {
        start,
        range: cm.markText(start, cm.getCursor("to"), {
          className: "CodeMirror-composing" }) };


    });
    on(te, "compositionend", () => {
      if (input4.composing) {
        input4.poll();
        input4.composing.range.clear();
        input4.composing = null;
      }
    });
  }

  createField(_display) {
    this.wrapper = hiddenTextarea();
    this.textarea = this.wrapper.firstChild;
  }

  screenReaderLabelChanged(label) {
    if (label) {
      this.textarea.setAttribute("aria-label", label);
    } else {
      this.textarea.removeAttribute("aria-label");
    }
  }

  prepareSelection() {
    let cm = this.cm,
    display = cm.display,
    doc = cm.doc;
    let result = prepareSelection(cm);

    if (cm.options.moveInputWithCursor) {
      let headPos = cursorCoords(cm, doc.sel.primary().head, "div");
      let wrapOff = display.wrapper.getBoundingClientRect(),
      lineOff = display.lineDiv.getBoundingClientRect();
      result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10, headPos.top + lineOff.top - wrapOff.top));
      result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10, headPos.left + lineOff.left - wrapOff.left));
    }

    return result;
  }

  showSelection(drawn) {
    let cm = this.cm,
    display = cm.display;
    removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
    removeChildrenAndAdd(display.selectionDiv, drawn.selection);

    if (drawn.teTop != null) {
      this.wrapper.style.top = drawn.teTop + "px";
      this.wrapper.style.left = drawn.teLeft + "px";
    }
  }

  reset(typing) {
    if (this.contextMenuPending || this.composing) return;
    let cm = this.cm;

    if (cm.somethingSelected()) {
      this.prevInput = "";
      let content = cm.getSelection();
      this.textarea.value = content;
      if (cm.state.focused) _selectInput(this.textarea);
      if (ie && ie_version >= 9) this.hasSelection = content;
    } else if (!typing) {
      this.prevInput = this.textarea.value = "";
      if (ie && ie_version >= 9) this.hasSelection = null;
    }
  }

  getField() {
    return this.textarea;
  }

  supportsTouch() {
    return false;
  }

  focus() {
    if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
      try {
        this.textarea.focus();
      } catch (e) {}
    }
  }

  blur() {
    this.textarea.blur();
  }

  resetPosition() {
    this.wrapper.style.top = this.wrapper.style.left = 0;
  }

  receivedFocus() {
    this.slowPoll();
  }

  slowPoll() {
    if (this.pollingFast) return;
    this.polling.set(this.cm.options.pollInterval, () => {
      this.poll();
      if (this.cm.state.focused) this.slowPoll();
    });
  }

  fastPoll() {
    let missed = false,
    input4 = this;
    input4.pollingFast = true;

    function p() {
      let changed = input4.poll();

      if (!changed && !missed) {
        missed = true;
        input4.polling.set(60, p);
      } else {
        input4.pollingFast = false;
        input4.slowPoll();
      }
    }

    input4.polling.set(20, p);
  }

  poll() {
    let cm = this.cm,
    input4 = this.textarea,
    prevInput = this.prevInput;
    if (this.contextMenuPending || !cm.state.focused || hasSelection(input4) && !prevInput && !this.composing || cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq) return false;
    let text = input4.value;
    if (text == prevInput && !cm.somethingSelected()) return false;

    if (ie && ie_version >= 9 && this.hasSelection === text || mac && /[\uf700-\uf7ff]/.test(text)) {
      cm.display.input.reset();
      return false;
    }

    if (cm.doc.sel == cm.display.selForContextMenu) {
      let first = text.charCodeAt(0);
      if (first == 8203 && !prevInput) prevInput = "​";

      if (first == 8666) {
        this.reset();
        return this.cm.execCommand("undo");
      }
    }

    let same = 0,
    l = Math.min(prevInput.length, text.length);

    while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) ++same;

    runInOp(cm, () => {
      applyTextInput(cm, text.slice(same), prevInput.length - same, null, this.composing ? "*compose" : null);
      if (text.length > 1e3 || text.indexOf("\n") > -1) input4.value = this.prevInput = "";else this.prevInput = text;

      if (this.composing) {
        this.composing.range.clear();
        this.composing.range = cm.markText(this.composing.start, cm.getCursor("to"), {
          className: "CodeMirror-composing" });

      }
    });
    return true;
  }

  ensurePolled() {
    if (this.pollingFast && this.poll()) this.pollingFast = false;
  }

  onKeyPress() {
    if (ie && ie_version >= 9) this.hasSelection = null;
    this.fastPoll();
  }

  onContextMenu(e) {
    let input4 = this,
    cm = input4.cm,
    display = cm.display,
    te = input4.textarea;
    if (input4.contextMenuPending) input4.contextMenuPending();
    let pos26 = posFromMouse(cm, e),
    scrollPos = display.scroller.scrollTop;
    if (!pos26 || presto) return;
    let reset = cm.options.resetSelectionOnContextMenu;
    if (reset && cm.doc.sel.contains(pos26) == -1) operation(cm, setSelection)(cm.doc, simpleSelection(pos26), sel_dontScroll);
    let oldCSS = te.style.cssText,
    oldWrapperCSS = input4.wrapper.style.cssText;
    let wrapperBox = input4.wrapper.offsetParent.getBoundingClientRect();
    input4.wrapper.style.cssText = "position: static";
    te.style.cssText = `position: absolute; width: 30px; height: 30px;
      top: ${e.clientY - wrapperBox.top - 5}px; left: ${e.clientX - wrapperBox.left - 5}px;
      z-index: 1000; background: ${ie ? "rgba(255, 255, 255, .05)" : "transparent"};
      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);`;
    let oldScrollY;
    if (webkit) oldScrollY = window.scrollY;
    display.input.focus();
    if (webkit) window.scrollTo(null, oldScrollY);
    display.input.reset();
    if (!cm.somethingSelected()) te.value = input4.prevInput = " ";
    input4.contextMenuPending = rehide;
    display.selForContextMenu = cm.doc.sel;
    clearTimeout(display.detectingSelectAll);

    function prepareSelectAllHack() {
      if (te.selectionStart != null) {
        let selected = cm.somethingSelected();
        let extval = "​" + (selected ? te.value : "");
        te.value = "⇚";
        te.value = extval;
        input4.prevInput = selected ? "" : "​";
        te.selectionStart = 1;
        te.selectionEnd = extval.length;
        display.selForContextMenu = cm.doc.sel;
      }
    }

    function rehide() {
      if (input4.contextMenuPending != rehide) return;
      input4.contextMenuPending = false;
      input4.wrapper.style.cssText = oldWrapperCSS;
      te.style.cssText = oldCSS;
      if (ie && ie_version < 9) display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);

      if (te.selectionStart != null) {
        if (!ie || ie && ie_version < 9) prepareSelectAllHack();

        let i = 0,
        poll = () => {
          if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 && te.selectionEnd > 0 && input4.prevInput == "​") {
            operation(cm, selectAll)(cm);
          } else if (i++ < 10) {
            display.detectingSelectAll = setTimeout(poll, 500);
          } else {
            display.selForContextMenu = null;
            display.input.reset();
          }
        };

        display.detectingSelectAll = setTimeout(poll, 200);
      }
    }

    if (ie && ie_version >= 9) prepareSelectAllHack();

    if (captureRightClick) {
      e_stop(e);

      let mouseup = () => {
        off(window, "mouseup", mouseup);
        setTimeout(rehide, 20);
      };

      on(window, "mouseup", mouseup);
    } else {
      setTimeout(rehide, 50);
    }
  }

  readOnlyChanged(val) {
    if (!val) this.reset();
    this.textarea.disabled = val == "nocursor";
  }

  setUneditable() {}}



TextareaInput2.prototype.needsContentAttribute = false; // node_modules/codemirror/src/edit/fromTextArea.js

function fromTextArea(textarea, options3) {
  options3 = options3 ? copyObj(options3) : {};
  options3.value = textarea.value;
  if (!options3.tabindex && textarea.tabIndex) options3.tabindex = textarea.tabIndex;
  if (!options3.placeholder && textarea.placeholder) options3.placeholder = textarea.placeholder;

  if (options3.autofocus == null) {
    let hasFocus = activeElt();
    options3.autofocus = hasFocus == textarea || textarea.getAttribute("autofocus") != null && hasFocus == document.body;
  }

  function save() {
    textarea.value = cm.getValue();
  }

  let realSubmit;

  if (textarea.form) {
    on(textarea.form, "submit", save);

    if (!options3.leaveSubmitMethodAlone) {
      let form = textarea.form;
      realSubmit = form.submit;

      try {
        let wrappedSubmit = form.submit = () => {
          save();
          form.submit = realSubmit;
          form.submit();
          form.submit = wrappedSubmit;
        };
      } catch (e) {}
    }
  }

  options3.finishInit = cm2 => {
    cm2.save = save;

    cm2.getTextArea = () => textarea;

    cm2.toTextArea = () => {
      cm2.toTextArea = isNaN;
      save();
      textarea.parentNode.removeChild(cm2.getWrapperElement());
      textarea.style.display = "";

      if (textarea.form) {
        off(textarea.form, "submit", save);
        if (!options3.leaveSubmitMethodAlone && typeof textarea.form.submit == "function") textarea.form.submit = realSubmit;
      }
    };
  };

  textarea.style.display = "none";
  let cm = CodeMirror(node => textarea.parentNode.insertBefore(node, textarea.nextSibling), options3);
  return cm;
} // node_modules/codemirror/src/edit/legacy.js


function addLegacyProps(CodeMirror6) {
  CodeMirror6.off = off;
  CodeMirror6.on = on;
  CodeMirror6.wheelEventPixels = wheelEventPixels;
  CodeMirror6.Doc = Doc_default;
  CodeMirror6.splitLines = splitLinesAuto;
  CodeMirror6.countColumn = countColumn;
  CodeMirror6.findColumn = findColumn;
  CodeMirror6.isWordChar = isWordCharBasic;
  CodeMirror6.Pass = Pass;
  CodeMirror6.signal = signal;
  CodeMirror6.Line = Line;
  CodeMirror6.changeEnd = changeEnd;
  CodeMirror6.scrollbarModel = scrollbarModel;
  CodeMirror6.Pos = Pos;
  CodeMirror6.cmpPos = cmp;
  CodeMirror6.modes = modes4;
  CodeMirror6.mimeModes = mimeModes;
  CodeMirror6.resolveMode = resolveMode;
  CodeMirror6.getMode = getMode;
  CodeMirror6.modeExtensions = modeExtensions;
  CodeMirror6.extendMode = extendMode;
  CodeMirror6.copyState = copyState;
  CodeMirror6.startState = startState;
  CodeMirror6.innerMode = innerMode;
  CodeMirror6.commands = commands;
  CodeMirror6.keyMap = keyMap;
  CodeMirror6.keyName = keyName;
  CodeMirror6.isModifierKey = isModifierKey;
  CodeMirror6.lookupKey = lookupKey;
  CodeMirror6.normalizeKeyMap = normalizeKeyMap;
  CodeMirror6.StringStream = StringStream_default;
  CodeMirror6.SharedTextMarker = SharedTextMarker;
  CodeMirror6.TextMarker = TextMarker;
  CodeMirror6.LineWidget = LineWidget;
  CodeMirror6.e_preventDefault = e_preventDefault;
  CodeMirror6.e_stopPropagation = e_stopPropagation;
  CodeMirror6.e_stop = e_stop;
  CodeMirror6.addClass = addClass;
  CodeMirror6.contains = contains;
  CodeMirror6.rmClass = rmClass;
  CodeMirror6.keyNames = keyNames;
} // node_modules/codemirror/src/edit/main.js


defineOptions(CodeMirror);
methods_default(CodeMirror);
let dontDelegate = "iter insert remove copy getEditor constructor".split(" ");

for (let prop in Doc_default.prototype) if (Doc_default.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0) CodeMirror.prototype[prop] = function (method) {
  return function () {
    return method.apply(this.doc, arguments);
  };
}(Doc_default.prototype[prop]);

eventMixin(Doc_default);
CodeMirror.inputStyles = {
  textarea: TextareaInput2,
  contenteditable: ContentEditableInput2 };


CodeMirror.defineMode = function (name) {
  if (!CodeMirror.defaults.mode && name != "null") CodeMirror.defaults.mode = name;
  defineMode.apply(this, arguments);
};

CodeMirror.defineMIME = defineMIME;
CodeMirror.defineMode("null", () => ({
  token: stream => stream.skipToEnd() }));

CodeMirror.defineMIME("text/plain", "null");

CodeMirror.defineExtension = (name, func) => {
  CodeMirror.prototype[name] = func;
};

CodeMirror.defineDocExtension = (name, func) => {
  Doc_default.prototype[name] = func;
};

CodeMirror.fromTextArea = fromTextArea;
addLegacyProps(CodeMirror);
CodeMirror.version = "5.54.0"; // node_modules/codemirror/src/codemirror.js

const codemirror_default = CodeMirror; // src/styling.js

document.body.insertAdjacentHTML("beforeend", `
<style>
/* BASICS */

.CodeMirror {
  /* Set height, width, borders, and global font properties here */
  font-family: monospace;
  height: auto;
  color: black;
  direction: ltr;
}

/* PADDING */

.CodeMirror-lines {
  padding: 4px 0; /* Vertical padding around content */
}
.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  padding: 0 4px; /* Horizontal padding of content */
}

.CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  background-color: white; /* The little square between H and V scrollbars */
}

/* GUTTER */

.CodeMirror-gutters {
  border-right: 1px solid #ddd;
  background-color: #f7f7f7;
  white-space: nowrap;
}
.CodeMirror-linenumbers {}
.CodeMirror-linenumber {
  padding: 0 3px 0 5px;
  min-width: 20px;
  text-align: right;
  color: #999;
  white-space: nowrap;
}

.CodeMirror-guttermarker { color: black; }
.CodeMirror-guttermarker-subtle { color: #999; }

/* CURSOR */

.CodeMirror-cursor {
  border-left: 1px solid black;
  border-right: none;
  width: 0;
}
/* Shown when moving in bi-directional text */
.CodeMirror div.CodeMirror-secondarycursor {
  border-left: 1px solid silver;
}
.cm-fat-cursor .CodeMirror-cursor {
  width: auto;
  border: 0 !important;
  background: #7e7;
}
.cm-fat-cursor div.CodeMirror-cursors {
  z-index: 1;
}
.cm-fat-cursor-mark {
  background-color: rgba(20, 255, 20, 0.5);
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
}
.cm-animate-fat-cursor {
  width: auto;
  border: 0;
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
  background-color: #7e7;
}
@-moz-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@-webkit-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}

/* Can style cursor different in overwrite (non-insert) mode */
.CodeMirror-overwrite .CodeMirror-cursor {}

.cm-tab { display: inline-block; text-decoration: inherit; }

.CodeMirror-rulers {
  position: absolute;
  left: 0; right: 0; top: -50px; bottom: 0;
  overflow: hidden;
}
.CodeMirror-ruler {
  border-left: 1px solid #ccc;
  top: 0; bottom: 0;
  position: absolute;
}

/* DEFAULT THEME */

.cm-s-default .cm-header {color: blue;}
.cm-s-default .cm-quote {color: #090;}
.cm-negative {color: #d44;}
.cm-positive {color: #292;}
.cm-header, .cm-strong {font-weight: bold;}
.cm-em {font-style: italic;}
.cm-link {text-decoration: underline;}
.cm-strikethrough {text-decoration: line-through;}

.cm-s-default .cm-keyword {color: #708;}
.cm-s-default .cm-atom {color: #219;}
.cm-s-default .cm-number {color: #164;}
.cm-s-default .cm-def {color: #00f;}
.cm-s-default .cm-variable,
.cm-s-default .cm-punctuation,
.cm-s-default .cm-property,
.cm-s-default .cm-operator {}
.cm-s-default .cm-variable-2 {color: #05a;}
.cm-s-default .cm-variable-3, .cm-s-default .cm-type {color: #085;}
.cm-s-default .cm-comment {color: #a50;}
.cm-s-default .cm-string {color: #a11;}
.cm-s-default .cm-string-2 {color: #f50;}
.cm-s-default .cm-meta {color: #555;}
.cm-s-default .cm-qualifier {color: #555;}
.cm-s-default .cm-builtin {color: #30a;}
.cm-s-default .cm-bracket {color: #997;}
.cm-s-default .cm-tag {color: #170;}
.cm-s-default .cm-attribute {color: #00c;}
.cm-s-default .cm-hr {color: #999;}
.cm-s-default .cm-link {color: #00c;}

.cm-s-default .cm-error {color: #f00;}
.cm-invalidchar {color: #f00;}

.CodeMirror-composing { border-bottom: 2px solid; }

/* Default styles for common addons */

div.CodeMirror span.CodeMirror-matchingbracket {color: #0b0;}
div.CodeMirror span.CodeMirror-nonmatchingbracket {color: #a22;}
.CodeMirror-matchingtag { background: rgba(255, 150, 0, .3); }
.CodeMirror-activeline-background {background: #e8f2ff;}

/* STOP */

/* The rest of this file contains styles related to the mechanics of
    the editor. You probably shouldn't touch them. */

.CodeMirror {
  position: relative;
  overflow: hidden;
  background: white;
}

.CodeMirror-scroll {
  overflow: scroll !important; /* Things will break if this is overridden */
  /* 50px is the magic margin used to hide the element's real scrollbars */
  /* See overflow: hidden in .CodeMirror */
  margin-bottom: -50px; margin-right: -50px;
  padding-bottom: 50px;
  height: 100%;
  outline: none; /* Prevent dragging from highlighting the element */
  position: relative;
}
.CodeMirror-sizer {
  position: relative;
  border-right: 50px solid transparent;
}

/* The fake, visible scrollbars. Used to force redraw during scrolling
    before actual scrolling happens, thus preventing shaking and
    flickering artifacts. */
.CodeMirror-vscrollbar, .CodeMirror-hscrollbar, .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  position: absolute;
  z-index: 6;
  display: none;
}
.CodeMirror-vscrollbar {
  right: 0; top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
}
.CodeMirror-hscrollbar {
  bottom: 0; left: 0;
  overflow-y: hidden;
  overflow-x: scroll;
}
.CodeMirror-scrollbar-filler {
  right: 0; bottom: 0;
}
.CodeMirror-gutter-filler {
  left: 0; bottom: 0;
}

.CodeMirror-gutters {
  position: absolute; left: 0; top: 0;
  min-height: 100%;
  z-index: 3;
}
.CodeMirror-gutter {
  white-space: normal;
  height: 100%;
  display: inline-block;
  vertical-align: top;
  margin-bottom: -50px;
}
.CodeMirror-gutter-wrapper {
  position: absolute;
  z-index: 4;
  background: none !important;
  border: none !important;
}
.CodeMirror-gutter-background {
  position: absolute;
  top: 0; bottom: 0;
  z-index: 4;
}
.CodeMirror-gutter-elt {
  position: absolute;
  cursor: default;
  z-index: 4;
}
.CodeMirror-gutter-wrapper ::selection { background-color: transparent }
.CodeMirror-gutter-wrapper ::-moz-selection { background-color: transparent }

.CodeMirror-lines {
  cursor: text;
  min-height: 1px; /* prevents collapsing before first draw */
}
.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  /* Reset some styles that the rest of the page might have set */
  -moz-border-radius: 0; -webkit-border-radius: 0; border-radius: 0;
  border-width: 0;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  margin: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: inherit;
  color: inherit;
  z-index: 2;
  position: relative;
  overflow: visible;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-variant-ligatures: contextual;
  font-variant-ligatures: contextual;
}
.CodeMirror-wrap pre.CodeMirror-line,
.CodeMirror-wrap pre.CodeMirror-line-like {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal;
}

.CodeMirror-linebackground {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
}

.CodeMirror-linewidget {
  position: relative;
  z-index: 2;
  padding: 0.1px; /* Force widget margins to stay inside of the container */
}

.CodeMirror-widget {}

.CodeMirror-rtl pre { direction: rtl; }

.CodeMirror-code {
  outline: none;
}

/* Force content-box sizing for the elements where we expect it */
.CodeMirror-scroll,
.CodeMirror-sizer,
.CodeMirror-gutter,
.CodeMirror-gutters,
.CodeMirror-linenumber {
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}

.CodeMirror-measure {
  position: absolute;
  width: 100%;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}

.CodeMirror-cursor {
  position: absolute;
  pointer-events: none;
}
.CodeMirror-measure pre { position: static; }

div.CodeMirror-cursors {
  visibility: hidden;
  position: relative;
  z-index: 3;
}
div.CodeMirror-dragcursors {
  visibility: visible;
}

.CodeMirror-focused div.CodeMirror-cursors {
  visibility: visible;
}

.CodeMirror-selected { background: #d9d9d9; }
.CodeMirror-focused .CodeMirror-selected { background: #d7d4f0; }
.CodeMirror-crosshair { cursor: crosshair; }
.CodeMirror-line::selection, .CodeMirror-line > span::selection, .CodeMirror-line > span > span::selection { background: #d7d4f0; }
.CodeMirror-line::-moz-selection, .CodeMirror-line > span::-moz-selection, .CodeMirror-line > span > span::-moz-selection { background: #d7d4f0; }

.cm-searching {
  background-color: #ffa;
  background-color: rgba(255, 255, 0, .4);
}

/* Used to force a border model for a node */
.cm-force-border { padding-right: .1px; }

@media print {
  /* Hide the cursor when printing */
  .CodeMirror div.CodeMirror-cursors {
    visibility: hidden;
  }
}

/* See issue #2901 */
.cm-tab-wrap-hack:after { content: ''; }

/* Help users use markselection to safely style text background */
span.CodeMirror-selectedtext { background: none; }
</style>
`); // src/wc-codemirror.js

self.CodeMirror = codemirror_default;

class WCCodeMirror extends HTMLElement {
  static get observedAttributes() {
    return ["src"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.__initialized) {
      return;
    }

    if (oldValue !== newValue) {
      this[name] = newValue;
    }
  }

  get src() {
    return this.getAttribute("src");
  }

  set src(value) {
    this.setAttribute("src", value);
    this.setSrc();
  }

  get value() {
    return this.editor.getValue();
  }

  set value(value) {
    this.setValue(value);
  }

  constructor() {
    super();
    const template = document.createElement("template");
    template.innerHTML = WCCodeMirror.template();
    this.appendChild(template.content.cloneNode(true));
    this.__initialized = false;
    this.__element = null;
    this.editor = null;
  }

  async connectedCallback() {
    this.style.display = "block";
    this.__element = this.querySelector("textarea");
    const mode = this.hasAttribute("mode") ? this.getAttribute("mode") : "null";
    const theme = this.hasAttribute("theme") ? this.getAttribute("theme") : "default";
    let readOnly = this.getAttribute("readonly");
    if (readOnly === "") readOnly = true;else if (readOnly !== "nocursor") readOnly = false;
    let content = "";
    const innerScriptTag = this.querySelector("script");

    if (innerScriptTag) {
      if (innerScriptTag.getAttribute("type") === "wc-content") {
        content = WCCodeMirror.dedentText(innerScriptTag.innerHTML);
        content = content.replace(/&lt;(\/?script)(.*?)&gt;/g, "<$1$2>");
      }
    }

    let viewportMargin = codemirror_default.defaults.viewportMargin;

    if (this.hasAttribute("viewport-margin")) {
      const viewportMarginAttr = this.getAttribute("viewport-margin").toLowerCase();
      viewportMargin = viewportMarginAttr === "infinity" ? Infinity : parseInt(viewportMarginAttr);
    }

    this.editor = codemirror_default.fromTextArea(this.__element, {
      lineNumbers: true,
      readOnly,
      mode,
      theme,
      viewportMargin });


    if (this.hasAttribute("src")) {
      this.setSrc(this.getAttribute("src"));
    } else {
      await new Promise(resolve => setTimeout(resolve, 50));
      this.value = content;
    }

    this.__initialized = true;
  }

  async setSrc() {
    const src = this.getAttribute("src");
    const contents = await this.fetchSrc(src);
    this.value = contents;
  }

  async setValue(value) {
    this.editor.swapDoc(codemirror_default.Doc(value, this.getAttribute("mode")));
    this.editor.refresh();
  }

  async fetchSrc(src) {
    const response = await fetch(src);
    return response.text();
  }

  static template() {
    return `
      <textarea style="display:inherit; width:inherit; height:inherit;"></textarea>
    `;
  }

  static dedentText(text) {
    const lines = text.split("\n");
    if (lines[0] === "") lines.splice(0, 1);
    const initline = lines[0];
    let fwdPad = 0;
    const usingTabs = initline[0] === "	";
    const checkChar = usingTabs ? "	" : " ";

    while (true) {
      if (initline[fwdPad] === checkChar) {
        fwdPad += 1;
      } else {
        break;
      }
    }

    const fixedLines = [];

    for (const line of lines) {
      let fixedLine = line;

      for (let i = 0; i < fwdPad; i++) {
        if (fixedLine[0] === checkChar) {
          fixedLine = fixedLine.substring(1);
        } else {
          break;
        }
      }

      fixedLines.push(fixedLine);
    }

    if (fixedLines[fixedLines.length - 1] === "") fixedLines.splice(fixedLines.length - 1, 1);
    return fixedLines.join("\n");
  }}



customElements.define("wc-codemirror", WCCodeMirror);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
  return module = {
    exports: {} },
  fn(module, module.exports), module.exports;
}

var polyfill = createCommonjsModule(function (module) {
  /**
                                                        * core-js 3.1.3
                                                        * https://github.com/zloirock/core-js
                                                        * License: http://rock.mit-license.org
                                                        * © 2019 Denis Pushkarev (zloirock.ru)
                                                        */
  !function (undefined$1) {
    /******/
    (function (modules) {
      // webpackBootstrap

      /******/
      // The module cache

      /******/
      var installedModules = {};
      /******/

      /******/
      // The require function

      /******/

      function __webpack_require__(moduleId) {
        /******/

        /******/
        // Check if module is in cache

        /******/
        if (installedModules[moduleId]) {
          /******/
          return installedModules[moduleId].exports;
          /******/
        }
        /******/
        // Create a new module (and put it into the cache)

        /******/


        var module = installedModules[moduleId] = {
          /******/
          i: moduleId,

          /******/
          l: false,

          /******/
          exports: {}
          /******/ };


        /******/

        /******/
        // Execute the module function

        /******/

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/

        /******/
        // Flag the module as loaded

        /******/

        module.l = true;
        /******/

        /******/
        // Return the exports of the module

        /******/

        return module.exports;
        /******/
      }
      /******/

      /******/

      /******/
      // expose the modules object (__webpack_modules__)

      /******/


      __webpack_require__.m = modules;
      /******/

      /******/
      // expose the module cache

      /******/

      __webpack_require__.c = installedModules;
      /******/

      /******/
      // define getter function for harmony exports

      /******/

      __webpack_require__.d = function (exports, name, getter) {
        /******/
        if (!__webpack_require__.o(exports, name)) {
          /******/
          Object.defineProperty(exports, name, {
            enumerable: true,
            get: getter });

          /******/
        }
        /******/

      };
      /******/

      /******/
      // define __esModule on exports

      /******/


      __webpack_require__.r = function (exports) {
        /******/
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          /******/
          Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module' });

          /******/
        }
        /******/


        Object.defineProperty(exports, '__esModule', {
          value: true });

        /******/
      };
      /******/

      /******/
      // create a fake namespace object

      /******/
      // mode & 1: value is a module id, require it

      /******/
      // mode & 2: merge all properties of value into the ns

      /******/
      // mode & 4: return value when already ns object

      /******/
      // mode & 8|1: behave like require

      /******/


      __webpack_require__.t = function (value, mode) {
        /******/
        if (mode & 1) value = __webpack_require__(value);
        /******/

        if (mode & 8) return value;
        /******/

        if (mode & 4 && typeof value === 'object' && value && value.__esModule) return value;
        /******/

        var ns = Object.create(null);
        /******/

        __webpack_require__.r(ns);
        /******/


        Object.defineProperty(ns, 'default', {
          enumerable: true,
          value: value });

        /******/

        if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) {
          return value[key];
        }.bind(null, key));
        /******/

        return ns;
        /******/
      };
      /******/

      /******/
      // getDefaultExport function for compatibility with non-harmony modules

      /******/


      __webpack_require__.n = function (module) {
        /******/
        var getter = module && module.__esModule ?
        /******/
        function getDefault() {
          return module['default'];
        } :
        /******/
        function getModuleExports() {
          return module;
        };
        /******/

        __webpack_require__.d(getter, 'a', getter);
        /******/


        return getter;
        /******/
      };
      /******/

      /******/
      // Object.prototype.hasOwnProperty.call

      /******/


      __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      /******/

      /******/
      // __webpack_public_path__

      /******/


      __webpack_require__.p = "";
      /******/

      /******/

      /******/
      // Load entry module and return exports

      /******/

      return __webpack_require__(__webpack_require__.s = 0);
      /******/
    })(
    /************************************************************************/

    /******/
    [
    /* 0 */

    /***/
    function (module, exports, __webpack_require__) {
      __webpack_require__(1);

      __webpack_require__(56);

      __webpack_require__(57);

      __webpack_require__(58);

      __webpack_require__(59);

      __webpack_require__(60);

      __webpack_require__(61);

      __webpack_require__(62);

      __webpack_require__(63);

      __webpack_require__(64);

      __webpack_require__(65);

      __webpack_require__(66);

      __webpack_require__(67);

      __webpack_require__(68);

      __webpack_require__(69);

      __webpack_require__(70);

      __webpack_require__(74);

      __webpack_require__(77);

      __webpack_require__(82);

      __webpack_require__(84);

      __webpack_require__(85);

      __webpack_require__(86);

      __webpack_require__(87);

      __webpack_require__(89);

      __webpack_require__(90);

      __webpack_require__(92);

      __webpack_require__(100);

      __webpack_require__(101);

      __webpack_require__(102);

      __webpack_require__(103);

      __webpack_require__(111);

      __webpack_require__(112);

      __webpack_require__(114);

      __webpack_require__(115);

      __webpack_require__(116);

      __webpack_require__(118);

      __webpack_require__(119);

      __webpack_require__(120);

      __webpack_require__(121);

      __webpack_require__(122);

      __webpack_require__(123);

      __webpack_require__(126);

      __webpack_require__(127);

      __webpack_require__(128);

      __webpack_require__(129);

      __webpack_require__(135);

      __webpack_require__(136);

      __webpack_require__(138);

      __webpack_require__(139);

      __webpack_require__(140);

      __webpack_require__(142);

      __webpack_require__(143);

      __webpack_require__(145);

      __webpack_require__(146);

      __webpack_require__(148);

      __webpack_require__(149);

      __webpack_require__(150);

      __webpack_require__(151);

      __webpack_require__(158);

      __webpack_require__(160);

      __webpack_require__(161);

      __webpack_require__(162);

      __webpack_require__(164);

      __webpack_require__(165);

      __webpack_require__(167);

      __webpack_require__(168);

      __webpack_require__(170);

      __webpack_require__(171);

      __webpack_require__(172);

      __webpack_require__(173);

      __webpack_require__(174);

      __webpack_require__(175);

      __webpack_require__(176);

      __webpack_require__(177);

      __webpack_require__(178);

      __webpack_require__(179);

      __webpack_require__(180);

      __webpack_require__(183);

      __webpack_require__(184);

      __webpack_require__(186);

      __webpack_require__(188);

      __webpack_require__(189);

      __webpack_require__(190);

      __webpack_require__(191);

      __webpack_require__(192);

      __webpack_require__(194);

      __webpack_require__(196);

      __webpack_require__(199);

      __webpack_require__(200);

      __webpack_require__(202);

      __webpack_require__(203);

      __webpack_require__(205);

      __webpack_require__(206);

      __webpack_require__(207);

      __webpack_require__(208);

      __webpack_require__(210);

      __webpack_require__(211);

      __webpack_require__(212);

      __webpack_require__(213);

      __webpack_require__(214);

      __webpack_require__(215);

      __webpack_require__(216);

      __webpack_require__(218);

      __webpack_require__(219);

      __webpack_require__(220);

      __webpack_require__(221);

      __webpack_require__(222);

      __webpack_require__(223);

      __webpack_require__(224);

      __webpack_require__(225);

      __webpack_require__(226);

      __webpack_require__(227);

      __webpack_require__(229);

      __webpack_require__(230);

      __webpack_require__(231);

      __webpack_require__(232);

      __webpack_require__(240);

      __webpack_require__(241);

      __webpack_require__(242);

      __webpack_require__(243);

      __webpack_require__(244);

      __webpack_require__(245);

      __webpack_require__(246);

      __webpack_require__(247);

      __webpack_require__(248);

      __webpack_require__(249);

      __webpack_require__(250);

      __webpack_require__(251);

      __webpack_require__(252);

      __webpack_require__(253);

      __webpack_require__(254);

      __webpack_require__(257);

      __webpack_require__(259);

      __webpack_require__(260);

      __webpack_require__(261);

      __webpack_require__(262);

      __webpack_require__(264);

      __webpack_require__(267);

      __webpack_require__(268);

      __webpack_require__(269);

      __webpack_require__(270);

      __webpack_require__(274);

      __webpack_require__(275);

      __webpack_require__(278);

      __webpack_require__(279);

      __webpack_require__(280);

      __webpack_require__(281);

      __webpack_require__(282);

      __webpack_require__(283);

      __webpack_require__(284);

      __webpack_require__(285);

      __webpack_require__(287);

      __webpack_require__(288);

      __webpack_require__(289);

      __webpack_require__(292);

      __webpack_require__(293);

      __webpack_require__(294);

      __webpack_require__(295);

      __webpack_require__(296);

      __webpack_require__(297);

      __webpack_require__(298);

      __webpack_require__(299);

      __webpack_require__(300);

      __webpack_require__(301);

      __webpack_require__(302);

      __webpack_require__(303);

      __webpack_require__(304);

      __webpack_require__(309);

      __webpack_require__(310);

      __webpack_require__(311);

      __webpack_require__(312);

      __webpack_require__(313);

      __webpack_require__(314);

      __webpack_require__(315);

      __webpack_require__(316);

      __webpack_require__(317);

      __webpack_require__(318);

      __webpack_require__(319);

      __webpack_require__(320);

      __webpack_require__(321);

      __webpack_require__(322);

      __webpack_require__(323);

      __webpack_require__(324);

      __webpack_require__(325);

      __webpack_require__(326);

      __webpack_require__(327);

      __webpack_require__(328);

      __webpack_require__(329);

      __webpack_require__(330);

      __webpack_require__(331);

      __webpack_require__(332);

      __webpack_require__(333);

      __webpack_require__(334);

      __webpack_require__(335);

      __webpack_require__(336);

      __webpack_require__(337);

      __webpack_require__(338);

      __webpack_require__(339);

      __webpack_require__(340);

      __webpack_require__(341);

      __webpack_require__(342);

      __webpack_require__(344);

      __webpack_require__(345);

      __webpack_require__(347);

      __webpack_require__(348);

      __webpack_require__(349);

      __webpack_require__(350);

      __webpack_require__(355);

      module.exports = __webpack_require__(353);
      /***/
    },
    /* 1 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var has = __webpack_require__(15);

      var NATIVE_SYMBOL = __webpack_require__(42);

      var DESCRIPTORS = __webpack_require__(5);

      var IS_PURE = __webpack_require__(24);

      var redefine = __webpack_require__(21);

      var hiddenKeys = __webpack_require__(30);

      var fails = __webpack_require__(6);

      var shared = __webpack_require__(22);

      var setToStringTag = __webpack_require__(43);

      var uid = __webpack_require__(29);

      var wellKnownSymbol = __webpack_require__(44);

      var wrappedWellKnownSymbolModule = __webpack_require__(45);

      var defineWellKnownSymbol = __webpack_require__(46);

      var enumKeys = __webpack_require__(48);

      var isArray = __webpack_require__(50);

      var anObject = __webpack_require__(20);

      var isObject = __webpack_require__(14);

      var toObject = __webpack_require__(51);

      var toIndexedObject = __webpack_require__(9);

      var toPrimitive = __webpack_require__(13);

      var createPropertyDescriptor = __webpack_require__(8);

      var nativeObjectCreate = __webpack_require__(52);

      var getOwnPropertyNamesModule = __webpack_require__(33);

      var getOwnPropertyNamesExternal = __webpack_require__(55);

      var getOwnPropertyDescriptorModule = __webpack_require__(4);

      var definePropertyModule = __webpack_require__(19);

      var propertyIsEnumerableModule = __webpack_require__(7);

      var hide = __webpack_require__(18);

      var objectKeys = __webpack_require__(49);

      var getOwnPropertySymbolsModule = __webpack_require__(40);

      var sharedKey = __webpack_require__(28);

      var InternalStateModule = __webpack_require__(26);

      var HIDDEN = sharedKey('hidden');
      var SYMBOL = 'Symbol';
      var setInternalState = InternalStateModule.set;
      var getInternalState = InternalStateModule.getterFor(SYMBOL);
      var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
      var nativeDefineProperty = definePropertyModule.f;
      var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
      var $Symbol = global.Symbol;
      var JSON = global.JSON;
      var nativeJSONStringify = JSON && JSON.stringify;
      var PROTOTYPE = 'prototype';
      var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
      var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
      var SymbolRegistry = shared('symbol-registry');
      var AllSymbols = shared('symbols');
      var ObjectPrototypeSymbols = shared('op-symbols');
      var WellKnownSymbolsStore = shared('wks');
      var ObjectPrototype = Object[PROTOTYPE];
      var QObject = global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

      var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

      var setSymbolDescriptor = DESCRIPTORS && fails(function () {
        return nativeObjectCreate(nativeDefineProperty({}, 'a', {
          get: function () {
            return nativeDefineProperty(this, 'a', {
              value: 7 }).
            a;
          } })).
        a != 7;
      }) ? function (it, key, D) {
        var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, key);
        if (ObjectPrototypeDescriptor) delete ObjectPrototype[key];
        nativeDefineProperty(it, key, D);

        if (ObjectPrototypeDescriptor && it !== ObjectPrototype) {
          nativeDefineProperty(ObjectPrototype, key, ObjectPrototypeDescriptor);
        }
      } : nativeDefineProperty;

      var wrap = function wrap(tag, description) {
        var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE]);
        setInternalState(symbol, {
          type: SYMBOL,
          tag: tag,
          description: description });

        if (!DESCRIPTORS) symbol.description = description;
        return symbol;
      };

      var isSymbol = NATIVE_SYMBOL && typeof $Symbol.iterator == 'symbol' ? function (it) {
        return typeof it == 'symbol';
      } : function (it) {
        return Object(it) instanceof $Symbol;
      };

      var $defineProperty = function defineProperty(it, key, D) {
        if (it === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, key, D);
        anObject(it);
        key = toPrimitive(key, true);
        anObject(D);

        if (has(AllSymbols, key)) {
          if (!D.enumerable) {
            if (!has(it, HIDDEN)) nativeDefineProperty(it, HIDDEN, createPropertyDescriptor(1, {}));
            it[HIDDEN][key] = true;
          } else {
            if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
            D = nativeObjectCreate(D, {
              enumerable: createPropertyDescriptor(0, false) });

          }

          return setSymbolDescriptor(it, key, D);
        }

        return nativeDefineProperty(it, key, D);
      };

      var $defineProperties = function defineProperties(it, P) {
        anObject(it);
        var keys = enumKeys(P = toIndexedObject(P));
        var i = 0;
        var l = keys.length;
        var key;

        while (l > i) $defineProperty(it, key = keys[i++], P[key]);

        return it;
      };

      var $create = function create(it, P) {
        return P === undefined$1 ? nativeObjectCreate(it) : $defineProperties(nativeObjectCreate(it), P);
      };

      var $propertyIsEnumerable = function propertyIsEnumerable(key) {
        var E = nativePropertyIsEnumerable.call(this, key = toPrimitive(key, true));
        if (this === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return false;
        return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
      };

      var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
        it = toIndexedObject(it);
        key = toPrimitive(key, true);
        if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
        var D = nativeGetOwnPropertyDescriptor(it, key);
        if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
        return D;
      };

      var $getOwnPropertyNames = function getOwnPropertyNames(it) {
        var names = nativeGetOwnPropertyNames(toIndexedObject(it));
        var result = [];
        var i = 0;
        var key;

        while (names.length > i) {
          if (!has(AllSymbols, key = names[i++]) && !has(hiddenKeys, key)) result.push(key);
        }

        return result;
      };

      var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
        var IS_OP = it === ObjectPrototype;
        var names = nativeGetOwnPropertyNames(IS_OP ? ObjectPrototypeSymbols : toIndexedObject(it));
        var result = [];
        var i = 0;
        var key;

        while (names.length > i) {
          if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectPrototype, key) : true)) result.push(AllSymbols[key]);
        }

        return result;
      }; // `Symbol` constructor
      // https://tc39.github.io/ecma262/#sec-symbol-constructor


      if (!NATIVE_SYMBOL) {
        $Symbol = function Symbol() {
          if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
          var description = arguments[0] === undefined$1 ? undefined$1 : String(arguments[0]);
          var tag = uid(description);

          var setter = function setter(value) {
            if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
            if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
            setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
          };

          if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, {
            configurable: true,
            set: setter });

          return wrap(tag, description);
        };

        redefine($Symbol[PROTOTYPE], 'toString', function toString() {
          return getInternalState(this).tag;
        });
        propertyIsEnumerableModule.f = $propertyIsEnumerable;
        definePropertyModule.f = $defineProperty;
        getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
        getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
        getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

        if (DESCRIPTORS) {
          // https://github.com/tc39/proposal-Symbol-description
          nativeDefineProperty($Symbol[PROTOTYPE], 'description', {
            configurable: true,
            get: function description() {
              return getInternalState(this).description;
            } });


          if (!IS_PURE) {
            redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, {
              unsafe: true });

          }
        }

        wrappedWellKnownSymbolModule.f = function (name) {
          return wrap(wellKnownSymbol(name), name);
        };
      }

      $({
        global: true,
        wrap: true,
        forced: !NATIVE_SYMBOL,
        sham: !NATIVE_SYMBOL },
      {
        Symbol: $Symbol });


      for (var wellKnownSymbols = objectKeys(WellKnownSymbolsStore), k = 0; wellKnownSymbols.length > k;) {
        defineWellKnownSymbol(wellKnownSymbols[k++]);
      }

      $({
        target: SYMBOL,
        stat: true,
        forced: !NATIVE_SYMBOL },
      {
        // `Symbol.for` method
        // https://tc39.github.io/ecma262/#sec-symbol.for
        'for': function (key) {
          return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
        },
        // `Symbol.keyFor` method
        // https://tc39.github.io/ecma262/#sec-symbol.keyfor
        keyFor: function keyFor(sym) {
          if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');

          for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
        },
        useSetter: function () {
          USE_SETTER = true;
        },
        useSimple: function () {
          USE_SETTER = false;
        } });

      $({
        target: 'Object',
        stat: true,
        forced: !NATIVE_SYMBOL,
        sham: !DESCRIPTORS },
      {
        // `Object.create` method
        // https://tc39.github.io/ecma262/#sec-object.create
        create: $create,
        // `Object.defineProperty` method
        // https://tc39.github.io/ecma262/#sec-object.defineproperty
        defineProperty: $defineProperty,
        // `Object.defineProperties` method
        // https://tc39.github.io/ecma262/#sec-object.defineproperties
        defineProperties: $defineProperties,
        // `Object.getOwnPropertyDescriptor` method
        // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
        getOwnPropertyDescriptor: $getOwnPropertyDescriptor });

      $({
        target: 'Object',
        stat: true,
        forced: !NATIVE_SYMBOL },
      {
        // `Object.getOwnPropertyNames` method
        // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
        getOwnPropertyNames: $getOwnPropertyNames,
        // `Object.getOwnPropertySymbols` method
        // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
        getOwnPropertySymbols: $getOwnPropertySymbols });
      // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
      // https://bugs.chromium.org/p/v8/issues/detail?id=3443

      $({
        target: 'Object',
        stat: true,
        forced: fails(function () {
          getOwnPropertySymbolsModule.f(1);
        }) },
      {
        getOwnPropertySymbols: function getOwnPropertySymbols(it) {
          return getOwnPropertySymbolsModule.f(toObject(it));
        } });
      // `JSON.stringify` method behavior with symbols
      // https://tc39.github.io/ecma262/#sec-json.stringify

      JSON && $({
        target: 'JSON',
        stat: true,
        forced: !NATIVE_SYMBOL || fails(function () {
          var symbol = $Symbol(); // MS Edge converts symbol values to JSON as {}

          return nativeJSONStringify([symbol]) != '[null]' // WebKit converts symbol values to JSON as null
          || nativeJSONStringify({
            a: symbol }) !=
          '{}' // V8 throws on boxed symbols
          || nativeJSONStringify(Object(symbol)) != '{}';
        }) },
      {
        stringify: function stringify(it) {
          var args = [it];
          var i = 1;
          var replacer, $replacer;

          while (arguments.length > i) args.push(arguments[i++]);

          $replacer = replacer = args[1];
          if (!isObject(replacer) && it === undefined$1 || isSymbol(it)) return; // IE8 returns string on undefined

          if (!isArray(replacer)) replacer = function (key, value) {
            if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
            if (!isSymbol(value)) return value;
          };
          args[1] = replacer;
          return nativeJSONStringify.apply(JSON, args);
        } });
      // `Symbol.prototype[@@toPrimitive]` method
      // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive

      if (!$Symbol[PROTOTYPE][TO_PRIMITIVE]) hide($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf); // `Symbol.prototype[@@toStringTag]` property
      // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag

      setToStringTag($Symbol, SYMBOL);
      hiddenKeys[HIDDEN] = true;
      /***/
    },
    /* 2 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var getOwnPropertyDescriptor = __webpack_require__(4).f;

      var hide = __webpack_require__(18);

      var redefine = __webpack_require__(21);

      var setGlobal = __webpack_require__(23);

      var copyConstructorProperties = __webpack_require__(31);

      var isForced = __webpack_require__(41);
      /*
                                                options.target      - name of the target object
                                                options.global      - target is the global object
                                                options.stat        - export as static methods of target
                                                options.proto       - export as prototype methods of target
                                                options.real        - real prototype method for the `pure` version
                                                options.forced      - export even if the native feature is available
                                                options.bind        - bind methods to the target, required for the `pure` version
                                                options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
                                                options.unsafe      - use the simple assignment of property instead of delete + defineProperty
                                                options.sham        - add a flag to not completely full polyfills
                                                options.enumerable  - export as enumerable property
                                                options.noTargetGet - prevent calling a getter on target
                                              */


      module.exports = function (options, source) {
        var TARGET = options.target;
        var GLOBAL = options.global;
        var STATIC = options.stat;
        var FORCED, target, key, targetProperty, sourceProperty, descriptor;

        if (GLOBAL) {
          target = global;
        } else if (STATIC) {
          target = global[TARGET] || setGlobal(TARGET, {});
        } else {
          target = (global[TARGET] || {}).prototype;
        }

        if (target) for (key in source) {
          sourceProperty = source[key];

          if (options.noTargetGet) {
            descriptor = getOwnPropertyDescriptor(target, key);
            targetProperty = descriptor && descriptor.value;
          } else targetProperty = target[key];

          FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

          if (!FORCED && targetProperty !== undefined$1) {
            if (typeof sourceProperty === typeof targetProperty) continue;
            copyConstructorProperties(sourceProperty, targetProperty);
          } // add a flag to not completely full polyfills


          if (options.sham || targetProperty && targetProperty.sham) {
            hide(sourceProperty, 'sham', true);
          } // extend global


          redefine(target, key, sourceProperty, options);
        }
      };
      /***/

    },
    /* 3 */

    /***/
    function (module, exports) {
      var O = 'object';

      var check = function check(it) {
        return it && it.Math == Math && it;
      }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


      module.exports = // eslint-disable-next-line no-undef
      check(typeof globalThis == O && globalThis) || check(typeof window == O && window) || check(typeof self == O && self) || check(typeof commonjsGlobal == O && commonjsGlobal) || // eslint-disable-next-line no-new-func
      Function('return this')();
      /***/
    },
    /* 4 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var propertyIsEnumerableModule = __webpack_require__(7);

      var createPropertyDescriptor = __webpack_require__(8);

      var toIndexedObject = __webpack_require__(9);

      var toPrimitive = __webpack_require__(13);

      var has = __webpack_require__(15);

      var IE8_DOM_DEFINE = __webpack_require__(16);

      var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
        O = toIndexedObject(O);
        P = toPrimitive(P, true);
        if (IE8_DOM_DEFINE) try {
          return nativeGetOwnPropertyDescriptor(O, P);
        } catch (error) {
          /* empty */
        }
        if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
      };
      /***/
    },
    /* 5 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6); // Thank's IE8 for his funny defineProperty


      module.exports = !fails(function () {
        return Object.defineProperty({}, 'a', {
          get: function () {
            return 7;
          } }).
        a != 7;
      });
      /***/
    },
    /* 6 */

    /***/
    function (module, exports) {
      module.exports = function (exec) {
        try {
          return !!exec();
        } catch (error) {
          return true;
        }
      };
      /***/

    },
    /* 7 */

    /***/
    function (module, exports, __webpack_require__) {
      var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
      var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

      var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
        1: 2 },
      1);
      exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
        var descriptor = getOwnPropertyDescriptor(this, V);
        return !!descriptor && descriptor.enumerable;
      } : nativePropertyIsEnumerable;
      /***/
    },
    /* 8 */

    /***/
    function (module, exports) {
      module.exports = function (bitmap, value) {
        return {
          enumerable: !(bitmap & 1),
          configurable: !(bitmap & 2),
          writable: !(bitmap & 4),
          value: value };

      };
      /***/

    },
    /* 9 */

    /***/
    function (module, exports, __webpack_require__) {
      // toObject with fallback for non-array-like ES3 strings
      var IndexedObject = __webpack_require__(10);

      var requireObjectCoercible = __webpack_require__(12);

      module.exports = function (it) {
        return IndexedObject(requireObjectCoercible(it));
      };
      /***/

    },
    /* 10 */

    /***/
    function (module, exports, __webpack_require__) {
      // fallback for non-array-like ES3 and non-enumerable old V8 strings
      var fails = __webpack_require__(6);

      var classof = __webpack_require__(11);

      var split = ''.split;
      module.exports = fails(function () {
        // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
        // eslint-disable-next-line no-prototype-builtins
        return !Object('z').propertyIsEnumerable(0);
      }) ? function (it) {
        return classof(it) == 'String' ? split.call(it, '') : Object(it);
      } : Object;
      /***/
    },
    /* 11 */

    /***/
    function (module, exports) {
      var toString = {}.toString;

      module.exports = function (it) {
        return toString.call(it).slice(8, -1);
      };
      /***/

    },
    /* 12 */

    /***/
    function (module, exports) {
      // `RequireObjectCoercible` abstract operation
      // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
      module.exports = function (it) {
        if (it == undefined$1) throw TypeError("Can't call method on " + it);
        return it;
      };
      /***/

    },
    /* 13 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14); // 7.1.1 ToPrimitive(input [, PreferredType])
      // instead of the ES6 spec version, we didn't implement @@toPrimitive case
      // and the second argument - flag - preferred type is a string


      module.exports = function (it, S) {
        if (!isObject(it)) return it;
        var fn, val;
        if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
        if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
        if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
        throw TypeError("Can't convert object to primitive value");
      };
      /***/

    },
    /* 14 */

    /***/
    function (module, exports) {
      module.exports = function (it) {
        return typeof it === 'object' ? it !== null : typeof it === 'function';
      };
      /***/

    },
    /* 15 */

    /***/
    function (module, exports) {
      var hasOwnProperty = {}.hasOwnProperty;

      module.exports = function (it, key) {
        return hasOwnProperty.call(it, key);
      };
      /***/

    },
    /* 16 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var fails = __webpack_require__(6);

      var createElement = __webpack_require__(17); // Thank's IE8 for his funny defineProperty


      module.exports = !DESCRIPTORS && !fails(function () {
        return Object.defineProperty(createElement('div'), 'a', {
          get: function () {
            return 7;
          } }).
        a != 7;
      });
      /***/
    },
    /* 17 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var isObject = __webpack_require__(14);

      var document = global.document; // typeof document.createElement is 'object' in old IE

      var exist = isObject(document) && isObject(document.createElement);

      module.exports = function (it) {
        return exist ? document.createElement(it) : {};
      };
      /***/

    },
    /* 18 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var definePropertyModule = __webpack_require__(19);

      var createPropertyDescriptor = __webpack_require__(8);

      module.exports = DESCRIPTORS ? function (object, key, value) {
        return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
      } : function (object, key, value) {
        object[key] = value;
        return object;
      };
      /***/
    },
    /* 19 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var IE8_DOM_DEFINE = __webpack_require__(16);

      var anObject = __webpack_require__(20);

      var toPrimitive = __webpack_require__(13);

      var nativeDefineProperty = Object.defineProperty;
      exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
        anObject(O);
        P = toPrimitive(P, true);
        anObject(Attributes);
        if (IE8_DOM_DEFINE) try {
          return nativeDefineProperty(O, P, Attributes);
        } catch (error) {
          /* empty */
        }
        if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
        if ('value' in Attributes) O[P] = Attributes.value;
        return O;
      };
      /***/
    },
    /* 20 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14);

      module.exports = function (it) {
        if (!isObject(it)) {
          throw TypeError(String(it) + ' is not an object');
        }

        return it;
      };
      /***/

    },
    /* 21 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var shared = __webpack_require__(22);

      var hide = __webpack_require__(18);

      var has = __webpack_require__(15);

      var setGlobal = __webpack_require__(23);

      var nativeFunctionToString = __webpack_require__(25);

      var InternalStateModule = __webpack_require__(26);

      var getInternalState = InternalStateModule.get;
      var enforceInternalState = InternalStateModule.enforce;
      var TEMPLATE = String(nativeFunctionToString).split('toString');
      shared('inspectSource', function (it) {
        return nativeFunctionToString.call(it);
      });
      (module.exports = function (O, key, value, options) {
        var unsafe = options ? !!options.unsafe : false;
        var simple = options ? !!options.enumerable : false;
        var noTargetGet = options ? !!options.noTargetGet : false;

        if (typeof value == 'function') {
          if (typeof key == 'string' && !has(value, 'name')) hide(value, 'name', key);
          enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
        }

        if (O === global) {
          if (simple) O[key] = value;else setGlobal(key, value);
          return;
        } else if (!unsafe) {
          delete O[key];
        } else if (!noTargetGet && O[key]) {
          simple = true;
        }

        if (simple) O[key] = value;else hide(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
      })(Function.prototype, 'toString', function toString() {
        return typeof this == 'function' && getInternalState(this).source || nativeFunctionToString.call(this);
      });
      /***/
    },
    /* 22 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var setGlobal = __webpack_require__(23);

      var IS_PURE = __webpack_require__(24);

      var SHARED = '__core-js_shared__';
      var store = global[SHARED] || setGlobal(SHARED, {});
      (module.exports = function (key, value) {
        return store[key] || (store[key] = value !== undefined$1 ? value : {});
      })('versions', []).push({
        version: '3.1.3',
        mode: IS_PURE ? 'pure' : 'global',
        copyright: '© 2019 Denis Pushkarev (zloirock.ru)' });

      /***/
    },
    /* 23 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var hide = __webpack_require__(18);

      module.exports = function (key, value) {
        try {
          hide(global, key, value);
        } catch (error) {
          global[key] = value;
        }

        return value;
      };
      /***/

    },
    /* 24 */

    /***/
    function (module, exports) {
      module.exports = false;
      /***/
    },
    /* 25 */

    /***/
    function (module, exports, __webpack_require__) {
      var shared = __webpack_require__(22);

      module.exports = shared('native-function-to-string', Function.toString);
      /***/
    },
    /* 26 */

    /***/
    function (module, exports, __webpack_require__) {
      var NATIVE_WEAK_MAP = __webpack_require__(27);

      var global = __webpack_require__(3);

      var isObject = __webpack_require__(14);

      var hide = __webpack_require__(18);

      var objectHas = __webpack_require__(15);

      var sharedKey = __webpack_require__(28);

      var hiddenKeys = __webpack_require__(30);

      var WeakMap = global.WeakMap;
      var set, get, has;

      var enforce = function enforce(it) {
        return has(it) ? get(it) : set(it, {});
      };

      var getterFor = function getterFor(TYPE) {
        return function (it) {
          var state;

          if (!isObject(it) || (state = get(it)).type !== TYPE) {
            throw TypeError('Incompatible receiver, ' + TYPE + ' required');
          }

          return state;
        };
      };

      if (NATIVE_WEAK_MAP) {
        var store = new WeakMap();
        var wmget = store.get;
        var wmhas = store.has;
        var wmset = store.set;

        set = function (it, metadata) {
          wmset.call(store, it, metadata);
          return metadata;
        };

        get = function (it) {
          return wmget.call(store, it) || {};
        };

        has = function (it) {
          return wmhas.call(store, it);
        };
      } else {
        var STATE = sharedKey('state');
        hiddenKeys[STATE] = true;

        set = function (it, metadata) {
          hide(it, STATE, metadata);
          return metadata;
        };

        get = function (it) {
          return objectHas(it, STATE) ? it[STATE] : {};
        };

        has = function (it) {
          return objectHas(it, STATE);
        };
      }

      module.exports = {
        set: set,
        get: get,
        has: has,
        enforce: enforce,
        getterFor: getterFor };

      /***/
    },
    /* 27 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var nativeFunctionToString = __webpack_require__(25);

      var WeakMap = global.WeakMap;
      module.exports = typeof WeakMap === 'function' && /native code/.test(nativeFunctionToString.call(WeakMap));
      /***/
    },
    /* 28 */

    /***/
    function (module, exports, __webpack_require__) {
      var shared = __webpack_require__(22);

      var uid = __webpack_require__(29);

      var keys = shared('keys');

      module.exports = function (key) {
        return keys[key] || (keys[key] = uid(key));
      };
      /***/

    },
    /* 29 */

    /***/
    function (module, exports) {
      var id = 0;
      var postfix = Math.random();

      module.exports = function (key) {
        return 'Symbol('.concat(key === undefined$1 ? '' : key, ')_', (++id + postfix).toString(36));
      };
      /***/

    },
    /* 30 */

    /***/
    function (module, exports) {
      module.exports = {};
      /***/
    },
    /* 31 */

    /***/
    function (module, exports, __webpack_require__) {
      var has = __webpack_require__(15);

      var ownKeys = __webpack_require__(32);

      var getOwnPropertyDescriptorModule = __webpack_require__(4);

      var definePropertyModule = __webpack_require__(19);

      module.exports = function (target, source) {
        var keys = ownKeys(source);
        var defineProperty = definePropertyModule.f;
        var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
        }
      };
      /***/

    },
    /* 32 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var getOwnPropertyNamesModule = __webpack_require__(33);

      var getOwnPropertySymbolsModule = __webpack_require__(40);

      var anObject = __webpack_require__(20);

      var Reflect = global.Reflect; // all object keys, includes non-enumerable and symbols

      module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
        var keys = getOwnPropertyNamesModule.f(anObject(it));
        var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
        return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
      };
      /***/

    },
    /* 33 */

    /***/
    function (module, exports, __webpack_require__) {
      // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
      var internalObjectKeys = __webpack_require__(34);

      var enumBugKeys = __webpack_require__(39);

      var hiddenKeys = enumBugKeys.concat('length', 'prototype');

      exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
        return internalObjectKeys(O, hiddenKeys);
      };
      /***/

    },
    /* 34 */

    /***/
    function (module, exports, __webpack_require__) {
      var has = __webpack_require__(15);

      var toIndexedObject = __webpack_require__(9);

      var arrayIncludes = __webpack_require__(35);

      var hiddenKeys = __webpack_require__(30);

      var arrayIndexOf = arrayIncludes(false);

      module.exports = function (object, names) {
        var O = toIndexedObject(object);
        var i = 0;
        var result = [];
        var key;

        for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


        while (names.length > i) if (has(O, key = names[i++])) {
          ~arrayIndexOf(result, key) || result.push(key);
        }

        return result;
      };
      /***/

    },
    /* 35 */

    /***/
    function (module, exports, __webpack_require__) {
      var toIndexedObject = __webpack_require__(9);

      var toLength = __webpack_require__(36);

      var toAbsoluteIndex = __webpack_require__(38); // `Array.prototype.{ indexOf, includes }` methods implementation
      // false -> Array#indexOf
      // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
      // true  -> Array#includes
      // https://tc39.github.io/ecma262/#sec-array.prototype.includes


      module.exports = function (IS_INCLUDES) {
        return function ($this, el, fromIndex) {
          var O = toIndexedObject($this);
          var length = toLength(O.length);
          var index = toAbsoluteIndex(fromIndex, length);
          var value; // Array#includes uses SameValueZero equality algorithm
          // eslint-disable-next-line no-self-compare

          if (IS_INCLUDES && el != el) while (length > index) {
            value = O[index++]; // eslint-disable-next-line no-self-compare

            if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
          } else for (; length > index; index++) if (IS_INCLUDES || index in O) {
            if (O[index] === el) return IS_INCLUDES || index || 0;
          }
          return !IS_INCLUDES && -1;
        };
      };
      /***/

    },
    /* 36 */

    /***/
    function (module, exports, __webpack_require__) {
      var toInteger = __webpack_require__(37);

      var min = Math.min; // `ToLength` abstract operation
      // https://tc39.github.io/ecma262/#sec-tolength

      module.exports = function (argument) {
        return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
      };
      /***/

    },
    /* 37 */

    /***/
    function (module, exports) {
      var ceil = Math.ceil;
      var floor = Math.floor; // `ToInteger` abstract operation
      // https://tc39.github.io/ecma262/#sec-tointeger

      module.exports = function (argument) {
        return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
      };
      /***/

    },
    /* 38 */

    /***/
    function (module, exports, __webpack_require__) {
      var toInteger = __webpack_require__(37);

      var max = Math.max;
      var min = Math.min; // Helper for a popular repeating case of the spec:
      // Let integer be ? ToInteger(index).
      // If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).

      module.exports = function (index, length) {
        var integer = toInteger(index);
        return integer < 0 ? max(integer + length, 0) : min(integer, length);
      };
      /***/

    },
    /* 39 */

    /***/
    function (module, exports) {
      // IE8- don't enum bug keys
      module.exports = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];
      /***/
    },
    /* 40 */

    /***/
    function (module, exports) {
      exports.f = Object.getOwnPropertySymbols;
      /***/
    },
    /* 41 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      var replacement = /#|\.prototype\./;

      var isForced = function isForced(feature, detection) {
        var value = data[normalize(feature)];
        return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
      };

      var normalize = isForced.normalize = function (string) {
        return String(string).replace(replacement, '.').toLowerCase();
      };

      var data = isForced.data = {};
      var NATIVE = isForced.NATIVE = 'N';
      var POLYFILL = isForced.POLYFILL = 'P';
      module.exports = isForced;
      /***/
    },
    /* 42 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
        // Chrome 38 Symbol has incorrect toString conversion
        // eslint-disable-next-line no-undef
        return !String(Symbol());
      });
      /***/
    },
    /* 43 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineProperty = __webpack_require__(19).f;

      var has = __webpack_require__(15);

      var wellKnownSymbol = __webpack_require__(44);

      var TO_STRING_TAG = wellKnownSymbol('toStringTag');

      module.exports = function (it, TAG, STATIC) {
        if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
          defineProperty(it, TO_STRING_TAG, {
            configurable: true,
            value: TAG });

        }
      };
      /***/

    },
    /* 44 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var shared = __webpack_require__(22);

      var uid = __webpack_require__(29);

      var NATIVE_SYMBOL = __webpack_require__(42);

      var Symbol = global.Symbol;
      var store = shared('wks');

      module.exports = function (name) {
        return store[name] || (store[name] = NATIVE_SYMBOL && Symbol[name] || (NATIVE_SYMBOL ? Symbol : uid)('Symbol.' + name));
      };
      /***/

    },
    /* 45 */

    /***/
    function (module, exports, __webpack_require__) {
      exports.f = __webpack_require__(44);
      /***/
    },
    /* 46 */

    /***/
    function (module, exports, __webpack_require__) {
      var path = __webpack_require__(47);

      var has = __webpack_require__(15);

      var wrappedWellKnownSymbolModule = __webpack_require__(45);

      var defineProperty = __webpack_require__(19).f;

      module.exports = function (NAME) {
        var Symbol = path.Symbol || (path.Symbol = {});
        if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
          value: wrappedWellKnownSymbolModule.f(NAME) });

      };
      /***/

    },
    /* 47 */

    /***/
    function (module, exports, __webpack_require__) {
      module.exports = __webpack_require__(3);
      /***/
    },
    /* 48 */

    /***/
    function (module, exports, __webpack_require__) {
      var objectKeys = __webpack_require__(49);

      var getOwnPropertySymbolsModule = __webpack_require__(40);

      var propertyIsEnumerableModule = __webpack_require__(7); // all enumerable object keys, includes symbols


      module.exports = function (it) {
        var result = objectKeys(it);
        var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;

        if (getOwnPropertySymbols) {
          var symbols = getOwnPropertySymbols(it);
          var propertyIsEnumerable = propertyIsEnumerableModule.f;
          var i = 0;
          var key;

          while (symbols.length > i) if (propertyIsEnumerable.call(it, key = symbols[i++])) result.push(key);
        }

        return result;
      };
      /***/

    },
    /* 49 */

    /***/
    function (module, exports, __webpack_require__) {
      var internalObjectKeys = __webpack_require__(34);

      var enumBugKeys = __webpack_require__(39); // 19.1.2.14 / 15.2.3.14 Object.keys(O)


      module.exports = Object.keys || function keys(O) {
        return internalObjectKeys(O, enumBugKeys);
      };
      /***/

    },
    /* 50 */

    /***/
    function (module, exports, __webpack_require__) {
      var classof = __webpack_require__(11); // `IsArray` abstract operation
      // https://tc39.github.io/ecma262/#sec-isarray


      module.exports = Array.isArray || function isArray(arg) {
        return classof(arg) == 'Array';
      };
      /***/

    },
    /* 51 */

    /***/
    function (module, exports, __webpack_require__) {
      var requireObjectCoercible = __webpack_require__(12); // `ToObject` abstract operation
      // https://tc39.github.io/ecma262/#sec-toobject


      module.exports = function (argument) {
        return Object(requireObjectCoercible(argument));
      };
      /***/

    },
    /* 52 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20);

      var defineProperties = __webpack_require__(53);

      var enumBugKeys = __webpack_require__(39);

      var hiddenKeys = __webpack_require__(30);

      var html = __webpack_require__(54);

      var documentCreateElement = __webpack_require__(17);

      var sharedKey = __webpack_require__(28);

      var IE_PROTO = sharedKey('IE_PROTO');
      var PROTOTYPE = 'prototype';

      var Empty = function Empty() {
        /* empty */
      }; // Create object with fake `null` prototype: use iframe Object with cleared prototype


      var _createDict = function createDict() {
        // Thrash, waste and sodomy: IE GC bug
        var iframe = documentCreateElement('iframe');
        var length = enumBugKeys.length;
        var lt = '<';
        var script = 'script';
        var gt = '>';
        var js = 'java' + script + ':';
        var iframeDocument;
        iframe.style.display = 'none';
        html.appendChild(iframe);
        iframe.src = String(js);
        iframeDocument = iframe.contentWindow.document;
        iframeDocument.open();
        iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
        iframeDocument.close();
        _createDict = iframeDocument.F;

        while (length--) delete _createDict[PROTOTYPE][enumBugKeys[length]];

        return _createDict();
      }; // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])


      module.exports = Object.create || function create(O, Properties) {
        var result;

        if (O !== null) {
          Empty[PROTOTYPE] = anObject(O);
          result = new Empty();
          Empty[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

          result[IE_PROTO] = O;
        } else result = _createDict();

        return Properties === undefined$1 ? result : defineProperties(result, Properties);
      };

      hiddenKeys[IE_PROTO] = true;
      /***/
    },
    /* 53 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var definePropertyModule = __webpack_require__(19);

      var anObject = __webpack_require__(20);

      var objectKeys = __webpack_require__(49);

      module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
        anObject(O);
        var keys = objectKeys(Properties);
        var length = keys.length;
        var i = 0;
        var key;

        while (length > i) definePropertyModule.f(O, key = keys[i++], Properties[key]);

        return O;
      };
      /***/
    },
    /* 54 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var document = global.document;
      module.exports = document && document.documentElement;
      /***/
    },
    /* 55 */

    /***/
    function (module, exports, __webpack_require__) {
      var toIndexedObject = __webpack_require__(9);

      var nativeGetOwnPropertyNames = __webpack_require__(33).f;

      var toString = {}.toString;
      var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

      var getWindowNames = function getWindowNames(it) {
        try {
          return nativeGetOwnPropertyNames(it);
        } catch (error) {
          return windowNames.slice();
        }
      }; // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window


      module.exports.f = function getOwnPropertyNames(it) {
        return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : nativeGetOwnPropertyNames(toIndexedObject(it));
      };
      /***/

    },
    /* 56 */

    /***/
    function (module, exports, __webpack_require__) {
      // `Symbol.prototype.description` getter
      // https://tc39.github.io/ecma262/#sec-symbol.prototype.description
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var global = __webpack_require__(3);

      var has = __webpack_require__(15);

      var isObject = __webpack_require__(14);

      var defineProperty = __webpack_require__(19).f;

      var copyConstructorProperties = __webpack_require__(31);

      var NativeSymbol = global.Symbol;

      if (DESCRIPTORS && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) || // Safari 12 bug
      NativeSymbol().description !== undefined$1)) {
        var EmptyStringDescriptionStore = {}; // wrap Symbol constructor for correct work with undefined description

        var SymbolWrapper = function Symbol() {
          var description = arguments.length < 1 || arguments[0] === undefined$1 ? undefined$1 : String(arguments[0]);
          var result = this instanceof SymbolWrapper ? new NativeSymbol(description) // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
          : description === undefined$1 ? NativeSymbol() : NativeSymbol(description);
          if (description === '') EmptyStringDescriptionStore[result] = true;
          return result;
        };

        copyConstructorProperties(SymbolWrapper, NativeSymbol);
        var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
        symbolPrototype.constructor = SymbolWrapper;
        var symbolToString = symbolPrototype.toString;
        var native = String(NativeSymbol('test')) == 'Symbol(test)';
        var regexp = /^Symbol\((.*)\)[^)]+$/;
        defineProperty(symbolPrototype, 'description', {
          configurable: true,
          get: function description() {
            var symbol = isObject(this) ? this.valueOf() : this;
            var string = symbolToString.call(symbol);
            if (has(EmptyStringDescriptionStore, symbol)) return '';
            var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
            return desc === '' ? undefined$1 : desc;
          } });

        $({
          global: true,
          forced: true },
        {
          Symbol: SymbolWrapper });

      }
      /***/

    },
    /* 57 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.asyncIterator` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.asynciterator


      defineWellKnownSymbol('asyncIterator');
      /***/
    },
    /* 58 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.hasInstance` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.hasinstance


      defineWellKnownSymbol('hasInstance');
      /***/
    },
    /* 59 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.isConcatSpreadable` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.isconcatspreadable


      defineWellKnownSymbol('isConcatSpreadable');
      /***/
    },
    /* 60 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.iterator` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.iterator


      defineWellKnownSymbol('iterator');
      /***/
    },
    /* 61 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.match` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.match


      defineWellKnownSymbol('match');
      /***/
    },
    /* 62 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.matchAll` well-known symbol


      defineWellKnownSymbol('matchAll');
      /***/
    },
    /* 63 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.replace` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.replace


      defineWellKnownSymbol('replace');
      /***/
    },
    /* 64 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.search` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.search


      defineWellKnownSymbol('search');
      /***/
    },
    /* 65 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.species` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.species


      defineWellKnownSymbol('species');
      /***/
    },
    /* 66 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.split` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.split


      defineWellKnownSymbol('split');
      /***/
    },
    /* 67 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.toPrimitive` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.toprimitive


      defineWellKnownSymbol('toPrimitive');
      /***/
    },
    /* 68 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.toStringTag` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.tostringtag


      defineWellKnownSymbol('toStringTag');
      /***/
    },
    /* 69 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineWellKnownSymbol = __webpack_require__(46); // `Symbol.unscopables` well-known symbol
      // https://tc39.github.io/ecma262/#sec-symbol.unscopables


      defineWellKnownSymbol('unscopables');
      /***/
    },
    /* 70 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var isArray = __webpack_require__(50);

      var isObject = __webpack_require__(14);

      var toObject = __webpack_require__(51);

      var toLength = __webpack_require__(36);

      var createProperty = __webpack_require__(71);

      var arraySpeciesCreate = __webpack_require__(72);

      var arrayMethodHasSpeciesSupport = __webpack_require__(73);

      var wellKnownSymbol = __webpack_require__(44);

      var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
      var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
      var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';
      var IS_CONCAT_SPREADABLE_SUPPORT = !fails(function () {
        var array = [];
        array[IS_CONCAT_SPREADABLE] = false;
        return array.concat()[0] !== array;
      });
      var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

      var isConcatSpreadable = function isConcatSpreadable(O) {
        if (!isObject(O)) return false;
        var spreadable = O[IS_CONCAT_SPREADABLE];
        return spreadable !== undefined$1 ? !!spreadable : isArray(O);
      };

      var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.concat
      // with adding support of @@isConcatSpreadable and @@species

      $({
        target: 'Array',
        proto: true,
        forced: FORCED },
      {
        concat: function concat(arg) {
          // eslint-disable-line no-unused-vars
          var O = toObject(this);
          var A = arraySpeciesCreate(O, 0);
          var n = 0;
          var i, k, length, len, E;

          for (i = -1, length = arguments.length; i < length; i++) {
            E = i === -1 ? O : arguments[i];

            if (isConcatSpreadable(E)) {
              len = toLength(E.length);
              if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

              for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
            } else {
              if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
              createProperty(A, n++, E);
            }
          }

          A.length = n;
          return A;
        } });

      /***/
    },
    /* 71 */

    /***/
    function (module, exports, __webpack_require__) {
      var toPrimitive = __webpack_require__(13);

      var definePropertyModule = __webpack_require__(19);

      var createPropertyDescriptor = __webpack_require__(8);

      module.exports = function (object, key, value) {
        var propertyKey = toPrimitive(key);
        if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
      };
      /***/

    },
    /* 72 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14);

      var isArray = __webpack_require__(50);

      var wellKnownSymbol = __webpack_require__(44);

      var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
      // https://tc39.github.io/ecma262/#sec-arrayspeciescreate

      module.exports = function (originalArray, length) {
        var C;

        if (isArray(originalArray)) {
          C = originalArray.constructor; // cross-realm fallback

          if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined$1;else if (isObject(C)) {
            C = C[SPECIES];
            if (C === null) C = undefined$1;
          }
        }

        return new (C === undefined$1 ? Array : C)(length === 0 ? 0 : length);
      };
      /***/

    },
    /* 73 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      var wellKnownSymbol = __webpack_require__(44);

      var SPECIES = wellKnownSymbol('species');

      module.exports = function (METHOD_NAME) {
        return !fails(function () {
          var array = [];
          var constructor = array.constructor = {};

          constructor[SPECIES] = function () {
            return {
              foo: 1 };

          };

          return array[METHOD_NAME](Boolean).foo !== 1;
        });
      };
      /***/

    },
    /* 74 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var copyWithin = __webpack_require__(75);

      var addToUnscopables = __webpack_require__(76); // `Array.prototype.copyWithin` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.copywithin


      $({
        target: 'Array',
        proto: true },
      {
        copyWithin: copyWithin });
      // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

      addToUnscopables('copyWithin');
      /***/
    },
    /* 75 */

    /***/
    function (module, exports, __webpack_require__) {
      var toObject = __webpack_require__(51);

      var toAbsoluteIndex = __webpack_require__(38);

      var toLength = __webpack_require__(36); // `Array.prototype.copyWithin` method implementation
      // https://tc39.github.io/ecma262/#sec-array.prototype.copywithin


      module.exports = [].copyWithin || function copyWithin(target
      /* = 0 */,
      start
      /* = 0, end = @length */)
      {
        var O = toObject(this);
        var len = toLength(O.length);
        var to = toAbsoluteIndex(target, len);
        var from = toAbsoluteIndex(start, len);
        var end = arguments.length > 2 ? arguments[2] : undefined$1;
        var count = Math.min((end === undefined$1 ? len : toAbsoluteIndex(end, len)) - from, len - to);
        var inc = 1;

        if (from < to && to < from + count) {
          inc = -1;
          from += count - 1;
          to += count - 1;
        }

        while (count-- > 0) {
          if (from in O) O[to] = O[from];else delete O[to];
          to += inc;
          from += inc;
        }

        return O;
      };
      /***/

    },
    /* 76 */

    /***/
    function (module, exports, __webpack_require__) {
      var wellKnownSymbol = __webpack_require__(44);

      var create = __webpack_require__(52);

      var hide = __webpack_require__(18);

      var UNSCOPABLES = wellKnownSymbol('unscopables');
      var ArrayPrototype = Array.prototype; // Array.prototype[@@unscopables]
      // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

      if (ArrayPrototype[UNSCOPABLES] == undefined$1) {
        hide(ArrayPrototype, UNSCOPABLES, create(null));
      } // add a key to Array.prototype[@@unscopables]


      module.exports = function (key) {
        ArrayPrototype[UNSCOPABLES][key] = true;
      };
      /***/

    },
    /* 77 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var arrayMethods = __webpack_require__(78);

      var sloppyArrayMethod = __webpack_require__(81);

      var internalEvery = arrayMethods(4);
      var SLOPPY_METHOD = sloppyArrayMethod('every'); // `Array.prototype.every` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.every

      $({
        target: 'Array',
        proto: true,
        forced: SLOPPY_METHOD },
      {
        every: function every(callbackfn
        /* , thisArg */)
        {
          return internalEvery(this, callbackfn, arguments[1]);
        } });

      /***/
    },
    /* 78 */

    /***/
    function (module, exports, __webpack_require__) {
      var bind = __webpack_require__(79);

      var IndexedObject = __webpack_require__(10);

      var toObject = __webpack_require__(51);

      var toLength = __webpack_require__(36);

      var arraySpeciesCreate = __webpack_require__(72); // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
      // 0 -> Array#forEach
      // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
      // 1 -> Array#map
      // https://tc39.github.io/ecma262/#sec-array.prototype.map
      // 2 -> Array#filter
      // https://tc39.github.io/ecma262/#sec-array.prototype.filter
      // 3 -> Array#some
      // https://tc39.github.io/ecma262/#sec-array.prototype.some
      // 4 -> Array#every
      // https://tc39.github.io/ecma262/#sec-array.prototype.every
      // 5 -> Array#find
      // https://tc39.github.io/ecma262/#sec-array.prototype.find
      // 6 -> Array#findIndex
      // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex


      module.exports = function (TYPE, specificCreate) {
        var IS_MAP = TYPE == 1;
        var IS_FILTER = TYPE == 2;
        var IS_SOME = TYPE == 3;
        var IS_EVERY = TYPE == 4;
        var IS_FIND_INDEX = TYPE == 6;
        var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
        var create = specificCreate || arraySpeciesCreate;
        return function ($this, callbackfn, that) {
          var O = toObject($this);
          var self = IndexedObject(O);
          var boundFunction = bind(callbackfn, that, 3);
          var length = toLength(self.length);
          var index = 0;
          var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined$1;
          var value, result;

          for (; length > index; index++) if (NO_HOLES || index in self) {
            value = self[index];
            result = boundFunction(value, index, O);

            if (TYPE) {
              if (IS_MAP) target[index] = result; // map
              else if (result) switch (TYPE) {
                  case 3:
                    return true;
                  // some

                  case 5:
                    return value;
                  // find

                  case 6:
                    return index;
                  // findIndex

                  case 2:
                    target.push(value);
                  // filter
                } else if (IS_EVERY) return false; // every
            }
          }

          return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
        };
      };
      /***/

    },
    /* 79 */

    /***/
    function (module, exports, __webpack_require__) {
      var aFunction = __webpack_require__(80); // optional / simple context binding


      module.exports = function (fn, that, length) {
        aFunction(fn);
        if (that === undefined$1) return fn;

        switch (length) {
          case 0:
            return function () {
              return fn.call(that);
            };

          case 1:
            return function (a) {
              return fn.call(that, a);
            };

          case 2:
            return function (a, b) {
              return fn.call(that, a, b);
            };

          case 3:
            return function (a, b, c) {
              return fn.call(that, a, b, c);
            };}


        return function ()
        /* ...args */
        {
          return fn.apply(that, arguments);
        };
      };
      /***/

    },
    /* 80 */

    /***/
    function (module, exports) {
      module.exports = function (it) {
        if (typeof it != 'function') {
          throw TypeError(String(it) + ' is not a function');
        }

        return it;
      };
      /***/

    },
    /* 81 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      module.exports = function (METHOD_NAME, argument) {
        var method = [][METHOD_NAME];
        return !method || !fails(function () {
          // eslint-disable-next-line no-useless-call,no-throw-literal
          method.call(null, argument || function () {
            throw 1;
          }, 1);
        });
      };
      /***/

    },
    /* 82 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fill = __webpack_require__(83);

      var addToUnscopables = __webpack_require__(76); // `Array.prototype.fill` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.fill


      $({
        target: 'Array',
        proto: true },
      {
        fill: fill });
      // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

      addToUnscopables('fill');
      /***/
    },
    /* 83 */

    /***/
    function (module, exports, __webpack_require__) {
      var toObject = __webpack_require__(51);

      var toAbsoluteIndex = __webpack_require__(38);

      var toLength = __webpack_require__(36); // `Array.prototype.fill` method implementation
      // https://tc39.github.io/ecma262/#sec-array.prototype.fill


      module.exports = function fill(value
      /* , start = 0, end = @length */)
      {
        var O = toObject(this);
        var length = toLength(O.length);
        var argumentsLength = arguments.length;
        var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined$1, length);
        var end = argumentsLength > 2 ? arguments[2] : undefined$1;
        var endPos = end === undefined$1 ? length : toAbsoluteIndex(end, length);

        while (endPos > index) O[index++] = value;

        return O;
      };
      /***/

    },
    /* 84 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var arrayMethods = __webpack_require__(78);

      var arrayMethodHasSpeciesSupport = __webpack_require__(73);

      var internalFilter = arrayMethods(2);
      var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter'); // `Array.prototype.filter` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.filter
      // with adding support of @@species

      $({
        target: 'Array',
        proto: true,
        forced: !SPECIES_SUPPORT },
      {
        filter: function filter(callbackfn
        /* , thisArg */)
        {
          return internalFilter(this, callbackfn, arguments[1]);
        } });

      /***/
    },
    /* 85 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var arrayMethods = __webpack_require__(78);

      var addToUnscopables = __webpack_require__(76);

      var internalFind = arrayMethods(5);
      var FIND = 'find';
      var SKIPS_HOLES = true; // Shouldn't skip holes

      if (FIND in []) Array(1)[FIND](function () {
        SKIPS_HOLES = false;
      }); // `Array.prototype.find` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.find

      $({
        target: 'Array',
        proto: true,
        forced: SKIPS_HOLES },
      {
        find: function find(callbackfn
        /* , that = undefined */)
        {
          return internalFind(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined$1);
        } });
      // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

      addToUnscopables(FIND);
      /***/
    },
    /* 86 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var arrayMethods = __webpack_require__(78);

      var addToUnscopables = __webpack_require__(76);

      var internalFindIndex = arrayMethods(6);
      var FIND_INDEX = 'findIndex';
      var SKIPS_HOLES = true; // Shouldn't skip holes

      if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () {
        SKIPS_HOLES = false;
      }); // `Array.prototype.findIndex` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.findindex

      $({
        target: 'Array',
        proto: true,
        forced: SKIPS_HOLES },
      {
        findIndex: function findIndex(callbackfn
        /* , that = undefined */)
        {
          return internalFindIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined$1);
        } });
      // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

      addToUnscopables(FIND_INDEX);
      /***/
    },
    /* 87 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var flattenIntoArray = __webpack_require__(88);

      var toObject = __webpack_require__(51);

      var toLength = __webpack_require__(36);

      var toInteger = __webpack_require__(37);

      var arraySpeciesCreate = __webpack_require__(72); // `Array.prototype.flat` method
      // https://github.com/tc39/proposal-flatMap


      $({
        target: 'Array',
        proto: true },
      {
        flat: function flat()
        /* depthArg = 1 */
        {
          var depthArg = arguments[0];
          var O = toObject(this);
          var sourceLen = toLength(O.length);
          var A = arraySpeciesCreate(O, 0);
          A.length = flattenIntoArray(A, O, O, sourceLen, 0, depthArg === undefined$1 ? 1 : toInteger(depthArg));
          return A;
        } });

      /***/
    },
    /* 88 */

    /***/
    function (module, exports, __webpack_require__) {
      var isArray = __webpack_require__(50);

      var toLength = __webpack_require__(36);

      var bind = __webpack_require__(79); // `FlattenIntoArray` abstract operation
      // https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray


      var flattenIntoArray = function flattenIntoArray(target, original, source, sourceLen, start, depth, mapper, thisArg) {
        var targetIndex = start;
        var sourceIndex = 0;
        var mapFn = mapper ? bind(mapper, thisArg, 3) : false;
        var element;

        while (sourceIndex < sourceLen) {
          if (sourceIndex in source) {
            element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

            if (depth > 0 && isArray(element)) {
              targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
            } else {
              if (targetIndex >= 0x1FFFFFFFFFFFFF) throw TypeError('Exceed the acceptable array length');
              target[targetIndex] = element;
            }

            targetIndex++;
          }

          sourceIndex++;
        }

        return targetIndex;
      };

      module.exports = flattenIntoArray;
      /***/
    },
    /* 89 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var flattenIntoArray = __webpack_require__(88);

      var toObject = __webpack_require__(51);

      var toLength = __webpack_require__(36);

      var aFunction = __webpack_require__(80);

      var arraySpeciesCreate = __webpack_require__(72); // `Array.prototype.flatMap` method
      // https://github.com/tc39/proposal-flatMap


      $({
        target: 'Array',
        proto: true },
      {
        flatMap: function flatMap(callbackfn
        /* , thisArg */)
        {
          var O = toObject(this);
          var sourceLen = toLength(O.length);
          var A;
          aFunction(callbackfn);
          A = arraySpeciesCreate(O, 0);
          A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);
          return A;
        } });

      /***/
    },
    /* 90 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var forEach = __webpack_require__(91); // `Array.prototype.forEach` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.foreach


      $({
        target: 'Array',
        proto: true,
        forced: [].forEach != forEach },
      {
        forEach: forEach });

      /***/
    },
    /* 91 */

    /***/
    function (module, exports, __webpack_require__) {
      var arrayMethods = __webpack_require__(78);

      var sloppyArrayMethod = __webpack_require__(81);

      var internalForEach = arrayMethods(0);
      var SLOPPY_METHOD = sloppyArrayMethod('forEach'); // `Array.prototype.forEach` method implementation
      // https://tc39.github.io/ecma262/#sec-array.prototype.foreach

      module.exports = SLOPPY_METHOD ? function forEach(callbackfn
      /* , thisArg */)
      {
        return internalForEach(this, callbackfn, arguments[1]);
      } : [].forEach;
      /***/
    },
    /* 92 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var from = __webpack_require__(93);

      var checkCorrectnessOfIteration = __webpack_require__(99);

      var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {}); // `Array.from` method
      // https://tc39.github.io/ecma262/#sec-array.from

      $({
        target: 'Array',
        stat: true,
        forced: INCORRECT_ITERATION },
      {
        from: from });

      /***/
    },
    /* 93 */

    /***/
    function (module, exports, __webpack_require__) {
      var bind = __webpack_require__(79);

      var toObject = __webpack_require__(51);

      var callWithSafeIterationClosing = __webpack_require__(94);

      var isArrayIteratorMethod = __webpack_require__(95);

      var toLength = __webpack_require__(36);

      var createProperty = __webpack_require__(71);

      var getIteratorMethod = __webpack_require__(97); // `Array.from` method
      // https://tc39.github.io/ecma262/#sec-array.from


      module.exports = function from(arrayLike
      /* , mapfn = undefined, thisArg = undefined */)
      {
        var O = toObject(arrayLike);
        var C = typeof this == 'function' ? this : Array;
        var argumentsLength = arguments.length;
        var mapfn = argumentsLength > 1 ? arguments[1] : undefined$1;
        var mapping = mapfn !== undefined$1;
        var index = 0;
        var iteratorMethod = getIteratorMethod(O);
        var length, result, step, iterator;
        if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined$1, 2); // if the target is not iterable or it's an array with the default iterator - use a simple case

        if (iteratorMethod != undefined$1 && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
          iterator = iteratorMethod.call(O);
          result = new C();

          for (; !(step = iterator.next()).done; index++) {
            createProperty(result, index, mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value);
          }
        } else {
          length = toLength(O.length);
          result = new C(length);

          for (; length > index; index++) {
            createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
          }
        }

        result.length = index;
        return result;
      };
      /***/

    },
    /* 94 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20); // call something on iterator step with safe closing on error


      module.exports = function (iterator, fn, value, ENTRIES) {
        try {
          return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
        } catch (error) {
          var returnMethod = iterator['return'];
          if (returnMethod !== undefined$1) anObject(returnMethod.call(iterator));
          throw error;
        }
      };
      /***/

    },
    /* 95 */

    /***/
    function (module, exports, __webpack_require__) {
      var wellKnownSymbol = __webpack_require__(44);

      var Iterators = __webpack_require__(96);

      var ITERATOR = wellKnownSymbol('iterator');
      var ArrayPrototype = Array.prototype; // check on default Array iterator

      module.exports = function (it) {
        return it !== undefined$1 && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
      };
      /***/

    },
    /* 96 */

    /***/
    function (module, exports) {
      module.exports = {};
      /***/
    },
    /* 97 */

    /***/
    function (module, exports, __webpack_require__) {
      var classof = __webpack_require__(98);

      var Iterators = __webpack_require__(96);

      var wellKnownSymbol = __webpack_require__(44);

      var ITERATOR = wellKnownSymbol('iterator');

      module.exports = function (it) {
        if (it != undefined$1) return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
      };
      /***/

    },
    /* 98 */

    /***/
    function (module, exports, __webpack_require__) {
      var classofRaw = __webpack_require__(11);

      var wellKnownSymbol = __webpack_require__(44);

      var TO_STRING_TAG = wellKnownSymbol('toStringTag'); // ES3 wrong here

      var CORRECT_ARGUMENTS = classofRaw(function () {
        return arguments;
      }()) == 'Arguments'; // fallback for IE11 Script Access Denied error

      var tryGet = function tryGet(it, key) {
        try {
          return it[key];
        } catch (error) {
          /* empty */
        }
      }; // getting tag from ES6+ `Object.prototype.toString`


      module.exports = function (it) {
        var O, tag, result;
        return it === undefined$1 ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
        : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag // builtinTag case
        : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
        : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
      };
      /***/

    },
    /* 99 */

    /***/
    function (module, exports, __webpack_require__) {
      var wellKnownSymbol = __webpack_require__(44);

      var ITERATOR = wellKnownSymbol('iterator');
      var SAFE_CLOSING = false;

      try {
        var called = 0;
        var iteratorWithReturn = {
          next: function () {
            return {
              done: !!called++ };

          },
          'return': function () {
            SAFE_CLOSING = true;
          } };


        iteratorWithReturn[ITERATOR] = function () {
          return this;
        }; // eslint-disable-next-line no-throw-literal


        Array.from(iteratorWithReturn, function () {
          throw 2;
        });
      } catch (error) {
        /* empty */
      }

      module.exports = function (exec, SKIP_CLOSING) {
        if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
        var ITERATION_SUPPORT = false;

        try {
          var object = {};

          object[ITERATOR] = function () {
            return {
              next: function () {
                return {
                  done: ITERATION_SUPPORT = true };

              } };

          };

          exec(object);
        } catch (error) {
          /* empty */
        }

        return ITERATION_SUPPORT;
      };
      /***/

    },
    /* 100 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var arrayIncludes = __webpack_require__(35);

      var addToUnscopables = __webpack_require__(76);

      var internalIncludes = arrayIncludes(true); // `Array.prototype.includes` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.includes

      $({
        target: 'Array',
        proto: true },
      {
        includes: function includes(el
        /* , fromIndex = 0 */)
        {
          return internalIncludes(this, el, arguments.length > 1 ? arguments[1] : undefined$1);
        } });
      // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

      addToUnscopables('includes');
      /***/
    },
    /* 101 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var sloppyArrayMethod = __webpack_require__(81);

      var arrayIncludes = __webpack_require__(35);

      var internalIndexOf = arrayIncludes(false);
      var nativeIndexOf = [].indexOf;
      var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
      var SLOPPY_METHOD = sloppyArrayMethod('indexOf'); // `Array.prototype.indexOf` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.indexof

      $({
        target: 'Array',
        proto: true,
        forced: NEGATIVE_ZERO || SLOPPY_METHOD },
      {
        indexOf: function indexOf(searchElement
        /* , fromIndex = 0 */)
        {
          return NEGATIVE_ZERO // convert -0 to +0
          ? nativeIndexOf.apply(this, arguments) || 0 : internalIndexOf(this, searchElement, arguments[1]);
        } });

      /***/
    },
    /* 102 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var isArray = __webpack_require__(50); // `Array.isArray` method
      // https://tc39.github.io/ecma262/#sec-array.isarray


      $({
        target: 'Array',
        stat: true },
      {
        isArray: isArray });

      /***/
    },
    /* 103 */

    /***/
    function (module, exports, __webpack_require__) {
      var toIndexedObject = __webpack_require__(9);

      var addToUnscopables = __webpack_require__(76);

      var Iterators = __webpack_require__(96);

      var InternalStateModule = __webpack_require__(26);

      var defineIterator = __webpack_require__(104);

      var ARRAY_ITERATOR = 'Array Iterator';
      var setInternalState = InternalStateModule.set;
      var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR); // `Array.prototype.entries` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.entries
      // `Array.prototype.keys` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.keys
      // `Array.prototype.values` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.values
      // `Array.prototype[@@iterator]` method
      // https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
      // `CreateArrayIterator` internal method
      // https://tc39.github.io/ecma262/#sec-createarrayiterator

      module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
        setInternalState(this, {
          type: ARRAY_ITERATOR,
          target: toIndexedObject(iterated),
          // target
          index: 0,
          // next index
          kind: kind // kind
        });
        // `%ArrayIteratorPrototype%.next` method
        // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
      }, function () {
        var state = getInternalState(this);
        var target = state.target;
        var kind = state.kind;
        var index = state.index++;

        if (!target || index >= target.length) {
          state.target = undefined$1;
          return {
            value: undefined$1,
            done: true };

        }

        if (kind == 'keys') return {
          value: index,
          done: false };

        if (kind == 'values') return {
          value: target[index],
          done: false };

        return {
          value: [index, target[index]],
          done: false };

      }, 'values'); // argumentsList[@@iterator] is %ArrayProto_values%
      // https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
      // https://tc39.github.io/ecma262/#sec-createmappedargumentsobject

      Iterators.Arguments = Iterators.Array; // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

      addToUnscopables('keys');
      addToUnscopables('values');
      addToUnscopables('entries');
      /***/
    },
    /* 104 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createIteratorConstructor = __webpack_require__(105);

      var getPrototypeOf = __webpack_require__(107);

      var setPrototypeOf = __webpack_require__(109);

      var setToStringTag = __webpack_require__(43);

      var hide = __webpack_require__(18);

      var redefine = __webpack_require__(21);

      var wellKnownSymbol = __webpack_require__(44);

      var IS_PURE = __webpack_require__(24);

      var Iterators = __webpack_require__(96);

      var IteratorsCore = __webpack_require__(106);

      var IteratorPrototype = IteratorsCore.IteratorPrototype;
      var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
      var ITERATOR = wellKnownSymbol('iterator');
      var KEYS = 'keys';
      var VALUES = 'values';
      var ENTRIES = 'entries';

      var returnThis = function returnThis() {
        return this;
      };

      module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
        createIteratorConstructor(IteratorConstructor, NAME, next);

        var getIterationMethod = function getIterationMethod(KIND) {
          if (KIND === DEFAULT && defaultIterator) return defaultIterator;
          if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];

          switch (KIND) {
            case KEYS:
              return function keys() {
                return new IteratorConstructor(this, KIND);
              };

            case VALUES:
              return function values() {
                return new IteratorConstructor(this, KIND);
              };

            case ENTRIES:
              return function entries() {
                return new IteratorConstructor(this, KIND);
              };}


          return function () {
            return new IteratorConstructor(this);
          };
        };

        var TO_STRING_TAG = NAME + ' Iterator';
        var INCORRECT_VALUES_NAME = false;
        var IterablePrototype = Iterable.prototype;
        var nativeIterator = IterablePrototype[ITERATOR] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
        var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
        var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
        var CurrentIteratorPrototype, methods, KEY; // fix native

        if (anyNativeIterator) {
          CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));

          if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
            if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
              if (setPrototypeOf) {
                setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
              } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
                hide(CurrentIteratorPrototype, ITERATOR, returnThis);
              }
            } // Set @@toStringTag to native iterators


            setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
            if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
          }
        } // fix Array#{values, @@iterator}.name in V8 / FF


        if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
          INCORRECT_VALUES_NAME = true;

          defaultIterator = function values() {
            return nativeIterator.call(this);
          };
        } // define iterator


        if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
          hide(IterablePrototype, ITERATOR, defaultIterator);
        }

        Iterators[NAME] = defaultIterator; // export additional methods

        if (DEFAULT) {
          methods = {
            values: getIterationMethod(VALUES),
            keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
            entries: getIterationMethod(ENTRIES) };

          if (FORCED) for (KEY in methods) {
            if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
              redefine(IterablePrototype, KEY, methods[KEY]);
            }
          } else $({
            target: NAME,
            proto: true,
            forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME },
          methods);
        }

        return methods;
      };
      /***/

    },
    /* 105 */

    /***/
    function (module, exports, __webpack_require__) {
      var IteratorPrototype = __webpack_require__(106).IteratorPrototype;

      var create = __webpack_require__(52);

      var createPropertyDescriptor = __webpack_require__(8);

      var setToStringTag = __webpack_require__(43);

      var Iterators = __webpack_require__(96);

      var returnThis = function returnThis() {
        return this;
      };

      module.exports = function (IteratorConstructor, NAME, next) {
        var TO_STRING_TAG = NAME + ' Iterator';
        IteratorConstructor.prototype = create(IteratorPrototype, {
          next: createPropertyDescriptor(1, next) });

        setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
        Iterators[TO_STRING_TAG] = returnThis;
        return IteratorConstructor;
      };
      /***/

    },
    /* 106 */

    /***/
    function (module, exports, __webpack_require__) {
      var getPrototypeOf = __webpack_require__(107);

      var hide = __webpack_require__(18);

      var has = __webpack_require__(15);

      var wellKnownSymbol = __webpack_require__(44);

      var IS_PURE = __webpack_require__(24);

      var ITERATOR = wellKnownSymbol('iterator');
      var BUGGY_SAFARI_ITERATORS = false;

      var returnThis = function returnThis() {
        return this;
      }; // `%IteratorPrototype%` object
      // https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object


      var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

      if ([].keys) {
        arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

        if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
          PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
          if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
        }
      }

      if (IteratorPrototype == undefined$1) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

      if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
      module.exports = {
        IteratorPrototype: IteratorPrototype,
        BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS };

      /***/
    },
    /* 107 */

    /***/
    function (module, exports, __webpack_require__) {
      var has = __webpack_require__(15);

      var toObject = __webpack_require__(51);

      var sharedKey = __webpack_require__(28);

      var CORRECT_PROTOTYPE_GETTER = __webpack_require__(108);

      var IE_PROTO = sharedKey('IE_PROTO');
      var ObjectPrototype = Object.prototype; // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)

      module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
        O = toObject(O);
        if (has(O, IE_PROTO)) return O[IE_PROTO];

        if (typeof O.constructor == 'function' && O instanceof O.constructor) {
          return O.constructor.prototype;
        }

        return O instanceof Object ? ObjectPrototype : null;
      };
      /***/
    },
    /* 108 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      module.exports = !fails(function () {
        function F() {
          /* empty */
        }

        F.prototype.constructor = null;
        return Object.getPrototypeOf(new F()) !== F.prototype;
      });
      /***/
    },
    /* 109 */

    /***/
    function (module, exports, __webpack_require__) {
      var validateSetPrototypeOfArguments = __webpack_require__(110); // Works with __proto__ only. Old v8 can't work with null proto objects.

      /* eslint-disable no-proto */


      module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
        var correctSetter = false;
        var test = {};
        var setter;

        try {
          setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
          setter.call(test, []);
          correctSetter = test instanceof Array;
        } catch (error) {
          /* empty */
        }

        return function setPrototypeOf(O, proto) {
          validateSetPrototypeOfArguments(O, proto);
          if (correctSetter) setter.call(O, proto);else O.__proto__ = proto;
          return O;
        };
      }() : undefined$1);
      /***/
    },
    /* 110 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14);

      var anObject = __webpack_require__(20);

      module.exports = function (O, proto) {
        anObject(O);

        if (!isObject(proto) && proto !== null) {
          throw TypeError("Can't set " + String(proto) + ' as a prototype');
        }
      };
      /***/

    },
    /* 111 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var IndexedObject = __webpack_require__(10);

      var toIndexedObject = __webpack_require__(9);

      var sloppyArrayMethod = __webpack_require__(81);

      var nativeJoin = [].join;
      var ES3_STRINGS = IndexedObject != Object;
      var SLOPPY_METHOD = sloppyArrayMethod('join', ','); // `Array.prototype.join` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.join

      $({
        target: 'Array',
        proto: true,
        forced: ES3_STRINGS || SLOPPY_METHOD },
      {
        join: function join(separator) {
          return nativeJoin.call(toIndexedObject(this), separator === undefined$1 ? ',' : separator);
        } });

      /***/
    },
    /* 112 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var lastIndexOf = __webpack_require__(113); // `Array.prototype.lastIndexOf` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof


      $({
        target: 'Array',
        proto: true,
        forced: lastIndexOf !== [].lastIndexOf },
      {
        lastIndexOf: lastIndexOf });

      /***/
    },
    /* 113 */

    /***/
    function (module, exports, __webpack_require__) {
      var toIndexedObject = __webpack_require__(9);

      var toInteger = __webpack_require__(37);

      var toLength = __webpack_require__(36);

      var sloppyArrayMethod = __webpack_require__(81);

      var nativeLastIndexOf = [].lastIndexOf;
      var NEGATIVE_ZERO = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
      var SLOPPY_METHOD = sloppyArrayMethod('lastIndexOf'); // `Array.prototype.lastIndexOf` method implementation
      // https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

      module.exports = NEGATIVE_ZERO || SLOPPY_METHOD ? function lastIndexOf(searchElement
      /* , fromIndex = @[*-1] */)
      {
        // convert -0 to +0
        if (NEGATIVE_ZERO) return nativeLastIndexOf.apply(this, arguments) || 0;
        var O = toIndexedObject(this);
        var length = toLength(O.length);
        var index = length - 1;
        if (arguments.length > 1) index = Math.min(index, toInteger(arguments[1]));
        if (index < 0) index = length + index;

        for (; index >= 0; index--) if (index in O) if (O[index] === searchElement) return index || 0;

        return -1;
      } : nativeLastIndexOf;
      /***/
    },
    /* 114 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var arrayMethods = __webpack_require__(78);

      var arrayMethodHasSpeciesSupport = __webpack_require__(73);

      var internalMap = arrayMethods(1);
      var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map'); // `Array.prototype.map` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.map
      // with adding support of @@species

      $({
        target: 'Array',
        proto: true,
        forced: !SPECIES_SUPPORT },
      {
        map: function map(callbackfn
        /* , thisArg */)
        {
          return internalMap(this, callbackfn, arguments[1]);
        } });

      /***/
    },
    /* 115 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var createProperty = __webpack_require__(71);

      var ISNT_GENERIC = fails(function () {
        function F() {
          /* empty */
        }

        return !(Array.of.call(F) instanceof F);
      }); // `Array.of` method
      // https://tc39.github.io/ecma262/#sec-array.of
      // WebKit Array.of isn't generic

      $({
        target: 'Array',
        stat: true,
        forced: ISNT_GENERIC },
      {
        of: function of()
        /* ...args */
        {
          var index = 0;
          var argumentsLength = arguments.length;
          var result = new (typeof this == 'function' ? this : Array)(argumentsLength);

          while (argumentsLength > index) createProperty(result, index, arguments[index++]);

          result.length = argumentsLength;
          return result;
        } });

      /***/
    },
    /* 116 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalReduce = __webpack_require__(117);

      var sloppyArrayMethod = __webpack_require__(81);

      var SLOPPY_METHOD = sloppyArrayMethod('reduce'); // `Array.prototype.reduce` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.reduce

      $({
        target: 'Array',
        proto: true,
        forced: SLOPPY_METHOD },
      {
        reduce: function reduce(callbackfn
        /* , initialValue */)
        {
          return internalReduce(this, callbackfn, arguments.length, arguments[1], false);
        } });

      /***/
    },
    /* 117 */

    /***/
    function (module, exports, __webpack_require__) {
      var aFunction = __webpack_require__(80);

      var toObject = __webpack_require__(51);

      var IndexedObject = __webpack_require__(10);

      var toLength = __webpack_require__(36); // `Array.prototype.{ reduce, reduceRight }` methods implementation
      // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
      // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright


      module.exports = function (that, callbackfn, argumentsLength, memo, isRight) {
        aFunction(callbackfn);
        var O = toObject(that);
        var self = IndexedObject(O);
        var length = toLength(O.length);
        var index = isRight ? length - 1 : 0;
        var i = isRight ? -1 : 1;
        if (argumentsLength < 2) while (true) {
          if (index in self) {
            memo = self[index];
            index += i;
            break;
          }

          index += i;

          if (isRight ? index < 0 : length <= index) {
            throw TypeError('Reduce of empty array with no initial value');
          }
        }

        for (; isRight ? index >= 0 : length > index; index += i) if (index in self) {
          memo = callbackfn(memo, self[index], index, O);
        }

        return memo;
      };
      /***/

    },
    /* 118 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalReduce = __webpack_require__(117);

      var sloppyArrayMethod = __webpack_require__(81);

      var SLOPPY_METHOD = sloppyArrayMethod('reduceRight'); // `Array.prototype.reduceRight` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright

      $({
        target: 'Array',
        proto: true,
        forced: SLOPPY_METHOD },
      {
        reduceRight: function reduceRight(callbackfn
        /* , initialValue */)
        {
          return internalReduce(this, callbackfn, arguments.length, arguments[1], true);
        } });

      /***/
    },
    /* 119 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var isArray = __webpack_require__(50);

      var nativeReverse = [].reverse;
      var test = [1, 2]; // `Array.prototype.reverse` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
      // fix for Safari 12.0 bug
      // https://bugs.webkit.org/show_bug.cgi?id=188794

      $({
        target: 'Array',
        proto: true,
        forced: String(test) === String(test.reverse()) },
      {
        reverse: function reverse() {
          if (isArray(this)) this.length = this.length;
          return nativeReverse.call(this);
        } });

      /***/
    },
    /* 120 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var isObject = __webpack_require__(14);

      var isArray = __webpack_require__(50);

      var toAbsoluteIndex = __webpack_require__(38);

      var toLength = __webpack_require__(36);

      var toIndexedObject = __webpack_require__(9);

      var createProperty = __webpack_require__(71);

      var arrayMethodHasSpeciesSupport = __webpack_require__(73);

      var wellKnownSymbol = __webpack_require__(44);

      var SPECIES = wellKnownSymbol('species');
      var nativeSlice = [].slice;
      var max = Math.max;
      var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice'); // `Array.prototype.slice` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.slice
      // fallback for not array-like ES3 strings and DOM objects

      $({
        target: 'Array',
        proto: true,
        forced: !SPECIES_SUPPORT },
      {
        slice: function slice(start, end) {
          var O = toIndexedObject(this);
          var length = toLength(O.length);
          var k = toAbsoluteIndex(start, length);
          var fin = toAbsoluteIndex(end === undefined$1 ? length : end, length); // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible

          var Constructor, result, n;

          if (isArray(O)) {
            Constructor = O.constructor; // cross-realm fallback

            if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
              Constructor = undefined$1;
            } else if (isObject(Constructor)) {
              Constructor = Constructor[SPECIES];
              if (Constructor === null) Constructor = undefined$1;
            }

            if (Constructor === Array || Constructor === undefined$1) {
              return nativeSlice.call(O, k, fin);
            }
          }

          result = new (Constructor === undefined$1 ? Array : Constructor)(max(fin - k, 0));

          for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);

          result.length = n;
          return result;
        } });

      /***/
    },
    /* 121 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var arrayMethods = __webpack_require__(78);

      var sloppyArrayMethod = __webpack_require__(81);

      var internalSome = arrayMethods(3);
      var SLOPPY_METHOD = sloppyArrayMethod('some'); // `Array.prototype.some` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.some

      $({
        target: 'Array',
        proto: true,
        forced: SLOPPY_METHOD },
      {
        some: function some(callbackfn
        /* , thisArg */)
        {
          return internalSome(this, callbackfn, arguments[1]);
        } });

      /***/
    },
    /* 122 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var aFunction = __webpack_require__(80);

      var toObject = __webpack_require__(51);

      var fails = __webpack_require__(6);

      var sloppyArrayMethod = __webpack_require__(81);

      var nativeSort = [].sort;
      var test = [1, 2, 3]; // IE8-

      var FAILS_ON_UNDEFINED = fails(function () {
        test.sort(undefined$1);
      }); // V8 bug

      var FAILS_ON_NULL = fails(function () {
        test.sort(null);
      }); // Old WebKit

      var SLOPPY_METHOD = sloppyArrayMethod('sort');
      var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || SLOPPY_METHOD; // `Array.prototype.sort` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.sort

      $({
        target: 'Array',
        proto: true,
        forced: FORCED },
      {
        sort: function sort(comparefn) {
          return comparefn === undefined$1 ? nativeSort.call(toObject(this)) : nativeSort.call(toObject(this), aFunction(comparefn));
        } });

      /***/
    },
    /* 123 */

    /***/
    function (module, exports, __webpack_require__) {
      var setSpecies = __webpack_require__(124); // `Array[@@species]` getter
      // https://tc39.github.io/ecma262/#sec-get-array-@@species


      setSpecies('Array');
      /***/
    },
    /* 124 */

    /***/
    function (module, exports, __webpack_require__) {
      var getBuiltIn = __webpack_require__(125);

      var definePropertyModule = __webpack_require__(19);

      var wellKnownSymbol = __webpack_require__(44);

      var DESCRIPTORS = __webpack_require__(5);

      var SPECIES = wellKnownSymbol('species');

      module.exports = function (CONSTRUCTOR_NAME) {
        var C = getBuiltIn(CONSTRUCTOR_NAME);
        var defineProperty = definePropertyModule.f;
        if (DESCRIPTORS && C && !C[SPECIES]) defineProperty(C, SPECIES, {
          configurable: true,
          get: function () {
            return this;
          } });

      };
      /***/

    },
    /* 125 */

    /***/
    function (module, exports, __webpack_require__) {
      var path = __webpack_require__(47);

      var global = __webpack_require__(3);

      var aFunction = function aFunction(variable) {
        return typeof variable == 'function' ? variable : undefined$1;
      };

      module.exports = function (namespace, method) {
        return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace]) : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
      };
      /***/

    },
    /* 126 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toAbsoluteIndex = __webpack_require__(38);

      var toInteger = __webpack_require__(37);

      var toLength = __webpack_require__(36);

      var toObject = __webpack_require__(51);

      var arraySpeciesCreate = __webpack_require__(72);

      var createProperty = __webpack_require__(71);

      var arrayMethodHasSpeciesSupport = __webpack_require__(73);

      var max = Math.max;
      var min = Math.min;
      var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
      var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';
      var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice'); // `Array.prototype.splice` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.splice
      // with adding support of @@species

      $({
        target: 'Array',
        proto: true,
        forced: !SPECIES_SUPPORT },
      {
        splice: function splice(start, deleteCount
        /* , ...items */)
        {
          var O = toObject(this);
          var len = toLength(O.length);
          var actualStart = toAbsoluteIndex(start, len);
          var argumentsLength = arguments.length;
          var insertCount, actualDeleteCount, A, k, from, to;

          if (argumentsLength === 0) {
            insertCount = actualDeleteCount = 0;
          } else if (argumentsLength === 1) {
            insertCount = 0;
            actualDeleteCount = len - actualStart;
          } else {
            insertCount = argumentsLength - 2;
            actualDeleteCount = min(max(toInteger(deleteCount), 0), len - actualStart);
          }

          if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
            throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
          }

          A = arraySpeciesCreate(O, actualDeleteCount);

          for (k = 0; k < actualDeleteCount; k++) {
            from = actualStart + k;
            if (from in O) createProperty(A, k, O[from]);
          }

          A.length = actualDeleteCount;

          if (insertCount < actualDeleteCount) {
            for (k = actualStart; k < len - actualDeleteCount; k++) {
              from = k + actualDeleteCount;
              to = k + insertCount;
              if (from in O) O[to] = O[from];else delete O[to];
            }

            for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
          } else if (insertCount > actualDeleteCount) {
            for (k = len - actualDeleteCount; k > actualStart; k--) {
              from = k + actualDeleteCount - 1;
              to = k + insertCount - 1;
              if (from in O) O[to] = O[from];else delete O[to];
            }
          }

          for (k = 0; k < insertCount; k++) {
            O[k + actualStart] = arguments[k + 2];
          }

          O.length = len - actualDeleteCount + insertCount;
          return A;
        } });

      /***/
    },
    /* 127 */

    /***/
    function (module, exports, __webpack_require__) {
      // this method was added to unscopables after implementation
      // in popular engines, so it's moved to a separate module
      var addToUnscopables = __webpack_require__(76);

      addToUnscopables('flat');
      /***/
    },
    /* 128 */

    /***/
    function (module, exports, __webpack_require__) {
      // this method was added to unscopables after implementation
      // in popular engines, so it's moved to a separate module
      var addToUnscopables = __webpack_require__(76);

      addToUnscopables('flatMap');
      /***/
    },
    /* 129 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var arrayBufferModule = __webpack_require__(130);

      var setSpecies = __webpack_require__(124);

      var ARRAY_BUFFER = 'ArrayBuffer';
      var ArrayBuffer = arrayBufferModule[ARRAY_BUFFER];
      var NativeArrayBuffer = global[ARRAY_BUFFER]; // `ArrayBuffer` constructor
      // https://tc39.github.io/ecma262/#sec-arraybuffer-constructor

      $({
        global: true,
        forced: NativeArrayBuffer !== ArrayBuffer },
      {
        ArrayBuffer: ArrayBuffer });

      setSpecies(ARRAY_BUFFER);
      /***/
    },
    /* 130 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var DESCRIPTORS = __webpack_require__(5);

      var NATIVE_ARRAY_BUFFER = __webpack_require__(131).NATIVE_ARRAY_BUFFER;

      var hide = __webpack_require__(18);

      var redefineAll = __webpack_require__(132);

      var fails = __webpack_require__(6);

      var anInstance = __webpack_require__(133);

      var toInteger = __webpack_require__(37);

      var toLength = __webpack_require__(36);

      var toIndex = __webpack_require__(134);

      var getOwnPropertyNames = __webpack_require__(33).f;

      var defineProperty = __webpack_require__(19).f;

      var arrayFill = __webpack_require__(83);

      var setToStringTag = __webpack_require__(43);

      var InternalStateModule = __webpack_require__(26);

      var getInternalState = InternalStateModule.get;
      var setInternalState = InternalStateModule.set;
      var ARRAY_BUFFER = 'ArrayBuffer';
      var DATA_VIEW = 'DataView';
      var PROTOTYPE = 'prototype';
      var WRONG_LENGTH = 'Wrong length';
      var WRONG_INDEX = 'Wrong index';
      var NativeArrayBuffer = global[ARRAY_BUFFER];
      var $ArrayBuffer = NativeArrayBuffer;
      var $DataView = global[DATA_VIEW];
      var Math = global.Math;
      var RangeError = global.RangeError; // eslint-disable-next-line no-shadow-restricted-names

      var Infinity = 1 / 0;
      var abs = Math.abs;
      var pow = Math.pow;
      var floor = Math.floor;
      var log = Math.log;
      var LN2 = Math.LN2; // IEEE754 conversions based on https://github.com/feross/ieee754

      var packIEEE754 = function packIEEE754(number, mantissaLength, bytes) {
        var buffer = new Array(bytes);
        var exponentLength = bytes * 8 - mantissaLength - 1;
        var eMax = (1 << exponentLength) - 1;
        var eBias = eMax >> 1;
        var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
        var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
        var index = 0;
        var exponent, mantissa, c;
        number = abs(number); // eslint-disable-next-line no-self-compare

        if (number != number || number === Infinity) {
          // eslint-disable-next-line no-self-compare
          mantissa = number != number ? 1 : 0;
          exponent = eMax;
        } else {
          exponent = floor(log(number) / LN2);

          if (number * (c = pow(2, -exponent)) < 1) {
            exponent--;
            c *= 2;
          }

          if (exponent + eBias >= 1) {
            number += rt / c;
          } else {
            number += rt * pow(2, 1 - eBias);
          }

          if (number * c >= 2) {
            exponent++;
            c /= 2;
          }

          if (exponent + eBias >= eMax) {
            mantissa = 0;
            exponent = eMax;
          } else if (exponent + eBias >= 1) {
            mantissa = (number * c - 1) * pow(2, mantissaLength);
            exponent = exponent + eBias;
          } else {
            mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
            exponent = 0;
          }
        }

        for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);

        exponent = exponent << mantissaLength | mantissa;
        exponentLength += mantissaLength;

        for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);

        buffer[--index] |= sign * 128;
        return buffer;
      };

      var unpackIEEE754 = function unpackIEEE754(buffer, mantissaLength) {
        var bytes = buffer.length;
        var exponentLength = bytes * 8 - mantissaLength - 1;
        var eMax = (1 << exponentLength) - 1;
        var eBias = eMax >> 1;
        var nBits = exponentLength - 7;
        var index = bytes - 1;
        var sign = buffer[index--];
        var exponent = sign & 127;
        var mantissa;
        sign >>= 7;

        for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);

        mantissa = exponent & (1 << -nBits) - 1;
        exponent >>= -nBits;
        nBits += mantissaLength;

        for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);

        if (exponent === 0) {
          exponent = 1 - eBias;
        } else if (exponent === eMax) {
          return mantissa ? NaN : sign ? -Infinity : Infinity;
        } else {
          mantissa = mantissa + pow(2, mantissaLength);
          exponent = exponent - eBias;
        }

        return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
      };

      var unpackInt32 = function unpackInt32(buffer) {
        return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
      };

      var packInt8 = function packInt8(number) {
        return [number & 0xFF];
      };

      var packInt16 = function packInt16(number) {
        return [number & 0xFF, number >> 8 & 0xFF];
      };

      var packInt32 = function packInt32(number) {
        return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
      };

      var packFloat32 = function packFloat32(number) {
        return packIEEE754(number, 23, 4);
      };

      var packFloat64 = function packFloat64(number) {
        return packIEEE754(number, 52, 8);
      };

      var addGetter = function addGetter(Constructor, key) {
        defineProperty(Constructor[PROTOTYPE], key, {
          get: function () {
            return getInternalState(this)[key];
          } });

      };

      var get = function get(view, count, index, isLittleEndian) {
        var numIndex = +index;
        var intIndex = toIndex(numIndex);
        var store = getInternalState(view);
        if (intIndex + count > store.byteLength) throw RangeError(WRONG_INDEX);
        var bytes = getInternalState(store.buffer).bytes;
        var start = intIndex + store.byteOffset;
        var pack = bytes.slice(start, start + count);
        return isLittleEndian ? pack : pack.reverse();
      };

      var set = function set(view, count, index, conversion, value, isLittleEndian) {
        var numIndex = +index;
        var intIndex = toIndex(numIndex);
        var store = getInternalState(view);
        if (intIndex + count > store.byteLength) throw RangeError(WRONG_INDEX);
        var bytes = getInternalState(store.buffer).bytes;
        var start = intIndex + store.byteOffset;
        var pack = conversion(+value);

        for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
      };

      if (!NATIVE_ARRAY_BUFFER) {
        $ArrayBuffer = function ArrayBuffer(length) {
          anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
          var byteLength = toIndex(length);
          setInternalState(this, {
            bytes: arrayFill.call(new Array(byteLength), 0),
            byteLength: byteLength });

          if (!DESCRIPTORS) this.byteLength = byteLength;
        };

        $DataView = function DataView(buffer, byteOffset, byteLength) {
          anInstance(this, $DataView, DATA_VIEW);
          anInstance(buffer, $ArrayBuffer, DATA_VIEW);
          var bufferLength = getInternalState(buffer).byteLength;
          var offset = toInteger(byteOffset);
          if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset');
          byteLength = byteLength === undefined$1 ? bufferLength - offset : toLength(byteLength);
          if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
          setInternalState(this, {
            buffer: buffer,
            byteLength: byteLength,
            byteOffset: offset });


          if (!DESCRIPTORS) {
            this.buffer = buffer;
            this.byteLength = byteLength;
            this.byteOffset = offset;
          }
        };

        if (DESCRIPTORS) {
          addGetter($ArrayBuffer, 'byteLength');
          addGetter($DataView, 'buffer');
          addGetter($DataView, 'byteLength');
          addGetter($DataView, 'byteOffset');
        }

        redefineAll($DataView[PROTOTYPE], {
          getInt8: function getInt8(byteOffset) {
            return get(this, 1, byteOffset)[0] << 24 >> 24;
          },
          getUint8: function getUint8(byteOffset) {
            return get(this, 1, byteOffset)[0];
          },
          getInt16: function getInt16(byteOffset
          /* , littleEndian */)
          {
            var bytes = get(this, 2, byteOffset, arguments[1]);
            return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
          },
          getUint16: function getUint16(byteOffset
          /* , littleEndian */)
          {
            var bytes = get(this, 2, byteOffset, arguments[1]);
            return bytes[1] << 8 | bytes[0];
          },
          getInt32: function getInt32(byteOffset
          /* , littleEndian */)
          {
            return unpackInt32(get(this, 4, byteOffset, arguments[1]));
          },
          getUint32: function getUint32(byteOffset
          /* , littleEndian */)
          {
            return unpackInt32(get(this, 4, byteOffset, arguments[1])) >>> 0;
          },
          getFloat32: function getFloat32(byteOffset
          /* , littleEndian */)
          {
            return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23);
          },
          getFloat64: function getFloat64(byteOffset
          /* , littleEndian */)
          {
            return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52);
          },
          setInt8: function setInt8(byteOffset, value) {
            set(this, 1, byteOffset, packInt8, value);
          },
          setUint8: function setUint8(byteOffset, value) {
            set(this, 1, byteOffset, packInt8, value);
          },
          setInt16: function setInt16(byteOffset, value
          /* , littleEndian */)
          {
            set(this, 2, byteOffset, packInt16, value, arguments[2]);
          },
          setUint16: function setUint16(byteOffset, value
          /* , littleEndian */)
          {
            set(this, 2, byteOffset, packInt16, value, arguments[2]);
          },
          setInt32: function setInt32(byteOffset, value
          /* , littleEndian */)
          {
            set(this, 4, byteOffset, packInt32, value, arguments[2]);
          },
          setUint32: function setUint32(byteOffset, value
          /* , littleEndian */)
          {
            set(this, 4, byteOffset, packInt32, value, arguments[2]);
          },
          setFloat32: function setFloat32(byteOffset, value
          /* , littleEndian */)
          {
            set(this, 4, byteOffset, packFloat32, value, arguments[2]);
          },
          setFloat64: function setFloat64(byteOffset, value
          /* , littleEndian */)
          {
            set(this, 8, byteOffset, packFloat64, value, arguments[2]);
          } });

      } else {
        if (!fails(function () {
          NativeArrayBuffer(1);
        }) || !fails(function () {
          new NativeArrayBuffer(-1); // eslint-disable-line no-new
        }) || fails(function () {
          new NativeArrayBuffer(); // eslint-disable-line no-new

          new NativeArrayBuffer(1.5); // eslint-disable-line no-new

          new NativeArrayBuffer(NaN); // eslint-disable-line no-new

          return NativeArrayBuffer.name != ARRAY_BUFFER;
        })) {
          $ArrayBuffer = function ArrayBuffer(length) {
            anInstance(this, $ArrayBuffer);
            return new NativeArrayBuffer(toIndex(length));
          };

          var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE] = NativeArrayBuffer[PROTOTYPE];

          for (var keys = getOwnPropertyNames(NativeArrayBuffer), j = 0, key; keys.length > j;) {
            if (!((key = keys[j++]) in $ArrayBuffer)) hide($ArrayBuffer, key, NativeArrayBuffer[key]);
          }

          ArrayBufferPrototype.constructor = $ArrayBuffer;
        } // iOS Safari 7.x bug


        var testView = new $DataView(new $ArrayBuffer(2));
        var nativeSetInt8 = $DataView[PROTOTYPE].setInt8;
        testView.setInt8(0, 2147483648);
        testView.setInt8(1, 2147483649);
        if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataView[PROTOTYPE], {
          setInt8: function setInt8(byteOffset, value) {
            nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
          },
          setUint8: function setUint8(byteOffset, value) {
            nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
          } },
        {
          unsafe: true });

      }

      setToStringTag($ArrayBuffer, ARRAY_BUFFER);
      setToStringTag($DataView, DATA_VIEW);
      exports[ARRAY_BUFFER] = $ArrayBuffer;
      exports[DATA_VIEW] = $DataView;
      /***/
    },
    /* 131 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var global = __webpack_require__(3);

      var isObject = __webpack_require__(14);

      var has = __webpack_require__(15);

      var classof = __webpack_require__(98);

      var hide = __webpack_require__(18);

      var redefine = __webpack_require__(21);

      var defineProperty = __webpack_require__(19).f;

      var getPrototypeOf = __webpack_require__(107);

      var setPrototypeOf = __webpack_require__(109);

      var wellKnownSymbol = __webpack_require__(44);

      var uid = __webpack_require__(29);

      var DataView = global.DataView;
      var DataViewPrototype = DataView && DataView.prototype;
      var Int8Array = global.Int8Array;
      var Int8ArrayPrototype = Int8Array && Int8Array.prototype;
      var Uint8ClampedArray = global.Uint8ClampedArray;
      var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
      var TypedArray = Int8Array && getPrototypeOf(Int8Array);
      var TypedArrayPrototype = Int8ArrayPrototype && getPrototypeOf(Int8ArrayPrototype);
      var ObjectPrototype = Object.prototype;
      var isPrototypeOf = ObjectPrototype.isPrototypeOf;
      var TO_STRING_TAG = wellKnownSymbol('toStringTag');
      var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
      var NATIVE_ARRAY_BUFFER = !!(global.ArrayBuffer && global.DataView);
      var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER && !!setPrototypeOf;
      var TYPED_ARRAY_TAG_REQIRED = false;
      var NAME;
      var TypedArrayConstructorsList = {
        Int8Array: 1,
        Uint8Array: 1,
        Uint8ClampedArray: 1,
        Int16Array: 2,
        Uint16Array: 2,
        Int32Array: 4,
        Uint32Array: 4,
        Float32Array: 4,
        Float64Array: 8 };


      var isView = function isView(it) {
        var klass = classof(it);
        return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
      };

      var isTypedArray = function isTypedArray(it) {
        return isObject(it) && has(TypedArrayConstructorsList, classof(it));
      };

      var aTypedArray = function aTypedArray(it) {
        if (isTypedArray(it)) return it;
        throw TypeError('Target is not a typed array');
      };

      var aTypedArrayConstructor = function aTypedArrayConstructor(C) {
        if (setPrototypeOf) {
          if (isPrototypeOf.call(TypedArray, C)) return C;
        } else for (var ARRAY in TypedArrayConstructorsList) if (has(TypedArrayConstructorsList, NAME)) {
          var TypedArrayConstructor = global[ARRAY];

          if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
            return C;
          }
        }

        throw TypeError('Target is not a typed array constructor');
      };

      var exportProto = function exportProto(KEY, property, forced) {
        if (!DESCRIPTORS) return;
        if (forced) for (var ARRAY in TypedArrayConstructorsList) {
          var TypedArrayConstructor = global[ARRAY];

          if (TypedArrayConstructor && has(TypedArrayConstructor.prototype, KEY)) {
            delete TypedArrayConstructor.prototype[KEY];
          }
        }

        if (!TypedArrayPrototype[KEY] || forced) {
          redefine(TypedArrayPrototype, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property);
        }
      };

      var exportStatic = function exportStatic(KEY, property, forced) {
        var ARRAY, TypedArrayConstructor;
        if (!DESCRIPTORS) return;

        if (setPrototypeOf) {
          if (forced) for (ARRAY in TypedArrayConstructorsList) {
            TypedArrayConstructor = global[ARRAY];

            if (TypedArrayConstructor && has(TypedArrayConstructor, KEY)) {
              delete TypedArrayConstructor[KEY];
            }
          }

          if (!TypedArray[KEY] || forced) {
            // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
            try {
              return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8Array[KEY] || property);
            } catch (error) {
              /* empty */
            }
          } else return;
        }

        for (ARRAY in TypedArrayConstructorsList) {
          TypedArrayConstructor = global[ARRAY];

          if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
            redefine(TypedArrayConstructor, KEY, property);
          }
        }
      };

      for (NAME in TypedArrayConstructorsList) {
        if (!global[NAME]) NATIVE_ARRAY_BUFFER_VIEWS = false;
      } // WebKit bug - typed arrays constructors prototype is Object.prototype


      if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
        // eslint-disable-next-line no-shadow
        TypedArray = function TypedArray() {
          throw TypeError('Incorrect invocation');
        };

        if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
          if (global[NAME]) setPrototypeOf(global[NAME], TypedArray);
        }
      }

      if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype) {
        TypedArrayPrototype = TypedArray.prototype;
        if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
          if (global[NAME]) setPrototypeOf(global[NAME].prototype, TypedArrayPrototype);
        }
      } // WebKit bug - one more object in Uint8ClampedArray prototype chain


      if (NATIVE_ARRAY_BUFFER_VIEWS && getPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
        setPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
      }

      if (DESCRIPTORS && !has(TypedArrayPrototype, TO_STRING_TAG)) {
        TYPED_ARRAY_TAG_REQIRED = true;
        defineProperty(TypedArrayPrototype, TO_STRING_TAG, {
          get: function () {
            return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined$1;
          } });


        for (NAME in TypedArrayConstructorsList) if (global[NAME]) {
          hide(global[NAME], TYPED_ARRAY_TAG, NAME);
        }
      } // WebKit bug - the same parent prototype for typed arrays and data view


      if (NATIVE_ARRAY_BUFFER && setPrototypeOf && getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
        setPrototypeOf(DataViewPrototype, ObjectPrototype);
      }

      module.exports = {
        NATIVE_ARRAY_BUFFER: NATIVE_ARRAY_BUFFER,
        NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
        TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
        aTypedArray: aTypedArray,
        aTypedArrayConstructor: aTypedArrayConstructor,
        exportProto: exportProto,
        exportStatic: exportStatic,
        isView: isView,
        isTypedArray: isTypedArray,
        TypedArray: TypedArray,
        TypedArrayPrototype: TypedArrayPrototype };

      /***/
    },
    /* 132 */

    /***/
    function (module, exports, __webpack_require__) {
      var redefine = __webpack_require__(21);

      module.exports = function (target, src, options) {
        for (var key in src) redefine(target, key, src[key], options);

        return target;
      };
      /***/

    },
    /* 133 */

    /***/
    function (module, exports) {
      module.exports = function (it, Constructor, name) {
        if (!(it instanceof Constructor)) {
          throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
        }

        return it;
      };
      /***/

    },
    /* 134 */

    /***/
    function (module, exports, __webpack_require__) {
      var toInteger = __webpack_require__(37);

      var toLength = __webpack_require__(36); // `ToIndex` abstract operation
      // https://tc39.github.io/ecma262/#sec-toindex


      module.exports = function (it) {
        if (it === undefined$1) return 0;
        var number = toInteger(it);
        var length = toLength(number);
        if (number !== length) throw RangeError('Wrong length or index');
        return length;
      };
      /***/

    },
    /* 135 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var ArrayBufferViewCore = __webpack_require__(131);

      var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS; // `ArrayBuffer.isView` method
      // https://tc39.github.io/ecma262/#sec-arraybuffer.isview

      $({
        target: 'ArrayBuffer',
        stat: true,
        forced: !NATIVE_ARRAY_BUFFER_VIEWS },
      {
        isView: ArrayBufferViewCore.isView });

      /***/
    },
    /* 136 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var ArrayBufferModule = __webpack_require__(130);

      var anObject = __webpack_require__(20);

      var toAbsoluteIndex = __webpack_require__(38);

      var toLength = __webpack_require__(36);

      var speciesConstructor = __webpack_require__(137);

      var ArrayBuffer = ArrayBufferModule.ArrayBuffer;
      var DataView = ArrayBufferModule.DataView;
      var nativeArrayBufferSlice = ArrayBuffer.prototype.slice;
      var INCORRECT_SLICE = fails(function () {
        return !new ArrayBuffer(2).slice(1, undefined$1).byteLength;
      }); // `ArrayBuffer.prototype.slice` method
      // https://tc39.github.io/ecma262/#sec-arraybuffer.prototype.slice

      $({
        target: 'ArrayBuffer',
        proto: true,
        unsafe: true,
        forced: INCORRECT_SLICE },
      {
        slice: function slice(start, end) {
          if (nativeArrayBufferSlice !== undefined$1 && end === undefined$1) {
            return nativeArrayBufferSlice.call(anObject(this), start); // FF fix
          }

          var length = anObject(this).byteLength;
          var first = toAbsoluteIndex(start, length);
          var fin = toAbsoluteIndex(end === undefined$1 ? length : end, length);
          var result = new (speciesConstructor(this, ArrayBuffer))(toLength(fin - first));
          var viewSource = new DataView(this);
          var viewTarget = new DataView(result);
          var index = 0;

          while (first < fin) {
            viewTarget.setUint8(index++, viewSource.getUint8(first++));
          }

          return result;
        } });

      /***/
    },
    /* 137 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20);

      var aFunction = __webpack_require__(80);

      var wellKnownSymbol = __webpack_require__(44);

      var SPECIES = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
      // https://tc39.github.io/ecma262/#sec-speciesconstructor

      module.exports = function (O, defaultConstructor) {
        var C = anObject(O).constructor;
        var S;
        return C === undefined$1 || (S = anObject(C)[SPECIES]) == undefined$1 ? defaultConstructor : aFunction(S);
      };
      /***/

    },
    /* 138 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var ArrayBufferModule = __webpack_require__(130);

      var NATIVE_ARRAY_BUFFER = __webpack_require__(131).NATIVE_ARRAY_BUFFER; // `DataView` constructor
      // https://tc39.github.io/ecma262/#sec-dataview-constructor


      $({
        global: true,
        forced: !NATIVE_ARRAY_BUFFER },
      {
        DataView: ArrayBufferModule.DataView });

      /***/
    },
    /* 139 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2); // `Date.now` method
      // https://tc39.github.io/ecma262/#sec-date.now


      $({
        target: 'Date',
        stat: true },
      {
        now: function now() {
          return new Date().getTime();
        } });

      /***/
    },
    /* 140 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toISOString = __webpack_require__(141); // `Date.prototype.toISOString` method
      // https://tc39.github.io/ecma262/#sec-date.prototype.toisostring
      // PhantomJS / old WebKit has a broken implementations


      $({
        target: 'Date',
        proto: true,
        forced: Date.prototype.toISOString !== toISOString },
      {
        toISOString: toISOString });

      /***/
    },
    /* 141 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      var prototype = Date.prototype;
      var getTime = prototype.getTime;
      var nativeDateToISOString = prototype.toISOString;

      var leadingZero = function leadingZero(number) {
        return number > 9 ? number : '0' + number;
      }; // `Date.prototype.toISOString` method implementation
      // https://tc39.github.io/ecma262/#sec-date.prototype.toisostring
      // PhantomJS / old WebKit fails here:


      module.exports = fails(function () {
        return nativeDateToISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
      }) || !fails(function () {
        nativeDateToISOString.call(new Date(NaN));
      }) ? function toISOString() {
        if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
        var date = this;
        var year = date.getUTCFullYear();
        var milliseconds = date.getUTCMilliseconds();
        var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
        return sign + ('00000' + Math.abs(year)).slice(sign ? -6 : -4) + '-' + leadingZero(date.getUTCMonth() + 1) + '-' + leadingZero(date.getUTCDate()) + 'T' + leadingZero(date.getUTCHours()) + ':' + leadingZero(date.getUTCMinutes()) + ':' + leadingZero(date.getUTCSeconds()) + '.' + (milliseconds > 99 ? milliseconds : '0' + leadingZero(milliseconds)) + 'Z';
      } : nativeDateToISOString;
      /***/
    },
    /* 142 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var toObject = __webpack_require__(51);

      var toPrimitive = __webpack_require__(13);

      var FORCED = fails(function () {
        return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({
          toISOString: function () {
            return 1;
          } }) !==
        1;
      }); // `Date.prototype.toJSON` method
      // https://tc39.github.io/ecma262/#sec-date.prototype.tojson

      $({
        target: 'Date',
        proto: true,
        forced: FORCED },
      {
        // eslint-disable-next-line no-unused-vars
        toJSON: function toJSON(key) {
          var O = toObject(this);
          var pv = toPrimitive(O);
          return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
        } });

      /***/
    },
    /* 143 */

    /***/
    function (module, exports, __webpack_require__) {
      var hide = __webpack_require__(18);

      var dateToPrimitive = __webpack_require__(144);

      var wellKnownSymbol = __webpack_require__(44);

      var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
      var DatePrototype = Date.prototype; // `Date.prototype[@@toPrimitive]` method
      // https://tc39.github.io/ecma262/#sec-date.prototype-@@toprimitive

      if (!(TO_PRIMITIVE in DatePrototype)) hide(DatePrototype, TO_PRIMITIVE, dateToPrimitive);
      /***/
    },
    /* 144 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20);

      var toPrimitive = __webpack_require__(13);

      module.exports = function (hint) {
        if (hint !== 'string' && hint !== 'number' && hint !== 'default') {
          throw TypeError('Incorrect hint');
        }

        return toPrimitive(anObject(this), hint !== 'number');
      };
      /***/

    },
    /* 145 */

    /***/
    function (module, exports, __webpack_require__) {
      var redefine = __webpack_require__(21);

      var DatePrototype = Date.prototype;
      var INVALID_DATE = 'Invalid Date';
      var TO_STRING = 'toString';
      var nativeDateToString = DatePrototype[TO_STRING];
      var getTime = DatePrototype.getTime; // `Date.prototype.toString` method
      // https://tc39.github.io/ecma262/#sec-date.prototype.tostring

      if (new Date(NaN) + '' != INVALID_DATE) {
        redefine(DatePrototype, TO_STRING, function toString() {
          var value = getTime.call(this); // eslint-disable-next-line no-self-compare

          return value === value ? nativeDateToString.call(this) : INVALID_DATE;
        });
      }
      /***/

    },
    /* 146 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var bind = __webpack_require__(147); // `Function.prototype.bind` method
      // https://tc39.github.io/ecma262/#sec-function.prototype.bind


      $({
        target: 'Function',
        proto: true },
      {
        bind: bind });

      /***/
    },
    /* 147 */

    /***/
    function (module, exports, __webpack_require__) {
      var aFunction = __webpack_require__(80);

      var isObject = __webpack_require__(14);

      var arraySlice = [].slice;
      var factories = {};

      var construct = function construct(C, argsLength, args) {
        if (!(argsLength in factories)) {
          for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']'; // eslint-disable-next-line no-new-func


          factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
        }

        return factories[argsLength](C, args);
      }; // `Function.prototype.bind` method implementation
      // https://tc39.github.io/ecma262/#sec-function.prototype.bind


      module.exports = Function.bind || function bind(that
      /* , ...args */)
      {
        var fn = aFunction(this);
        var partArgs = arraySlice.call(arguments, 1);

        var boundFunction = function bound()
        /* args... */
        {
          var args = partArgs.concat(arraySlice.call(arguments));
          return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
        };

        if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
        return boundFunction;
      };
      /***/

    },
    /* 148 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14);

      var definePropertyModule = __webpack_require__(19);

      var getPrototypeOf = __webpack_require__(107);

      var wellKnownSymbol = __webpack_require__(44);

      var HAS_INSTANCE = wellKnownSymbol('hasInstance');
      var FunctionPrototype = Function.prototype; // `Function.prototype[@@hasInstance]` method
      // https://tc39.github.io/ecma262/#sec-function.prototype-@@hasinstance

      if (!(HAS_INSTANCE in FunctionPrototype)) {
        definePropertyModule.f(FunctionPrototype, HAS_INSTANCE, {
          value: function (O) {
            if (typeof this != 'function' || !isObject(O)) return false;
            if (!isObject(this.prototype)) return O instanceof this; // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:

            while (O = getPrototypeOf(O)) if (this.prototype === O) return true;

            return false;
          } });

      }
      /***/

    },
    /* 149 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var defineProperty = __webpack_require__(19).f;

      var FunctionPrototype = Function.prototype;
      var FunctionPrototypeToString = FunctionPrototype.toString;
      var nameRE = /^\s*function ([^ (]*)/;
      var NAME = 'name'; // Function instances `.name` property
      // https://tc39.github.io/ecma262/#sec-function-instances-name

      if (DESCRIPTORS && !(NAME in FunctionPrototype)) {
        defineProperty(FunctionPrototype, NAME, {
          configurable: true,
          get: function () {
            try {
              return FunctionPrototypeToString.call(this).match(nameRE)[1];
            } catch (error) {
              return '';
            }
          } });

      }
      /***/

    },
    /* 150 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var setToStringTag = __webpack_require__(43); // JSON[@@toStringTag] property
      // https://tc39.github.io/ecma262/#sec-json-@@tostringtag


      setToStringTag(global.JSON, 'JSON', true);
      /***/
    },
    /* 151 */

    /***/
    function (module, exports, __webpack_require__) {
      var collection = __webpack_require__(152);

      var collectionStrong = __webpack_require__(157); // `Map` constructor
      // https://tc39.github.io/ecma262/#sec-map-objects


      module.exports = collection('Map', function (get) {
        return function Map() {
          return get(this, arguments.length > 0 ? arguments[0] : undefined$1);
        };
      }, collectionStrong, true);
      /***/
    },
    /* 152 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var isForced = __webpack_require__(41);

      var redefine = __webpack_require__(21);

      var InternalMetadataModule = __webpack_require__(153);

      var iterate = __webpack_require__(155);

      var anInstance = __webpack_require__(133);

      var isObject = __webpack_require__(14);

      var fails = __webpack_require__(6);

      var checkCorrectnessOfIteration = __webpack_require__(99);

      var setToStringTag = __webpack_require__(43);

      var inheritIfRequired = __webpack_require__(156);

      module.exports = function (CONSTRUCTOR_NAME, wrapper, common, IS_MAP, IS_WEAK) {
        var NativeConstructor = global[CONSTRUCTOR_NAME];
        var NativePrototype = NativeConstructor && NativeConstructor.prototype;
        var Constructor = NativeConstructor;
        var ADDER = IS_MAP ? 'set' : 'add';
        var exported = {};

        var fixMethod = function fixMethod(KEY) {
          var nativeMethod = NativePrototype[KEY];
          redefine(NativePrototype, KEY, KEY == 'add' ? function add(a) {
            nativeMethod.call(this, a === 0 ? 0 : a);
            return this;
          } : KEY == 'delete' ? function (a) {
            return IS_WEAK && !isObject(a) ? false : nativeMethod.call(this, a === 0 ? 0 : a);
          } : KEY == 'get' ? function get(a) {
            return IS_WEAK && !isObject(a) ? undefined$1 : nativeMethod.call(this, a === 0 ? 0 : a);
          } : KEY == 'has' ? function has(a) {
            return IS_WEAK && !isObject(a) ? false : nativeMethod.call(this, a === 0 ? 0 : a);
          } : function set(a, b) {
            nativeMethod.call(this, a === 0 ? 0 : a, b);
            return this;
          });
        }; // eslint-disable-next-line max-len


        if (isForced(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
          new NativeConstructor().entries().next();
        })))) {
          // create collection constructor
          Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
          InternalMetadataModule.REQUIRED = true;
        } else if (isForced(CONSTRUCTOR_NAME, true)) {
          var instance = new Constructor(); // early implementations not supports chaining

          var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false

          var THROWS_ON_PRIMITIVES = fails(function () {
            instance.has(1);
          }); // most early implementations doesn't supports iterables, most modern - not close it correctly
          // eslint-disable-next-line no-new

          var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) {
            new NativeConstructor(iterable);
          }); // for early implementations -0 and +0 not the same

          var BUGGY_ZERO = !IS_WEAK && fails(function () {
            // V8 ~ Chromium 42- fails only with 5+ elements
            var $instance = new NativeConstructor();
            var index = 5;

            while (index--) $instance[ADDER](index, index);

            return !$instance.has(-0);
          });

          if (!ACCEPT_ITERABLES) {
            Constructor = wrapper(function (target, iterable) {
              anInstance(target, Constructor, CONSTRUCTOR_NAME);
              var that = inheritIfRequired(new NativeConstructor(), target, Constructor);
              if (iterable != undefined$1) iterate(iterable, that[ADDER], that, IS_MAP);
              return that;
            });
            Constructor.prototype = NativePrototype;
            NativePrototype.constructor = Constructor;
          }

          if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
            fixMethod('delete');
            fixMethod('has');
            IS_MAP && fixMethod('get');
          }

          if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

          if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
        }

        exported[CONSTRUCTOR_NAME] = Constructor;
        $({
          global: true,
          forced: Constructor != NativeConstructor },
        exported);
        setToStringTag(Constructor, CONSTRUCTOR_NAME);
        if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
        return Constructor;
      };
      /***/

    },
    /* 153 */

    /***/
    function (module, exports, __webpack_require__) {
      var hiddenKeys = __webpack_require__(30);

      var isObject = __webpack_require__(14);

      var has = __webpack_require__(15);

      var defineProperty = __webpack_require__(19).f;

      var uid = __webpack_require__(29);

      var FREEZING = __webpack_require__(154);

      var METADATA = uid('meta');
      var id = 0;

      var isExtensible = Object.isExtensible || function () {
        return true;
      };

      var setMetadata = function setMetadata(it) {
        defineProperty(it, METADATA, {
          value: {
            objectID: 'O' + ++id,
            // object ID
            weakData: {} // weak collections IDs
          } });


      };

      var fastKey = function fastKey(it, create) {
        // return a primitive with prefix
        if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

        if (!has(it, METADATA)) {
          // can't set metadata to uncaught frozen object
          if (!isExtensible(it)) return 'F'; // not necessary to add metadata

          if (!create) return 'E'; // add missing metadata

          setMetadata(it); // return object ID
        }

        return it[METADATA].objectID;
      };

      var getWeakData = function getWeakData(it, create) {
        if (!has(it, METADATA)) {
          // can't set metadata to uncaught frozen object
          if (!isExtensible(it)) return true; // not necessary to add metadata

          if (!create) return false; // add missing metadata

          setMetadata(it); // return the store of weak collections IDs
        }

        return it[METADATA].weakData;
      }; // add metadata on freeze-family methods calling


      var onFreeze = function onFreeze(it) {
        if (FREEZING && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
        return it;
      };

      var meta = module.exports = {
        REQUIRED: false,
        fastKey: fastKey,
        getWeakData: getWeakData,
        onFreeze: onFreeze };

      hiddenKeys[METADATA] = true;
      /***/
    },
    /* 154 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      module.exports = !fails(function () {
        return Object.isExtensible(Object.preventExtensions({}));
      });
      /***/
    },
    /* 155 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20);

      var isArrayIteratorMethod = __webpack_require__(95);

      var toLength = __webpack_require__(36);

      var bind = __webpack_require__(79);

      var getIteratorMethod = __webpack_require__(97);

      var callWithSafeIterationClosing = __webpack_require__(94);

      var BREAK = {};

      var exports = module.exports = function (iterable, fn, that, ENTRIES, ITERATOR) {
        var boundFunction = bind(fn, that, ENTRIES ? 2 : 1);
        var iterator, iterFn, index, length, result, step;

        if (ITERATOR) {
          iterator = iterable;
        } else {
          iterFn = getIteratorMethod(iterable);
          if (typeof iterFn != 'function') throw TypeError('Target is not iterable'); // optimisation for array iterators

          if (isArrayIteratorMethod(iterFn)) {
            for (index = 0, length = toLength(iterable.length); length > index; index++) {
              result = ENTRIES ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
              if (result === BREAK) return BREAK;
            }

            return;
          }

          iterator = iterFn.call(iterable);
        }

        while (!(step = iterator.next()).done) {
          if (callWithSafeIterationClosing(iterator, boundFunction, step.value, ENTRIES) === BREAK) return BREAK;
        }
      };

      exports.BREAK = BREAK;
      /***/
    },
    /* 156 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14);

      var setPrototypeOf = __webpack_require__(109);

      module.exports = function (that, target, C) {
        var S = target.constructor;
        var P;

        if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
          setPrototypeOf(that, P);
        }

        return that;
      };
      /***/

    },
    /* 157 */

    /***/
    function (module, exports, __webpack_require__) {
      var defineProperty = __webpack_require__(19).f;

      var create = __webpack_require__(52);

      var redefineAll = __webpack_require__(132);

      var bind = __webpack_require__(79);

      var anInstance = __webpack_require__(133);

      var iterate = __webpack_require__(155);

      var defineIterator = __webpack_require__(104);

      var setSpecies = __webpack_require__(124);

      var DESCRIPTORS = __webpack_require__(5);

      var fastKey = __webpack_require__(153).fastKey;

      var InternalStateModule = __webpack_require__(26);

      var setInternalState = InternalStateModule.set;
      var internalStateGetterFor = InternalStateModule.getterFor;
      module.exports = {
        getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
          var C = wrapper(function (that, iterable) {
            anInstance(that, C, CONSTRUCTOR_NAME);
            setInternalState(that, {
              type: CONSTRUCTOR_NAME,
              index: create(null),
              first: undefined$1,
              last: undefined$1,
              size: 0 });

            if (!DESCRIPTORS) that.size = 0;
            if (iterable != undefined$1) iterate(iterable, that[ADDER], that, IS_MAP);
          });
          var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

          var define = function define(that, key, value) {
            var state = getInternalState(that);
            var entry = getEntry(that, key);
            var previous, index; // change existing entry

            if (entry) {
              entry.value = value; // create new entry
            } else {
              state.last = entry = {
                index: index = fastKey(key, true),
                key: key,
                value: value,
                previous: previous = state.last,
                next: undefined$1,
                removed: false };

              if (!state.first) state.first = entry;
              if (previous) previous.next = entry;
              if (DESCRIPTORS) state.size++;else that.size++; // add to index

              if (index !== 'F') state.index[index] = entry;
            }

            return that;
          };

          var getEntry = function getEntry(that, key) {
            var state = getInternalState(that); // fast case

            var index = fastKey(key);
            var entry;
            if (index !== 'F') return state.index[index]; // frozen object case

            for (entry = state.first; entry; entry = entry.next) {
              if (entry.key == key) return entry;
            }
          };

          redefineAll(C.prototype, {
            // 23.1.3.1 Map.prototype.clear()
            // 23.2.3.2 Set.prototype.clear()
            clear: function clear() {
              var that = this;
              var state = getInternalState(that);
              var data = state.index;
              var entry = state.first;

              while (entry) {
                entry.removed = true;
                if (entry.previous) entry.previous = entry.previous.next = undefined$1;
                delete data[entry.index];
                entry = entry.next;
              }

              state.first = state.last = undefined$1;
              if (DESCRIPTORS) state.size = 0;else that.size = 0;
            },
            // 23.1.3.3 Map.prototype.delete(key)
            // 23.2.3.4 Set.prototype.delete(value)
            'delete': function (key) {
              var that = this;
              var state = getInternalState(that);
              var entry = getEntry(that, key);

              if (entry) {
                var next = entry.next;
                var prev = entry.previous;
                delete state.index[entry.index];
                entry.removed = true;
                if (prev) prev.next = next;
                if (next) next.previous = prev;
                if (state.first == entry) state.first = next;
                if (state.last == entry) state.last = prev;
                if (DESCRIPTORS) state.size--;else that.size--;
              }

              return !!entry;
            },
            // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
            // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
            forEach: function forEach(callbackfn
            /* , that = undefined */)
            {
              var state = getInternalState(this);
              var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined$1, 3);
              var entry;

              while (entry = entry ? entry.next : state.first) {
                boundFunction(entry.value, entry.key, this); // revert to the last existing entry

                while (entry && entry.removed) entry = entry.previous;
              }
            },
            // 23.1.3.7 Map.prototype.has(key)
            // 23.2.3.7 Set.prototype.has(value)
            has: function has(key) {
              return !!getEntry(this, key);
            } });

          redefineAll(C.prototype, IS_MAP ? {
            // 23.1.3.6 Map.prototype.get(key)
            get: function get(key) {
              var entry = getEntry(this, key);
              return entry && entry.value;
            },
            // 23.1.3.9 Map.prototype.set(key, value)
            set: function set(key, value) {
              return define(this, key === 0 ? 0 : key, value);
            } } :
          {
            // 23.2.3.1 Set.prototype.add(value)
            add: function add(value) {
              return define(this, value = value === 0 ? 0 : value, value);
            } });

          if (DESCRIPTORS) defineProperty(C.prototype, 'size', {
            get: function () {
              return getInternalState(this).size;
            } });

          return C;
        },
        setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
          var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
          var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
          var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME); // add .keys, .values, .entries, [@@iterator]
          // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11

          defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
            setInternalState(this, {
              type: ITERATOR_NAME,
              target: iterated,
              state: getInternalCollectionState(iterated),
              kind: kind,
              last: undefined$1 });

          }, function () {
            var state = getInternalIteratorState(this);
            var kind = state.kind;
            var entry = state.last; // revert to the last existing entry

            while (entry && entry.removed) entry = entry.previous; // get next entry


            if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
              // or finish the iteration
              state.target = undefined$1;
              return {
                value: undefined$1,
                done: true };

            } // return step by kind


            if (kind == 'keys') return {
              value: entry.key,
              done: false };

            if (kind == 'values') return {
              value: entry.value,
              done: false };

            return {
              value: [entry.key, entry.value],
              done: false };

          }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

          setSpecies(CONSTRUCTOR_NAME);
        } };

      /***/
    },
    /* 158 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var log1p = __webpack_require__(159);

      var nativeAcosh = Math.acosh;
      var log = Math.log;
      var sqrt = Math.sqrt;
      var LN2 = Math.LN2;
      var FORCED = !nativeAcosh // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
      || Math.floor(nativeAcosh(Number.MAX_VALUE)) != 710 // Tor Browser bug: Math.acosh(Infinity) -> NaN
      || nativeAcosh(Infinity) != Infinity; // `Math.acosh` method
      // https://tc39.github.io/ecma262/#sec-math.acosh

      $({
        target: 'Math',
        stat: true,
        forced: FORCED },
      {
        acosh: function acosh(x) {
          return (x = +x) < 1 ? NaN : x > 94906265.62425156 ? log(x) + LN2 : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
        } });

      /***/
    },
    /* 159 */

    /***/
    function (module, exports) {
      // `Math.log1p` method implementation
      // https://tc39.github.io/ecma262/#sec-math.log1p
      module.exports = Math.log1p || function log1p(x) {
        return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
      };
      /***/

    },
    /* 160 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var nativeAsinh = Math.asinh;
      var log = Math.log;
      var sqrt = Math.sqrt;

      function asinh(x) {
        return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
      } // `Math.asinh` method
      // https://tc39.github.io/ecma262/#sec-math.asinh
      // Tor Browser bug: Math.asinh(0) -> -0


      $({
        target: 'Math',
        stat: true,
        forced: !(nativeAsinh && 1 / nativeAsinh(0) > 0) },
      {
        asinh: asinh });

      /***/
    },
    /* 161 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var nativeAtanh = Math.atanh;
      var log = Math.log; // `Math.atanh` method
      // https://tc39.github.io/ecma262/#sec-math.atanh
      // Tor Browser bug: Math.atanh(-0) -> 0

      $({
        target: 'Math',
        stat: true,
        forced: !(nativeAtanh && 1 / nativeAtanh(-0) < 0) },
      {
        atanh: function atanh(x) {
          return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
        } });

      /***/
    },
    /* 162 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var sign = __webpack_require__(163);

      var abs = Math.abs;
      var pow = Math.pow; // `Math.cbrt` method
      // https://tc39.github.io/ecma262/#sec-math.cbrt

      $({
        target: 'Math',
        stat: true },
      {
        cbrt: function cbrt(x) {
          return sign(x = +x) * pow(abs(x), 1 / 3);
        } });

      /***/
    },
    /* 163 */

    /***/
    function (module, exports) {
      // `Math.sign` method implementation
      // https://tc39.github.io/ecma262/#sec-math.sign
      module.exports = Math.sign || function sign(x) {
        // eslint-disable-next-line no-self-compare
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
      };
      /***/

    },
    /* 164 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var floor = Math.floor;
      var log = Math.log;
      var LOG2E = Math.LOG2E; // `Math.clz32` method
      // https://tc39.github.io/ecma262/#sec-math.clz32

      $({
        target: 'Math',
        stat: true },
      {
        clz32: function clz32(x) {
          return (x >>>= 0) ? 31 - floor(log(x + 0.5) * LOG2E) : 32;
        } });

      /***/
    },
    /* 165 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var expm1 = __webpack_require__(166);

      var nativeCosh = Math.cosh;
      var abs = Math.abs;
      var E = Math.E; // `Math.cosh` method
      // https://tc39.github.io/ecma262/#sec-math.cosh

      $({
        target: 'Math',
        stat: true,
        forced: !nativeCosh || nativeCosh(710) === Infinity },
      {
        cosh: function cosh(x) {
          var t = expm1(abs(x) - 1) + 1;
          return (t + 1 / (t * E * E)) * (E / 2);
        } });

      /***/
    },
    /* 166 */

    /***/
    function (module, exports) {
      var nativeExpm1 = Math.expm1; // `Math.expm1` method implementation
      // https://tc39.github.io/ecma262/#sec-math.expm1

      module.exports = !nativeExpm1 // Old FF bug
      || nativeExpm1(10) > 22025.465794806719 || nativeExpm1(10) < 22025.4657948067165168 // Tor Browser bug
      || nativeExpm1(-2e-17) != -2e-17 ? function expm1(x) {
        return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
      } : nativeExpm1;
      /***/
    },
    /* 167 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var expm1 = __webpack_require__(166); // `Math.expm1` method
      // https://tc39.github.io/ecma262/#sec-math.expm1


      $({
        target: 'Math',
        stat: true,
        forced: expm1 != Math.expm1 },
      {
        expm1: expm1 });

      /***/
    },
    /* 168 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fround = __webpack_require__(169); // `Math.fround` method
      // https://tc39.github.io/ecma262/#sec-math.fround


      $({
        target: 'Math',
        stat: true },
      {
        fround: fround });

      /***/
    },
    /* 169 */

    /***/
    function (module, exports, __webpack_require__) {
      var sign = __webpack_require__(163);

      var pow = Math.pow;
      var EPSILON = pow(2, -52);
      var EPSILON32 = pow(2, -23);
      var MAX32 = pow(2, 127) * (2 - EPSILON32);
      var MIN32 = pow(2, -126);

      var roundTiesToEven = function roundTiesToEven(n) {
        return n + 1 / EPSILON - 1 / EPSILON;
      }; // `Math.fround` method implementation
      // https://tc39.github.io/ecma262/#sec-math.fround


      module.exports = Math.fround || function fround(x) {
        var $abs = Math.abs(x);
        var $sign = sign(x);
        var a, result;
        if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
        a = (1 + EPSILON32 / EPSILON) * $abs;
        result = a - (a - $abs); // eslint-disable-next-line no-self-compare

        if (result > MAX32 || result != result) return $sign * Infinity;
        return $sign * result;
      };
      /***/

    },
    /* 170 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var abs = Math.abs;
      var sqrt = Math.sqrt; // `Math.hypot` method
      // https://tc39.github.io/ecma262/#sec-math.hypot

      $({
        target: 'Math',
        stat: true },
      {
        hypot: function hypot(value1, value2) {
          // eslint-disable-line no-unused-vars
          var sum = 0;
          var i = 0;
          var aLen = arguments.length;
          var larg = 0;
          var arg, div;

          while (i < aLen) {
            arg = abs(arguments[i++]);

            if (larg < arg) {
              div = larg / arg;
              sum = sum * div * div + 1;
              larg = arg;
            } else if (arg > 0) {
              div = arg / larg;
              sum += div * div;
            } else sum += arg;
          }

          return larg === Infinity ? Infinity : larg * sqrt(sum);
        } });

      /***/
    },
    /* 171 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var nativeImul = Math.imul;
      var FORCED = fails(function () {
        return nativeImul(0xFFFFFFFF, 5) != -5 || nativeImul.length != 2;
      }); // `Math.imul` method
      // https://tc39.github.io/ecma262/#sec-math.imul
      // some WebKit versions fails with big numbers, some has wrong arity

      $({
        target: 'Math',
        stat: true,
        forced: FORCED },
      {
        imul: function imul(x, y) {
          var UINT16 = 0xFFFF;
          var xn = +x;
          var yn = +y;
          var xl = UINT16 & xn;
          var yl = UINT16 & yn;
          return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
        } });

      /***/
    },
    /* 172 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var log = Math.log;
      var LOG10E = Math.LOG10E; // `Math.log10` method
      // https://tc39.github.io/ecma262/#sec-math.log10

      $({
        target: 'Math',
        stat: true },
      {
        log10: function log10(x) {
          return log(x) * LOG10E;
        } });

      /***/
    },
    /* 173 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var log1p = __webpack_require__(159); // `Math.log1p` method
      // https://tc39.github.io/ecma262/#sec-math.log1p


      $({
        target: 'Math',
        stat: true },
      {
        log1p: log1p });

      /***/
    },
    /* 174 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var log = Math.log;
      var LN2 = Math.LN2; // `Math.log2` method
      // https://tc39.github.io/ecma262/#sec-math.log2

      $({
        target: 'Math',
        stat: true },
      {
        log2: function log2(x) {
          return log(x) / LN2;
        } });

      /***/
    },
    /* 175 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var sign = __webpack_require__(163); // `Math.sign` method
      // https://tc39.github.io/ecma262/#sec-math.sign


      $({
        target: 'Math',
        stat: true },
      {
        sign: sign });

      /***/
    },
    /* 176 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var expm1 = __webpack_require__(166);

      var abs = Math.abs;
      var exp = Math.exp;
      var E = Math.E;
      var FORCED = fails(function () {
        return Math.sinh(-2e-17) != -2e-17;
      }); // `Math.sinh` method
      // https://tc39.github.io/ecma262/#sec-math.sinh
      // V8 near Chromium 38 has a problem with very small numbers

      $({
        target: 'Math',
        stat: true,
        forced: FORCED },
      {
        sinh: function sinh(x) {
          return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
        } });

      /***/
    },
    /* 177 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var expm1 = __webpack_require__(166);

      var exp = Math.exp; // `Math.tanh` method
      // https://tc39.github.io/ecma262/#sec-math.tanh

      $({
        target: 'Math',
        stat: true },
      {
        tanh: function tanh(x) {
          var a = expm1(x = +x);
          var b = expm1(-x);
          return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
        } });

      /***/
    },
    /* 178 */

    /***/
    function (module, exports, __webpack_require__) {
      var setToStringTag = __webpack_require__(43); // Math[@@toStringTag] property
      // https://tc39.github.io/ecma262/#sec-math-@@tostringtag


      setToStringTag(Math, 'Math', true);
      /***/
    },
    /* 179 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var ceil = Math.ceil;
      var floor = Math.floor; // `Math.trunc` method
      // https://tc39.github.io/ecma262/#sec-math.trunc

      $({
        target: 'Math',
        stat: true },
      {
        trunc: function trunc(it) {
          return (it > 0 ? floor : ceil)(it);
        } });

      /***/
    },
    /* 180 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var global = __webpack_require__(3);

      var isForced = __webpack_require__(41);

      var redefine = __webpack_require__(21);

      var has = __webpack_require__(15);

      var classof = __webpack_require__(11);

      var inheritIfRequired = __webpack_require__(156);

      var toPrimitive = __webpack_require__(13);

      var fails = __webpack_require__(6);

      var create = __webpack_require__(52);

      var getOwnPropertyNames = __webpack_require__(33).f;

      var getOwnPropertyDescriptor = __webpack_require__(4).f;

      var defineProperty = __webpack_require__(19).f;

      var internalStringTrim = __webpack_require__(181);

      var NUMBER = 'Number';
      var NativeNumber = global[NUMBER];
      var NumberPrototype = NativeNumber.prototype; // Opera ~12 has broken Object#toString

      var BROKEN_CLASSOF = classof(create(NumberPrototype)) == NUMBER;
      var NATIVE_TRIM = ('trim' in String.prototype); // `ToNumber` abstract operation
      // https://tc39.github.io/ecma262/#sec-tonumber

      var toNumber = function toNumber(argument) {
        var it = toPrimitive(argument, false);
        var first, third, radix, maxCode, digits, length, i, code;

        if (typeof it == 'string' && it.length > 2) {
          it = NATIVE_TRIM ? it.trim() : internalStringTrim(it, 3);
          first = it.charCodeAt(0);

          if (first === 43 || first === 45) {
            third = it.charCodeAt(2);
            if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
          } else if (first === 48) {
            switch (it.charCodeAt(1)) {
              case 66:
              case 98:
                radix = 2;
                maxCode = 49;
                break;
              // fast equal of /^0b[01]+$/i

              case 79:
              case 111:
                radix = 8;
                maxCode = 55;
                break;
              // fast equal of /^0o[0-7]+$/i

              default:
                return +it;}


            digits = it.slice(2);
            length = digits.length;

            for (i = 0; i < length; i++) {
              code = digits.charCodeAt(i); // parseInt parses a string to a first unavailable symbol
              // but ToNumber should return NaN if a string contains unavailable symbols

              if (code < 48 || code > maxCode) return NaN;
            }

            return parseInt(digits, radix);
          }
        }

        return +it;
      }; // `Number` constructor
      // https://tc39.github.io/ecma262/#sec-number-constructor


      if (isForced(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
        var NumberWrapper = function Number(value) {
          var it = arguments.length < 1 ? 0 : value;
          var that = this;
          return that instanceof NumberWrapper // check on 1..constructor(foo) case
          && (BROKEN_CLASSOF ? fails(function () {
            NumberPrototype.valueOf.call(that);
          }) : classof(that) != NUMBER) ? inheritIfRequired(new NativeNumber(toNumber(it)), that, NumberWrapper) : toNumber(it);
        };

        for (var keys = DESCRIPTORS ? getOwnPropertyNames(NativeNumber) : ( // ES3:
        'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' + // ES2015 (in case, if modules with ES2015 Number statics required before):
        'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j = 0, key; keys.length > j; j++) {
          if (has(NativeNumber, key = keys[j]) && !has(NumberWrapper, key)) {
            defineProperty(NumberWrapper, key, getOwnPropertyDescriptor(NativeNumber, key));
          }
        }

        NumberWrapper.prototype = NumberPrototype;
        NumberPrototype.constructor = NumberWrapper;
        redefine(global, NUMBER, NumberWrapper);
      }
      /***/

    },
    /* 181 */

    /***/
    function (module, exports, __webpack_require__) {
      var requireObjectCoercible = __webpack_require__(12);

      var whitespaces = __webpack_require__(182);

      var whitespace = '[' + whitespaces + ']';
      var ltrim = RegExp('^' + whitespace + whitespace + '*');
      var rtrim = RegExp(whitespace + whitespace + '*$'); // 1 -> String#trimStart
      // 2 -> String#trimEnd
      // 3 -> String#trim

      module.exports = function (string, TYPE) {
        string = String(requireObjectCoercible(string));
        if (TYPE & 1) string = string.replace(ltrim, '');
        if (TYPE & 2) string = string.replace(rtrim, '');
        return string;
      };
      /***/

    },
    /* 182 */

    /***/
    function (module, exports) {
      // a string of all valid unicode whitespaces
      // eslint-disable-next-line max-len
      module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
      /***/
    },
    /* 183 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2); // `Number.EPSILON` constant
      // https://tc39.github.io/ecma262/#sec-number.epsilon


      $({
        target: 'Number',
        stat: true },
      {
        EPSILON: Math.pow(2, -52) });

      /***/
    },
    /* 184 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var numberIsFinite = __webpack_require__(185); // `Number.isFinite` method
      // https://tc39.github.io/ecma262/#sec-number.isfinite


      $({
        target: 'Number',
        stat: true },
      {
        isFinite: numberIsFinite });

      /***/
    },
    /* 185 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var globalIsFinite = global.isFinite; // `Number.isFinite` method
      // https://tc39.github.io/ecma262/#sec-number.isfinite

      module.exports = Number.isFinite || function isFinite(it) {
        return typeof it == 'number' && globalIsFinite(it);
      };
      /***/

    },
    /* 186 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var isInteger = __webpack_require__(187); // `Number.isInteger` method
      // https://tc39.github.io/ecma262/#sec-number.isinteger


      $({
        target: 'Number',
        stat: true },
      {
        isInteger: isInteger });

      /***/
    },
    /* 187 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14);

      var floor = Math.floor; // `Number.isInteger` method implementation
      // https://tc39.github.io/ecma262/#sec-number.isinteger

      module.exports = function isInteger(it) {
        return !isObject(it) && isFinite(it) && floor(it) === it;
      };
      /***/

    },
    /* 188 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2); // `Number.isNaN` method
      // https://tc39.github.io/ecma262/#sec-number.isnan


      $({
        target: 'Number',
        stat: true },
      {
        isNaN: function isNaN(number) {
          // eslint-disable-next-line no-self-compare
          return number != number;
        } });

      /***/
    },
    /* 189 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var isInteger = __webpack_require__(187);

      var abs = Math.abs; // `Number.isSafeInteger` method
      // https://tc39.github.io/ecma262/#sec-number.issafeinteger

      $({
        target: 'Number',
        stat: true },
      {
        isSafeInteger: function isSafeInteger(number) {
          return isInteger(number) && abs(number) <= 0x1FFFFFFFFFFFFF;
        } });

      /***/
    },
    /* 190 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2); // `Number.MAX_SAFE_INTEGER` constant
      // https://tc39.github.io/ecma262/#sec-number.max_safe_integer


      $({
        target: 'Number',
        stat: true },
      {
        MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF });

      /***/
    },
    /* 191 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2); // `Number.MIN_SAFE_INTEGER` constant
      // https://tc39.github.io/ecma262/#sec-number.min_safe_integer


      $({
        target: 'Number',
        stat: true },
      {
        MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF });

      /***/
    },
    /* 192 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var parseFloat = __webpack_require__(193); // `Number.parseFloat` method
      // https://tc39.github.io/ecma262/#sec-number.parseFloat


      $({
        target: 'Number',
        stat: true,
        forced: Number.parseFloat != parseFloat },
      {
        parseFloat: parseFloat });

      /***/
    },
    /* 193 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var internalStringTrim = __webpack_require__(181);

      var whitespaces = __webpack_require__(182);

      var nativeParseFloat = global.parseFloat;
      var FORCED = 1 / nativeParseFloat(whitespaces + '-0') !== -Infinity;
      module.exports = FORCED ? function parseFloat(str) {
        var string = internalStringTrim(String(str), 3);
        var result = nativeParseFloat(string);
        return result === 0 && string.charAt(0) == '-' ? -0 : result;
      } : nativeParseFloat;
      /***/
    },
    /* 194 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var parseInt = __webpack_require__(195); // `Number.parseInt` method
      // https://tc39.github.io/ecma262/#sec-number.parseint


      $({
        target: 'Number',
        stat: true,
        forced: Number.parseInt != parseInt },
      {
        parseInt: parseInt });

      /***/
    },
    /* 195 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var internalStringTrim = __webpack_require__(181);

      var whitespaces = __webpack_require__(182);

      var nativeParseInt = global.parseInt;
      var hex = /^[+-]?0[Xx]/;
      var FORCED = nativeParseInt(whitespaces + '08') !== 8 || nativeParseInt(whitespaces + '0x16') !== 22;
      module.exports = FORCED ? function parseInt(str, radix) {
        var string = internalStringTrim(String(str), 3);
        return nativeParseInt(string, radix >>> 0 || (hex.test(string) ? 16 : 10));
      } : nativeParseInt;
      /***/
    },
    /* 196 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toInteger = __webpack_require__(37);

      var thisNumberValue = __webpack_require__(197);

      var repeat = __webpack_require__(198);

      var fails = __webpack_require__(6);

      var nativeToFixed = 1.0.toFixed;
      var floor = Math.floor;
      var data = [0, 0, 0, 0, 0, 0];

      var multiply = function multiply(n, c) {
        var i = -1;
        var c2 = c;

        while (++i < 6) {
          c2 += n * data[i];
          data[i] = c2 % 1e7;
          c2 = floor(c2 / 1e7);
        }
      };

      var divide = function divide(n) {
        var i = 6;
        var c = 0;

        while (--i >= 0) {
          c += data[i];
          data[i] = floor(c / n);
          c = c % n * 1e7;
        }
      };

      var numToString = function numToString() {
        var i = 6;
        var s = '';

        while (--i >= 0) {
          if (s !== '' || i === 0 || data[i] !== 0) {
            var t = String(data[i]);
            s = s === '' ? t : s + repeat.call('0', 7 - t.length) + t;
          }
        }

        return s;
      };

      var pow = function pow(x, n, acc) {
        return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
      };

      var log = function log(x) {
        var n = 0;
        var x2 = x;

        while (x2 >= 4096) {
          n += 12;
          x2 /= 4096;
        }

        while (x2 >= 2) {
          n += 1;
          x2 /= 2;
        }

        return n;
      };

      var FORCED = nativeToFixed && (0.00008.toFixed(3) !== '0.000' || 0.9.toFixed(0) !== '1' || 1.255.toFixed(2) !== '1.25' || 1000000000000000128.0.toFixed(0) !== '1000000000000000128') || !fails(function () {
        // V8 ~ Android 4.3-
        nativeToFixed.call({});
      }); // `Number.prototype.toFixed` method
      // https://tc39.github.io/ecma262/#sec-number.prototype.tofixed

      $({
        target: 'Number',
        proto: true,
        forced: FORCED },
      {
        toFixed: function toFixed(fractionDigits) {
          var x = thisNumberValue(this);
          var f = toInteger(fractionDigits);
          var s = '';
          var m = '0';
          var e, z, j, k;
          if (f < 0 || f > 20) throw RangeError('Incorrect fraction digits'); // eslint-disable-next-line no-self-compare

          if (x != x) return 'NaN';
          if (x <= -1e21 || x >= 1e21) return String(x);

          if (x < 0) {
            s = '-';
            x = -x;
          }

          if (x > 1e-21) {
            e = log(x * pow(2, 69, 1)) - 69;
            z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
            z *= 0x10000000000000;
            e = 52 - e;

            if (e > 0) {
              multiply(0, z);
              j = f;

              while (j >= 7) {
                multiply(1e7, 0);
                j -= 7;
              }

              multiply(pow(10, j, 1), 0);
              j = e - 1;

              while (j >= 23) {
                divide(1 << 23);
                j -= 23;
              }

              divide(1 << j);
              multiply(1, 1);
              divide(2);
              m = numToString();
            } else {
              multiply(0, z);
              multiply(1 << -e, 0);
              m = numToString() + repeat.call('0', f);
            }
          }

          if (f > 0) {
            k = m.length;
            m = s + (k <= f ? '0.' + repeat.call('0', f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
          } else {
            m = s + m;
          }

          return m;
        } });

      /***/
    },
    /* 197 */

    /***/
    function (module, exports, __webpack_require__) {
      var classof = __webpack_require__(11); // `thisNumberValue` abstract operation
      // https://tc39.github.io/ecma262/#sec-thisnumbervalue


      module.exports = function (value) {
        if (typeof value != 'number' && classof(value) != 'Number') {
          throw TypeError('Incorrect invocation');
        }

        return +value;
      };
      /***/

    },
    /* 198 */

    /***/
    function (module, exports, __webpack_require__) {
      var toInteger = __webpack_require__(37);

      var requireObjectCoercible = __webpack_require__(12); // `String.prototype.repeat` method implementation
      // https://tc39.github.io/ecma262/#sec-string.prototype.repeat


      module.exports = ''.repeat || function repeat(count) {
        var str = String(requireObjectCoercible(this));
        var result = '';
        var n = toInteger(count);
        if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');

        for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;

        return result;
      };
      /***/

    },
    /* 199 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var thisNumberValue = __webpack_require__(197);

      var nativeToPrecision = 1.0.toPrecision;
      var FORCED = fails(function () {
        // IE7-
        return nativeToPrecision.call(1, undefined$1) !== '1';
      }) || !fails(function () {
        // V8 ~ Android 4.3-
        nativeToPrecision.call({});
      }); // `Number.prototype.toPrecision` method
      // https://tc39.github.io/ecma262/#sec-number.prototype.toprecision

      $({
        target: 'Number',
        proto: true,
        forced: FORCED },
      {
        toPrecision: function toPrecision(precision) {
          return precision === undefined$1 ? nativeToPrecision.call(thisNumberValue(this)) : nativeToPrecision.call(thisNumberValue(this), precision);
        } });

      /***/
    },
    /* 200 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var assign = __webpack_require__(201); // `Object.assign` method
      // https://tc39.github.io/ecma262/#sec-object.assign


      $({
        target: 'Object',
        stat: true,
        forced: Object.assign !== assign },
      {
        assign: assign });

      /***/
    },
    /* 201 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var fails = __webpack_require__(6);

      var objectKeys = __webpack_require__(49);

      var getOwnPropertySymbolsModule = __webpack_require__(40);

      var propertyIsEnumerableModule = __webpack_require__(7);

      var toObject = __webpack_require__(51);

      var IndexedObject = __webpack_require__(10);

      var nativeAssign = Object.assign; // 19.1.2.1 Object.assign(target, source, ...)
      // should work with symbols and should have deterministic property order (V8 bug)

      module.exports = !nativeAssign || fails(function () {
        var A = {};
        var B = {}; // eslint-disable-next-line no-undef

        var symbol = Symbol();
        var alphabet = 'abcdefghijklmnopqrst';
        A[symbol] = 7;
        alphabet.split('').forEach(function (chr) {
          B[chr] = chr;
        });
        return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
      }) ? function assign(target, source) {
        // eslint-disable-line no-unused-vars
        var T = toObject(target);
        var argumentsLength = arguments.length;
        var index = 1;
        var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
        var propertyIsEnumerable = propertyIsEnumerableModule.f;

        while (argumentsLength > index) {
          var S = IndexedObject(arguments[index++]);
          var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
          var length = keys.length;
          var j = 0;
          var key;

          while (length > j) {
            key = keys[j++];
            if (!DESCRIPTORS || propertyIsEnumerable.call(S, key)) T[key] = S[key];
          }
        }

        return T;
      } : nativeAssign;
      /***/
    },
    /* 202 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var create = __webpack_require__(52); // `Object.create` method
      // https://tc39.github.io/ecma262/#sec-object.create


      $({
        target: 'Object',
        stat: true,
        sham: !DESCRIPTORS },
      {
        create: create });

      /***/
    },
    /* 203 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var FORCED = __webpack_require__(204);

      var toObject = __webpack_require__(51);

      var aFunction = __webpack_require__(80);

      var definePropertyModule = __webpack_require__(19); // `Object.prototype.__defineGetter__` method
      // https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__


      if (DESCRIPTORS) {
        $({
          target: 'Object',
          proto: true,
          forced: FORCED },
        {
          __defineGetter__: function __defineGetter__(P, getter) {
            definePropertyModule.f(toObject(this), P, {
              get: aFunction(getter),
              enumerable: true,
              configurable: true });

          } });

      }
      /***/

    },
    /* 204 */

    /***/
    function (module, exports, __webpack_require__) {
      var IS_PURE = __webpack_require__(24);

      var global = __webpack_require__(3);

      var fails = __webpack_require__(6); // Forced replacement object prototype accessors methods


      module.exports = IS_PURE || !fails(function () {
        var key = Math.random(); // In FF throws only define methods
        // eslint-disable-next-line no-undef, no-useless-call

        __defineSetter__.call(null, key, function () {
          /* empty */
        });

        delete global[key];
      });
      /***/
    },
    /* 205 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var defineProperties = __webpack_require__(53); // `Object.defineProperties` method
      // https://tc39.github.io/ecma262/#sec-object.defineproperties


      $({
        target: 'Object',
        stat: true,
        forced: !DESCRIPTORS,
        sham: !DESCRIPTORS },
      {
        defineProperties: defineProperties });

      /***/
    },
    /* 206 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var objectDefinePropertyModile = __webpack_require__(19); // `Object.defineProperty` method
      // https://tc39.github.io/ecma262/#sec-object.defineproperty


      $({
        target: 'Object',
        stat: true,
        forced: !DESCRIPTORS,
        sham: !DESCRIPTORS },
      {
        defineProperty: objectDefinePropertyModile.f });

      /***/
    },
    /* 207 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var FORCED = __webpack_require__(204);

      var toObject = __webpack_require__(51);

      var aFunction = __webpack_require__(80);

      var definePropertyModule = __webpack_require__(19); // `Object.prototype.__defineSetter__` method
      // https://tc39.github.io/ecma262/#sec-object.prototype.__defineSetter__


      if (DESCRIPTORS) {
        $({
          target: 'Object',
          proto: true,
          forced: FORCED },
        {
          __defineSetter__: function __defineSetter__(P, setter) {
            definePropertyModule.f(toObject(this), P, {
              set: aFunction(setter),
              enumerable: true,
              configurable: true });

          } });

      }
      /***/

    },
    /* 208 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var objectToArray = __webpack_require__(209); // `Object.entries` method
      // https://tc39.github.io/ecma262/#sec-object.entries


      $({
        target: 'Object',
        stat: true },
      {
        entries: function entries(O) {
          return objectToArray(O, true);
        } });

      /***/
    },
    /* 209 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var objectKeys = __webpack_require__(49);

      var toIndexedObject = __webpack_require__(9);

      var propertyIsEnumerable = __webpack_require__(7).f; // TO_ENTRIES: true  -> Object.entries
      // TO_ENTRIES: false -> Object.values


      module.exports = function (it, TO_ENTRIES) {
        var O = toIndexedObject(it);
        var keys = objectKeys(O);
        var length = keys.length;
        var i = 0;
        var result = [];
        var key;

        while (length > i) {
          key = keys[i++];

          if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
            result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
          }
        }

        return result;
      };
      /***/

    },
    /* 210 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var FREEZING = __webpack_require__(154);

      var fails = __webpack_require__(6);

      var isObject = __webpack_require__(14);

      var onFreeze = __webpack_require__(153).onFreeze;

      var nativeFreeze = Object.freeze;
      var FAILS_ON_PRIMITIVES = fails(function () {
        nativeFreeze(1);
      }); // `Object.freeze` method
      // https://tc39.github.io/ecma262/#sec-object.freeze

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES,
        sham: !FREEZING },
      {
        freeze: function freeze(it) {
          return nativeFreeze && isObject(it) ? nativeFreeze(onFreeze(it)) : it;
        } });

      /***/
    },
    /* 211 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var iterate = __webpack_require__(155);

      var createProperty = __webpack_require__(71); // `Object.fromEntries` method
      // https://github.com/tc39/proposal-object-from-entries


      $({
        target: 'Object',
        stat: true },
      {
        fromEntries: function fromEntries(iterable) {
          var obj = {};
          iterate(iterable, function (k, v) {
            createProperty(obj, k, v);
          }, undefined$1, true);
          return obj;
        } });

      /***/
    },
    /* 212 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var toIndexedObject = __webpack_require__(9);

      var nativeGetOwnPropertyDescriptor = __webpack_require__(4).f;

      var DESCRIPTORS = __webpack_require__(5);

      var FAILS_ON_PRIMITIVES = fails(function () {
        nativeGetOwnPropertyDescriptor(1);
      });
      var FORCED = !DESCRIPTORS || FAILS_ON_PRIMITIVES; // `Object.getOwnPropertyDescriptor` method
      // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

      $({
        target: 'Object',
        stat: true,
        forced: FORCED,
        sham: !DESCRIPTORS },
      {
        getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
          return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
        } });

      /***/
    },
    /* 213 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var ownKeys = __webpack_require__(32);

      var toIndexedObject = __webpack_require__(9);

      var getOwnPropertyDescriptorModule = __webpack_require__(4);

      var createProperty = __webpack_require__(71); // `Object.getOwnPropertyDescriptors` method
      // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors


      $({
        target: 'Object',
        stat: true,
        sham: !DESCRIPTORS },
      {
        getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
          var O = toIndexedObject(object);
          var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
          var keys = ownKeys(O);
          var result = {};
          var i = 0;
          var key, descriptor;

          while (keys.length > i) {
            descriptor = getOwnPropertyDescriptor(O, key = keys[i++]);
            if (descriptor !== undefined$1) createProperty(result, key, descriptor);
          }

          return result;
        } });

      /***/
    },
    /* 214 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var nativeGetOwnPropertyNames = __webpack_require__(55).f;

      var FAILS_ON_PRIMITIVES = fails(function () {
        return !Object.getOwnPropertyNames(1);
      }); // `Object.getOwnPropertyNames` method
      // https://tc39.github.io/ecma262/#sec-object.getownpropertynames

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES },
      {
        getOwnPropertyNames: nativeGetOwnPropertyNames });

      /***/
    },
    /* 215 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var toObject = __webpack_require__(51);

      var nativeGetPrototypeOf = __webpack_require__(107);

      var CORRECT_PROTOTYPE_GETTER = __webpack_require__(108);

      var FAILS_ON_PRIMITIVES = fails(function () {
        nativeGetPrototypeOf(1);
      }); // `Object.getPrototypeOf` method
      // https://tc39.github.io/ecma262/#sec-object.getprototypeof

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES,
        sham: !CORRECT_PROTOTYPE_GETTER },
      {
        getPrototypeOf: function getPrototypeOf(it) {
          return nativeGetPrototypeOf(toObject(it));
        } });

      /***/
    },
    /* 216 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var is = __webpack_require__(217); // `Object.is` method
      // https://tc39.github.io/ecma262/#sec-object.is


      $({
        target: 'Object',
        stat: true },
      {
        is: is });

      /***/
    },
    /* 217 */

    /***/
    function (module, exports) {
      // `SameValue` abstract operation
      // https://tc39.github.io/ecma262/#sec-samevalue
      module.exports = Object.is || function is(x, y) {
        // eslint-disable-next-line no-self-compare
        return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
      };
      /***/

    },
    /* 218 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var isObject = __webpack_require__(14);

      var nativeIsExtensible = Object.isExtensible;
      var FAILS_ON_PRIMITIVES = fails(function () {}); // `Object.isExtensible` method
      // https://tc39.github.io/ecma262/#sec-object.isextensible

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES },
      {
        isExtensible: function isExtensible(it) {
          return isObject(it) ? nativeIsExtensible ? nativeIsExtensible(it) : true : false;
        } });

      /***/
    },
    /* 219 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var isObject = __webpack_require__(14);

      var nativeIsFrozen = Object.isFrozen;
      var FAILS_ON_PRIMITIVES = fails(function () {}); // `Object.isFrozen` method
      // https://tc39.github.io/ecma262/#sec-object.isfrozen

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES },
      {
        isFrozen: function isFrozen(it) {
          return isObject(it) ? nativeIsFrozen ? nativeIsFrozen(it) : false : true;
        } });

      /***/
    },
    /* 220 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var isObject = __webpack_require__(14);

      var nativeIsSealed = Object.isSealed;
      var FAILS_ON_PRIMITIVES = fails(function () {}); // `Object.isSealed` method
      // https://tc39.github.io/ecma262/#sec-object.issealed

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES },
      {
        isSealed: function isSealed(it) {
          return isObject(it) ? nativeIsSealed ? nativeIsSealed(it) : false : true;
        } });

      /***/
    },
    /* 221 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toObject = __webpack_require__(51);

      var nativeKeys = __webpack_require__(49);

      var fails = __webpack_require__(6);

      var FAILS_ON_PRIMITIVES = fails(function () {
        nativeKeys(1);
      }); // `Object.keys` method
      // https://tc39.github.io/ecma262/#sec-object.keys

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES },
      {
        keys: function keys(it) {
          return nativeKeys(toObject(it));
        } });

      /***/
    },
    /* 222 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var FORCED = __webpack_require__(204);

      var toObject = __webpack_require__(51);

      var toPrimitive = __webpack_require__(13);

      var getPrototypeOf = __webpack_require__(107);

      var getOwnPropertyDescriptor = __webpack_require__(4).f; // `Object.prototype.__lookupGetter__` method
      // https://tc39.github.io/ecma262/#sec-object.prototype.__lookupGetter__


      if (DESCRIPTORS) {
        $({
          target: 'Object',
          proto: true,
          forced: FORCED },
        {
          __lookupGetter__: function __lookupGetter__(P) {
            var O = toObject(this);
            var key = toPrimitive(P, true);
            var desc;

            do {
              if (desc = getOwnPropertyDescriptor(O, key)) return desc.get;
            } while (O = getPrototypeOf(O));
          } });

      }
      /***/

    },
    /* 223 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var FORCED = __webpack_require__(204);

      var toObject = __webpack_require__(51);

      var toPrimitive = __webpack_require__(13);

      var getPrototypeOf = __webpack_require__(107);

      var getOwnPropertyDescriptor = __webpack_require__(4).f; // `Object.prototype.__lookupSetter__` method
      // https://tc39.github.io/ecma262/#sec-object.prototype.__lookupSetter__


      if (DESCRIPTORS) {
        $({
          target: 'Object',
          proto: true,
          forced: FORCED },
        {
          __lookupSetter__: function __lookupSetter__(P) {
            var O = toObject(this);
            var key = toPrimitive(P, true);
            var desc;

            do {
              if (desc = getOwnPropertyDescriptor(O, key)) return desc.set;
            } while (O = getPrototypeOf(O));
          } });

      }
      /***/

    },
    /* 224 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var isObject = __webpack_require__(14);

      var onFreeze = __webpack_require__(153).onFreeze;

      var FREEZING = __webpack_require__(154);

      var fails = __webpack_require__(6);

      var nativePreventExtensions = Object.preventExtensions;
      var FAILS_ON_PRIMITIVES = fails(function () {
        nativePreventExtensions(1);
      }); // `Object.preventExtensions` method
      // https://tc39.github.io/ecma262/#sec-object.preventextensions

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES,
        sham: !FREEZING },
      {
        preventExtensions: function preventExtensions(it) {
          return nativePreventExtensions && isObject(it) ? nativePreventExtensions(onFreeze(it)) : it;
        } });

      /***/
    },
    /* 225 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var isObject = __webpack_require__(14);

      var onFreeze = __webpack_require__(153).onFreeze;

      var FREEZING = __webpack_require__(154);

      var fails = __webpack_require__(6);

      var nativeSeal = Object.seal;
      var FAILS_ON_PRIMITIVES = fails(function () {
        nativeSeal(1);
      }); // `Object.seal` method
      // https://tc39.github.io/ecma262/#sec-object.seal

      $({
        target: 'Object',
        stat: true,
        forced: FAILS_ON_PRIMITIVES,
        sham: !FREEZING },
      {
        seal: function seal(it) {
          return nativeSeal && isObject(it) ? nativeSeal(onFreeze(it)) : it;
        } });

      /***/
    },
    /* 226 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var setPrototypeOf = __webpack_require__(109); // `Object.setPrototypeOf` method
      // https://tc39.github.io/ecma262/#sec-object.setprototypeof


      $({
        target: 'Object',
        stat: true },
      {
        setPrototypeOf: setPrototypeOf });

      /***/
    },
    /* 227 */

    /***/
    function (module, exports, __webpack_require__) {
      var redefine = __webpack_require__(21);

      var toString = __webpack_require__(228);

      var ObjectPrototype = Object.prototype; // `Object.prototype.toString` method
      // https://tc39.github.io/ecma262/#sec-object.prototype.tostring

      if (toString !== ObjectPrototype.toString) {
        redefine(ObjectPrototype, 'toString', toString, {
          unsafe: true });

      }
      /***/

    },
    /* 228 */

    /***/
    function (module, exports, __webpack_require__) {
      var classof = __webpack_require__(98);

      var wellKnownSymbol = __webpack_require__(44);

      var TO_STRING_TAG = wellKnownSymbol('toStringTag');
      var test = {};
      test[TO_STRING_TAG] = 'z'; // `Object.prototype.toString` method implementation
      // https://tc39.github.io/ecma262/#sec-object.prototype.tostring

      module.exports = String(test) !== '[object z]' ? function toString() {
        return '[object ' + classof(this) + ']';
      } : test.toString;
      /***/
    },
    /* 229 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var objectToArray = __webpack_require__(209); // `Object.values` method
      // https://tc39.github.io/ecma262/#sec-object.values


      $({
        target: 'Object',
        stat: true },
      {
        values: function values(O) {
          return objectToArray(O);
        } });

      /***/
    },
    /* 230 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var parseFloatImplementation = __webpack_require__(193); // `parseFloat` method
      // https://tc39.github.io/ecma262/#sec-parsefloat-string


      $({
        global: true,
        forced: parseFloat != parseFloatImplementation },
      {
        parseFloat: parseFloatImplementation });

      /***/
    },
    /* 231 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var parseIntImplementation = __webpack_require__(195); // `parseInt` method
      // https://tc39.github.io/ecma262/#sec-parseint-string-radix


      $({
        global: true,
        forced: parseInt != parseIntImplementation },
      {
        parseInt: parseIntImplementation });

      /***/
    },
    /* 232 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var IS_PURE = __webpack_require__(24);

      var global = __webpack_require__(3);

      var path = __webpack_require__(47);

      var redefineAll = __webpack_require__(132);

      var setToStringTag = __webpack_require__(43);

      var setSpecies = __webpack_require__(124);

      var isObject = __webpack_require__(14);

      var aFunction = __webpack_require__(80);

      var anInstance = __webpack_require__(133);

      var classof = __webpack_require__(11);

      var iterate = __webpack_require__(155);

      var checkCorrectnessOfIteration = __webpack_require__(99);

      var speciesConstructor = __webpack_require__(137);

      var task = __webpack_require__(233).set;

      var microtask = __webpack_require__(234);

      var promiseResolve = __webpack_require__(236);

      var hostReportErrors = __webpack_require__(238);

      var newPromiseCapabilityModule = __webpack_require__(237);

      var perform = __webpack_require__(239);

      var userAgent = __webpack_require__(235);

      var InternalStateModule = __webpack_require__(26);

      var isForced = __webpack_require__(41);

      var wellKnownSymbol = __webpack_require__(44);

      var SPECIES = wellKnownSymbol('species');
      var PROMISE = 'Promise';
      var getInternalState = InternalStateModule.get;
      var setInternalState = InternalStateModule.set;
      var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
      var PromiseConstructor = global[PROMISE];
      var TypeError = global.TypeError;
      var document = global.document;
      var process = global.process;
      var $fetch = global.fetch;
      var versions = process && process.versions;
      var v8 = versions && versions.v8 || '';
      var newPromiseCapability = newPromiseCapabilityModule.f;
      var newGenericPromiseCapability = newPromiseCapability;
      var IS_NODE = classof(process) == 'process';
      var DISPATCH_EVENT = !!(document && document.createEvent && global.dispatchEvent);
      var UNHANDLED_REJECTION = 'unhandledrejection';
      var REJECTION_HANDLED = 'rejectionhandled';
      var PENDING = 0;
      var FULFILLED = 1;
      var REJECTED = 2;
      var HANDLED = 1;
      var UNHANDLED = 2;
      var Internal, OwnPromiseCapability, PromiseWrapper;
      var FORCED = isForced(PROMISE, function () {
        // correct subclassing with @@species support
        var promise = PromiseConstructor.resolve(1);

        var empty = function empty() {
          /* empty */
        };

        var FakePromise = (promise.constructor = {})[SPECIES] = function (exec) {
          exec(empty, empty);
        }; // unhandled rejections tracking support, NodeJS Promise without it fails @@species test


        return !((IS_NODE || typeof PromiseRejectionEvent == 'function') && (!IS_PURE || promise['finally']) && promise.then(empty) instanceof FakePromise // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
        // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
        // we can't detect it synchronously, so just check versions
        && v8.indexOf('6.6') !== 0 && userAgent.indexOf('Chrome/66') === -1);
      });
      var INCORRECT_ITERATION = FORCED || !checkCorrectnessOfIteration(function (iterable) {
        PromiseConstructor.all(iterable)['catch'](function () {
          /* empty */
        });
      }); // helpers

      var isThenable = function isThenable(it) {
        var then;
        return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
      };

      var notify = function notify(promise, state, isReject) {
        if (state.notified) return;
        state.notified = true;
        var chain = state.reactions;
        microtask(function () {
          var value = state.value;
          var ok = state.state == FULFILLED;
          var i = 0;

          var run = function run(reaction) {
            var handler = ok ? reaction.ok : reaction.fail;
            var resolve = reaction.resolve;
            var reject = reaction.reject;
            var domain = reaction.domain;
            var result, then, exited;

            try {
              if (handler) {
                if (!ok) {
                  if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
                  state.rejection = HANDLED;
                }

                if (handler === true) result = value;else {
                  if (domain) domain.enter();
                  result = handler(value); // may throw

                  if (domain) {
                    domain.exit();
                    exited = true;
                  }
                }

                if (result === reaction.promise) {
                  reject(TypeError('Promise-chain cycle'));
                } else if (then = isThenable(result)) {
                  then.call(result, resolve, reject);
                } else resolve(result);
              } else reject(value);
            } catch (error) {
              if (domain && !exited) domain.exit();
              reject(error);
            }
          };

          while (chain.length > i) run(chain[i++]); // variable length - can't use forEach


          state.reactions = [];
          state.notified = false;
          if (isReject && !state.rejection) onUnhandled(promise, state);
        });
      };

      var dispatchEvent = function dispatchEvent(name, promise, reason) {
        var event, handler;

        if (DISPATCH_EVENT) {
          event = document.createEvent('Event');
          event.promise = promise;
          event.reason = reason;
          event.initEvent(name, false, true);
          global.dispatchEvent(event);
        } else event = {
          promise: promise,
          reason: reason };


        if (handler = global['on' + name]) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
      };

      var onUnhandled = function onUnhandled(promise, state) {
        task.call(global, function () {
          var value = state.value;
          var IS_UNHANDLED = isUnhandled(state);
          var result;

          if (IS_UNHANDLED) {
            result = perform(function () {
              if (IS_NODE) {
                process.emit('unhandledRejection', value, promise);
              } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
            }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

            state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
            if (result.error) throw result.value;
          }
        });
      };

      var isUnhandled = function isUnhandled(state) {
        return state.rejection !== HANDLED && !state.parent;
      };

      var onHandleUnhandled = function onHandleUnhandled(promise, state) {
        task.call(global, function () {
          if (IS_NODE) {
            process.emit('rejectionHandled', promise);
          } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
        });
      };

      var bind = function bind(fn, promise, state, unwrap) {
        return function (value) {
          fn(promise, state, value, unwrap);
        };
      };

      var internalReject = function internalReject(promise, state, value, unwrap) {
        if (state.done) return;
        state.done = true;
        if (unwrap) state = unwrap;
        state.value = value;
        state.state = REJECTED;
        notify(promise, state, true);
      };

      var internalResolve = function internalResolve(promise, state, value, unwrap) {
        if (state.done) return;
        state.done = true;
        if (unwrap) state = unwrap;

        try {
          if (promise === value) throw TypeError("Promise can't be resolved itself");
          var then = isThenable(value);

          if (then) {
            microtask(function () {
              var wrapper = {
                done: false };


              try {
                then.call(value, bind(internalResolve, promise, wrapper, state), bind(internalReject, promise, wrapper, state));
              } catch (error) {
                internalReject(promise, wrapper, error, state);
              }
            });
          } else {
            state.value = value;
            state.state = FULFILLED;
            notify(promise, state, false);
          }
        } catch (error) {
          internalReject(promise, {
            done: false },
          error, state);
        }
      }; // constructor polyfill


      if (FORCED) {
        // 25.4.3.1 Promise(executor)
        PromiseConstructor = function Promise(executor) {
          anInstance(this, PromiseConstructor, PROMISE);
          aFunction(executor);
          Internal.call(this);
          var state = getInternalState(this);

          try {
            executor(bind(internalResolve, this, state), bind(internalReject, this, state));
          } catch (error) {
            internalReject(this, state, error);
          }
        }; // eslint-disable-next-line no-unused-vars


        Internal = function Promise(executor) {
          setInternalState(this, {
            type: PROMISE,
            done: false,
            notified: false,
            parent: false,
            reactions: [],
            rejection: false,
            state: PENDING,
            value: undefined$1 });

        };

        Internal.prototype = redefineAll(PromiseConstructor.prototype, {
          // `Promise.prototype.then` method
          // https://tc39.github.io/ecma262/#sec-promise.prototype.then
          then: function then(onFulfilled, onRejected) {
            var state = getInternalPromiseState(this);
            var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
            reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
            reaction.fail = typeof onRejected == 'function' && onRejected;
            reaction.domain = IS_NODE ? process.domain : undefined$1;
            state.parent = true;
            state.reactions.push(reaction);
            if (state.state != PENDING) notify(this, state, false);
            return reaction.promise;
          },
          // `Promise.prototype.catch` method
          // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
          'catch': function (onRejected) {
            return this.then(undefined$1, onRejected);
          } });


        OwnPromiseCapability = function () {
          var promise = new Internal();
          var state = getInternalState(promise);
          this.promise = promise;
          this.resolve = bind(internalResolve, promise, state);
          this.reject = bind(internalReject, promise, state);
        };

        newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
          return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
        }; // wrap fetch result


        if (!IS_PURE && typeof $fetch == 'function') $({
          global: true,
          enumerable: true,
          forced: true },
        {
          // eslint-disable-next-line no-unused-vars
          fetch: function fetch(input) {
            return promiseResolve(PromiseConstructor, $fetch.apply(global, arguments));
          } });

      }

      $({
        global: true,
        wrap: true,
        forced: FORCED },
      {
        Promise: PromiseConstructor });

      setToStringTag(PromiseConstructor, PROMISE, false, true);
      setSpecies(PROMISE);
      PromiseWrapper = path[PROMISE]; // statics

      $({
        target: PROMISE,
        stat: true,
        forced: FORCED },
      {
        // `Promise.reject` method
        // https://tc39.github.io/ecma262/#sec-promise.reject
        reject: function reject(r) {
          var capability = newPromiseCapability(this);
          capability.reject.call(undefined$1, r);
          return capability.promise;
        } });

      $({
        target: PROMISE,
        stat: true,
        forced: IS_PURE || FORCED },
      {
        // `Promise.resolve` method
        // https://tc39.github.io/ecma262/#sec-promise.resolve
        resolve: function resolve(x) {
          return promiseResolve(IS_PURE && this === PromiseWrapper ? PromiseConstructor : this, x);
        } });

      $({
        target: PROMISE,
        stat: true,
        forced: INCORRECT_ITERATION },
      {
        // `Promise.all` method
        // https://tc39.github.io/ecma262/#sec-promise.all
        all: function all(iterable) {
          var C = this;
          var capability = newPromiseCapability(C);
          var resolve = capability.resolve;
          var reject = capability.reject;
          var result = perform(function () {
            var $promiseResolve = aFunction(C.resolve);
            var values = [];
            var counter = 0;
            var remaining = 1;
            iterate(iterable, function (promise) {
              var index = counter++;
              var alreadyCalled = false;
              values.push(undefined$1);
              remaining++;
              $promiseResolve.call(C, promise).then(function (value) {
                if (alreadyCalled) return;
                alreadyCalled = true;
                values[index] = value;
                --remaining || resolve(values);
              }, reject);
            });
            --remaining || resolve(values);
          });
          if (result.error) reject(result.value);
          return capability.promise;
        },
        // `Promise.race` method
        // https://tc39.github.io/ecma262/#sec-promise.race
        race: function race(iterable) {
          var C = this;
          var capability = newPromiseCapability(C);
          var reject = capability.reject;
          var result = perform(function () {
            var $promiseResolve = aFunction(C.resolve);
            iterate(iterable, function (promise) {
              $promiseResolve.call(C, promise).then(capability.resolve, reject);
            });
          });
          if (result.error) reject(result.value);
          return capability.promise;
        } });

      /***/
    },
    /* 233 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var fails = __webpack_require__(6);

      var classof = __webpack_require__(11);

      var bind = __webpack_require__(79);

      var html = __webpack_require__(54);

      var createElement = __webpack_require__(17);

      var location = global.location;
      var set = global.setImmediate;
      var clear = global.clearImmediate;
      var process = global.process;
      var MessageChannel = global.MessageChannel;
      var Dispatch = global.Dispatch;
      var counter = 0;
      var queue = {};
      var ONREADYSTATECHANGE = 'onreadystatechange';
      var defer, channel, port;

      var run = function run(id) {
        // eslint-disable-next-line no-prototype-builtins
        if (queue.hasOwnProperty(id)) {
          var fn = queue[id];
          delete queue[id];
          fn();
        }
      };

      var runner = function runner(id) {
        return function () {
          run(id);
        };
      };

      var listener = function listener(event) {
        run(event.data);
      };

      var post = function post(id) {
        // old engines have not location.origin
        global.postMessage(id + '', location.protocol + '//' + location.host);
      }; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


      if (!set || !clear) {
        set = function setImmediate(fn) {
          var args = [];
          var i = 1;

          while (arguments.length > i) args.push(arguments[i++]);

          queue[++counter] = function () {
            // eslint-disable-next-line no-new-func
            (typeof fn == 'function' ? fn : Function(fn)).apply(undefined$1, args);
          };

          defer(counter);
          return counter;
        };

        clear = function clearImmediate(id) {
          delete queue[id];
        }; // Node.js 0.8-


        if (classof(process) == 'process') {
          defer = function (id) {
            process.nextTick(runner(id));
          }; // Sphere (JS game engine) Dispatch API

        } else if (Dispatch && Dispatch.now) {
          defer = function (id) {
            Dispatch.now(runner(id));
          }; // Browsers with MessageChannel, includes WebWorkers

        } else if (MessageChannel) {
          channel = new MessageChannel();
          port = channel.port2;
          channel.port1.onmessage = listener;
          defer = bind(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
          // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
        } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts && !fails(post)) {
          defer = post;
          global.addEventListener('message', listener, false); // IE8-
        } else if (ONREADYSTATECHANGE in createElement('script')) {
          defer = function (id) {
            html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
              html.removeChild(this);
              run(id);
            };
          }; // Rest old browsers

        } else {
          defer = function (id) {
            setTimeout(runner(id), 0);
          };
        }
      }

      module.exports = {
        set: set,
        clear: clear };

      /***/
    },
    /* 234 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var getOwnPropertyDescriptor = __webpack_require__(4).f;

      var classof = __webpack_require__(11);

      var macrotask = __webpack_require__(233).set;

      var userAgent = __webpack_require__(235);

      var MutationObserver = global.MutationObserver || global.WebKitMutationObserver;
      var process = global.process;
      var Promise = global.Promise;
      var IS_NODE = classof(process) == 'process'; // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`

      var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global, 'queueMicrotask');
      var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
      var flush, head, last, notify, toggle, node, promise; // modern engines have queueMicrotask method

      if (!queueMicrotask) {
        flush = function () {
          var parent, fn;
          if (IS_NODE && (parent = process.domain)) parent.exit();

          while (head) {
            fn = head.fn;
            head = head.next;

            try {
              fn();
            } catch (error) {
              if (head) notify();else last = undefined$1;
              throw error;
            }
          }

          last = undefined$1;
          if (parent) parent.enter();
        }; // Node.js


        if (IS_NODE) {
          notify = function () {
            process.nextTick(flush);
          }; // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339

        } else if (MutationObserver && !/(iphone|ipod|ipad).*applewebkit/i.test(userAgent)) {
          toggle = true;
          node = document.createTextNode('');
          new MutationObserver(flush).observe(node, {
            characterData: true });
          // eslint-disable-line no-new

          notify = function () {
            node.data = toggle = !toggle;
          }; // environments with maybe non-completely correct, but existent Promise

        } else if (Promise && Promise.resolve) {
          // Promise.resolve without an argument throws an error in LG WebOS 2
          promise = Promise.resolve(undefined$1);

          notify = function () {
            promise.then(flush);
          }; // for other environments - macrotask based on:
          // - setImmediate
          // - MessageChannel
          // - window.postMessag
          // - onreadystatechange
          // - setTimeout

        } else {
          notify = function () {
            // strange IE + webpack dev server bug - use .call(global)
            macrotask.call(global, flush);
          };
        }
      }

      module.exports = queueMicrotask || function (fn) {
        var task = {
          fn: fn,
          next: undefined$1 };

        if (last) last.next = task;

        if (!head) {
          head = task;
          notify();
        }

        last = task;
      };
      /***/

    },
    /* 235 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var navigator = global.navigator;
      module.exports = navigator && navigator.userAgent || '';
      /***/
    },
    /* 236 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20);

      var isObject = __webpack_require__(14);

      var newPromiseCapability = __webpack_require__(237);

      module.exports = function (C, x) {
        anObject(C);
        if (isObject(x) && x.constructor === C) return x;
        var promiseCapability = newPromiseCapability.f(C);
        var resolve = promiseCapability.resolve;
        resolve(x);
        return promiseCapability.promise;
      };
      /***/

    },
    /* 237 */

    /***/
    function (module, exports, __webpack_require__) {
      var aFunction = __webpack_require__(80);

      var PromiseCapability = function PromiseCapability(C) {
        var resolve, reject;
        this.promise = new C(function ($$resolve, $$reject) {
          if (resolve !== undefined$1 || reject !== undefined$1) throw TypeError('Bad Promise constructor');
          resolve = $$resolve;
          reject = $$reject;
        });
        this.resolve = aFunction(resolve);
        this.reject = aFunction(reject);
      }; // 25.4.1.5 NewPromiseCapability(C)


      module.exports.f = function (C) {
        return new PromiseCapability(C);
      };
      /***/

    },
    /* 238 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      module.exports = function (a, b) {
        var console = global.console;

        if (console && console.error) {
          arguments.length === 1 ? console.error(a) : console.error(a, b);
        }
      };
      /***/

    },
    /* 239 */

    /***/
    function (module, exports) {
      module.exports = function (exec) {
        try {
          return {
            error: false,
            value: exec() };

        } catch (error) {
          return {
            error: true,
            value: error };

        }
      };
      /***/

    },
    /* 240 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var getBuiltIn = __webpack_require__(125);

      var speciesConstructor = __webpack_require__(137);

      var promiseResolve = __webpack_require__(236); // `Promise.prototype.finally` method
      // https://tc39.github.io/ecma262/#sec-promise.prototype.finally


      $({
        target: 'Promise',
        proto: true,
        real: true },
      {
        'finally': function (onFinally) {
          var C = speciesConstructor(this, getBuiltIn('Promise'));
          var isFunction = typeof onFinally == 'function';
          return this.then(isFunction ? function (x) {
            return promiseResolve(C, onFinally()).then(function () {
              return x;
            });
          } : onFinally, isFunction ? function (e) {
            return promiseResolve(C, onFinally()).then(function () {
              throw e;
            });
          } : onFinally);
        } });

      /***/
    },
    /* 241 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var aFunction = __webpack_require__(80);

      var anObject = __webpack_require__(20);

      var fails = __webpack_require__(6);

      var nativeApply = (global.Reflect || {}).apply;
      var functionApply = Function.apply; // MS Edge argumentsList argument is optional

      var OPTIONAL_ARGUMENTS_LIST = !fails(function () {
        nativeApply(function () {
          /* empty */
        });
      }); // `Reflect.apply` method
      // https://tc39.github.io/ecma262/#sec-reflect.apply

      $({
        target: 'Reflect',
        stat: true,
        forced: OPTIONAL_ARGUMENTS_LIST },
      {
        apply: function apply(target, thisArgument, argumentsList) {
          aFunction(target);
          anObject(argumentsList);
          return nativeApply ? nativeApply(target, thisArgument, argumentsList) : functionApply.call(target, thisArgument, argumentsList);
        } });

      /***/
    },
    /* 242 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var create = __webpack_require__(52);

      var aFunction = __webpack_require__(80);

      var anObject = __webpack_require__(20);

      var isObject = __webpack_require__(14);

      var fails = __webpack_require__(6);

      var bind = __webpack_require__(147);

      var nativeConstruct = (global.Reflect || {}).construct; // `Reflect.construct` method
      // https://tc39.github.io/ecma262/#sec-reflect.construct
      // MS Edge supports only 2 arguments and argumentsList argument is optional
      // FF Nightly sets third argument as `new.target`, but does not create `this` from it

      var NEW_TARGET_BUG = fails(function () {
        function F() {
          /* empty */
        }

        return !(nativeConstruct(function () {
          /* empty */
        }, [], F) instanceof F);
      });
      var ARGS_BUG = !fails(function () {
        nativeConstruct(function () {
          /* empty */
        });
      });
      var FORCED = NEW_TARGET_BUG || ARGS_BUG;
      $({
        target: 'Reflect',
        stat: true,
        forced: FORCED,
        sham: FORCED },
      {
        construct: function construct(Target, args
        /* , newTarget */)
        {
          aFunction(Target);
          anObject(args);
          var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
          if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);

          if (Target == newTarget) {
            // w/o altered newTarget, optimization for 0-4 arguments
            switch (args.length) {
              case 0:
                return new Target();

              case 1:
                return new Target(args[0]);

              case 2:
                return new Target(args[0], args[1]);

              case 3:
                return new Target(args[0], args[1], args[2]);

              case 4:
                return new Target(args[0], args[1], args[2], args[3]);}
            // w/o altered newTarget, lot of arguments case


            var $args = [null];
            $args.push.apply($args, args);
            return new (bind.apply(Target, $args))();
          } // with altered newTarget, not support built-in constructors


          var proto = newTarget.prototype;
          var instance = create(isObject(proto) ? proto : Object.prototype);
          var result = Function.apply.call(Target, instance, args);
          return isObject(result) ? result : instance;
        } });

      /***/
    },
    /* 243 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var fails = __webpack_require__(6);

      var definePropertyModule = __webpack_require__(19);

      var anObject = __webpack_require__(20);

      var toPrimitive = __webpack_require__(13);

      var DESCRIPTORS = __webpack_require__(5); // MS Edge has broken Reflect.defineProperty - throwing instead of returning false


      var ERROR_INSTEAD_OF_FALSE = fails(function () {
        // eslint-disable-next-line no-undef
        Reflect.defineProperty(definePropertyModule.f({}, 1, {
          value: 1 }),
        1, {
          value: 2 });

      }); // `Reflect.defineProperty` method
      // https://tc39.github.io/ecma262/#sec-reflect.defineproperty

      $({
        target: 'Reflect',
        stat: true,
        forced: ERROR_INSTEAD_OF_FALSE,
        sham: !DESCRIPTORS },
      {
        defineProperty: function defineProperty(target, propertyKey, attributes) {
          anObject(target);
          propertyKey = toPrimitive(propertyKey, true);
          anObject(attributes);

          try {
            definePropertyModule.f(target, propertyKey, attributes);
            return true;
          } catch (error) {
            return false;
          }
        } });

      /***/
    },
    /* 244 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var getOwnPropertyDescriptor = __webpack_require__(4).f;

      var anObject = __webpack_require__(20); // `Reflect.deleteProperty` method
      // https://tc39.github.io/ecma262/#sec-reflect.deleteproperty


      $({
        target: 'Reflect',
        stat: true },
      {
        deleteProperty: function deleteProperty(target, propertyKey) {
          var descriptor = getOwnPropertyDescriptor(anObject(target), propertyKey);
          return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
        } });

      /***/
    },
    /* 245 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var getOwnPropertyDescriptorModule = __webpack_require__(4);

      var getPrototypeOf = __webpack_require__(107);

      var has = __webpack_require__(15);

      var isObject = __webpack_require__(14);

      var anObject = __webpack_require__(20); // `Reflect.get` method
      // https://tc39.github.io/ecma262/#sec-reflect.get


      function get(target, propertyKey
      /* , receiver */)
      {
        var receiver = arguments.length < 3 ? target : arguments[2];
        var descriptor, prototype;
        if (anObject(target) === receiver) return target[propertyKey];
        if (descriptor = getOwnPropertyDescriptorModule.f(target, propertyKey)) return has(descriptor, 'value') ? descriptor.value : descriptor.get === undefined$1 ? undefined$1 : descriptor.get.call(receiver);
        if (isObject(prototype = getPrototypeOf(target))) return get(prototype, propertyKey, receiver);
      }

      $({
        target: 'Reflect',
        stat: true },
      {
        get: get });

      /***/
    },
    /* 246 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var getOwnPropertyDescriptorModule = __webpack_require__(4);

      var anObject = __webpack_require__(20);

      var DESCRIPTORS = __webpack_require__(5); // `Reflect.getOwnPropertyDescriptor` method
      // https://tc39.github.io/ecma262/#sec-reflect.getownpropertydescriptor


      $({
        target: 'Reflect',
        stat: true,
        sham: !DESCRIPTORS },
      {
        getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
          return getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
        } });

      /***/
    },
    /* 247 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var objectGetPrototypeOf = __webpack_require__(107);

      var anObject = __webpack_require__(20);

      var CORRECT_PROTOTYPE_GETTER = __webpack_require__(108); // `Reflect.getPrototypeOf` method
      // https://tc39.github.io/ecma262/#sec-reflect.getprototypeof


      $({
        target: 'Reflect',
        stat: true,
        sham: !CORRECT_PROTOTYPE_GETTER },
      {
        getPrototypeOf: function getPrototypeOf(target) {
          return objectGetPrototypeOf(anObject(target));
        } });

      /***/
    },
    /* 248 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2); // `Reflect.has` method
      // https://tc39.github.io/ecma262/#sec-reflect.has


      $({
        target: 'Reflect',
        stat: true },
      {
        has: function has(target, propertyKey) {
          return propertyKey in target;
        } });

      /***/
    },
    /* 249 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var anObject = __webpack_require__(20);

      var objectIsExtensible = Object.isExtensible; // `Reflect.isExtensible` method
      // https://tc39.github.io/ecma262/#sec-reflect.isextensible

      $({
        target: 'Reflect',
        stat: true },
      {
        isExtensible: function isExtensible(target) {
          anObject(target);
          return objectIsExtensible ? objectIsExtensible(target) : true;
        } });

      /***/
    },
    /* 250 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var ownKeys = __webpack_require__(32); // `Reflect.ownKeys` method
      // https://tc39.github.io/ecma262/#sec-reflect.ownkeys


      $({
        target: 'Reflect',
        stat: true },
      {
        ownKeys: ownKeys });

      /***/
    },
    /* 251 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var getBuiltIn = __webpack_require__(125);

      var anObject = __webpack_require__(20);

      var FREEZING = __webpack_require__(154); // `Reflect.preventExtensions` method
      // https://tc39.github.io/ecma262/#sec-reflect.preventextensions


      $({
        target: 'Reflect',
        stat: true,
        sham: !FREEZING },
      {
        preventExtensions: function preventExtensions(target) {
          anObject(target);

          try {
            var objectPreventExtensions = getBuiltIn('Object', 'preventExtensions');
            if (objectPreventExtensions) objectPreventExtensions(target);
            return true;
          } catch (error) {
            return false;
          }
        } });

      /***/
    },
    /* 252 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var definePropertyModule = __webpack_require__(19);

      var getOwnPropertyDescriptorModule = __webpack_require__(4);

      var getPrototypeOf = __webpack_require__(107);

      var has = __webpack_require__(15);

      var createPropertyDescriptor = __webpack_require__(8);

      var anObject = __webpack_require__(20);

      var isObject = __webpack_require__(14); // `Reflect.set` method
      // https://tc39.github.io/ecma262/#sec-reflect.set


      function set(target, propertyKey, V
      /* , receiver */)
      {
        var receiver = arguments.length < 4 ? target : arguments[3];
        var ownDescriptor = getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
        var existingDescriptor, prototype;

        if (!ownDescriptor) {
          if (isObject(prototype = getPrototypeOf(target))) {
            return set(prototype, propertyKey, V, receiver);
          }

          ownDescriptor = createPropertyDescriptor(0);
        }

        if (has(ownDescriptor, 'value')) {
          if (ownDescriptor.writable === false || !isObject(receiver)) return false;

          if (existingDescriptor = getOwnPropertyDescriptorModule.f(receiver, propertyKey)) {
            if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
            existingDescriptor.value = V;
            definePropertyModule.f(receiver, propertyKey, existingDescriptor);
          } else definePropertyModule.f(receiver, propertyKey, createPropertyDescriptor(0, V));

          return true;
        }

        return ownDescriptor.set === undefined$1 ? false : (ownDescriptor.set.call(receiver, V), true);
      }

      $({
        target: 'Reflect',
        stat: true },
      {
        set: set });

      /***/
    },
    /* 253 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var objectSetPrototypeOf = __webpack_require__(109);

      var validateSetPrototypeOfArguments = __webpack_require__(110); // `Reflect.setPrototypeOf` method
      // https://tc39.github.io/ecma262/#sec-reflect.setprototypeof


      if (objectSetPrototypeOf) $({
        target: 'Reflect',
        stat: true },
      {
        setPrototypeOf: function setPrototypeOf(target, proto) {
          validateSetPrototypeOfArguments(target, proto);

          try {
            objectSetPrototypeOf(target, proto);
            return true;
          } catch (error) {
            return false;
          }
        } });

      /***/
    },
    /* 254 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var global = __webpack_require__(3);

      var isForced = __webpack_require__(41);

      var inheritIfRequired = __webpack_require__(156);

      var defineProperty = __webpack_require__(19).f;

      var getOwnPropertyNames = __webpack_require__(33).f;

      var isRegExp = __webpack_require__(255);

      var getFlags = __webpack_require__(256);

      var redefine = __webpack_require__(21);

      var fails = __webpack_require__(6);

      var setSpecies = __webpack_require__(124);

      var wellKnownSymbol = __webpack_require__(44);

      var MATCH = wellKnownSymbol('match');
      var NativeRegExp = global.RegExp;
      var RegExpPrototype = NativeRegExp.prototype;
      var re1 = /a/g;
      var re2 = /a/g; // "new" should create a new object, old webkit bug

      var CORRECT_NEW = new NativeRegExp(re1) !== re1;
      var FORCED = isForced('RegExp', DESCRIPTORS && (!CORRECT_NEW || fails(function () {
        re2[MATCH] = false; // RegExp constructor can alter flags and IsRegExp works correct with @@match

        return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
      }))); // `RegExp` constructor
      // https://tc39.github.io/ecma262/#sec-regexp-constructor

      if (FORCED) {
        var RegExpWrapper = function RegExp(pattern, flags) {
          var thisIsRegExp = this instanceof RegExpWrapper;
          var patternIsRegExp = isRegExp(pattern);
          var flagsAreUndefined = flags === undefined$1;
          return !thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined ? pattern : inheritIfRequired(CORRECT_NEW ? new NativeRegExp(patternIsRegExp && !flagsAreUndefined ? pattern.source : pattern, flags) : NativeRegExp((patternIsRegExp = pattern instanceof RegExpWrapper) ? pattern.source : pattern, patternIsRegExp && flagsAreUndefined ? getFlags.call(pattern) : flags), thisIsRegExp ? this : RegExpPrototype, RegExpWrapper);
        };

        var proxy = function proxy(key) {
          key in RegExpWrapper || defineProperty(RegExpWrapper, key, {
            configurable: true,
            get: function () {
              return NativeRegExp[key];
            },
            set: function (it) {
              NativeRegExp[key] = it;
            } });

        };

        var keys = getOwnPropertyNames(NativeRegExp);
        var i = 0;

        while (i < keys.length) proxy(keys[i++]);

        RegExpPrototype.constructor = RegExpWrapper;
        RegExpWrapper.prototype = RegExpPrototype;
        redefine(global, 'RegExp', RegExpWrapper);
      } // https://tc39.github.io/ecma262/#sec-get-regexp-@@species


      setSpecies('RegExp');
      /***/
    },
    /* 255 */

    /***/
    function (module, exports, __webpack_require__) {
      var isObject = __webpack_require__(14);

      var classof = __webpack_require__(11);

      var wellKnownSymbol = __webpack_require__(44);

      var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
      // https://tc39.github.io/ecma262/#sec-isregexp

      module.exports = function (it) {
        var isRegExp;
        return isObject(it) && ((isRegExp = it[MATCH]) !== undefined$1 ? !!isRegExp : classof(it) == 'RegExp');
      };
      /***/

    },
    /* 256 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20); // `RegExp.prototype.flags` getter implementation
      // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


      module.exports = function () {
        var that = anObject(this);
        var result = '';
        if (that.global) result += 'g';
        if (that.ignoreCase) result += 'i';
        if (that.multiline) result += 'm';
        if (that.unicode) result += 'u';
        if (that.sticky) result += 'y';
        return result;
      };
      /***/

    },
    /* 257 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var exec = __webpack_require__(258);

      $({
        target: 'RegExp',
        proto: true,
        forced: /./.exec !== exec },
      {
        exec: exec });

      /***/
    },
    /* 258 */

    /***/
    function (module, exports, __webpack_require__) {
      var regexpFlags = __webpack_require__(256);

      var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
      // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
      // which loads this file before patching the method.

      var nativeReplace = String.prototype.replace;
      var patchedExec = nativeExec;

      var UPDATES_LAST_INDEX_WRONG = function () {
        var re1 = /a/;
        var re2 = /b*/g;
        nativeExec.call(re1, 'a');
        nativeExec.call(re2, 'a');
        return re1.lastIndex !== 0 || re2.lastIndex !== 0;
      }(); // nonparticipating capturing group, copied from es5-shim's String#split patch.


      var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined$1;
      var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

      if (PATCH) {
        patchedExec = function exec(str) {
          var re = this;
          var lastIndex, reCopy, match, i;

          if (NPCG_INCLUDED) {
            reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
          }

          if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
          match = nativeExec.call(re, str);

          if (UPDATES_LAST_INDEX_WRONG && match) {
            re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
          }

          if (NPCG_INCLUDED && match && match.length > 1) {
            // Fix browsers whose `exec` methods don't consistently return `undefined`
            // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
            nativeReplace.call(match[0], reCopy, function () {
              for (i = 1; i < arguments.length - 2; i++) {
                if (arguments[i] === undefined$1) match[i] = undefined$1;
              }
            });
          }

          return match;
        };
      }

      module.exports = patchedExec;
      /***/
    },
    /* 259 */

    /***/
    function (module, exports, __webpack_require__) {
      var DESCRIPTORS = __webpack_require__(5);

      var objectDefinePropertyModule = __webpack_require__(19);

      var regExpFlags = __webpack_require__(256); // `RegExp.prototype.flags` getter
      // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


      if (DESCRIPTORS && /./g.flags != 'g') {
        objectDefinePropertyModule.f(RegExp.prototype, 'flags', {
          configurable: true,
          get: regExpFlags });

      }
      /***/

    },
    /* 260 */

    /***/
    function (module, exports, __webpack_require__) {
      var redefine = __webpack_require__(21);

      var anObject = __webpack_require__(20);

      var fails = __webpack_require__(6);

      var flags = __webpack_require__(256);

      var TO_STRING = 'toString';
      var nativeToString = /./[TO_STRING];
      var RegExpPrototype = RegExp.prototype;
      var NOT_GENERIC = fails(function () {
        return nativeToString.call({
          source: 'a',
          flags: 'b' }) !=
        '/a/b';
      }); // FF44- RegExp#toString has a wrong name

      var INCORRECT_NAME = nativeToString.name != TO_STRING; // `RegExp.prototype.toString` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring

      if (NOT_GENERIC || INCORRECT_NAME) {
        redefine(RegExp.prototype, TO_STRING, function toString() {
          var R = anObject(this);
          var p = String(R.source);
          var rf = R.flags;
          var f = String(rf === undefined$1 && R instanceof RegExp && !('flags' in RegExpPrototype) ? flags.call(R) : rf);
          return '/' + p + '/' + f;
        }, {
          unsafe: true });

      }
      /***/

    },
    /* 261 */

    /***/
    function (module, exports, __webpack_require__) {
      var collection = __webpack_require__(152);

      var collectionStrong = __webpack_require__(157); // `Set` constructor
      // https://tc39.github.io/ecma262/#sec-set-objects


      module.exports = collection('Set', function (get) {
        return function Set() {
          return get(this, arguments.length > 0 ? arguments[0] : undefined$1);
        };
      }, collectionStrong);
      /***/
    },
    /* 262 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalCodePointAt = __webpack_require__(263); // `String.prototype.codePointAt` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat


      $({
        target: 'String',
        proto: true },
      {
        codePointAt: function codePointAt(pos) {
          return internalCodePointAt(this, pos);
        } });

      /***/
    },
    /* 263 */

    /***/
    function (module, exports, __webpack_require__) {
      var toInteger = __webpack_require__(37);

      var requireObjectCoercible = __webpack_require__(12); // CONVERT_TO_STRING: true  -> String#at
      // CONVERT_TO_STRING: false -> String#codePointAt


      module.exports = function (that, pos, CONVERT_TO_STRING) {
        var S = String(requireObjectCoercible(that));
        var position = toInteger(pos);
        var size = S.length;
        var first, second;
        if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined$1;
        first = S.charCodeAt(position);
        return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
      };
      /***/

    },
    /* 264 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toLength = __webpack_require__(36);

      var validateArguments = __webpack_require__(265);

      var correctIsRegExpLogic = __webpack_require__(266);

      var ENDS_WITH = 'endsWith';
      var nativeEndsWith = ''[ENDS_WITH];
      var min = Math.min; // `String.prototype.endsWith` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.endswith

      $({
        target: 'String',
        proto: true,
        forced: !correctIsRegExpLogic(ENDS_WITH) },
      {
        endsWith: function endsWith(searchString
        /* , endPosition = @length */)
        {
          var that = validateArguments(this, searchString, ENDS_WITH);
          var endPosition = arguments.length > 1 ? arguments[1] : undefined$1;
          var len = toLength(that.length);
          var end = endPosition === undefined$1 ? len : min(toLength(endPosition), len);
          var search = String(searchString);
          return nativeEndsWith ? nativeEndsWith.call(that, search, end) : that.slice(end - search.length, end) === search;
        } });

      /***/
    },
    /* 265 */

    /***/
    function (module, exports, __webpack_require__) {
      // helper for String#{startsWith, endsWith, includes}
      var isRegExp = __webpack_require__(255);

      var requireObjectCoercible = __webpack_require__(12);

      module.exports = function (that, searchString, NAME) {
        if (isRegExp(searchString)) {
          throw TypeError('String.prototype.' + NAME + " doesn't accept regex");
        }

        return String(requireObjectCoercible(that));
      };
      /***/

    },
    /* 266 */

    /***/
    function (module, exports, __webpack_require__) {
      var wellKnownSymbol = __webpack_require__(44);

      var MATCH = wellKnownSymbol('match');

      module.exports = function (METHOD_NAME) {
        var regexp = /./;

        try {
          '/./'[METHOD_NAME](regexp);
        } catch (e) {
          try {
            regexp[MATCH] = false;
            return '/./'[METHOD_NAME](regexp);
          } catch (f) {
            /* empty */
          }
        }

        return false;
      };
      /***/

    },
    /* 267 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toAbsoluteIndex = __webpack_require__(38);

      var fromCharCode = String.fromCharCode;
      var nativeFromCodePoint = String.fromCodePoint; // length should be 1, old FF problem

      var INCORRECT_LENGTH = !!nativeFromCodePoint && nativeFromCodePoint.length != 1; // `String.fromCodePoint` method
      // https://tc39.github.io/ecma262/#sec-string.fromcodepoint

      $({
        target: 'String',
        stat: true,
        forced: INCORRECT_LENGTH },
      {
        fromCodePoint: function fromCodePoint(x) {
          // eslint-disable-line no-unused-vars
          var elements = [];
          var length = arguments.length;
          var i = 0;
          var code;

          while (length > i) {
            code = +arguments[i++];
            if (toAbsoluteIndex(code, 0x10FFFF) !== code) throw RangeError(code + ' is not a valid code point');
            elements.push(code < 0x10000 ? fromCharCode(code) : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00));
          }

          return elements.join('');
        } });

      /***/
    },
    /* 268 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var validateArguments = __webpack_require__(265);

      var correctIsRegExpLogic = __webpack_require__(266); // `String.prototype.includes` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.includes


      $({
        target: 'String',
        proto: true,
        forced: !correctIsRegExpLogic('includes') },
      {
        includes: function includes(searchString
        /* , position = 0 */)
        {
          return !!~validateArguments(this, searchString, 'includes').indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined$1);
        } });

      /***/
    },
    /* 269 */

    /***/
    function (module, exports, __webpack_require__) {
      var codePointAt = __webpack_require__(263);

      var InternalStateModule = __webpack_require__(26);

      var defineIterator = __webpack_require__(104);

      var STRING_ITERATOR = 'String Iterator';
      var setInternalState = InternalStateModule.set;
      var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
      // https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator

      defineIterator(String, 'String', function (iterated) {
        setInternalState(this, {
          type: STRING_ITERATOR,
          string: String(iterated),
          index: 0 });
        // `%StringIteratorPrototype%.next` method
        // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
      }, function next() {
        var state = getInternalState(this);
        var string = state.string;
        var index = state.index;
        var point;
        if (index >= string.length) return {
          value: undefined$1,
          done: true };

        point = codePointAt(string, index, true);
        state.index += point.length;
        return {
          value: point,
          done: false };

      });
      /***/
    },
    /* 270 */

    /***/
    function (module, exports, __webpack_require__) {
      var fixRegExpWellKnownSymbolLogic = __webpack_require__(271);

      var anObject = __webpack_require__(20);

      var toLength = __webpack_require__(36);

      var requireObjectCoercible = __webpack_require__(12);

      var advanceStringIndex = __webpack_require__(272);

      var regExpExec = __webpack_require__(273); // @@match logic


      fixRegExpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
        return [// `String.prototype.match` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.match
        function match(regexp) {
          var O = requireObjectCoercible(this);
          var matcher = regexp == undefined$1 ? undefined$1 : regexp[MATCH];
          return matcher !== undefined$1 ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
        }, // `RegExp.prototype[@@match]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
        function (regexp) {
          var res = maybeCallNative(nativeMatch, regexp, this);
          if (res.done) return res.value;
          var rx = anObject(regexp);
          var S = String(this);
          if (!rx.global) return regExpExec(rx, S);
          var fullUnicode = rx.unicode;
          rx.lastIndex = 0;
          var A = [];
          var n = 0;
          var result;

          while ((result = regExpExec(rx, S)) !== null) {
            var matchStr = String(result[0]);
            A[n] = matchStr;
            if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
            n++;
          }

          return n === 0 ? null : A;
        }];
      });
      /***/
    },
    /* 271 */

    /***/
    function (module, exports, __webpack_require__) {
      var hide = __webpack_require__(18);

      var redefine = __webpack_require__(21);

      var fails = __webpack_require__(6);

      var wellKnownSymbol = __webpack_require__(44);

      var regexpExec = __webpack_require__(258);

      var SPECIES = wellKnownSymbol('species');
      var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
        // #replace needs built-in support for named groups.
        // #match works fine because it just return the exec results, even if it has
        // a "grops" property.
        var re = /./;

        re.exec = function () {
          var result = [];
          result.groups = {
            a: '7' };

          return result;
        };

        return ''.replace(re, '$<a>') !== '7';
      }); // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
      // Weex JS has frozen built-in prototypes, so use try / catch wrapper

      var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
        var re = /(?:)/;
        var originalExec = re.exec;

        re.exec = function () {
          return originalExec.apply(this, arguments);
        };

        var result = 'ab'.split(re);
        return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
      });

      module.exports = function (KEY, length, exec, sham) {
        var SYMBOL = wellKnownSymbol(KEY);
        var DELEGATES_TO_SYMBOL = !fails(function () {
          // String methods call symbol-named RegEp methods
          var O = {};

          O[SYMBOL] = function () {
            return 7;
          };

          return ''[KEY](O) != 7;
        });
        var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
          // Symbol-named RegExp methods call .exec
          var execCalled = false;
          var re = /a/;

          re.exec = function () {
            execCalled = true;
            return null;
          };

          if (KEY === 'split') {
            // RegExp[@@split] doesn't call the regex's exec method, but first creates
            // a new one. We need to return the patched regex when creating the new one.
            re.constructor = {};

            re.constructor[SPECIES] = function () {
              return re;
            };
          }

          re[SYMBOL]('');
          return !execCalled;
        });

        if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
          var nativeRegExpMethod = /./[SYMBOL];
          var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
            if (regexp.exec === regexpExec) {
              if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
                // The native String method already delegates to @@method (this
                // polyfilled function), leasing to infinite recursion.
                // We avoid it by directly calling the native @@method method.
                return {
                  done: true,
                  value: nativeRegExpMethod.call(regexp, str, arg2) };

              }

              return {
                done: true,
                value: nativeMethod.call(str, regexp, arg2) };

            }

            return {
              done: false };

          });
          var stringMethod = methods[0];
          var regexMethod = methods[1];
          redefine(String.prototype, KEY, stringMethod);
          redefine(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
          // 21.2.5.11 RegExp.prototype[@@split](string, limit)
          ? function (string, arg) {
            return regexMethod.call(string, this, arg);
          } // 21.2.5.6 RegExp.prototype[@@match](string)
          // 21.2.5.9 RegExp.prototype[@@search](string)
          : function (string) {
            return regexMethod.call(string, this);
          });
          if (sham) hide(RegExp.prototype[SYMBOL], 'sham', true);
        }
      };
      /***/

    },
    /* 272 */

    /***/
    function (module, exports, __webpack_require__) {
      var codePointAt = __webpack_require__(263); // `AdvanceStringIndex` abstract operation
      // https://tc39.github.io/ecma262/#sec-advancestringindex


      module.exports = function (S, index, unicode) {
        return index + (unicode ? codePointAt(S, index, true).length : 1);
      };
      /***/

    },
    /* 273 */

    /***/
    function (module, exports, __webpack_require__) {
      var classof = __webpack_require__(11);

      var regexpExec = __webpack_require__(258); // `RegExpExec` abstract operation
      // https://tc39.github.io/ecma262/#sec-regexpexec


      module.exports = function (R, S) {
        var exec = R.exec;

        if (typeof exec === 'function') {
          var result = exec.call(R, S);

          if (typeof result !== 'object') {
            throw TypeError('RegExp exec method returned something other than an Object or null');
          }

          return result;
        }

        if (classof(R) !== 'RegExp') {
          throw TypeError('RegExp#exec called on incompatible receiver');
        }

        return regexpExec.call(R, S);
      };
      /***/

    },
    /* 274 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createIteratorConstructor = __webpack_require__(105);

      var requireObjectCoercible = __webpack_require__(12);

      var toLength = __webpack_require__(36);

      var aFunction = __webpack_require__(80);

      var anObject = __webpack_require__(20);

      var classof = __webpack_require__(98);

      var getFlags = __webpack_require__(256);

      var hide = __webpack_require__(18);

      var wellKnownSymbol = __webpack_require__(44);

      var speciesConstructor = __webpack_require__(137);

      var advanceStringIndex = __webpack_require__(272);

      var InternalStateModule = __webpack_require__(26);

      var IS_PURE = __webpack_require__(24);

      var MATCH_ALL = wellKnownSymbol('matchAll');
      var REGEXP_STRING = 'RegExp String';
      var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
      var setInternalState = InternalStateModule.set;
      var getInternalState = InternalStateModule.getterFor(REGEXP_STRING_ITERATOR);
      var RegExpPrototype = RegExp.prototype;
      var regExpBuiltinExec = RegExpPrototype.exec;

      var regExpExec = function regExpExec(R, S) {
        var exec = R.exec;
        var result;

        if (typeof exec == 'function') {
          result = exec.call(R, S);
          if (typeof result != 'object') throw TypeError('Incorrect exec result');
          return result;
        }

        return regExpBuiltinExec.call(R, S);
      }; // eslint-disable-next-line max-len


      var $RegExpStringIterator = createIteratorConstructor(function RegExpStringIterator(regexp, string, global, fullUnicode) {
        setInternalState(this, {
          type: REGEXP_STRING_ITERATOR,
          regexp: regexp,
          string: string,
          global: global,
          unicode: fullUnicode,
          done: false });

      }, REGEXP_STRING, function next() {
        var state = getInternalState(this);
        if (state.done) return {
          value: undefined$1,
          done: true };

        var R = state.regexp;
        var S = state.string;
        var match = regExpExec(R, S);
        if (match === null) return {
          value: undefined$1,
          done: state.done = true };


        if (state.global) {
          if (String(match[0]) == '') R.lastIndex = advanceStringIndex(S, toLength(R.lastIndex), state.unicode);
          return {
            value: match,
            done: false };

        }

        state.done = true;
        return {
          value: match,
          done: false };

      });

      var $matchAll = function $matchAll(string) {
        var R = anObject(this);
        var S = String(string);
        var C, flagsValue, flags, matcher, global, fullUnicode;
        C = speciesConstructor(R, RegExp);
        flagsValue = R.flags;

        if (flagsValue === undefined$1 && R instanceof RegExp && !('flags' in RegExpPrototype)) {
          flagsValue = getFlags.call(R);
        }

        flags = flagsValue === undefined$1 ? '' : String(flagsValue);
        matcher = new C(C === RegExp ? R.source : R, flags);
        global = !!~flags.indexOf('g');
        fullUnicode = !!~flags.indexOf('u');
        matcher.lastIndex = toLength(R.lastIndex);
        return new $RegExpStringIterator(matcher, S, global, fullUnicode);
      }; // `String.prototype.matchAll` method
      // https://github.com/tc39/proposal-string-matchall


      $({
        target: 'String',
        proto: true },
      {
        matchAll: function matchAll(regexp) {
          var O = requireObjectCoercible(this);
          var S, matcher, rx;

          if (regexp != null) {
            matcher = regexp[MATCH_ALL];
            if (matcher === undefined$1 && IS_PURE && classof(regexp) == 'RegExp') matcher = $matchAll;
            if (matcher != null) return aFunction(matcher).call(regexp, O);
          }

          S = String(O);
          rx = new RegExp(regexp, 'g');
          return IS_PURE ? $matchAll.call(rx, S) : rx[MATCH_ALL](S);
        } });

      IS_PURE || MATCH_ALL in RegExpPrototype || hide(RegExpPrototype, MATCH_ALL, $matchAll);
      /***/
    },
    /* 275 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalStringPad = __webpack_require__(276);

      var WEBKIT_BUG = __webpack_require__(277); // `String.prototype.padEnd` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.padend


      $({
        target: 'String',
        proto: true,
        forced: WEBKIT_BUG },
      {
        padEnd: function padEnd(maxLength
        /* , fillString = ' ' */)
        {
          return internalStringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined$1, false);
        } });

      /***/
    },
    /* 276 */

    /***/
    function (module, exports, __webpack_require__) {
      // https://github.com/tc39/proposal-string-pad-start-end
      var toLength = __webpack_require__(36);

      var repeat = __webpack_require__(198);

      var requireObjectCoercible = __webpack_require__(12);

      module.exports = function (that, maxLength, fillString, left) {
        var S = String(requireObjectCoercible(that));
        var stringLength = S.length;
        var fillStr = fillString === undefined$1 ? ' ' : String(fillString);
        var intMaxLength = toLength(maxLength);
        var fillLen, stringFiller;
        if (intMaxLength <= stringLength || fillStr == '') return S;
        fillLen = intMaxLength - stringLength;
        stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
        if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
        return left ? stringFiller + S : S + stringFiller;
      };
      /***/

    },
    /* 277 */

    /***/
    function (module, exports, __webpack_require__) {
      // https://github.com/zloirock/core-js/issues/280
      var userAgent = __webpack_require__(235); // eslint-disable-next-line unicorn/no-unsafe-regex


      module.exports = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent);
      /***/
    },
    /* 278 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalStringPad = __webpack_require__(276);

      var WEBKIT_BUG = __webpack_require__(277); // `String.prototype.padStart` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.padstart


      $({
        target: 'String',
        proto: true,
        forced: WEBKIT_BUG },
      {
        padStart: function padStart(maxLength
        /* , fillString = ' ' */)
        {
          return internalStringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined$1, true);
        } });

      /***/
    },
    /* 279 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toIndexedObject = __webpack_require__(9);

      var toLength = __webpack_require__(36); // `String.raw` method
      // https://tc39.github.io/ecma262/#sec-string.raw


      $({
        target: 'String',
        stat: true },
      {
        raw: function raw(template) {
          var rawTemplate = toIndexedObject(template.raw);
          var literalSegments = toLength(rawTemplate.length);
          var argumentsLength = arguments.length;
          var elements = [];
          var i = 0;

          while (literalSegments > i) {
            elements.push(String(rawTemplate[i++]));
            if (i < argumentsLength) elements.push(String(arguments[i]));
          }

          return elements.join('');
        } });

      /***/
    },
    /* 280 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var repeat = __webpack_require__(198); // `String.prototype.repeat` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.repeat


      $({
        target: 'String',
        proto: true },
      {
        repeat: repeat });

      /***/
    },
    /* 281 */

    /***/
    function (module, exports, __webpack_require__) {
      var fixRegExpWellKnownSymbolLogic = __webpack_require__(271);

      var anObject = __webpack_require__(20);

      var toObject = __webpack_require__(51);

      var toLength = __webpack_require__(36);

      var toInteger = __webpack_require__(37);

      var requireObjectCoercible = __webpack_require__(12);

      var advanceStringIndex = __webpack_require__(272);

      var regExpExec = __webpack_require__(273);

      var max = Math.max;
      var min = Math.min;
      var floor = Math.floor;
      var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
      var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

      var maybeToString = function maybeToString(it) {
        return it === undefined$1 ? it : String(it);
      }; // @@replace logic


      fixRegExpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative) {
        return [// `String.prototype.replace` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.replace
        function replace(searchValue, replaceValue) {
          var O = requireObjectCoercible(this);
          var replacer = searchValue == undefined$1 ? undefined$1 : searchValue[REPLACE];
          return replacer !== undefined$1 ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
        }, // `RegExp.prototype[@@replace]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
        function (regexp, replaceValue) {
          var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
          if (res.done) return res.value;
          var rx = anObject(regexp);
          var S = String(this);
          var functionalReplace = typeof replaceValue === 'function';
          if (!functionalReplace) replaceValue = String(replaceValue);
          var global = rx.global;

          if (global) {
            var fullUnicode = rx.unicode;
            rx.lastIndex = 0;
          }

          var results = [];

          while (true) {
            var result = regExpExec(rx, S);
            if (result === null) break;
            results.push(result);
            if (!global) break;
            var matchStr = String(result[0]);
            if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
          }

          var accumulatedResult = '';
          var nextSourcePosition = 0;

          for (var i = 0; i < results.length; i++) {
            result = results[i];
            var matched = String(result[0]);
            var position = max(min(toInteger(result.index), S.length), 0);
            var captures = []; // NOTE: This is equivalent to
            //   captures = result.slice(1).map(maybeToString)
            // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
            // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
            // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

            for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));

            var namedCaptures = result.groups;

            if (functionalReplace) {
              var replacerArgs = [matched].concat(captures, position, S);
              if (namedCaptures !== undefined$1) replacerArgs.push(namedCaptures);
              var replacement = String(replaceValue.apply(undefined$1, replacerArgs));
            } else {
              replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
            }

            if (position >= nextSourcePosition) {
              accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
              nextSourcePosition = position + matched.length;
            }
          }

          return accumulatedResult + S.slice(nextSourcePosition);
        }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

        function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
          var tailPos = position + matched.length;
          var m = captures.length;
          var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

          if (namedCaptures !== undefined$1) {
            namedCaptures = toObject(namedCaptures);
            symbols = SUBSTITUTION_SYMBOLS;
          }

          return nativeReplace.call(replacement, symbols, function (match, ch) {
            var capture;

            switch (ch.charAt(0)) {
              case '$':
                return '$';

              case '&':
                return matched;

              case '`':
                return str.slice(0, position);

              case "'":
                return str.slice(tailPos);

              case '<':
                capture = namedCaptures[ch.slice(1, -1)];
                break;

              default:
                // \d\d?
                var n = +ch;
                if (n === 0) return match;

                if (n > m) {
                  var f = floor(n / 10);
                  if (f === 0) return match;
                  if (f <= m) return captures[f - 1] === undefined$1 ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
                  return match;
                }

                capture = captures[n - 1];}


            return capture === undefined$1 ? '' : capture;
          });
        }
      });
      /***/
    },
    /* 282 */

    /***/
    function (module, exports, __webpack_require__) {
      var fixRegExpWellKnownSymbolLogic = __webpack_require__(271);

      var anObject = __webpack_require__(20);

      var requireObjectCoercible = __webpack_require__(12);

      var sameValue = __webpack_require__(217);

      var regExpExec = __webpack_require__(273); // @@search logic


      fixRegExpWellKnownSymbolLogic('search', 1, function (SEARCH, nativeSearch, maybeCallNative) {
        return [// `String.prototype.search` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.search
        function search(regexp) {
          var O = requireObjectCoercible(this);
          var searcher = regexp == undefined$1 ? undefined$1 : regexp[SEARCH];
          return searcher !== undefined$1 ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
        }, // `RegExp.prototype[@@search]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
        function (regexp) {
          var res = maybeCallNative(nativeSearch, regexp, this);
          if (res.done) return res.value;
          var rx = anObject(regexp);
          var S = String(this);
          var previousLastIndex = rx.lastIndex;
          if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
          var result = regExpExec(rx, S);
          if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
          return result === null ? -1 : result.index;
        }];
      });
      /***/
    },
    /* 283 */

    /***/
    function (module, exports, __webpack_require__) {
      var fixRegExpWellKnownSymbolLogic = __webpack_require__(271);

      var isRegExp = __webpack_require__(255);

      var anObject = __webpack_require__(20);

      var requireObjectCoercible = __webpack_require__(12);

      var speciesConstructor = __webpack_require__(137);

      var advanceStringIndex = __webpack_require__(272);

      var toLength = __webpack_require__(36);

      var callRegExpExec = __webpack_require__(273);

      var regexpExec = __webpack_require__(258);

      var fails = __webpack_require__(6);

      var arrayPush = [].push;
      var min = Math.min;
      var MAX_UINT32 = 0xFFFFFFFF; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

      var SUPPORTS_Y = !fails(function () {
        return !RegExp(MAX_UINT32, 'y');
      }); // @@split logic

      fixRegExpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
        var internalSplit;

        if ('abbc'.split(/(b)*/)[1] == 'c' || 'test'.split(/(?:)/, -1).length != 4 || 'ab'.split(/(?:ab)*/).length != 2 || '.'.split(/(.?)(.?)/).length != 4 || '.'.split(/()()/).length > 1 || ''.split(/.?/).length) {
          // based on es5-shim implementation, need to rework it
          internalSplit = function (separator, limit) {
            var string = String(requireObjectCoercible(this));
            var lim = limit === undefined$1 ? MAX_UINT32 : limit >>> 0;
            if (lim === 0) return [];
            if (separator === undefined$1) return [string]; // If `separator` is not a regex, use native split

            if (!isRegExp(separator)) {
              return nativeSplit.call(string, separator, lim);
            }

            var output = [];
            var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
            var lastLastIndex = 0; // Make `global` and avoid `lastIndex` issues by working with a copy

            var separatorCopy = new RegExp(separator.source, flags + 'g');
            var match, lastIndex, lastLength;

            while (match = regexpExec.call(separatorCopy, string)) {
              lastIndex = separatorCopy.lastIndex;

              if (lastIndex > lastLastIndex) {
                output.push(string.slice(lastLastIndex, match.index));
                if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
                lastLength = match[0].length;
                lastLastIndex = lastIndex;
                if (output.length >= lim) break;
              }

              if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
            }

            if (lastLastIndex === string.length) {
              if (lastLength || !separatorCopy.test('')) output.push('');
            } else output.push(string.slice(lastLastIndex));

            return output.length > lim ? output.slice(0, lim) : output;
          }; // Chakra, V8

        } else if ('0'.split(undefined$1, 0).length) {
          internalSplit = function (separator, limit) {
            return separator === undefined$1 && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
          };
        } else internalSplit = nativeSplit;

        return [// `String.prototype.split` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.split
        function split(separator, limit) {
          var O = requireObjectCoercible(this);
          var splitter = separator == undefined$1 ? undefined$1 : separator[SPLIT];
          return splitter !== undefined$1 ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
        }, // `RegExp.prototype[@@split]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
        //
        // NOTE: This cannot be properly polyfilled in engines that don't support
        // the 'y' flag.
        function (regexp, limit) {
          var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
          if (res.done) return res.value;
          var rx = anObject(regexp);
          var S = String(this);
          var C = speciesConstructor(rx, RegExp);
          var unicodeMatching = rx.unicode;
          var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
          // simulate the 'y' flag.

          var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
          var lim = limit === undefined$1 ? MAX_UINT32 : limit >>> 0;
          if (lim === 0) return [];
          if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
          var p = 0;
          var q = 0;
          var A = [];

          while (q < S.length) {
            splitter.lastIndex = SUPPORTS_Y ? q : 0;
            var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
            var e;

            if (z === null || (e = min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
              q = advanceStringIndex(S, q, unicodeMatching);
            } else {
              A.push(S.slice(p, q));
              if (A.length === lim) return A;

              for (var i = 1; i <= z.length - 1; i++) {
                A.push(z[i]);
                if (A.length === lim) return A;
              }

              q = p = e;
            }
          }

          A.push(S.slice(p));
          return A;
        }];
      }, !SUPPORTS_Y);
      /***/
    },
    /* 284 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var toLength = __webpack_require__(36);

      var validateArguments = __webpack_require__(265);

      var correctIsRegExpLogic = __webpack_require__(266);

      var STARTS_WITH = 'startsWith';
      var nativeStartsWith = ''[STARTS_WITH]; // `String.prototype.startsWith` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.startswith

      $({
        target: 'String',
        proto: true,
        forced: !correctIsRegExpLogic(STARTS_WITH) },
      {
        startsWith: function startsWith(searchString
        /* , position = 0 */)
        {
          var that = validateArguments(this, searchString, STARTS_WITH);
          var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined$1, that.length));
          var search = String(searchString);
          return nativeStartsWith ? nativeStartsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
        } });

      /***/
    },
    /* 285 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalStringTrim = __webpack_require__(181);

      var forcedStringTrimMethod = __webpack_require__(286);

      var FORCED = forcedStringTrimMethod('trim'); // `String.prototype.trim` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.trim

      $({
        target: 'String',
        proto: true,
        forced: FORCED },
      {
        trim: function trim() {
          return internalStringTrim(this, 3);
        } });

      /***/
    },
    /* 286 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      var whitespaces = __webpack_require__(182);

      var non = '\u200B\u0085\u180E'; // check that a method works with the correct list
      // of whitespaces and has a correct name

      module.exports = function (METHOD_NAME) {
        return fails(function () {
          return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
        });
      };
      /***/

    },
    /* 287 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalStringTrim = __webpack_require__(181);

      var forcedStringTrimMethod = __webpack_require__(286);

      var FORCED = forcedStringTrimMethod('trimEnd');
      var trimEnd = FORCED ? function trimEnd() {
        return internalStringTrim(this, 2);
      } : ''.trimEnd; // `String.prototype.{ trimEnd, trimRight }` methods
      // https://github.com/tc39/ecmascript-string-left-right-trim

      $({
        target: 'String',
        proto: true,
        forced: FORCED },
      {
        trimEnd: trimEnd,
        trimRight: trimEnd });

      /***/
    },
    /* 288 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var internalStringTrim = __webpack_require__(181);

      var forcedStringTrimMethod = __webpack_require__(286);

      var FORCED = forcedStringTrimMethod('trimStart');
      var trimStart = FORCED ? function trimStart() {
        return internalStringTrim(this, 1);
      } : ''.trimStart; // `String.prototype.{ trimStart, trimLeft }` methods
      // https://github.com/tc39/ecmascript-string-left-right-trim

      $({
        target: 'String',
        proto: true,
        forced: FORCED },
      {
        trimStart: trimStart,
        trimLeft: trimStart });

      /***/
    },
    /* 289 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.anchor` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.anchor


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('anchor') },
      {
        anchor: function anchor(name) {
          return createHTML(this, 'a', 'name', name);
        } });

      /***/
    },
    /* 290 */

    /***/
    function (module, exports, __webpack_require__) {
      var requireObjectCoercible = __webpack_require__(12);

      var quot = /"/g; // B.2.3.2.1 CreateHTML(string, tag, attribute, value)
      // https://tc39.github.io/ecma262/#sec-createhtml

      module.exports = function (string, tag, attribute, value) {
        var S = String(requireObjectCoercible(string));
        var p1 = '<' + tag;
        if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
        return p1 + '>' + S + '</' + tag + '>';
      };
      /***/

    },
    /* 291 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6); // check the existence of a method, lowercase
      // of a tag and escaping quotes in arguments


      module.exports = function (METHOD_NAME) {
        return fails(function () {
          var test = ''[METHOD_NAME]('"');
          return test !== test.toLowerCase() || test.split('"').length > 3;
        });
      };
      /***/

    },
    /* 292 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.big` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.big


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('big') },
      {
        big: function big() {
          return createHTML(this, 'big', '', '');
        } });

      /***/
    },
    /* 293 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.blink` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.blink


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('blink') },
      {
        blink: function blink() {
          return createHTML(this, 'blink', '', '');
        } });

      /***/
    },
    /* 294 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.bold` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.bold


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('bold') },
      {
        bold: function bold() {
          return createHTML(this, 'b', '', '');
        } });

      /***/
    },
    /* 295 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.fixed` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.fixed


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('fixed') },
      {
        fixed: function fixed() {
          return createHTML(this, 'tt', '', '');
        } });

      /***/
    },
    /* 296 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.fontcolor` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.fontcolor


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('fontcolor') },
      {
        fontcolor: function fontcolor(color) {
          return createHTML(this, 'font', 'color', color);
        } });

      /***/
    },
    /* 297 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.fontsize` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.fontsize


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('fontsize') },
      {
        fontsize: function fontsize(size) {
          return createHTML(this, 'font', 'size', size);
        } });

      /***/
    },
    /* 298 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.italics` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.italics


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('italics') },
      {
        italics: function italics() {
          return createHTML(this, 'i', '', '');
        } });

      /***/
    },
    /* 299 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.link` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.link


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('link') },
      {
        link: function link(url) {
          return createHTML(this, 'a', 'href', url);
        } });

      /***/
    },
    /* 300 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.small` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.small


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('small') },
      {
        small: function small() {
          return createHTML(this, 'small', '', '');
        } });

      /***/
    },
    /* 301 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.strike` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.strike


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('strike') },
      {
        strike: function strike() {
          return createHTML(this, 'strike', '', '');
        } });

      /***/
    },
    /* 302 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.sub` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.sub


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('sub') },
      {
        sub: function sub() {
          return createHTML(this, 'sub', '', '');
        } });

      /***/
    },
    /* 303 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var createHTML = __webpack_require__(290);

      var forcedStringHTMLMethod = __webpack_require__(291); // `String.prototype.sup` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.sup


      $({
        target: 'String',
        proto: true,
        forced: forcedStringHTMLMethod('sup') },
      {
        sup: function sup() {
          return createHTML(this, 'sup', '', '');
        } });

      /***/
    },
    /* 304 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Float32Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Float32', 4, function (init) {
        return function Float32Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 305 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var DESCRIPTORS = __webpack_require__(5);

      var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = __webpack_require__(306);

      var ArrayBufferViewCore = __webpack_require__(131);

      var ArrayBufferModule = __webpack_require__(130);

      var anInstance = __webpack_require__(133);

      var createPropertyDescriptor = __webpack_require__(8);

      var hide = __webpack_require__(18);

      var toLength = __webpack_require__(36);

      var toIndex = __webpack_require__(134);

      var toOffset = __webpack_require__(307);

      var toPrimitive = __webpack_require__(13);

      var has = __webpack_require__(15);

      var classof = __webpack_require__(98);

      var isObject = __webpack_require__(14);

      var create = __webpack_require__(52);

      var setPrototypeOf = __webpack_require__(109);

      var getOwnPropertyNames = __webpack_require__(33).f;

      var typedArrayFrom = __webpack_require__(308);

      var arrayMethods = __webpack_require__(78);

      var setSpecies = __webpack_require__(124);

      var definePropertyModule = __webpack_require__(19);

      var getOwnPropertyDescriptorModule = __webpack_require__(4);

      var InternalStateModule = __webpack_require__(26);

      var getInternalState = InternalStateModule.get;
      var setInternalState = InternalStateModule.set;
      var nativeDefineProperty = definePropertyModule.f;
      var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
      var forEach = arrayMethods(0);
      var RangeError = global.RangeError;
      var ArrayBuffer = ArrayBufferModule.ArrayBuffer;
      var DataView = ArrayBufferModule.DataView;
      var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
      var TYPED_ARRAY_TAG = ArrayBufferViewCore.TYPED_ARRAY_TAG;
      var TypedArray = ArrayBufferViewCore.TypedArray;
      var TypedArrayPrototype = ArrayBufferViewCore.TypedArrayPrototype;
      var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
      var isTypedArray = ArrayBufferViewCore.isTypedArray;
      var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
      var WRONG_LENGTH = 'Wrong length';

      var fromList = function fromList(C, list) {
        var index = 0;
        var length = list.length;
        var result = new (aTypedArrayConstructor(C))(length);

        while (length > index) result[index] = list[index++];

        return result;
      };

      var addGetter = function addGetter(it, key) {
        nativeDefineProperty(it, key, {
          get: function () {
            return getInternalState(this)[key];
          } });

      };

      var isArrayBuffer = function isArrayBuffer(it) {
        var klass;
        return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
      };

      var isTypedArrayIndex = function isTypedArrayIndex(target, key) {
        return isTypedArray(target) && typeof key != 'symbol' && key in target && String(+key) == String(key);
      };

      var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
        return isTypedArrayIndex(target, key = toPrimitive(key, true)) ? createPropertyDescriptor(2, target[key]) : nativeGetOwnPropertyDescriptor(target, key);
      };

      var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
        if (isTypedArrayIndex(target, key = toPrimitive(key, true)) && isObject(descriptor) && has(descriptor, 'value') && !has(descriptor, 'get') && !has(descriptor, 'set') // TODO: add validation descriptor w/o calling accessors
        && !descriptor.configurable && (!has(descriptor, 'writable') || descriptor.writable) && (!has(descriptor, 'enumerable') || descriptor.enumerable)) {
          target[key] = descriptor.value;
          return target;
        }

        return nativeDefineProperty(target, key, descriptor);
      };

      if (DESCRIPTORS) {
        if (!NATIVE_ARRAY_BUFFER_VIEWS) {
          getOwnPropertyDescriptorModule.f = wrappedGetOwnPropertyDescriptor;
          definePropertyModule.f = wrappedDefineProperty;
          addGetter(TypedArrayPrototype, 'buffer');
          addGetter(TypedArrayPrototype, 'byteOffset');
          addGetter(TypedArrayPrototype, 'byteLength');
          addGetter(TypedArrayPrototype, 'length');
        }

        $({
          target: 'Object',
          stat: true,
          forced: !NATIVE_ARRAY_BUFFER_VIEWS },
        {
          getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
          defineProperty: wrappedDefineProperty });
        // eslint-disable-next-line max-statements

        module.exports = function (TYPE, BYTES, wrapper, CLAMPED) {
          var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
          var GETTER = 'get' + TYPE;
          var SETTER = 'set' + TYPE;
          var NativeTypedArrayConstructor = global[CONSTRUCTOR_NAME];
          var TypedArrayConstructor = NativeTypedArrayConstructor;
          var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
          var exported = {};

          var getter = function getter(that, index) {
            var data = getInternalState(that);
            return data.view[GETTER](index * BYTES + data.byteOffset, true);
          };

          var setter = function setter(that, index, value) {
            var data = getInternalState(that);
            if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
            data.view[SETTER](index * BYTES + data.byteOffset, value, true);
          };

          var addElement = function addElement(that, index) {
            nativeDefineProperty(that, index, {
              get: function () {
                return getter(this, index);
              },
              set: function (value) {
                return setter(this, index, value);
              },
              enumerable: true });

          };

          if (!NATIVE_ARRAY_BUFFER_VIEWS) {
            TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
              anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
              var index = 0;
              var byteOffset = 0;
              var buffer, byteLength, length;

              if (!isObject(data)) {
                length = toIndex(data);
                byteLength = length * BYTES;
                buffer = new ArrayBuffer(byteLength);
              } else if (isArrayBuffer(data)) {
                buffer = data;
                byteOffset = toOffset(offset, BYTES);
                var $len = data.byteLength;

                if ($length === undefined$1) {
                  if ($len % BYTES) throw RangeError(WRONG_LENGTH);
                  byteLength = $len - byteOffset;
                  if (byteLength < 0) throw RangeError(WRONG_LENGTH);
                } else {
                  byteLength = toLength($length) * BYTES;
                  if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
                }

                length = byteLength / BYTES;
              } else if (isTypedArray(data)) {
                return fromList(TypedArrayConstructor, data);
              } else {
                return typedArrayFrom.call(TypedArrayConstructor, data);
              }

              setInternalState(that, {
                buffer: buffer,
                byteOffset: byteOffset,
                byteLength: byteLength,
                length: length,
                view: new DataView(buffer) });


              while (index < length) addElement(that, index++);
            });
            if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
            TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create(TypedArrayPrototype);
          } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS) {
            TypedArrayConstructor = wrapper(function (that, data, typedArrayOffset, $length) {
              anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
              if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
              if (isArrayBuffer(data)) return $length !== undefined$1 ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length) : typedArrayOffset !== undefined$1 ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES)) : new NativeTypedArrayConstructor(data);
              if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
              return typedArrayFrom.call(TypedArrayConstructor, data);
            });
            if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
            forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
              if (!(key in TypedArrayConstructor)) hide(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
            });
            TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
          }

          if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
            hide(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
          }

          if (TYPED_ARRAY_TAG) hide(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
          exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;
          $({
            global: true,
            forced: TypedArrayConstructor != NativeTypedArrayConstructor,
            sham: !NATIVE_ARRAY_BUFFER_VIEWS },
          exported);

          if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
            hide(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
          }

          if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
            hide(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
          }

          setSpecies(CONSTRUCTOR_NAME);
        };
      } else module.exports = function () {
        /* empty */
      };
      /***/

    },
    /* 306 */

    /***/
    function (module, exports, __webpack_require__) {
      /* eslint-disable no-new */
      var global = __webpack_require__(3);

      var fails = __webpack_require__(6);

      var checkCorrectnessOfIteration = __webpack_require__(99);

      var NATIVE_ARRAY_BUFFER_VIEWS = __webpack_require__(131).NATIVE_ARRAY_BUFFER_VIEWS;

      var ArrayBuffer = global.ArrayBuffer;
      var Int8Array = global.Int8Array;
      module.exports = !NATIVE_ARRAY_BUFFER_VIEWS || !fails(function () {
        Int8Array(1);
      }) || !fails(function () {
        new Int8Array(-1);
      }) || !checkCorrectnessOfIteration(function (iterable) {
        new Int8Array();
        new Int8Array(null);
        new Int8Array(1.5);
        new Int8Array(iterable);
      }, true) || fails(function () {
        // Safari 11 bug
        return new Int8Array(new ArrayBuffer(2), 1, undefined$1).length !== 1;
      });
      /***/
    },
    /* 307 */

    /***/
    function (module, exports, __webpack_require__) {
      var toInteger = __webpack_require__(37);

      module.exports = function (it, BYTES) {
        var offset = toInteger(it);
        if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset');
        return offset;
      };
      /***/

    },
    /* 308 */

    /***/
    function (module, exports, __webpack_require__) {
      var toObject = __webpack_require__(51);

      var toLength = __webpack_require__(36);

      var getIteratorMethod = __webpack_require__(97);

      var isArrayIteratorMethod = __webpack_require__(95);

      var bind = __webpack_require__(79);

      var aTypedArrayConstructor = __webpack_require__(131).aTypedArrayConstructor;

      module.exports = function from(source
      /* , mapfn, thisArg */)
      {
        var O = toObject(source);
        var argumentsLength = arguments.length;
        var mapfn = argumentsLength > 1 ? arguments[1] : undefined$1;
        var mapping = mapfn !== undefined$1;
        var iteratorMethod = getIteratorMethod(O);
        var i, length, result, step, iterator;

        if (iteratorMethod != undefined$1 && !isArrayIteratorMethod(iteratorMethod)) {
          iterator = iteratorMethod.call(O);
          O = [];

          while (!(step = iterator.next()).done) {
            O.push(step.value);
          }
        }

        if (mapping && argumentsLength > 2) {
          mapfn = bind(mapfn, arguments[2], 2);
        }

        length = toLength(O.length);
        result = new (aTypedArrayConstructor(this))(length);

        for (i = 0; length > i; i++) {
          result[i] = mapping ? mapfn(O[i], i) : O[i];
        }

        return result;
      };
      /***/

    },
    /* 309 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Float64Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Float64', 8, function (init) {
        return function Float64Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 310 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Int8Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Int8', 1, function (init) {
        return function Int8Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 311 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Int16Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Int16', 2, function (init) {
        return function Int16Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 312 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Int32Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Int32', 4, function (init) {
        return function Int32Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 313 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Uint8Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Uint8', 1, function (init) {
        return function Uint8Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 314 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Uint8ClampedArray` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Uint8', 1, function (init) {
        return function Uint8ClampedArray(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      }, true);
      /***/
    },
    /* 315 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Uint16Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Uint16', 2, function (init) {
        return function Uint16Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 316 */

    /***/
    function (module, exports, __webpack_require__) {
      var typedArrayConstructor = __webpack_require__(305); // `Uint32Array` constructor
      // https://tc39.github.io/ecma262/#sec-typedarray-objects


      typedArrayConstructor('Uint32', 4, function (init) {
        return function Uint32Array(data, byteOffset, length) {
          return init(this, data, byteOffset, length);
        };
      });
      /***/
    },
    /* 317 */

    /***/
    function (module, exports, __webpack_require__) {
      var arrayCopyWithin = __webpack_require__(75);

      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.copyWithin` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.copywithin

      ArrayBufferViewCore.exportProto('copyWithin', function copyWithin(target, start
      /* , end */)
      {
        return arrayCopyWithin.call(aTypedArray(this), target, start, arguments.length > 2 ? arguments[2] : undefined$1);
      });
      /***/
    },
    /* 318 */

    /***/
    function (module, exports, __webpack_require__) {
      var arrayMethods = __webpack_require__(78);

      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayEvery = arrayMethods(4);
      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.every` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.every

      ArrayBufferViewCore.exportProto('every', function every(callbackfn
      /* , thisArg */)
      {
        return arrayEvery(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 319 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayFill = __webpack_require__(83);

      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.fill` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.fill
      // eslint-disable-next-line no-unused-vars

      ArrayBufferViewCore.exportProto('fill', function fill(value
      /* , start, end */)
      {
        return arrayFill.apply(aTypedArray(this), arguments);
      });
      /***/
    },
    /* 320 */

    /***/
    function (module, exports, __webpack_require__) {
      var speciesConstructor = __webpack_require__(137);

      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayMethods = __webpack_require__(78);

      var arrayFilter = arrayMethods(2);
      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor; // `%TypedArray%.prototype.filter` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.filter

      ArrayBufferViewCore.exportProto('filter', function filter(callbackfn
      /* , thisArg */)
      {
        var list = arrayFilter(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined$1);
        var C = speciesConstructor(this, this.constructor);
        var index = 0;
        var length = list.length;
        var result = new (aTypedArrayConstructor(C))(length);

        while (length > index) result[index] = list[index++];

        return result;
      });
      /***/
    },
    /* 321 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayMethods = __webpack_require__(78);

      var arrayFind = arrayMethods(5);
      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.find` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.find

      ArrayBufferViewCore.exportProto('find', function find(predicate
      /* , thisArg */)
      {
        return arrayFind(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 322 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayMethods = __webpack_require__(78);

      var arrayFindIndex = arrayMethods(6);
      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.findIndex` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.findindex

      ArrayBufferViewCore.exportProto('findIndex', function findIndex(predicate
      /* , thisArg */)
      {
        return arrayFindIndex(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 323 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayMethods = __webpack_require__(78);

      var arrayForEach = arrayMethods(0);
      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.forEach` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.foreach

      ArrayBufferViewCore.exportProto('forEach', function forEach(callbackfn
      /* , thisArg */)
      {
        arrayForEach(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 324 */

    /***/
    function (module, exports, __webpack_require__) {
      var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = __webpack_require__(306);

      var ArrayBufferViewCore = __webpack_require__(131);

      var typedArrayFrom = __webpack_require__(308); // `%TypedArray%.from` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.from


      ArrayBufferViewCore.exportStatic('from', typedArrayFrom, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);
      /***/
    },
    /* 325 */

    /***/
    function (module, exports, __webpack_require__) {
      var createIncludes = __webpack_require__(35);

      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var arrayIncludes = createIncludes(true); // `%TypedArray%.prototype.includes` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.includes

      ArrayBufferViewCore.exportProto('includes', function includes(searchElement
      /* , fromIndex */)
      {
        return arrayIncludes(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 326 */

    /***/
    function (module, exports, __webpack_require__) {
      var createIncludes = __webpack_require__(35);

      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var arrayIndexOf = createIncludes(false); // `%TypedArray%.prototype.indexOf` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.indexof

      ArrayBufferViewCore.exportProto('indexOf', function indexOf(searchElement
      /* , fromIndex */)
      {
        return arrayIndexOf(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 327 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var ArrayIterators = __webpack_require__(103);

      var ArrayBufferViewCore = __webpack_require__(131);

      var wellKnownSymbol = __webpack_require__(44);

      var ITERATOR = wellKnownSymbol('iterator');
      var Uint8Array = global.Uint8Array;
      var arrayValues = ArrayIterators.values;
      var arrayKeys = ArrayIterators.keys;
      var arrayEntries = ArrayIterators.entries;
      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var exportProto = ArrayBufferViewCore.exportProto;
      var nativeTypedArrayIterator = Uint8Array && Uint8Array.prototype[ITERATOR];
      var CORRECT_ITER_NAME = !!nativeTypedArrayIterator && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined$1);

      var typedArrayValues = function values() {
        return arrayValues.call(aTypedArray(this));
      }; // `%TypedArray%.prototype.entries` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.entries


      exportProto('entries', function entries() {
        return arrayEntries.call(aTypedArray(this));
      }); // `%TypedArray%.prototype.keys` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.keys

      exportProto('keys', function keys() {
        return arrayKeys.call(aTypedArray(this));
      }); // `%TypedArray%.prototype.values` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.values

      exportProto('values', typedArrayValues, !CORRECT_ITER_NAME); // `%TypedArray%.prototype[@@iterator]` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype-@@iterator

      exportProto(ITERATOR, typedArrayValues, !CORRECT_ITER_NAME);
      /***/
    },
    /* 328 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var arrayJoin = [].join; // `%TypedArray%.prototype.join` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.join
      // eslint-disable-next-line no-unused-vars

      ArrayBufferViewCore.exportProto('join', function join(separator) {
        return arrayJoin.apply(aTypedArray(this), arguments);
      });
      /***/
    },
    /* 329 */

    /***/
    function (module, exports, __webpack_require__) {
      var arrayLastIndexOf = __webpack_require__(113);

      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.lastIndexOf` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.lastindexof
      // eslint-disable-next-line no-unused-vars

      ArrayBufferViewCore.exportProto('lastIndexOf', function lastIndexOf(searchElement
      /* , fromIndex */)
      {
        return arrayLastIndexOf.apply(aTypedArray(this), arguments);
      });
      /***/
    },
    /* 330 */

    /***/
    function (module, exports, __webpack_require__) {
      var speciesConstructor = __webpack_require__(137);

      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayMethods = __webpack_require__(78);

      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
      var internalTypedArrayMap = arrayMethods(1, function (O, length) {
        return new (aTypedArrayConstructor(speciesConstructor(O, O.constructor)))(length);
      }); // `%TypedArray%.prototype.map` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.map

      ArrayBufferViewCore.exportProto('map', function map(mapfn
      /* , thisArg */)
      {
        return internalTypedArrayMap(aTypedArray(this), mapfn, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 331 */

    /***/
    function (module, exports, __webpack_require__) {
      var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = __webpack_require__(306);

      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor; // `%TypedArray%.of` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.of

      ArrayBufferViewCore.exportStatic('of', function of()
      /* ...items */
      {
        var index = 0;
        var length = arguments.length;
        var result = new (aTypedArrayConstructor(this))(length);

        while (length > index) result[index] = arguments[index++];

        return result;
      }, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);
      /***/
    },
    /* 332 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var internalReduce = __webpack_require__(117);

      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.reduce` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduce

      ArrayBufferViewCore.exportProto('reduce', function reduce(callbackfn
      /* , initialValue */)
      {
        return internalReduce(aTypedArray(this), callbackfn, arguments.length, arguments[1], false);
      });
      /***/
    },
    /* 333 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var internalReduce = __webpack_require__(117);

      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.reduceRicht` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduceright

      ArrayBufferViewCore.exportProto('reduceRight', function reduceRight(callbackfn
      /* , initialValue */)
      {
        return internalReduce(aTypedArray(this), callbackfn, arguments.length, arguments[1], true);
      });
      /***/
    },
    /* 334 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.reverse` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reverse

      ArrayBufferViewCore.exportProto('reverse', function reverse() {
        var that = this;
        var length = aTypedArray(that).length;
        var middle = Math.floor(length / 2);
        var index = 0;
        var value;

        while (index < middle) {
          value = that[index];
          that[index++] = that[--length];
          that[length] = value;
        }

        return that;
      });
      /***/
    },
    /* 335 */

    /***/
    function (module, exports, __webpack_require__) {
      var toLength = __webpack_require__(36);

      var toOffset = __webpack_require__(307);

      var toObject = __webpack_require__(51);

      var ArrayBufferViewCore = __webpack_require__(131);

      var fails = __webpack_require__(6);

      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var FORCED = fails(function () {
        // eslint-disable-next-line no-undef
        new Int8Array(1).set({});
      }); // `%TypedArray%.prototype.set` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.set

      ArrayBufferViewCore.exportProto('set', function set(arrayLike
      /* , offset */)
      {
        aTypedArray(this);
        var offset = toOffset(arguments[1], 1);
        var length = this.length;
        var src = toObject(arrayLike);
        var len = toLength(src.length);
        var index = 0;
        if (len + offset > length) throw RangeError('Wrong length');

        while (index < len) this[offset + index] = src[index++];
      }, FORCED);
      /***/
    },
    /* 336 */

    /***/
    function (module, exports, __webpack_require__) {
      var speciesConstructor = __webpack_require__(137);

      var ArrayBufferViewCore = __webpack_require__(131);

      var fails = __webpack_require__(6);

      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
      var arraySlice = [].slice;
      var FORCED = fails(function () {
        // eslint-disable-next-line no-undef
        new Int8Array(1).slice();
      }); // `%TypedArray%.prototype.slice` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.slice

      ArrayBufferViewCore.exportProto('slice', function slice(start, end) {
        var list = arraySlice.call(aTypedArray(this), start, end);
        var C = speciesConstructor(this, this.constructor);
        var index = 0;
        var length = list.length;
        var result = new (aTypedArrayConstructor(C))(length);

        while (length > index) result[index] = list[index++];

        return result;
      }, FORCED);
      /***/
    },
    /* 337 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var arrayMethods = __webpack_require__(78);

      var arraySome = arrayMethods(3);
      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.some` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.some

      ArrayBufferViewCore.exportProto('some', function some(callbackfn
      /* , thisArg */)
      {
        return arraySome(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined$1);
      });
      /***/
    },
    /* 338 */

    /***/
    function (module, exports, __webpack_require__) {
      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var arraySort = [].sort; // `%TypedArray%.prototype.sort` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.sort

      ArrayBufferViewCore.exportProto('sort', function sort(comparefn) {
        return arraySort.call(aTypedArray(this), comparefn);
      });
      /***/
    },
    /* 339 */

    /***/
    function (module, exports, __webpack_require__) {
      var toLength = __webpack_require__(36);

      var toAbsoluteIndex = __webpack_require__(38);

      var speciesConstructor = __webpack_require__(137);

      var ArrayBufferViewCore = __webpack_require__(131);

      var aTypedArray = ArrayBufferViewCore.aTypedArray; // `%TypedArray%.prototype.subarray` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.subarray

      ArrayBufferViewCore.exportProto('subarray', function subarray(begin, end) {
        var O = aTypedArray(this);
        var length = O.length;
        var beginIndex = toAbsoluteIndex(begin, length);
        return new (speciesConstructor(O, O.constructor))(O.buffer, O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT, toLength((end === undefined$1 ? length : toAbsoluteIndex(end, length)) - beginIndex));
      });
      /***/
    },
    /* 340 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var fails = __webpack_require__(6);

      var ArrayBufferViewCore = __webpack_require__(131);

      var Int8Array = global.Int8Array;
      var aTypedArray = ArrayBufferViewCore.aTypedArray;
      var arrayToLocaleString = [].toLocaleString;
      var arraySlice = [].slice; // iOS Safari 6.x fails here

      var TO_LOCALE_BUG = !!Int8Array && fails(function () {
        arrayToLocaleString.call(new Int8Array(1));
      });
      var FORCED = fails(function () {
        return [1, 2].toLocaleString() != new Int8Array([1, 2]).toLocaleString();
      }) || !fails(function () {
        Int8Array.prototype.toLocaleString.call([1, 2]);
      }); // `%TypedArray%.prototype.toLocaleString` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tolocalestring

      ArrayBufferViewCore.exportProto('toLocaleString', function toLocaleString() {
        return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(aTypedArray(this)) : aTypedArray(this), arguments);
      }, FORCED);
      /***/
    },
    /* 341 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var ArrayBufferViewCore = __webpack_require__(131);

      var fails = __webpack_require__(6);

      var Uint8Array = global.Uint8Array;
      var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype;
      var arrayToString = [].toString;
      var arrayJoin = [].join;

      if (fails(function () {
        arrayToString.call({});
      })) {
        arrayToString = function toString() {
          return arrayJoin.call(this);
        };
      } // `%TypedArray%.prototype.toString` method
      // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tostring


      ArrayBufferViewCore.exportProto('toString', arrayToString, (Uint8ArrayPrototype || {}).toString != arrayToString);
      /***/
    },
    /* 342 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var redefineAll = __webpack_require__(132);

      var InternalMetadataModule = __webpack_require__(153);

      var collection = __webpack_require__(152);

      var collectionWeak = __webpack_require__(343);

      var isObject = __webpack_require__(14);

      var enforceIternalState = __webpack_require__(26).enforce;

      var NATIVE_WEAK_MAP = __webpack_require__(27);

      var IS_IE11 = !global.ActiveXObject && 'ActiveXObject' in global;
      var isExtensible = Object.isExtensible;
      var InternalWeakMap;

      var wrapper = function wrapper(get) {
        return function WeakMap() {
          return get(this, arguments.length > 0 ? arguments[0] : undefined$1);
        };
      }; // `WeakMap` constructor
      // https://tc39.github.io/ecma262/#sec-weakmap-constructor


      var $WeakMap = module.exports = collection('WeakMap', wrapper, collectionWeak, true, true); // IE11 WeakMap frozen keys fix
      // We can't use feature detection because it crash some old IE builds
      // https://github.com/zloirock/core-js/issues/485

      if (NATIVE_WEAK_MAP && IS_IE11) {
        InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
        InternalMetadataModule.REQUIRED = true;
        var WeakMapPrototype = $WeakMap.prototype;
        var nativeDelete = WeakMapPrototype['delete'];
        var nativeHas = WeakMapPrototype.has;
        var nativeGet = WeakMapPrototype.get;
        var nativeSet = WeakMapPrototype.set;
        redefineAll(WeakMapPrototype, {
          'delete': function (key) {
            if (isObject(key) && !isExtensible(key)) {
              var state = enforceIternalState(this);
              if (!state.frozen) state.frozen = new InternalWeakMap();
              return nativeDelete.call(this, key) || state.frozen['delete'](key);
            }

            return nativeDelete.call(this, key);
          },
          has: function has(key) {
            if (isObject(key) && !isExtensible(key)) {
              var state = enforceIternalState(this);
              if (!state.frozen) state.frozen = new InternalWeakMap();
              return nativeHas.call(this, key) || state.frozen.has(key);
            }

            return nativeHas.call(this, key);
          },
          get: function get(key) {
            if (isObject(key) && !isExtensible(key)) {
              var state = enforceIternalState(this);
              if (!state.frozen) state.frozen = new InternalWeakMap();
              return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
            }

            return nativeGet.call(this, key);
          },
          set: function set(key, value) {
            if (isObject(key) && !isExtensible(key)) {
              var state = enforceIternalState(this);
              if (!state.frozen) state.frozen = new InternalWeakMap();
              nativeHas.call(this, key) ? nativeSet.call(this, key, value) : state.frozen.set(key, value);
            } else nativeSet.call(this, key, value);

            return this;
          } });

      }
      /***/

    },
    /* 343 */

    /***/
    function (module, exports, __webpack_require__) {
      var redefineAll = __webpack_require__(132);

      var getWeakData = __webpack_require__(153).getWeakData;

      var anObject = __webpack_require__(20);

      var isObject = __webpack_require__(14);

      var anInstance = __webpack_require__(133);

      var iterate = __webpack_require__(155);

      var createArrayMethod = __webpack_require__(78);

      var $has = __webpack_require__(15);

      var InternalStateModule = __webpack_require__(26);

      var setInternalState = InternalStateModule.set;
      var internalStateGetterFor = InternalStateModule.getterFor;
      var arrayFind = createArrayMethod(5);
      var arrayFindIndex = createArrayMethod(6);
      var id = 0; // fallback for uncaught frozen keys

      var uncaughtFrozenStore = function uncaughtFrozenStore(store) {
        return store.frozen || (store.frozen = new UncaughtFrozenStore());
      };

      var UncaughtFrozenStore = function UncaughtFrozenStore() {
        this.entries = [];
      };

      var findUncaughtFrozen = function findUncaughtFrozen(store, key) {
        return arrayFind(store.entries, function (it) {
          return it[0] === key;
        });
      };

      UncaughtFrozenStore.prototype = {
        get: function (key) {
          var entry = findUncaughtFrozen(this, key);
          if (entry) return entry[1];
        },
        has: function (key) {
          return !!findUncaughtFrozen(this, key);
        },
        set: function (key, value) {
          var entry = findUncaughtFrozen(this, key);
          if (entry) entry[1] = value;else this.entries.push([key, value]);
        },
        'delete': function (key) {
          var index = arrayFindIndex(this.entries, function (it) {
            return it[0] === key;
          });
          if (~index) this.entries.splice(index, 1);
          return !!~index;
        } };

      module.exports = {
        getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
          var C = wrapper(function (that, iterable) {
            anInstance(that, C, CONSTRUCTOR_NAME);
            setInternalState(that, {
              type: CONSTRUCTOR_NAME,
              id: id++,
              frozen: undefined$1 });

            if (iterable != undefined$1) iterate(iterable, that[ADDER], that, IS_MAP);
          });
          var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

          var define = function define(that, key, value) {
            var state = getInternalState(that);
            var data = getWeakData(anObject(key), true);
            if (data === true) uncaughtFrozenStore(state).set(key, value);else data[state.id] = value;
            return that;
          };

          redefineAll(C.prototype, {
            // 23.3.3.2 WeakMap.prototype.delete(key)
            // 23.4.3.3 WeakSet.prototype.delete(value)
            'delete': function (key) {
              var state = getInternalState(this);
              if (!isObject(key)) return false;
              var data = getWeakData(key);
              if (data === true) return uncaughtFrozenStore(state)['delete'](key);
              return data && $has(data, state.id) && delete data[state.id];
            },
            // 23.3.3.4 WeakMap.prototype.has(key)
            // 23.4.3.4 WeakSet.prototype.has(value)
            has: function has(key) {
              var state = getInternalState(this);
              if (!isObject(key)) return false;
              var data = getWeakData(key);
              if (data === true) return uncaughtFrozenStore(state).has(key);
              return data && $has(data, state.id);
            } });

          redefineAll(C.prototype, IS_MAP ? {
            // 23.3.3.3 WeakMap.prototype.get(key)
            get: function get(key) {
              var state = getInternalState(this);

              if (isObject(key)) {
                var data = getWeakData(key);
                if (data === true) return uncaughtFrozenStore(state).get(key);
                return data ? data[state.id] : undefined$1;
              }
            },
            // 23.3.3.5 WeakMap.prototype.set(key, value)
            set: function set(key, value) {
              return define(this, key, value);
            } } :
          {
            // 23.4.3.1 WeakSet.prototype.add(value)
            add: function add(value) {
              return define(this, value, true);
            } });

          return C;
        } };

      /***/
    },
    /* 344 */

    /***/
    function (module, exports, __webpack_require__) {
      var collection = __webpack_require__(152);

      var collectionWeak = __webpack_require__(343); // `WeakSet` constructor
      // https://tc39.github.io/ecma262/#sec-weakset-constructor


      collection('WeakSet', function (get) {
        return function WeakSet() {
          return get(this, arguments.length > 0 ? arguments[0] : undefined$1);
        };
      }, collectionWeak, false, true);
      /***/
    },
    /* 345 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var DOMIterables = __webpack_require__(346);

      var forEach = __webpack_require__(91);

      var hide = __webpack_require__(18);

      for (var COLLECTION_NAME in DOMIterables) {
        var Collection = global[COLLECTION_NAME];
        var CollectionPrototype = Collection && Collection.prototype; // some Chrome versions have non-configurable methods on DOMTokenList

        if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
          hide(CollectionPrototype, 'forEach', forEach);
        } catch (error) {
          CollectionPrototype.forEach = forEach;
        }
      }
      /***/

    },
    /* 346 */

    /***/
    function (module, exports) {
      // iterable DOM collections
      // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
      module.exports = {
        CSSRuleList: 0,
        CSSStyleDeclaration: 0,
        CSSValueList: 0,
        ClientRectList: 0,
        DOMRectList: 0,
        DOMStringList: 0,
        DOMTokenList: 1,
        DataTransferItemList: 0,
        FileList: 0,
        HTMLAllCollection: 0,
        HTMLCollection: 0,
        HTMLFormElement: 0,
        HTMLSelectElement: 0,
        MediaList: 0,
        MimeTypeArray: 0,
        NamedNodeMap: 0,
        NodeList: 1,
        PaintRequestList: 0,
        Plugin: 0,
        PluginArray: 0,
        SVGLengthList: 0,
        SVGNumberList: 0,
        SVGPathSegList: 0,
        SVGPointList: 0,
        SVGStringList: 0,
        SVGTransformList: 0,
        SourceBufferList: 0,
        StyleSheetList: 0,
        TextTrackCueList: 0,
        TextTrackList: 0,
        TouchList: 0 };

      /***/
    },
    /* 347 */

    /***/
    function (module, exports, __webpack_require__) {
      var global = __webpack_require__(3);

      var DOMIterables = __webpack_require__(346);

      var ArrayIteratorMethods = __webpack_require__(103);

      var hide = __webpack_require__(18);

      var wellKnownSymbol = __webpack_require__(44);

      var ITERATOR = wellKnownSymbol('iterator');
      var TO_STRING_TAG = wellKnownSymbol('toStringTag');
      var ArrayValues = ArrayIteratorMethods.values;

      for (var COLLECTION_NAME in DOMIterables) {
        var Collection = global[COLLECTION_NAME];
        var CollectionPrototype = Collection && Collection.prototype;

        if (CollectionPrototype) {
          // some Chrome versions have non-configurable methods on DOMTokenList
          if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
            hide(CollectionPrototype, ITERATOR, ArrayValues);
          } catch (error) {
            CollectionPrototype[ITERATOR] = ArrayValues;
          }
          if (!CollectionPrototype[TO_STRING_TAG]) hide(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
          if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
            // some Chrome versions have non-configurable methods on DOMTokenList
            if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
              hide(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
            } catch (error) {
              CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
            }
          }
        }
      }
      /***/

    },
    /* 348 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var microtask = __webpack_require__(234);

      var classof = __webpack_require__(11);

      var process = global.process;
      var isNode = classof(process) == 'process'; // `queueMicrotask` method
      // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask

      $({
        global: true,
        enumerable: true,
        noTargetGet: true },
      {
        queueMicrotask: function queueMicrotask(fn) {
          var domain = isNode && process.domain;
          microtask(domain ? domain.bind(fn) : fn);
        } });

      /***/
    },
    /* 349 */

    /***/
    function (module, exports, __webpack_require__) {
      // ie9- setTimeout & setInterval additional parameters fix
      var $ = __webpack_require__(2);

      var global = __webpack_require__(3);

      var userAgent = __webpack_require__(235);

      var slice = [].slice;
      var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check

      var wrap = function wrap(set) {
        return function (fn, time
        /* , ...args */)
        {
          var boundArgs = arguments.length > 2;
          var args = boundArgs ? slice.call(arguments, 2) : false;
          return set(boundArgs ? function () {
            // eslint-disable-next-line no-new-func
            (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
          } : fn, time);
        };
      };

      $({
        global: true,
        bind: true,
        forced: MSIE },
      {
        setTimeout: wrap(global.setTimeout),
        setInterval: wrap(global.setInterval) });

      /***/
    },
    /* 350 */

    /***/
    function (module, exports, __webpack_require__) {
      __webpack_require__(269);

      var $ = __webpack_require__(2);

      var DESCRIPTORS = __webpack_require__(5);

      var USE_NATIVE_URL = __webpack_require__(351);

      var global = __webpack_require__(3);

      var defineProperties = __webpack_require__(53);

      var redefine = __webpack_require__(21);

      var anInstance = __webpack_require__(133);

      var has = __webpack_require__(15);

      var assign = __webpack_require__(201);

      var arrayFrom = __webpack_require__(93);

      var codePointAt = __webpack_require__(263);

      var toASCII = __webpack_require__(352);

      var setToStringTag = __webpack_require__(43);

      var URLSearchParamsModule = __webpack_require__(353);

      var InternalStateModule = __webpack_require__(26);

      var NativeURL = global.URL;
      var URLSearchParams = URLSearchParamsModule.URLSearchParams;
      var getInternalSearchParamsState = URLSearchParamsModule.getState;
      var setInternalState = InternalStateModule.set;
      var getInternalURLState = InternalStateModule.getterFor('URL');
      var pow = Math.pow;
      var INVALID_AUTHORITY = 'Invalid authority';
      var INVALID_SCHEME = 'Invalid scheme';
      var INVALID_HOST = 'Invalid host';
      var INVALID_PORT = 'Invalid port';
      var ALPHA = /[A-Za-z]/;
      var ALPHANUMERIC = /[\d+\-.A-Za-z]/;
      var DIGIT = /\d/;
      var HEX_START = /^(0x|0X)/;
      var OCT = /^[0-7]+$/;
      var DEC = /^\d+$/;
      var HEX = /^[\dA-Fa-f]+$/; // eslint-disable-next-line no-control-regex

      var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/; // eslint-disable-next-line no-control-regex

      var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/; // eslint-disable-next-line no-control-regex

      var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g; // eslint-disable-next-line no-control-regex

      var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
      var EOF;

      var parseHost = function parseHost(url, input) {
        var result, codePoints, i;

        if (input.charAt(0) == '[') {
          if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
          result = parseIPv6(input.slice(1, -1));
          if (!result) return INVALID_HOST;
          url.host = result; // opaque host
        } else if (!isSpecial(url)) {
          if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
          result = '';
          codePoints = arrayFrom(input);

          for (i = 0; i < codePoints.length; i++) result += percentEncode(codePoints[i], C0ControlPercentEncodeSet);

          url.host = result;
        } else {
          input = toASCII(input);
          if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
          result = parseIPv4(input);
          if (result === null) return INVALID_HOST;
          url.host = result;
        }
      };

      var parseIPv4 = function parseIPv4(input) {
        var parts = input.split('.');
        var partsLength, numbers, i, part, R, n, ipv4;

        if (parts[parts.length - 1] == '') {
          if (parts.length) parts.pop();
        }

        partsLength = parts.length;
        if (partsLength > 4) return input;
        numbers = [];

        for (i = 0; i < partsLength; i++) {
          part = parts[i];
          if (part == '') return input;
          R = 10;

          if (part.length > 1 && part.charAt(0) == '0') {
            R = HEX_START.test(part) ? 16 : 8;
            part = part.slice(R == 8 ? 1 : 2);
          }

          if (part === '') {
            n = 0;
          } else {
            if (!(R == 10 ? DEC : R == 8 ? OCT : HEX).test(part)) return input;
            n = parseInt(part, R);
          }

          numbers.push(n);
        }

        for (i = 0; i < partsLength; i++) {
          n = numbers[i];

          if (i == partsLength - 1) {
            if (n >= pow(256, 5 - partsLength)) return null;
          } else if (n > 255) return null;
        }

        ipv4 = numbers.pop();

        for (i = 0; i < numbers.length; i++) {
          ipv4 += numbers[i] * pow(256, 3 - i);
        }

        return ipv4;
      }; // eslint-disable-next-line max-statements


      var parseIPv6 = function parseIPv6(input) {
        var address = [0, 0, 0, 0, 0, 0, 0, 0];
        var pieceIndex = 0;
        var compress = null;
        var pointer = 0;
        var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

        var char = function char() {
          return input.charAt(pointer);
        };

        if (char() == ':') {
          if (input.charAt(1) != ':') return;
          pointer += 2;
          pieceIndex++;
          compress = pieceIndex;
        }

        while (char()) {
          if (pieceIndex == 8) return;

          if (char() == ':') {
            if (compress !== null) return;
            pointer++;
            pieceIndex++;
            compress = pieceIndex;
            continue;
          }

          value = length = 0;

          while (length < 4 && HEX.test(char())) {
            value = value * 16 + parseInt(char(), 16);
            pointer++;
            length++;
          }

          if (char() == '.') {
            if (length == 0) return;
            pointer -= length;
            if (pieceIndex > 6) return;
            numbersSeen = 0;

            while (char()) {
              ipv4Piece = null;

              if (numbersSeen > 0) {
                if (char() == '.' && numbersSeen < 4) pointer++;else return;
              }

              if (!DIGIT.test(char())) return;

              while (DIGIT.test(char())) {
                number = parseInt(char(), 10);
                if (ipv4Piece === null) ipv4Piece = number;else if (ipv4Piece == 0) return;else ipv4Piece = ipv4Piece * 10 + number;
                if (ipv4Piece > 255) return;
                pointer++;
              }

              address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
              numbersSeen++;
              if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
            }

            if (numbersSeen != 4) return;
            break;
          } else if (char() == ':') {
            pointer++;
            if (!char()) return;
          } else if (char()) return;

          address[pieceIndex++] = value;
        }

        if (compress !== null) {
          swaps = pieceIndex - compress;
          pieceIndex = 7;

          while (pieceIndex != 0 && swaps > 0) {
            swap = address[pieceIndex];
            address[pieceIndex--] = address[compress + swaps - 1];
            address[compress + --swaps] = swap;
          }
        } else if (pieceIndex != 8) return;

        return address;
      };

      var findLongestZeroSequence = function findLongestZeroSequence(ipv6) {
        var maxIndex = null;
        var maxLength = 1;
        var currStart = null;
        var currLength = 0;
        var i = 0;

        for (; i < 8; i++) {
          if (ipv6[i] !== 0) {
            if (currLength > maxLength) {
              maxIndex = currStart;
              maxLength = currLength;
            }

            currStart = null;
            currLength = 0;
          } else {
            if (currStart === null) currStart = i;
            ++currLength;
          }
        }

        if (currLength > maxLength) {
          maxIndex = currStart;
          maxLength = currLength;
        }

        return maxIndex;
      };

      var serializeHost = function serializeHost(host) {
        var result, i, compress, ignore0; // ipv4

        if (typeof host == 'number') {
          result = [];

          for (i = 0; i < 4; i++) {
            result.unshift(host % 256);
            host = Math.floor(host / 256);
          }

          return result.join('.'); // ipv6
        } else if (typeof host == 'object') {
          result = '';
          compress = findLongestZeroSequence(host);

          for (i = 0; i < 8; i++) {
            if (ignore0 && host[i] === 0) continue;
            if (ignore0) ignore0 = false;

            if (compress === i) {
              result += i ? ':' : '::';
              ignore0 = true;
            } else {
              result += host[i].toString(16);
              if (i < 7) result += ':';
            }
          }

          return '[' + result + ']';
        }

        return host;
      };

      var C0ControlPercentEncodeSet = {};
      var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
        ' ': 1,
        '"': 1,
        '<': 1,
        '>': 1,
        '`': 1 });

      var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
        '#': 1,
        '?': 1,
        '{': 1,
        '}': 1 });

      var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
        '/': 1,
        ':': 1,
        ';': 1,
        '=': 1,
        '@': 1,
        '[': 1,
        '\\': 1,
        ']': 1,
        '^': 1,
        '|': 1 });


      var percentEncode = function percentEncode(char, set) {
        var code = codePointAt(char, 0);
        return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
      };

      var specialSchemes = {
        ftp: 21,
        file: null,
        gopher: 70,
        http: 80,
        https: 443,
        ws: 80,
        wss: 443 };


      var isSpecial = function isSpecial(url) {
        return has(specialSchemes, url.scheme);
      };

      var includesCredentials = function includesCredentials(url) {
        return url.username != '' || url.password != '';
      };

      var cannotHaveUsernamePasswordPort = function cannotHaveUsernamePasswordPort(url) {
        return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
      };

      var isWindowsDriveLetter = function isWindowsDriveLetter(string, normalized) {
        var second;
        return string.length == 2 && ALPHA.test(string.charAt(0)) && ((second = string.charAt(1)) == ':' || !normalized && second == '|');
      };

      var startsWithWindowsDriveLetter = function startsWithWindowsDriveLetter(string) {
        var third;
        return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (string.length == 2 || (third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#');
      };

      var shortenURLsPath = function shortenURLsPath(url) {
        var path = url.path;
        var pathSize = path.length;

        if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
          path.pop();
        }
      };

      var isSingleDot = function isSingleDot(segment) {
        return segment === '.' || segment.toLowerCase() === '%2e';
      };

      var isDoubleDot = function isDoubleDot(segment) {
        segment = segment.toLowerCase();
        return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
      }; // States:


      var SCHEME_START = {};
      var SCHEME = {};
      var NO_SCHEME = {};
      var SPECIAL_RELATIVE_OR_AUTHORITY = {};
      var PATH_OR_AUTHORITY = {};
      var RELATIVE = {};
      var RELATIVE_SLASH = {};
      var SPECIAL_AUTHORITY_SLASHES = {};
      var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
      var AUTHORITY = {};
      var HOST = {};
      var HOSTNAME = {};
      var PORT = {};
      var FILE = {};
      var FILE_SLASH = {};
      var FILE_HOST = {};
      var PATH_START = {};
      var PATH = {};
      var CANNOT_BE_A_BASE_URL_PATH = {};
      var QUERY = {};
      var FRAGMENT = {}; // eslint-disable-next-line max-statements

      var parseURL = function parseURL(url, input, stateOverride, base) {
        var state = stateOverride || SCHEME_START;
        var pointer = 0;
        var buffer = '';
        var seenAt = false;
        var seenBracket = false;
        var seenPasswordToken = false;
        var codePoints, char, bufferCodePoints, failure;

        if (!stateOverride) {
          url.scheme = '';
          url.username = '';
          url.password = '';
          url.host = null;
          url.port = null;
          url.path = [];
          url.query = null;
          url.fragment = null;
          url.cannotBeABaseURL = false;
          input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
        }

        input = input.replace(TAB_AND_NEW_LINE, '');
        codePoints = arrayFrom(input);

        while (pointer <= codePoints.length) {
          char = codePoints[pointer];

          switch (state) {
            case SCHEME_START:
              if (char && ALPHA.test(char)) {
                buffer += char.toLowerCase();
                state = SCHEME;
              } else if (!stateOverride) {
                state = NO_SCHEME;
                continue;
              } else return INVALID_SCHEME;

              break;

            case SCHEME:
              if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
                buffer += char.toLowerCase();
              } else if (char == ':') {
                if (stateOverride) {
                  if (isSpecial(url) != has(specialSchemes, buffer) || buffer == 'file' && (includesCredentials(url) || url.port !== null) || url.scheme == 'file' && !url.host) return;
                }

                url.scheme = buffer;

                if (stateOverride) {
                  if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
                  return;
                }

                buffer = '';

                if (url.scheme == 'file') {
                  state = FILE;
                } else if (isSpecial(url) && base && base.scheme == url.scheme) {
                  state = SPECIAL_RELATIVE_OR_AUTHORITY;
                } else if (isSpecial(url)) {
                  state = SPECIAL_AUTHORITY_SLASHES;
                } else if (codePoints[pointer + 1] == '/') {
                  state = PATH_OR_AUTHORITY;
                  pointer++;
                } else {
                  url.cannotBeABaseURL = true;
                  url.path.push('');
                  state = CANNOT_BE_A_BASE_URL_PATH;
                }
              } else if (!stateOverride) {
                buffer = '';
                state = NO_SCHEME;
                pointer = 0;
                continue;
              } else return INVALID_SCHEME;

              break;

            case NO_SCHEME:
              if (!base || base.cannotBeABaseURL && char != '#') return INVALID_SCHEME;

              if (base.cannotBeABaseURL && char == '#') {
                url.scheme = base.scheme;
                url.path = base.path.slice();
                url.query = base.query;
                url.fragment = '';
                url.cannotBeABaseURL = true;
                state = FRAGMENT;
                break;
              }

              state = base.scheme == 'file' ? FILE : RELATIVE;
              continue;

            case SPECIAL_RELATIVE_OR_AUTHORITY:
              if (char == '/' && codePoints[pointer + 1] == '/') {
                state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
                pointer++;
              } else {
                state = RELATIVE;
                continue;
              }

              break;

            case PATH_OR_AUTHORITY:
              if (char == '/') {
                state = AUTHORITY;
                break;
              } else {
                state = PATH;
                continue;
              }

            case RELATIVE:
              url.scheme = base.scheme;

              if (char == EOF) {
                url.username = base.username;
                url.password = base.password;
                url.host = base.host;
                url.port = base.port;
                url.path = base.path.slice();
                url.query = base.query;
              } else if (char == '/' || char == '\\' && isSpecial(url)) {
                state = RELATIVE_SLASH;
              } else if (char == '?') {
                url.username = base.username;
                url.password = base.password;
                url.host = base.host;
                url.port = base.port;
                url.path = base.path.slice();
                url.query = '';
                state = QUERY;
              } else if (char == '#') {
                url.username = base.username;
                url.password = base.password;
                url.host = base.host;
                url.port = base.port;
                url.path = base.path.slice();
                url.query = base.query;
                url.fragment = '';
                state = FRAGMENT;
              } else {
                url.username = base.username;
                url.password = base.password;
                url.host = base.host;
                url.port = base.port;
                url.path = base.path.slice();
                url.path.pop();
                state = PATH;
                continue;
              }

              break;

            case RELATIVE_SLASH:
              if (isSpecial(url) && (char == '/' || char == '\\')) {
                state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
              } else if (char == '/') {
                state = AUTHORITY;
              } else {
                url.username = base.username;
                url.password = base.password;
                url.host = base.host;
                url.port = base.port;
                state = PATH;
                continue;
              }

              break;

            case SPECIAL_AUTHORITY_SLASHES:
              state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
              if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
              pointer++;
              break;

            case SPECIAL_AUTHORITY_IGNORE_SLASHES:
              if (char != '/' && char != '\\') {
                state = AUTHORITY;
                continue;
              }

              break;

            case AUTHORITY:
              if (char == '@') {
                if (seenAt) buffer = '%40' + buffer;
                seenAt = true;
                bufferCodePoints = arrayFrom(buffer);

                for (var i = 0; i < bufferCodePoints.length; i++) {
                  var codePoint = bufferCodePoints[i];

                  if (codePoint == ':' && !seenPasswordToken) {
                    seenPasswordToken = true;
                    continue;
                  }

                  var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
                  if (seenPasswordToken) url.password += encodedCodePoints;else url.username += encodedCodePoints;
                }

                buffer = '';
              } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url)) {
                if (seenAt && buffer == '') return INVALID_AUTHORITY;
                pointer -= arrayFrom(buffer).length + 1;
                buffer = '';
                state = HOST;
              } else buffer += char;

              break;

            case HOST:
            case HOSTNAME:
              if (stateOverride && url.scheme == 'file') {
                state = FILE_HOST;
                continue;
              } else if (char == ':' && !seenBracket) {
                if (buffer == '') return INVALID_HOST;
                failure = parseHost(url, buffer);
                if (failure) return failure;
                buffer = '';
                state = PORT;
                if (stateOverride == HOSTNAME) return;
              } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url)) {
                if (isSpecial(url) && buffer == '') return INVALID_HOST;
                if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
                failure = parseHost(url, buffer);
                if (failure) return failure;
                buffer = '';
                state = PATH_START;
                if (stateOverride) return;
                continue;
              } else {
                if (char == '[') seenBracket = true;else if (char == ']') seenBracket = false;
                buffer += char;
              }

              break;

            case PORT:
              if (DIGIT.test(char)) {
                buffer += char;
              } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url) || stateOverride) {
                if (buffer != '') {
                  var port = parseInt(buffer, 10);
                  if (port > 0xFFFF) return INVALID_PORT;
                  url.port = isSpecial(url) && port === specialSchemes[url.scheme] ? null : port;
                  buffer = '';
                }

                if (stateOverride) return;
                state = PATH_START;
                continue;
              } else return INVALID_PORT;

              break;

            case FILE:
              url.scheme = 'file';
              if (char == '/' || char == '\\') state = FILE_SLASH;else if (base && base.scheme == 'file') {
                if (char == EOF) {
                  url.host = base.host;
                  url.path = base.path.slice();
                  url.query = base.query;
                } else if (char == '?') {
                  url.host = base.host;
                  url.path = base.path.slice();
                  url.query = '';
                  state = QUERY;
                } else if (char == '#') {
                  url.host = base.host;
                  url.path = base.path.slice();
                  url.query = base.query;
                  url.fragment = '';
                  state = FRAGMENT;
                } else {
                  if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
                    url.host = base.host;
                    url.path = base.path.slice();
                    shortenURLsPath(url);
                  }

                  state = PATH;
                  continue;
                }
              } else {
                state = PATH;
                continue;
              }
              break;

            case FILE_SLASH:
              if (char == '/' || char == '\\') {
                state = FILE_HOST;
                break;
              }

              if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
                if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);else url.host = base.host;
              }

              state = PATH;
              continue;

            case FILE_HOST:
              if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
                if (!stateOverride && isWindowsDriveLetter(buffer)) {
                  state = PATH;
                } else if (buffer == '') {
                  url.host = '';
                  if (stateOverride) return;
                  state = PATH_START;
                } else {
                  failure = parseHost(url, buffer);
                  if (failure) return failure;
                  if (url.host == 'localhost') url.host = '';
                  if (stateOverride) return;
                  buffer = '';
                  state = PATH_START;
                }

                continue;
              } else buffer += char;

              break;

            case PATH_START:
              if (isSpecial(url)) {
                state = PATH;
                if (char != '/' && char != '\\') continue;
              } else if (!stateOverride && char == '?') {
                url.query = '';
                state = QUERY;
              } else if (!stateOverride && char == '#') {
                url.fragment = '';
                state = FRAGMENT;
              } else if (char != EOF) {
                state = PATH;
                if (char != '/') continue;
              }

              break;

            case PATH:
              if (char == EOF || char == '/' || char == '\\' && isSpecial(url) || !stateOverride && (char == '?' || char == '#')) {
                if (isDoubleDot(buffer)) {
                  shortenURLsPath(url);

                  if (char != '/' && !(char == '\\' && isSpecial(url))) {
                    url.path.push('');
                  }
                } else if (isSingleDot(buffer)) {
                  if (char != '/' && !(char == '\\' && isSpecial(url))) {
                    url.path.push('');
                  }
                } else {
                  if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
                    if (url.host) url.host = '';
                    buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
                  }

                  url.path.push(buffer);
                }

                buffer = '';

                if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
                  while (url.path.length > 1 && url.path[0] === '') {
                    url.path.shift();
                  }
                }

                if (char == '?') {
                  url.query = '';
                  state = QUERY;
                } else if (char == '#') {
                  url.fragment = '';
                  state = FRAGMENT;
                }
              } else {
                buffer += percentEncode(char, pathPercentEncodeSet);
              }

              break;

            case CANNOT_BE_A_BASE_URL_PATH:
              if (char == '?') {
                url.query = '';
                state = QUERY;
              } else if (char == '#') {
                url.fragment = '';
                state = FRAGMENT;
              } else if (char != EOF) {
                url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
              }

              break;

            case QUERY:
              if (!stateOverride && char == '#') {
                url.fragment = '';
                state = FRAGMENT;
              } else if (char != EOF) {
                if (char == "'" && isSpecial(url)) url.query += '%27';else if (char == '#') url.query += '%23';else url.query += percentEncode(char, C0ControlPercentEncodeSet);
              }

              break;

            case FRAGMENT:
              if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
              break;}


          pointer++;
        }
      }; // `URL` constructor
      // https://url.spec.whatwg.org/#url-class


      var URLConstructor = function URL(url
      /* , base */)
      {
        var that = anInstance(this, URLConstructor, 'URL');
        var base = arguments.length > 1 ? arguments[1] : undefined$1;
        var urlString = String(url);
        var state = setInternalState(that, {
          type: 'URL' });

        var baseState, failure;

        if (base !== undefined$1) {
          if (base instanceof URLConstructor) baseState = getInternalURLState(base);else {
            failure = parseURL(baseState = {}, String(base));
            if (failure) throw TypeError(failure);
          }
        }

        failure = parseURL(state, urlString, null, baseState);
        if (failure) throw TypeError(failure);
        var searchParams = state.searchParams = new URLSearchParams();
        var searchParamsState = getInternalSearchParamsState(searchParams);
        searchParamsState.updateSearchParams(state.query);

        searchParamsState.updateURL = function () {
          state.query = String(searchParams) || null;
        };

        if (!DESCRIPTORS) {
          that.href = serializeURL.call(that);
          that.origin = getOrigin.call(that);
          that.protocol = getProtocol.call(that);
          that.username = getUsername.call(that);
          that.password = getPassword.call(that);
          that.host = getHost.call(that);
          that.hostname = getHostname.call(that);
          that.port = getPort.call(that);
          that.pathname = getPathname.call(that);
          that.search = getSearch.call(that);
          that.searchParams = getSearchParams.call(that);
          that.hash = getHash.call(that);
        }
      };

      var URLPrototype = URLConstructor.prototype;

      var serializeURL = function serializeURL() {
        var url = getInternalURLState(this);
        var scheme = url.scheme;
        var username = url.username;
        var password = url.password;
        var host = url.host;
        var port = url.port;
        var path = url.path;
        var query = url.query;
        var fragment = url.fragment;
        var output = scheme + ':';

        if (host !== null) {
          output += '//';

          if (includesCredentials(url)) {
            output += username + (password ? ':' + password : '') + '@';
          }

          output += serializeHost(host);
          if (port !== null) output += ':' + port;
        } else if (scheme == 'file') output += '//';

        output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
        if (query !== null) output += '?' + query;
        if (fragment !== null) output += '#' + fragment;
        return output;
      };

      var getOrigin = function getOrigin() {
        var url = getInternalURLState(this);
        var scheme = url.scheme;
        var port = url.port;
        if (scheme == 'blob') try {
          return new URL(scheme.path[0]).origin;
        } catch (error) {
          return 'null';
        }
        if (scheme == 'file' || !isSpecial(url)) return 'null';
        return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
      };

      var getProtocol = function getProtocol() {
        return getInternalURLState(this).scheme + ':';
      };

      var getUsername = function getUsername() {
        return getInternalURLState(this).username;
      };

      var getPassword = function getPassword() {
        return getInternalURLState(this).password;
      };

      var getHost = function getHost() {
        var url = getInternalURLState(this);
        var host = url.host;
        var port = url.port;
        return host === null ? '' : port === null ? serializeHost(host) : serializeHost(host) + ':' + port;
      };

      var getHostname = function getHostname() {
        var host = getInternalURLState(this).host;
        return host === null ? '' : serializeHost(host);
      };

      var getPort = function getPort() {
        var port = getInternalURLState(this).port;
        return port === null ? '' : String(port);
      };

      var getPathname = function getPathname() {
        var url = getInternalURLState(this);
        var path = url.path;
        return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
      };

      var getSearch = function getSearch() {
        var query = getInternalURLState(this).query;
        return query ? '?' + query : '';
      };

      var getSearchParams = function getSearchParams() {
        return getInternalURLState(this).searchParams;
      };

      var getHash = function getHash() {
        var fragment = getInternalURLState(this).fragment;
        return fragment ? '#' + fragment : '';
      };

      var accessorDescriptor = function accessorDescriptor(getter, setter) {
        return {
          get: getter,
          set: setter,
          configurable: true,
          enumerable: true };

      };

      if (DESCRIPTORS) {
        defineProperties(URLPrototype, {
          // `URL.prototype.href` accessors pair
          // https://url.spec.whatwg.org/#dom-url-href
          href: accessorDescriptor(serializeURL, function (href) {
            var url = getInternalURLState(this);
            var urlString = String(href);
            var failure = parseURL(url, urlString);
            if (failure) throw TypeError(failure);
            getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
          }),
          // `URL.prototype.origin` getter
          // https://url.spec.whatwg.org/#dom-url-origin
          origin: accessorDescriptor(getOrigin),
          // `URL.prototype.protocol` accessors pair
          // https://url.spec.whatwg.org/#dom-url-protocol
          protocol: accessorDescriptor(getProtocol, function (protocol) {
            var url = getInternalURLState(this);
            parseURL(url, String(protocol) + ':', SCHEME_START);
          }),
          // `URL.prototype.username` accessors pair
          // https://url.spec.whatwg.org/#dom-url-username
          username: accessorDescriptor(getUsername, function (username) {
            var url = getInternalURLState(this);
            var codePoints = arrayFrom(String(username));
            if (cannotHaveUsernamePasswordPort(url)) return;
            url.username = '';

            for (var i = 0; i < codePoints.length; i++) {
              url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
            }
          }),
          // `URL.prototype.password` accessors pair
          // https://url.spec.whatwg.org/#dom-url-password
          password: accessorDescriptor(getPassword, function (password) {
            var url = getInternalURLState(this);
            var codePoints = arrayFrom(String(password));
            if (cannotHaveUsernamePasswordPort(url)) return;
            url.password = '';

            for (var i = 0; i < codePoints.length; i++) {
              url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
            }
          }),
          // `URL.prototype.host` accessors pair
          // https://url.spec.whatwg.org/#dom-url-host
          host: accessorDescriptor(getHost, function (host) {
            var url = getInternalURLState(this);
            if (url.cannotBeABaseURL) return;
            parseURL(url, String(host), HOST);
          }),
          // `URL.prototype.hostname` accessors pair
          // https://url.spec.whatwg.org/#dom-url-hostname
          hostname: accessorDescriptor(getHostname, function (hostname) {
            var url = getInternalURLState(this);
            if (url.cannotBeABaseURL) return;
            parseURL(url, String(hostname), HOSTNAME);
          }),
          // `URL.prototype.port` accessors pair
          // https://url.spec.whatwg.org/#dom-url-port
          port: accessorDescriptor(getPort, function (port) {
            var url = getInternalURLState(this);
            if (cannotHaveUsernamePasswordPort(url)) return;
            port = String(port);
            if (port == '') url.port = null;else parseURL(url, port, PORT);
          }),
          // `URL.prototype.pathname` accessors pair
          // https://url.spec.whatwg.org/#dom-url-pathname
          pathname: accessorDescriptor(getPathname, function (pathname) {
            var url = getInternalURLState(this);
            if (url.cannotBeABaseURL) return;
            url.path = [];
            parseURL(url, pathname + '', PATH_START);
          }),
          // `URL.prototype.search` accessors pair
          // https://url.spec.whatwg.org/#dom-url-search
          search: accessorDescriptor(getSearch, function (search) {
            var url = getInternalURLState(this);
            search = String(search);

            if (search == '') {
              url.query = null;
            } else {
              if ('?' == search.charAt(0)) search = search.slice(1);
              url.query = '';
              parseURL(url, search, QUERY);
            }

            getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
          }),
          // `URL.prototype.searchParams` getter
          // https://url.spec.whatwg.org/#dom-url-searchparams
          searchParams: accessorDescriptor(getSearchParams),
          // `URL.prototype.hash` accessors pair
          // https://url.spec.whatwg.org/#dom-url-hash
          hash: accessorDescriptor(getHash, function (hash) {
            var url = getInternalURLState(this);
            hash = String(hash);

            if (hash == '') {
              url.fragment = null;
              return;
            }

            if ('#' == hash.charAt(0)) hash = hash.slice(1);
            url.fragment = '';
            parseURL(url, hash, FRAGMENT);
          }) });

      } // `URL.prototype.toJSON` method
      // https://url.spec.whatwg.org/#dom-url-tojson


      redefine(URLPrototype, 'toJSON', function toJSON() {
        return serializeURL.call(this);
      }, {
        enumerable: true });
      // `URL.prototype.toString` method
      // https://url.spec.whatwg.org/#URL-stringification-behavior

      redefine(URLPrototype, 'toString', function toString() {
        return serializeURL.call(this);
      }, {
        enumerable: true });


      if (NativeURL) {
        var nativeCreateObjectURL = NativeURL.createObjectURL;
        var nativeRevokeObjectURL = NativeURL.revokeObjectURL; // `URL.createObjectURL` method
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
        // eslint-disable-next-line no-unused-vars

        if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
          return nativeCreateObjectURL.apply(NativeURL, arguments);
        }); // `URL.revokeObjectURL` method
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
        // eslint-disable-next-line no-unused-vars

        if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
          return nativeRevokeObjectURL.apply(NativeURL, arguments);
        });
      }

      setToStringTag(URLConstructor, 'URL');
      $({
        global: true,
        forced: !USE_NATIVE_URL,
        sham: !DESCRIPTORS },
      {
        URL: URLConstructor });

      /***/
    },
    /* 351 */

    /***/
    function (module, exports, __webpack_require__) {
      var fails = __webpack_require__(6);

      var wellKnownSymbol = __webpack_require__(44);

      var IS_PURE = __webpack_require__(24);

      var ITERATOR = wellKnownSymbol('iterator');
      module.exports = !fails(function () {
        var url = new URL('b?e=1', 'http://a');
        var searchParams = url.searchParams;
        url.pathname = 'c%20d';
        return IS_PURE && !url.toJSON || !searchParams.sort || url.href !== 'http://a/c%20d?e=1' || searchParams.get('e') !== '1' || String(new URLSearchParams('?a=1')) !== 'a=1' || !searchParams[ITERATOR] // throws in Edge
        || new URL('https://a@b').username !== 'a' || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b' // not punycoded in Edge
        || new URL('http://тест').host !== 'xn--e1aybc' // not escaped in Chrome 62-
        || new URL('http://a#б').hash !== '#%D0%B1';
      });
      /***/
    },
    /* 352 */

    /***/
    function (module, exports, __webpack_require__) {
      // based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
      var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

      var base = 36;
      var tMin = 1;
      var tMax = 26;
      var skew = 38;
      var damp = 700;
      var initialBias = 72;
      var initialN = 128; // 0x80

      var delimiter = '-'; // '\x2D'

      var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars

      var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

      var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
      var baseMinusTMin = base - tMin;
      var floor = Math.floor;
      var stringFromCharCode = String.fromCharCode;
      /**
                                                     * Creates an array containing the numeric code points of each Unicode
                                                     * character in the string. While JavaScript uses UCS-2 internally,
                                                     * this function will convert a pair of surrogate halves (each of which
                                                     * UCS-2 exposes as separate characters) into a single code point,
                                                     * matching UTF-16.
                                                     */

      var ucs2decode = function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;

        while (counter < length) {
          var value = string.charCodeAt(counter++);

          if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            // It's a high surrogate, and there is a next character.
            var extra = string.charCodeAt(counter++);

            if ((extra & 0xFC00) == 0xDC00) {
              // Low surrogate.
              output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
            } else {
              // It's an unmatched surrogate; only append this code unit, in case the
              // next code unit is the high surrogate of a surrogate pair.
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }

        return output;
      };
      /**
          * Converts a digit/integer into a basic code point.
          */


      var digitToBasic = function digitToBasic(digit) {
        //  0..25 map to ASCII a..z or A..Z
        // 26..35 map to ASCII 0..9
        return digit + 22 + 75 * (digit < 26);
      };
      /**
          * Bias adaptation function as per section 3.4 of RFC 3492.
          * https://tools.ietf.org/html/rfc3492#section-3.4
          */


      var adapt = function adapt(delta, numPoints, firstTime) {
        var k = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);

        for (;
        /* no initialization */
        delta > baseMinusTMin * tMax >> 1; k += base) {
          delta = floor(delta / baseMinusTMin);
        }

        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
      };
      /**
          * Converts a string of Unicode symbols (e.g. a domain name label) to a
          * Punycode string of ASCII-only symbols.
          */
      // eslint-disable-next-line  max-statements


      var encode = function encode(input) {
        var output = []; // Convert the input in UCS-2 to an array of Unicode code points.

        input = ucs2decode(input); // Cache the length.

        var inputLength = input.length; // Initialize the state.

        var n = initialN;
        var delta = 0;
        var bias = initialBias;
        var i, currentValue; // Handle the basic code points.

        for (i = 0; i < input.length; i++) {
          currentValue = input[i];

          if (currentValue < 0x80) {
            output.push(stringFromCharCode(currentValue));
          }
        }

        var basicLength = output.length; // number of basic code points.

        var handledCPCount = basicLength; // number of code points that have been handled;
        // Finish the basic string with a delimiter unless it's empty.

        if (basicLength) {
          output.push(delimiter);
        } // Main encoding loop:


        while (handledCPCount < inputLength) {
          // All non-basic code points < n have been handled already. Find the next larger one:
          var m = maxInt;

          for (i = 0; i < input.length; i++) {
            currentValue = input[i];

            if (currentValue >= n && currentValue < m) {
              m = currentValue;
            }
          } // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.


          var handledCPCountPlusOne = handledCPCount + 1;

          if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
            throw RangeError(OVERFLOW_ERROR);
          }

          delta += (m - n) * handledCPCountPlusOne;
          n = m;

          for (i = 0; i < input.length; i++) {
            currentValue = input[i];

            if (currentValue < n && ++delta > maxInt) {
              throw RangeError(OVERFLOW_ERROR);
            }

            if (currentValue == n) {
              // Represent delta as a generalized variable-length integer.
              var q = delta;

              for (var k = base;;
              /* no condition */
              k += base) {
                var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

                if (q < t) {
                  break;
                }

                var qMinusT = q - t;
                var baseMinusT = base - t;
                output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
                q = floor(qMinusT / baseMinusT);
              }

              output.push(stringFromCharCode(digitToBasic(q)));
              bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
              delta = 0;
              ++handledCPCount;
            }
          }

          ++delta;
          ++n;
        }

        return output.join('');
      };

      module.exports = function (input) {
        var encoded = [];
        var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
        var i, label;

        for (i = 0; i < labels.length; i++) {
          label = labels[i];
          encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
        }

        return encoded.join('.');
      };
      /***/

    },
    /* 353 */

    /***/
    function (module, exports, __webpack_require__) {
      __webpack_require__(103);

      var $ = __webpack_require__(2);

      var USE_NATIVE_URL = __webpack_require__(351);

      var redefine = __webpack_require__(21);

      var redefineAll = __webpack_require__(132);

      var setToStringTag = __webpack_require__(43);

      var createIteratorConstructor = __webpack_require__(105);

      var InternalStateModule = __webpack_require__(26);

      var anInstance = __webpack_require__(133);

      var hasOwn = __webpack_require__(15);

      var bind = __webpack_require__(79);

      var anObject = __webpack_require__(20);

      var isObject = __webpack_require__(14);

      var getIterator = __webpack_require__(354);

      var getIteratorMethod = __webpack_require__(97);

      var wellKnownSymbol = __webpack_require__(44);

      var ITERATOR = wellKnownSymbol('iterator');
      var URL_SEARCH_PARAMS = 'URLSearchParams';
      var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
      var setInternalState = InternalStateModule.set;
      var getInternalParamsState = InternalStateModule.getterFor(URL_SEARCH_PARAMS);
      var getInternalIteratorState = InternalStateModule.getterFor(URL_SEARCH_PARAMS_ITERATOR);
      var plus = /\+/g;
      var sequences = Array(4);

      var percentSequence = function percentSequence(bytes) {
        return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
      };

      var percentDecode = function percentDecode(sequence) {
        try {
          return decodeURIComponent(sequence);
        } catch (error) {
          return sequence;
        }
      };

      var deserialize = function deserialize(it) {
        var result = it.replace(plus, ' ');
        var bytes = 4;

        try {
          return decodeURIComponent(result);
        } catch (error) {
          while (bytes) {
            result = result.replace(percentSequence(bytes--), percentDecode);
          }

          return result;
        }
      };

      var find = /[!'()~]|%20/g;
      var replace = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+' };


      var replacer = function replacer(match) {
        return replace[match];
      };

      var serialize = function serialize(it) {
        return encodeURIComponent(it).replace(find, replacer);
      };

      var parseSearchParams = function parseSearchParams(result, query) {
        if (query) {
          var attributes = query.split('&');
          var i = 0;
          var attribute, entry;

          while (i < attributes.length) {
            attribute = attributes[i++];

            if (attribute.length) {
              entry = attribute.split('=');
              result.push({
                key: deserialize(entry.shift()),
                value: deserialize(entry.join('=')) });

            }
          }
        }

        return result;
      };

      var updateSearchParams = function updateSearchParams(query) {
        this.entries.length = 0;
        parseSearchParams(this.entries, query);
      };

      var validateArgumentsLength = function validateArgumentsLength(passed, required) {
        if (passed < required) throw TypeError('Not enough arguments');
      };

      var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
        setInternalState(this, {
          type: URL_SEARCH_PARAMS_ITERATOR,
          iterator: getIterator(getInternalParamsState(params).entries),
          kind: kind });

      }, 'Iterator', function next() {
        var state = getInternalIteratorState(this);
        var kind = state.kind;
        var step = state.iterator.next();
        var entry = step.value;

        if (!step.done) {
          step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
        }

        return step;
      }); // `URLSearchParams` constructor
      // https://url.spec.whatwg.org/#interface-urlsearchparams

      var URLSearchParamsConstructor = function URLSearchParams()
      /* init */
      {
        anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
        var init = arguments.length > 0 ? arguments[0] : undefined$1;
        var that = this;
        var entries = [];
        var iteratorMethod, iterator, step, entryIterator, first, second, key;
        setInternalState(that, {
          type: URL_SEARCH_PARAMS,
          entries: entries,
          updateURL: null,
          updateSearchParams: updateSearchParams });


        if (init !== undefined$1) {
          if (isObject(init)) {
            iteratorMethod = getIteratorMethod(init);

            if (typeof iteratorMethod === 'function') {
              iterator = iteratorMethod.call(init);

              while (!(step = iterator.next()).done) {
                entryIterator = getIterator(anObject(step.value));
                if ((first = entryIterator.next()).done || (second = entryIterator.next()).done || !entryIterator.next().done) throw TypeError('Expected sequence with length 2');
                entries.push({
                  key: first.value + '',
                  value: second.value + '' });

              }
            } else for (key in init) if (hasOwn(init, key)) entries.push({
              key: key,
              value: init[key] + '' });

          } else {
            parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
          }
        }
      };

      var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;
      redefineAll(URLSearchParamsPrototype, {
        // `URLSearchParams.prototype.appent` method
        // https://url.spec.whatwg.org/#dom-urlsearchparams-append
        append: function append(name, value) {
          validateArgumentsLength(arguments.length, 2);
          var state = getInternalParamsState(this);
          state.entries.push({
            key: name + '',
            value: value + '' });

          if (state.updateURL) state.updateURL();
        },
        // `URLSearchParams.prototype.delete` method
        // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
        'delete': function (name) {
          validateArgumentsLength(arguments.length, 1);
          var state = getInternalParamsState(this);
          var entries = state.entries;
          var key = name + '';
          var i = 0;

          while (i < entries.length) {
            if (entries[i].key === key) entries.splice(i, 1);else i++;
          }

          if (state.updateURL) state.updateURL();
        },
        // `URLSearchParams.prototype.get` method
        // https://url.spec.whatwg.org/#dom-urlsearchparams-get
        get: function get(name) {
          validateArgumentsLength(arguments.length, 1);
          var entries = getInternalParamsState(this).entries;
          var key = name + '';
          var i = 0;

          for (; i < entries.length; i++) if (entries[i].key === key) return entries[i].value;

          return null;
        },
        // `URLSearchParams.prototype.getAll` method
        // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
        getAll: function getAll(name) {
          validateArgumentsLength(arguments.length, 1);
          var entries = getInternalParamsState(this).entries;
          var key = name + '';
          var result = [];
          var i = 0;

          for (; i < entries.length; i++) if (entries[i].key === key) result.push(entries[i].value);

          return result;
        },
        // `URLSearchParams.prototype.has` method
        // https://url.spec.whatwg.org/#dom-urlsearchparams-has
        has: function has(name) {
          validateArgumentsLength(arguments.length, 1);
          var entries = getInternalParamsState(this).entries;
          var key = name + '';
          var i = 0;

          while (i < entries.length) if (entries[i++].key === key) return true;

          return false;
        },
        // `URLSearchParams.prototype.set` method
        // https://url.spec.whatwg.org/#dom-urlsearchparams-set
        set: function set(name, value) {
          validateArgumentsLength(arguments.length, 1);
          var state = getInternalParamsState(this);
          var entries = state.entries;
          var found = false;
          var key = name + '';
          var val = value + '';
          var i = 0;
          var entry;

          for (; i < entries.length; i++) {
            entry = entries[i];

            if (entry.key === key) {
              if (found) entries.splice(i--, 1);else {
                found = true;
                entry.value = val;
              }
            }
          }

          if (!found) entries.push({
            key: key,
            value: val });

          if (state.updateURL) state.updateURL();
        },
        // `URLSearchParams.prototype.sort` method
        // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
        sort: function sort() {
          var state = getInternalParamsState(this);
          var entries = state.entries; // Array#sort is not stable in some engines

          var slice = entries.slice();
          var entry, i, j;
          entries.length = 0;

          for (i = 0; i < slice.length; i++) {
            entry = slice[i];

            for (j = 0; j < i; j++) if (entries[j].key > entry.key) {
              entries.splice(j, 0, entry);
              break;
            }

            if (j === i) entries.push(entry);
          }

          if (state.updateURL) state.updateURL();
        },
        // `URLSearchParams.prototype.forEach` method
        forEach: function forEach(callback
        /* , thisArg */)
        {
          var entries = getInternalParamsState(this).entries;
          var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined$1, 3);
          var i = 0;
          var entry;

          while (i < entries.length) {
            entry = entries[i++];
            boundFunction(entry.value, entry.key, this);
          }
        },
        // `URLSearchParams.prototype.keys` method
        keys: function keys() {
          return new URLSearchParamsIterator(this, 'keys');
        },
        // `URLSearchParams.prototype.values` method
        values: function values() {
          return new URLSearchParamsIterator(this, 'values');
        },
        // `URLSearchParams.prototype.entries` method
        entries: function entries() {
          return new URLSearchParamsIterator(this, 'entries');
        } },
      {
        enumerable: true });
      // `URLSearchParams.prototype[@@iterator]` method

      redefine(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries); // `URLSearchParams.prototype.toString` method
      // https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior

      redefine(URLSearchParamsPrototype, 'toString', function toString() {
        var entries = getInternalParamsState(this).entries;
        var result = [];
        var i = 0;
        var entry;

        while (i < entries.length) {
          entry = entries[i++];
          result.push(serialize(entry.key) + '=' + serialize(entry.value));
        }

        return result.join('&');
      }, {
        enumerable: true });

      setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);
      $({
        global: true,
        forced: !USE_NATIVE_URL },
      {
        URLSearchParams: URLSearchParamsConstructor });

      module.exports = {
        URLSearchParams: URLSearchParamsConstructor,
        getState: getInternalParamsState };

      /***/
    },
    /* 354 */

    /***/
    function (module, exports, __webpack_require__) {
      var anObject = __webpack_require__(20);

      var getIteratorMethod = __webpack_require__(97);

      module.exports = function (it) {
        var iteratorMethod = getIteratorMethod(it);

        if (typeof iteratorMethod != 'function') {
          throw TypeError(String(it) + ' is not iterable');
        }

        return anObject(iteratorMethod.call(it));
      };
      /***/

    },
    /* 355 */

    /***/
    function (module, exports, __webpack_require__) {
      var $ = __webpack_require__(2); // `URL.prototype.toJSON` method
      // https://url.spec.whatwg.org/#dom-url-tojson


      $({
        target: 'URL',
        proto: true,
        enumerable: true },
      {
        toJSON: function toJSON() {
          return URL.prototype.toString.call(this);
        } });

      /***/
    }
    /******/]);

  }(); // START regenerator-runtime/runtime

  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = function (exports) {
    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.

    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.

      generator._invoke = makeInvokeMethod(innerFn, self, context);
      return generator;
    }

    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.

    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg) };

      } catch (err) {
        return {
          type: "throw",
          arg: err };

      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.

    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.

    function Generator() {}

    function GeneratorFunction() {}

    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.


    var IteratorPrototype = {};

    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.

    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        prototype[method] = function (arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    exports.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;

        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }

      genFun.prototype = Object.create(Gp);
      return genFun;
    }; // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.


    exports.awrap = function (arg) {
      return {
        __await: arg };

    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);

        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;

          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function (value) {
              invoke("next", value, resolve, reject);
            }, function (err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function (unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function (error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise = // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
        // invocations of the iterator.
        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      } // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).


      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);

    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };

    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.

    exports.async = function (innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;
      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          } // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;

          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);

            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;
          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);
          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;
          var record = tryCatch(innerFn, self, context);

          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done };

          } else if (record.type === "throw") {
            state = GenStateCompleted; // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.

            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    } // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.


    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];

      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError("The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.

        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }
      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      } // The delegate iterator is finished, so forget it and continue with
      // the outer generator.


      context.delegate = null;
      return ContinueSentinel;
    } // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.


    defineIteratorMethods(Gp);
    Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.

    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0] };


      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{
        tryLoc: "root" }];

      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function (object) {
      var keys = [];

      for (var key in object) {
        keys.push(key);
      }

      keys.reverse(); // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.

      return function next() {
        while (keys.length) {
          var key = keys.pop();

          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        } // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.


        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];

        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
          next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;
            return next;
          };

          return next.next = next;
        }
      } // Return an iterator with no values.


      return {
        next: doneResult };

    }

    exports.values = values;

    function doneResult() {
      return {
        value: undefined$1,
        done: true };

    }

    Context.prototype = {
      constructor: Context,
      reset: function (skipTempReset) {
        this.prev = 0;
        this.next = 0; // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.

        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = undefined$1;
        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },
      stop: function () {
        this.done = true;
        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;

        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },
      dispatchException: function (exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;

        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },
      abrupt: function (type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },
      complete: function (record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },
      finish: function (finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },
      "catch": function (tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;

            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }

            return thrown;
          }
        } // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.


        throw new Error("illegal catch attempt");
      },
      delegateYield: function (iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc };


        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      } };
    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.

    return exports;
  }( // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports);

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
});
var polyfill$1 = unwrapExports(polyfill);

// the contains code for the output console

class WCCodeConsole {
  constructor (wccode) {
    this.elements = {};
    this.createDiv(wccode);
  }

  /**
   * creates the console div for wc-code
   *
   * @param wccode - a wc-code instance
   */
  createDiv (wccode) {
    this.elements.console = document.createElement('div');
    this.elements.console.classList.add('wc-code-console');
    this.elements.consoleList = document.createElement('ol');

    this.elements.console.appendChild(this.elements.consoleList);
    wccode.appendChild(this.elements.console);
  }

  /**
   * add an element inside a console,
   *
   * this will be put in an 'li' element befor being put inside
   *
   * @param el - the HTMLElement to be put inside
   */
  addEl (el) {
    const li = document.createElement('li');
    li.appendChild(el);
    this.elements.consoleList.appendChild(li);
  }

  /**
   * easy method to put a span element inside the console with some text inside
   *
   * @param {String} text - the text to put inside the console
   */
  addText (text) {
    const span = document.createElement('span');
    span.innerText = text;
    this.addEl(span);
  }

  /** clear the console **/
  clear () {
    this.elements.consoleList.innerText = '';
  }
}

const ModesBaseLoc = 'https://cdn.jsdelivr.net/gh/vanillawc/wc-codemirror@1.8.7/mode/';

/**
 * these attributes, when loaded, load the
 * script file for the language dynamically,
 * as well the code running file
 */
var languageDetails = {
  metaUrl: import.meta.url,
  languages: {
    javascript: {
      CMLanguageLoc: ModesBaseLoc + 'javascript/javascript.js',
      languageFile: './languages/javascript.js'
    },
    python: {
      CMLanguageLoc: ModesBaseLoc + 'python/python.js',
      languageFile: './languages/python/python.js'
    }
  }
};

const WCCode$1 = {
  zones: {
    __nextZoneID: 0,
    zones: {},
    get (id) { return this.zones[id] },
    save (zone) {
      const zoneID = this.__nextZoneID;
      this.__nextZoneID++;
      this.zones[zoneID] = zone;
      return zoneID
    }
  },
  languages: {}
};

window.WCCode = WCCode$1;

/**
 * code zones are zones where the code runs,
 * these are supposed to be completely seperate interpreters
 * that don't share variables with other zones
 */
class CodeZone {
  constructor () {
    // needs to be set by the interpreter
    this.interpreter = undefined;
    this.console = undefined;
    this.zoneId = WCCode$1.zones.save(this);
  }

  /**
   * set the current interpreter
   */
  setInterpreter (interpreter) {
    this.interpreter = interpreter;
  }

  /**
   * set the currest console
   */
  setConsole (_console) {
    this.console = _console;
  }

  /**
   * run code in the zone
   */
  run (code) {
    this.interpreter.run(code);
  }
}

/* eslint no-undef: 0 */
/**
 * the wc-code-zone element
 */
class WCCodeZone extends HTMLElement {
  constructor () {
    super();
    this.language = this.getAttribute('mode');
    this.zone = new CodeZone();
    this.initalized = false;
    this.elements = {};
  }

  init () {
    const language = WCCode.languages[this.language];
    this.zone.setInterpreter(new language.Interpreter(this.zone));
    this.initalized = true;
  }

  get wccodes () {
    return this.getElementsByTagName('wc-code')
  }

  run () {
    this.zone.run();
  }
}

customElements.define('wc-code-zone', WCCodeZone);

const addedScripts = {};
const importedScripts = {};
const addedCSSLinks = {};

/**
 * add a script if we need to add a script,
 * else don't, useful for language syntax/theme additions,
 * adding themes, stuff like that
 */
async function addScriptIfRequired (_url, base) {
  const url = new URL(_url, base);
  if (addedScripts[url.href]) {
    if (addedScripts[url.href].completed) {
      return
    } else {
      return await addedScripts[url.href].promise
    }
  }

  const script = document.createElement('script');
  script.src = url.href;
  document.body.appendChild(script);

  const loaded = new Promise(resolve => {
    script.addEventListener('load', resolve);
  });

  addedScripts[url.href] = {
    promise: loaded,
    completed: false
  };

  await loaded;

  addedScripts[url.href].completed = true;
}

/**
 * import a script if we need to import a script,
 * else don't, useful for language syntax/theme additions,
 * adding themes, stuff like that
 */
async function importScriptIfRequired (_url, base) {
  const url = new URL(_url, base);

  if (importedScripts[url.href]) {
    if (importedScripts[url.href].completed) {
      return
    } else {
      return await importedScripts[url.href].promise
    }
  }
  const loaded = import(url.href);

  importedScripts[url.href] = {
    promise: loaded,
    completed: false
  };

  await loaded;

  importedScripts[url.href].completed = true;
}

/**
 * add a css link if required
 */
async function addCSSLinkIfRequired (_url, base) {
  const url = new URL(_url, base);
  if (addedCSSLinks[url.href]) {
    if (addedCSSLinks[url.href].completed) {
      return
    } else {
      return await addedCSSLinks[url.href].promise
    }
  }

  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', url.href);
  document.body.appendChild(link);

  const loaded = new Promise(resolve => link.addEventListener('load', resolve));

  addedCSSLinks[url.href] = {
    promise: loaded,
    completed: false
  };

  await loaded;

  addedCSSLinks[url.href].completed = true;
}

/**
 * see addScriptIfRequired, this is for multiple scripts
 */
async function addScriptsIfRequired (urls, base) {
  for (var url of urls) {
    await addScriptIfRequired(url, base);
  }
}

/**
 * find parent wc-zone
 *
 * @param wccode - a wccode instance
 */
function findParentWCCodeZone (wccode) {
  let parent = wccode.parentNode;

  while (true) {
    if (parent === document.body) {
      return null
    } else if (parent instanceof WCCodeZone) {
      return parent
    } else if (!parent) {
      return null
    }
    parent = parent.parentNode;
  }
}

/* eslint no-undef: 0 */

addCSSLinkIfRequired('./wc-code.css', import.meta.url);

/**
 * Code, but like its magic
 */
WCCode$1.WCCode = class extends WCCodeMirror {
  /**
   * create the wc-code instance
   */
  constructor () {
    super();

    this.elements = {};
    const inWCZone = findParentWCCodeZone(this);

    if (inWCZone) {
      this.parentZoneElement = inWCZone;
      this.zone = inWCZone.zone;
      this.setAttribute('mode', this.parentZoneElement.language);
      if (this.parentZoneElement.hasAttribute('theme')) {
        this.setAttribute('theme',
          this.parentZoneElement.getAttribute('theme'));
      }
    } else {
      this.zone = new CodeZone();
    }

    this.addLoadingBar();
    this.addButtons();
    this.addConsole();
    this.setTheme();
    this.init();
  }

  get languageOptions () {
    return WCCode$1.languages[this.language]
  }

  async connectedCallback(...args){
    await super.connectedCallback(...args);
    this.setKeyCombinations();
  }

  /**
   * set the programming language
   */
  async init () {
    this.elements.run.setAttribute('disabled', '');
    this.checkLanguageExists();
    this.language = this.getAttribute('mode');
    await this.initLanguageFiles();
    await this.initLanguage();
    await this.initInterpreter();
    this.loadingBar.setText('coding environment loading complete');
    this.loadingBar.setDone();
    this.elements.run.removeAttribute('disabled');
  }

  checkLanguageExists () {
    const language = this.getAttribute('mode');
    const languageStuff = languageDetails.languages[language];

    if (languageStuff) return
    console.error(`wc-code: the programming language you've used - i.e. "${language}" isn't supported, sorry !`);
    console.log(this);
    console.trace();
  }

  async initLanguageFiles () {
    const language = this.language;
    const languageStuff = languageDetails.languages[language];
    this.setAttribute('mode', language);
    this.loadingBar.setText('loading codemirror language file...');
    await importScriptIfRequired(languageStuff.CMLanguageLoc, languageDetails.metaUrl);
    this.loadingBar.setText('loading wc-code language file...');
    await importScriptIfRequired(languageStuff.languageFile,
      languageDetails.metaUrl);

    if (this.languageOptions.additionalScripts) {
      this.loadingBar.setText('loading additional required scripts...');
      await addScriptsIfRequired(this.languageOptions.additionalScripts,
          this.languageOptions.meta.url);
    }
  }

  async initLanguage () {
    this.loadingBar.setText('initializing language...');
    if (!this.languageOptions.initilalized) {
      // if the language has an init function,
      // init it !
      if (this.languageOptions.init) {
        if (this.languageOptions.inited) {
          await this.languageOptions.inited;
        } else {
          this.languageOptions.inited = this.languageOptions.init();
          await this.languageOptions.inited;
        }
      }

      this.languageOptions.initialized = true;
    }
  }

  async initInterpreter () {
    // create the interpreter
    if (this.parentZoneElement) {
      if (!this.parentZoneElement.initilalized) this.parentZoneElement.init();
    } else {
      const interpreter = new this.languageOptions.Interpreter(this.zone);
      this.zone.setInterpreter(interpreter);
    }

    const interpreter = this.zone.interpreter;

    /** initialize the interpreter**/
    if (!interpreter.initialized) {
      this.loadingBar.setText('initializing interpreter');

      // if init has already been called,
      // piggyback on that and wait for it to complete
      if (interpreter.inited) {
        await interpreter.inited;
      } else {
        // init the code
        if (interpreter.init) {
          interpreter.inited = interpreter.init();
          await interpreter.inited;
        }
      }

      interpreter.initialized = true;
    }
  }

  /**
   * set the theme
   */
  async setTheme () {
    const theme = this.getAttribute('theme');
    if (theme) {
      const base = 'https://codemirror.net/theme/';
      const url = base + theme + '.css';
      addCSSLinkIfRequired(url, import.meta.url);
    }
  }
  

  setKeyCombinations(){
    this.editor.setOption("extraKeys", {
      "Ctrl-Enter": cm => {
        this.run();
      }
    });
  }

  /**
   * adds the run button, copy button and the download file button
   */
  addButtons () {
    this.elements.features = document.createElement('div');
    this.elements.copy = document.createElement('input');
    this.elements.run = document.createElement('input');
    this.elements.download = document.createElement('input');

    this.elements.copy.type = 'button';
    this.elements.run.type = 'button';
    this.elements.download.type = 'button';

    this.elements.run.value = '▶ run code';
    this.elements.copy.value = '⎘ copy to clipboard';
    this.elements.download.value = '↓ download';

    this.elements.run.addEventListener('click', () => this.run());
    this.elements.copy.addEventListener('click', () => this.copy());
    this.elements.download.addEventListener('click', () => this.download());

    this.elements.features.appendChild(this.elements.run);
    this.elements.features.appendChild(this.elements.copy);
    this.elements.features.appendChild(this.elements.download);
    this.appendChild(this.elements.features);
  }

  /**
   * add the loading bar
   */
  addLoadingBar () {
    this.loadingBar = {
      elements: {
        p: document.createElement('p')
      },
      setText (text) {
        this.elements.p.innerText = text;
      },
      setDone () {
        this.elements.p.classList.remove('wc-code-loading-bar-loading');
        this.elements.p.classList.add('wc-code-loading-bar-done');
      }
    };

    const p = this.loadingBar.elements.p;
    p.classList.add('wc-code-loading-bar');
    p.classList.add('wc-code-loading-bar-loading');

    this.loadingBar.setText('loading...');
    this.appendChild(p);
  }

  /**
   * adds the code console
   */
  addConsole () {
    this.console = new WCCodeConsole(this);
  }

  /**
   * run the code
   */
  run () {
    this.console.clear();
    this.zone.setConsole(this.console);
    this.zone.run(this.value);
  }

  /**
   * copy the code
   */
  copy () {
    navigator.clipboard.writeText(this.value);
  }

  /**
   * download the code
   */
  download () {
    const a = document.createElement('a');
    const ext = this.languageOptions.fileExt;
    const filename = this.getAttribute('file-name') || ('code-file' + ext);
    const file = new File([this.value], filename, { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
  }
};

window.WCCode = WCCode$1;

customElements.define('wc-code', WCCode$1.WCCode);
