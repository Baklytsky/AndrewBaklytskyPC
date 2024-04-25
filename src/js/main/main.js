import Accessibility from '../globals/accessibility-handle';
import getScrollbarWidth from '../globals/scrollbar-width';
import {load} from '../vendor/theme-scripts/theme-sections';
import loadScript from '../util/loader';
import {GridSwatch} from '../features/swatch';

document.documentElement.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`);

document.addEventListener('DOMContentLoaded', function () {
  // Load all registered sections on the page.
  load('*');

  new Accessibility();

  if (!customElements.get('product-grid-item-swatch') && window.theme.settings.enableColorSwatchesCollection) {
    customElements.define('product-grid-item-swatch', GridSwatch);
  }

  // Safari smoothscroll polyfill
  const hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;

  if (!hasNativeSmoothScroll) {
    loadScript({url: theme.assets.smoothscroll});
  }
});
