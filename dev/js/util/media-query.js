function getWindowWidth() {
  return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
}

function getWindowHeight() {
  return document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
}

function isDesktop() {
  return getWindowWidth() >= window.theme.sizes.small;
}

function isMobile() {
  return getWindowWidth() < window.theme.sizes.small;
}

export {getWindowWidth, getWindowHeight, isMobile, isDesktop};
