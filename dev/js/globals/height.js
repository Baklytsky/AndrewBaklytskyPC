let screenOrientation = getScreenOrientation();
window.initialWindowHeight = Math.min(window.screen.height, window.innerHeight);

function readHeights() {
  const h = {};
  h.windowHeight = Math.min(window.screen.height, window.innerHeight);
  h.footerHeight = getHeight('[data-section-type*="footer"]');
  h.headerHeight = getHeight('[data-header-height]');
  h.stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? h.headerHeight : 0;
  h.collectionNavHeight = getHeight('[data-collection-nav]');
  h.logoHeight = getFooterLogoWithPadding();

  return h;
}

function setVarsOnResize() {
  document.addEventListener('theme:resize', resizeVars);
  setVars();
}

function setVars() {
  const {windowHeight, headerHeight, logoHeight, footerHeight, collectionNavHeight} = readHeights();

  document.documentElement.style.setProperty('--full-height', `${windowHeight}px`);
  document.documentElement.style.setProperty('--three-quarters', `${windowHeight * (3 / 4)}px`);
  document.documentElement.style.setProperty('--two-thirds', `${windowHeight * (2 / 3)}px`);
  document.documentElement.style.setProperty('--one-half', `${windowHeight / 2}px`);
  document.documentElement.style.setProperty('--one-third', `${windowHeight / 3}px`);

  document.documentElement.style.setProperty('--collection-nav-height', `${collectionNavHeight}px`);
  document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
  document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
  document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
}

function resizeVars() {
  // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
  const {windowHeight, headerHeight, logoHeight, footerHeight, collectionNavHeight} = readHeights();
  const currentScreenOrientation = getScreenOrientation();

  if (currentScreenOrientation !== screenOrientation || window.innerWidth > window.theme.sizes.mobile) {
    // Only update the heights on screen orientation change or larger than mobile devices
    document.documentElement.style.setProperty('--full-height', `${windowHeight}px`);
    document.documentElement.style.setProperty('--three-quarters', `${windowHeight * (3 / 4)}px`);
    document.documentElement.style.setProperty('--two-thirds', `${windowHeight * (2 / 3)}px`);
    document.documentElement.style.setProperty('--one-half', `${windowHeight / 2}px`);
    document.documentElement.style.setProperty('--one-third', `${windowHeight / 3}px`);

    // Update the screen orientation state
    screenOrientation = currentScreenOrientation;
  }

  document.documentElement.style.setProperty('--collection-nav-height', `${collectionNavHeight}px`);

  document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
  document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
  document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
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

function getFooterLogoWithPadding() {
  const height = getHeight('[data-footer-logo]');
  if (height > 0) {
    return height + 20;
  } else {
    return 0;
  }
}

export {setVarsOnResize, setVars, readHeights, getScreenOrientation};
