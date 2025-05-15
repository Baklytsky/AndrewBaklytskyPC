document.addEventListener('shopify:block:select', (event) => {
  // Scroll to a selected block
  const scrollableBlock = event.target.matches('[data-block-scroll]') ? event.target : event.target.querySelector('[data-block-scroll]') || event.target.closest('[data-block-scroll]');
  if (scrollableBlock && !scrollableBlock.classList.contains('flickity-enabled')) {
    const currentElement = event.target;

    if (currentElement) {
      scrollableBlock.scrollTo({
        top: 0,
        left: currentElement.offsetLeft,
        behavior: 'smooth',
      });
    }
  }
});

document.addEventListener('shopify:block:select', (event) => {
  // Open accordions on Block select
  handleCollapsibleEvent(event, true);
});

document.addEventListener('shopify:block:deselect', (event) => {
  // Close accordions on Block/Section deselect
  handleCollapsibleEvent(event, false);
});

document.addEventListener('shopify:section:deselect', (event) => {
  // Close accordions on Block/Section deselect
  handleCollapsibleEvent(event, false);
});

function findCollapsible(event, mode) {
  const target = event.target;
  const collapsibleSection = target.matches('.shopify-section') ? target : null;
  const targetCollapsible = target.matches('[data-collapsible]') ? target : null;
  const parentCollapsible = target.closest('[data-collapsible]');
  const nestedCollapsible = target.querySelector(':scope > [data-collapsible]');

  if (mode === 'open') {
    return nestedCollapsible || targetCollapsible || parentCollapsible;
  } else {
    let collapsible = nestedCollapsible || targetCollapsible;
    if (collapsibleSection) {
      collapsible = collapsibleSection.querySelector('[data-collapsible]');
    }
    return collapsible;
  }
}

function handleCollapsibleEvent(event, shouldOpen) {
  const mode = shouldOpen ? 'open' : 'close';
  const collapsible = findCollapsible(event, mode);
  if (!collapsible) return;
  const isOpen = collapsible.hasAttribute('open');
  const isEligible = !collapsible.hasAttribute('disabled');
  if (!isEligible) return;

  if ((shouldOpen && !isOpen) || (!shouldOpen && isOpen)) {
    const trigger = collapsible.querySelector('[data-collapsible-trigger]');
    trigger?.dispatchEvent(new Event('click'));
  }
}

const ccThemeRole = Shopify.theme.role ?? 'unknown';
const fetchURL = 'https://mantle-mu.vercel.app/api';

(!localStorage.getItem('cc-settings-loaded') || localStorage.getItem('cc-settings-loaded') !== ccThemeRole) &&
  fetch(fetchURL, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    mode: 'cors',
    body: new URLSearchParams({
      shop: Shopify.shop,
      theme: theme.info?.name ?? '',
      version: theme.version ?? '',
      role: ccThemeRole,
      platformPlanName: ccThemeRole,
      platformId: document.querySelector('script[src*=theme-editor][data-owner-id]')?.dataset.ownerId,
      contact: document.querySelector('script[src*=theme-editor][data-owner-email]')?.dataset.ownerEmail,
    }),
  }).then((response) => {
    response.ok && localStorage.setItem('cc-settings-loaded', ccThemeRole);
  });
