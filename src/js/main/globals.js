import appendCartItems from '../globals/append-cart-items';
import floatLabels from '../globals/forms';
import {setVarsOnResize, setVars} from '../globals/height';
import resizeListener from '../globals/resize';
import scrollListener from '../globals/scroll';
import wrapElements from '../globals/wrap';
import isTouch from '../util/touch';
import {ariaToggle} from '../globals/aria-toggle';
import {loading} from '../globals/loading';
import {loadedImagesEventHook, removeLoadingClassFromLoadedImages} from '../globals/images';
import {HeaderDrawer} from '../features/header-mobile-drawer';
import {PredictiveSearch} from '../globals/predictive-search';
import {Popout} from '../globals/popout';
import {initAnimations} from '../globals/animations';

import DeferredMedia from '../globals/deferred-media';
import {GridSlider} from '../features/grid-slider';
import {HeaderMobileSliderule} from '../features/header-mobile-sliderule';

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

if (window.theme.settings.enableAnimations) {
  initAnimations();
}

resizeListener();
scrollListener();
isTouch();
setVars();
loadedImagesEventHook();

window.addEventListener('DOMContentLoaded', () => {
  setVarsOnResize();
  ariaToggle(document);
  floatLabels(document);
  wrapElements(document);
  removeLoadingClassFromLoadedImages(document);
  loading();
  appendCartItems();

  requestIdleCallback(() => {
    if (Shopify.visualPreviewMode) {
      document.documentElement.classList.add('preview-mode');
    }
  });
});

document.addEventListener('shopify:section:load', (e) => {
  const container = e.target;
  floatLabels(container);
  wrapElements(container);
  ariaToggle(document);
  setVarsOnResize();
});

if (!customElements.get('header-drawer')) {
  customElements.define('header-drawer', HeaderDrawer);
}

if (!customElements.get('mobile-sliderule')) {
  customElements.define('mobile-sliderule', HeaderMobileSliderule);
}

if (!customElements.get('popout-select')) {
  customElements.define('popout-select', Popout);
}

if (!customElements.get('predictive-search')) {
  customElements.define('predictive-search', PredictiveSearch);
}

if (!customElements.get('deferred-media')) {
  customElements.define('deferred-media', DeferredMedia);
}

if (!customElements.get('grid-slider')) {
  customElements.define('grid-slider', GridSlider);
}
