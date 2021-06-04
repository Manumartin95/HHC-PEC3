// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/@justinribeiro/lite-youtube/lite-youtube.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LiteYTEmbed = void 0;

/**
 *
 * The shadowDom / Intersection Observer version of Paul's concept:
 * https://github.com/paulirish/lite-youtube-embed
 *
 * A lightweight YouTube embed. Still should feel the same to the user, just
 * MUCH faster to initialize and paint.
 *
 * Thx to these as the inspiration
 *   https://storage.googleapis.com/amp-vs-non-amp/youtube-lazy.html
 *   https://autoplay-youtube-player.glitch.me/
 *
 * Once built it, I also found these (👍👍):
 *   https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube
 *   https://github.com/Daugilas/lazyYT https://github.com/vb/lazyframe
 */
class LiteYTEmbed extends HTMLElement {
  constructor() {
    super();
    this.iframeLoaded = false;
    this.setupDom();
  }

  static get observedAttributes() {
    return ['videoid'];
  }

  connectedCallback() {
    this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {
      once: true
    });
    this.addEventListener('click', () => this.addIframe());
  }

  get videoId() {
    return encodeURIComponent(this.getAttribute('videoid') || '');
  }

  set videoId(id) {
    this.setAttribute('videoid', id);
  }

  get videoTitle() {
    return this.getAttribute('videotitle') || 'Video';
  }

  set videoTitle(title) {
    this.setAttribute('videotitle', title);
  }

  get videoPlay() {
    return this.getAttribute('videoPlay') || 'Play';
  }

  set videoPlay(name) {
    this.setAttribute('videoPlay', name);
  }

  get videoStartAt() {
    return Number(this.getAttribute('videoStartAt') || '0');
  }

  set videoStartAt(time) {
    this.setAttribute('videoStartAt', String(time));
  }

  get autoLoad() {
    return this.hasAttribute('autoload');
  }

  set autoLoad(value) {
    if (value) {
      this.setAttribute('autoload', '');
    } else {
      this.removeAttribute('autoload');
    }
  }

  get params() {
    return `start=${this.videoStartAt}&${this.getAttribute('params')}`;
  }
  /**
   * Define our shadowDOM for the component
   */


  setupDom() {
    const shadowDom = this.attachShadow({
      mode: 'open'
    });
    shadowDom.innerHTML = `
      <style>
        :host {
          contain: content;
          display: block;
          position: relative;
          width: 100%;
          padding-bottom: calc(100% / (16 / 9));
        }

        #frame, #fallbackPlaceholder, iframe {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        #frame {
          cursor: pointer;
        }

        #fallbackPlaceholder {
          object-fit: cover;
        }

        #frame::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);
          background-position: top;
          background-repeat: repeat-x;
          height: 60px;
          padding-bottom: 50px;
          width: 100%;
          transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
          z-index: 1;
        }
        /* play button */
        .lty-playbtn {
          width: 70px;
          height: 46px;
          background-color: #212121;
          z-index: 1;
          opacity: 0.8;
          border-radius: 14%; /* TODO: Consider replacing this with YT's actual svg. Eh. */
          transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
          border: 0;
        }
        #frame:hover .lty-playbtn {
          background-color: #f00;
          opacity: 1;
        }
        /* play button triangle */
        .lty-playbtn:before {
          content: '';
          border-style: solid;
          border-width: 11px 0 11px 19px;
          border-color: transparent transparent transparent #fff;
        }
        .lty-playbtn,
        .lty-playbtn:before {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate3d(-50%, -50%, 0);
        }

        /* Post-click styles */
        .lyt-activated {
          cursor: unset;
        }

        #frame.lyt-activated::before,
        .lyt-activated .lty-playbtn {
          display: none;
        }
      </style>
      <div id="frame">
        <picture>
          <source id="webpPlaceholder" type="image/webp">
          <source id="jpegPlaceholder" type="image/jpeg">
          <img id="fallbackPlaceholder" referrerpolicy="origin">
        </picture>
        <button class="lty-playbtn"></button>
      </div>
    `;
    this.domRefFrame = this.shadowRoot.querySelector('#frame');
    this.domRefImg = {
      fallback: this.shadowRoot.querySelector('#fallbackPlaceholder'),
      webp: this.shadowRoot.querySelector('#webpPlaceholder'),
      jpeg: this.shadowRoot.querySelector('#jpegPlaceholder')
    };
    this.domRefPlayButton = this.shadowRoot.querySelector('.lty-playbtn');
  }
  /**
   * Parse our attributes and fire up some placeholders
   */


  setupComponent() {
    this.initImagePlaceholder();
    this.domRefPlayButton.setAttribute('aria-label', `${this.videoPlay}: ${this.videoTitle}`);
    this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);

    if (this.autoLoad) {
      this.initIntersectionObserver();
    }
  }
  /**
   * Lifecycle method that we use to listen for attribute changes to period
   * @param {*} name
   * @param {*} oldVal
   * @param {*} newVal
   */


  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case 'videoid':
        {
          if (oldVal !== newVal) {
            this.setupComponent(); // if we have a previous iframe, remove it and the activated class

            if (this.domRefFrame.classList.contains('lyt-activated')) {
              this.domRefFrame.classList.remove('lyt-activated');
              this.shadowRoot.querySelector('iframe').remove();
              this.iframeLoaded = false;
            }
          }

          break;
        }

      default:
        break;
    }
  }
  /**
   * Inject the iframe into the component body
   */


  addIframe() {
    if (!this.iframeLoaded) {
      const iframeHTML = `
<iframe frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
  src="https://www.youtube.com/embed/${this.videoId}?autoplay=1&${this.params}"
></iframe>`;
      this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
      this.domRefFrame.classList.add('lyt-activated');
      this.iframeLoaded = true;
    }
  }
  /**
   * Setup the placeholder image for the component
   */


  initImagePlaceholder() {
    // we don't know which image type to preload, so warm the connection
    LiteYTEmbed.addPrefetch('preconnect', 'https://i.ytimg.com/');
    const posterUrlWebp = `https://i.ytimg.com/vi_webp/${this.videoId}/hqdefault.webp`;
    const posterUrlJpeg = `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
    this.domRefImg.webp.srcset = posterUrlWebp;
    this.domRefImg.jpeg.srcset = posterUrlJpeg;
    this.domRefImg.fallback.src = posterUrlJpeg;
    this.domRefImg.fallback.setAttribute('aria-label', `${this.videoPlay}: ${this.videoTitle}`);
    this.domRefImg.fallback.setAttribute('alt', `${this.videoPlay}: ${this.videoTitle}`);
  }
  /**
   * Setup the Intersection Observer to load the iframe when scrolled into view
   */


  initIntersectionObserver() {
    if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0
      };
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.iframeLoaded) {
            LiteYTEmbed.warmConnections();
            this.addIframe();
            observer.unobserve(this);
          }
        });
      }, options);
      observer.observe(this);
    }
  }
  /**
   * Add a <link rel={preload | preconnect} ...> to the head
   * @param {*} kind
   * @param {*} url
   * @param {*} as
   */


  static addPrefetch(kind, url, as) {
    const linkElem = document.createElement('link');
    linkElem.rel = kind;
    linkElem.href = url;

    if (as) {
      linkElem.as = as;
    }

    linkElem.crossOrigin = 'true';
    document.head.append(linkElem);
  }
  /**
   * Begin preconnecting to warm up the iframe load Since the embed's netwok
   * requests load within its iframe, preload/prefetch'ing them outside the
   * iframe will only cause double-downloads. So, the best we can do is warm up
   * a few connections to origins that are in the critical path.
   *
   * Maybe `<link rel=preload as=document>` would work, but it's unsupported:
   * http://crbug.com/593267 But TBH, I don't think it'll happen soon with Site
   * Isolation and split caches adding serious complexity.
   */


  static warmConnections() {
    if (LiteYTEmbed.preconnected) return; // Host that YT uses to serve JS needed by player, per amp-youtube

    LiteYTEmbed.addPrefetch('preconnect', 'https://s.ytimg.com'); // The iframe document and most of its subresources come right off
    // youtube.com

    LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com'); // The botguard script is fetched off from google.com

    LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com'); // TODO: Not certain if these ad related domains are in the critical path.
    // Could verify with domain-specific throttling.

    LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
    LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
    LiteYTEmbed.preconnected = true;
  }

}

exports.LiteYTEmbed = LiteYTEmbed;
LiteYTEmbed.preconnected = false; // Register custom element

customElements.define('lite-youtube', LiteYTEmbed);
},{}],"index.js":[function(require,module,exports) {
"use strict";

require("@justinribeiro/lite-youtube");

document.getElementById('review-button').addEventListener('click', function () {
  var element = document.getElementById('thanks-text');
  element.style.display = "revert";
});
},{"@justinribeiro/lite-youtube":"node_modules/@justinribeiro/lite-youtube/lite-youtube.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56496" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/PEC3.e31bb0bc.js.map