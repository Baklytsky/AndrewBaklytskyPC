let screenOrientation = getScreenOrientation();
let firstLoad = true;

window.theme.readHeights = function () {
  const h = {};
  h.windowHeight = Math.min(window.screen.height, theme.windowHeight);
  h.headerHeight = getHeight('[data-header-height]');
  h.stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? h.headerHeight : 0;
  h.collectionNavHeight = getHeight('[data-collection-nav]');

  return h;
};

function setVars() {
  const {windowHeight, headerHeight, collectionNavHeight} = window.theme.readHeights();
  const currentScreenOrientation = getScreenOrientation();

  if (!firstLoad || currentScreenOrientation !== screenOrientation || theme.windowWidth > window.theme.sizes.mobile) {
    // Only update the heights on screen orientation change or larger than mobile devices
    document.documentElement.style.setProperty('--full-height', `${windowHeight}px`);
    document.documentElement.style.setProperty('--three-quarters', `${windowHeight * (3 / 4)}px`);
    document.documentElement.style.setProperty('--two-thirds', `${windowHeight * (2 / 3)}px`);
    document.documentElement.style.setProperty('--one-half', `${windowHeight / 2}px`);
    document.documentElement.style.setProperty('--one-third', `${windowHeight / 3}px`);

    // Update the screen orientation state
    screenOrientation = currentScreenOrientation;
    firstLoad = false;
  }

  document.documentElement.style.setProperty('--collection-nav-height', `${collectionNavHeight}px`);
  document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
}

function getScreenOrientation() {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return 'portrait';
  }

  if (window.matchMedia('(orientation: landscape)').matches) {
    return 'landscape';
  }
}

function getHeight(selector) {
  const el = document.querySelector(selector);
  if (el) {
    return el.offsetHeight;
  } else {
    return 0;
  }
}

setVars();

window.addEventListener('DOMContentLoaded', setVars);
document.addEventListener('theme:resize', setVars);
document.addEventListener('shopify:section:load', setVars);
