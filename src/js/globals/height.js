let screenOrientation = getScreenOrientation();

const selectors = {
  body: 'body',
  main: '[data-main]',
  collectionFilters: '[data-collection-filters]',
  footer: '[data-section-type*="footer"]',
  header: '[data-header-height]',
  stickyHeader: '[data-site-header][data-position="fixed"]',
  announcementBar: '[data-announcement-bar]',
  collectionStickyBar: '[data-collection-sticky-bar]',
  logoTextLink: '[data-logo-text-link]',
};

const classes = {
  templateCollection: 'template-collection',
  templateSearch: 'template-search',
  supportsTransparentHeader: 'supports-transparent-header',
};

function readHeights() {
  const h = {};
  h.windowHeight = Math.min(window.screen.height, window.innerHeight);
  h.footerHeight = getHeight(selectors.footer);
  h.headerHeight = getHeight(selectors.header);
  h.stickyHeaderHeight = isHeaderSticky() ? window.stickyHeaderHeight : 0;
  h.headerInitialHeight = parseInt(document.querySelector(selectors.header)?.dataset.height || document.querySelector(selectors.header)?.offsetHeight) || 0;
  h.announcementBarHeight = getHeight(selectors.announcementBar);
  h.collectionStickyBarHeight = getHeight(selectors.collectionStickyBar);
  return h;
}

function setVarsOnResize() {
  document.addEventListener('theme:resize', resizeVars);
  setVars();
  document.dispatchEvent(new CustomEvent('theme:vars'), {bubbles: false});
}

function setVars() {
  calcVars();
}

function resizeVars() {
  // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
  calcVars(true);
}

function calcVars(checkOrientation = false) {
  const body = document.querySelector(selectors.body);
  const hasCollectionFilters = document.querySelector(selectors.collectionFilters);
  const hasLogoTextLink = document.querySelector(selectors.logoTextLink) !== null;

  let {windowHeight, headerHeight, headerInitialHeight, announcementBarHeight, footerHeight, collectionStickyBarHeight} = readHeights();

  if (hasLogoTextLink) headerHeight = recalcHeaderHeight();

  const contentFullHeight = window.isHeaderTransparent && checkFirstSectionTransparency() ? windowHeight - announcementBarHeight : windowHeight - headerInitialHeight - announcementBarHeight;
  let fullHeight = isHeaderSticky() ? windowHeight - window.stickyHeaderHeight : windowHeight;
  const isCollectionPage = body.classList.contains(classes.templateCollection);
  const isSearchPage = body.classList.contains(classes.templateSearch);
  const isPageWithFilters = (isCollectionPage && hasCollectionFilters) || (isSearchPage && hasCollectionFilters);

  document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
  document.documentElement.style.setProperty('--content-full', `${contentFullHeight}px`);
  document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
  document.documentElement.style.setProperty('--collection-sticky-bar-height', `${collectionStickyBarHeight}px`);

  if (isPageWithFilters) fullHeight = windowHeight;

  if (!checkOrientation) {
    document.documentElement.style.setProperty('--full-height', `${fullHeight}px`);
    return;
  }

  const currentScreenOrientation = getScreenOrientation();
  if (currentScreenOrientation !== screenOrientation) {
    // Only update the heights on screen orientation change
    document.documentElement.style.setProperty('--full-height', `${fullHeight}px`);

    // Update the screen orientation state
    screenOrientation = currentScreenOrientation;
  }
}

function getHeight(selector) {
  const el = document.querySelector(selector);
  if (el) {
    return el.clientHeight;
  } else {
    return 0;
  }
}

function checkFirstSectionTransparency() {
  const firstSection = document.querySelector(selectors.main).firstElementChild;
  return firstSection.classList.contains(classes.supportsTransparentHeader);
}

function isHeaderSticky() {
  return document.querySelector(selectors.stickyHeader);
}

function getScreenOrientation() {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return 'portrait';
  }

  if (window.matchMedia('(orientation: landscape)').matches) {
    return 'landscape';
  }
}

function recalcHeaderHeight() {
  document.documentElement.style.setProperty('--header-height', 'auto');
  document.documentElement.style.setProperty('--header-sticky-height', 'auto');

  // Header is declared here to avoid `offsetHeight` returning zero when the element has not been rendered to the DOM yet in the Theme editor
  const header = document.querySelector(selectors.header);
  const resetHeight = header.offsetHeight;

  // requestAnimationFrame method is needed to properly update the CSS variables on resize after they have been reset
  requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--header-height', `${resetHeight}px`);
    document.documentElement.style.setProperty('--header-sticky-height', `${resetHeight}px`);
  });

  return resetHeight;
}

export {setVarsOnResize, setVars, readHeights, getScreenOrientation};
