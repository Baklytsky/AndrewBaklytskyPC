import * as ScrollLock from 'scroll-lock';

window.theme = window.theme || {};
window.theme.ScrollLock = ScrollLock;

/* ================ PhotoSwipe ================ */

import * as PhotoSwipe from 'photoswipe';
import * as PhotoSwipeUI from 'photoswipe/dist/photoswipe-ui-default';

export {PhotoSwipe, PhotoSwipeUI};

/* ================ Required ================ */
import '@/js/main/settings';
import '@/js/globals/media-query';
import '@/js/globals/currency';
import '@/js/globals/debounce';
import '@/js/globals/height';
import '@/js/globals/scroll-to';
import '@/js/globals/theme-a11y';
import '@/js/globals/throttle';
import '@/js/globals/html-update';
import '@/js/main/globals';

/* ================ Globals ================ */
import '@/js/globals/accessibility-handle';
import '@/js/globals/animation-end-promise';
import '@/js/globals/all-animations-end-promise';
import '@/js/globals/cart';
import '@/js/globals/cart-count';
import '@/js/globals/cart-drawer';
import '@/js/globals/collapsible';
import '@/js/globals/deferred-media';
import '@/js/globals/has-open-modals';
import '@/js/globals/header';
import '@/js/globals/header-hover-disclosure';
import '@/js/globals/header-mobile-drawer';
import '@/js/globals/header-mobile-sliderule';
import '@/js/globals/header-search-popdown';
import '@/js/globals/main-search';
import '@/js/globals/native-scrollbar';
import '@/js/globals/popout';
import '@/js/globals/popup';
import '@/js/globals/predictive-search';
import '@/js/globals/product-form';
import '@/js/globals/product-images';
import '@/js/globals/product-item';
import '@/js/globals/product-item-siblings';
import '@/js/globals/shopify-products';
import '@/js/globals/tabs';
import '@/js/globals/toggle-ellipsis';
import '@/js/globals/tooltip';
import '@/js/globals/swiper-slider';