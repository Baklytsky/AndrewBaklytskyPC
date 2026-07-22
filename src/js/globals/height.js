let screenOrientation = getScreenOrientation();
let firstLoad = true;
let frame = null;

const root = document.documentElement;
const cachedVars = {};

function getScreenOrientation() {
  return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
}

function getViewportHeight() {
  return window.visualViewport?.height || window.innerHeight || theme.windowHeight;
}

function getHeight(selector) {
  return document.querySelector(selector)?.offsetHeight || 0;
}

function setRootVar(name, value) {
  const nextValue = `${Math.round(value)}px`;

  if (cachedVars[name] === nextValue) return;

  root.style.setProperty(name, nextValue);
  cachedVars[name] = nextValue;
}

function readHeights() {
  const headerHeight = getHeight('[data-header-height]');

  return {
    windowHeight: getViewportHeight(),
    headerHeight,
    stickyHeaderHeight: document.querySelector('[data-header-sticky]') ? headerHeight : 0,
    collectionNavHeight: getHeight('[data-filters-nav]'),
  };
}

window.theme.readHeights = readHeights;

function setVars() {
  const heights = readHeights();
  const currentScreenOrientation = getScreenOrientation();

  const shouldUpdateViewportHeights = firstLoad || currentScreenOrientation !== screenOrientation || theme.windowWidth > window.theme.sizes.mobile;

  if (shouldUpdateViewportHeights) {
    setRootVar('--full-height', heights.windowHeight);
    setRootVar('--three-quarters', heights.windowHeight * 0.75);
    setRootVar('--two-thirds', heights.windowHeight * (2 / 3));
    setRootVar('--one-half', heights.windowHeight * 0.5);
    setRootVar('--one-third', heights.windowHeight / 3);

    screenOrientation = currentScreenOrientation;
    firstLoad = false;
  }

  setRootVar('--filters-nav-height', heights.collectionNavHeight);
  setRootVar('--header-height', heights.headerHeight);
}

function requestSetVars() {
  if (frame) return;

  frame = requestAnimationFrame(() => {
    frame = null;
    setVars();
  });
}

requestSetVars();

window.addEventListener('DOMContentLoaded', requestSetVars);
document.addEventListener('theme:resize', requestSetVars);
document.addEventListener('shopify:section:load', requestSetVars);

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', requestSetVars);
}
