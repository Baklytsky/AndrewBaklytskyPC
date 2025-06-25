import {initAnimations} from '../globals/animations';
import floatLabels from '../globals/forms';
import resizeListener from '../globals/resize';
import scrollListener from '../globals/scroll';
import wrapElements from '../globals/wrap';
import isTouch from '../util/touch';
import {ariaToggle} from '../globals/aria-toggle';
import {loadedImagesEventHook, removeLoadingClassFromLoadedImages} from '../globals/images';

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
loadedImagesEventHook();

window.addEventListener('DOMContentLoaded', () => {
  ariaToggle(document);
  floatLabels(document);
  wrapElements(document);
  removeLoadingClassFromLoadedImages(document);

  requestIdleCallback(() => {
    if (Shopify.visualPreviewMode) {
      document.documentElement.classList.add('preview-mode');
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  if (window.self !== window.top) {
    document.querySelector('html').classList.add('iframe');
  }
});

document.addEventListener('shopify:section:load', (e) => {
  const container = e.target;
  floatLabels(container);
  wrapElements(container);
  ariaToggle(document);
});

// Apply a specific class to the html element for browser support of cookies.
if (window.navigator.cookieEnabled) {
  document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
}
