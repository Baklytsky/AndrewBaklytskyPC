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
