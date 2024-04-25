import debounce from '../util/debounce';
import initTransparentHeader from '../globals/init-transparent-header';
import {setVarsOnResize} from '../globals/height';
import preventOverflow from '../globals/prevent-overflow';
import resizeListener from '../globals/resize';
import scrollListener from '../globals/scroll';
import wrapElements from '../globals/wrap';
import isTouch from '../util/touch';
import {loading} from '../globals/loading';
import {loadedImagesEventHook, removeLoadingClassFromLoadedImages} from '../globals/images';
import DeferredLoading from '../globals/deferred-loading';
import PredictiveSearch from '../globals/predictive-search';
import AOS from 'aos';

// Safari requestIdleCallback polyfill
window.requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };
window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

resizeListener();
scrollListener();
isTouch();
loadedImagesEventHook();

const headerFunctions = debounce(() => {
  // Recheck sticky header settings if section is set to hidden
  initTransparentHeader();
}, 300);

const showAnimations = document.body.dataset.animations === 'true';
if (showAnimations) {
  AOS.init({
    once: true,
    offset: 50,
    duration: 600,
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setVarsOnResize();
  preventOverflow(document);
  wrapElements(document);
  removeLoadingClassFromLoadedImages(document);
  loading();
});

document.addEventListener('shopify:section:load', (e) => {
  const container = e.target;

  window.dispatchEvent(new Event('resize'), {bubbles: true});

  preventOverflow(container);
  wrapElements(container);
  setVarsOnResize();

  headerFunctions();
});

document.addEventListener('shopify:section:reorder', () => {
  headerFunctions();
});

document.addEventListener('shopify:section:unload', () => {
  headerFunctions();
});

if (!customElements.get('deferred-loading')) {
  customElements.define('deferred-loading', DeferredLoading);
}
