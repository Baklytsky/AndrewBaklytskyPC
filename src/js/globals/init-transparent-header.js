const selectors = {
  body: 'body',
  main: '[data-main]',
  header: '[data-site-header]',
  preventTransparentHeader: '[data-prevent-transparent-header]',
};
const classes = {
  supportsTransparentHeader: 'supports-transparent-header',
  siteHeaderTransparent: 'site-header--transparent',
  isFirstSectionTransparent: 'is-first-section-transparent',
};

const attributes = {
  transparent: 'data-transparent',
};

const initTransparentHeader = () => {
  // Determine what is the first
  const body = document.querySelector(selectors.body);
  const header = body.querySelector(selectors.header);

  if (!header) return;

  const headerTransparent = header.getAttribute(attributes.transparent) === 'true';
  const firstSection = body.querySelector(selectors.main).children[0];

  if (!firstSection) return;

  const preventTransparentHeader = firstSection.querySelector(`${selectors.preventTransparentHeader}:first-of-type`);
  window.isHeaderTransparent = headerTransparent && firstSection.classList.contains(classes.supportsTransparentHeader) && !preventTransparentHeader;

  const supportsHasSelector = CSS.supports('(selector(:has(*)))');
  if (!supportsHasSelector) {
    body.classList.toggle(classes.isFirstSectionTransparent, window.isHeaderTransparent);
    header.classList.toggle(classes.siteHeaderTransparent, window.isHeaderTransparent);
  }
};

export default initTransparentHeader;
