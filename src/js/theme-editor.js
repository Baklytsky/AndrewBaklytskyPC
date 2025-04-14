document.addEventListener('shopify:block:select', (event) => {
  // Select slide on Block select
  const blockSelectedIsSlide = event.target.closest('slider-component') && (event.target.hasAttribute('data-slide') || event.target.closest('[data-slide]'));
  if (blockSelectedIsSlide) {
    const slider = event.target.closest('slider-component');

    if (slider) {
      const flickityEnabled = slider.classList.contains('flickity-enabled');

      // Go to selected slide, pause autoplay
      if (flickityEnabled) {
        const slide = event.target.hasAttribute('data-slide') ? event.target : event.target.closest('[data-slide]');
        const slideIndex = parseInt(Array.from(slider.querySelector('.flickity-slider')?.children).indexOf(slide));

        slide.classList.add('is-selected');
        slider.dispatchEvent(
          new CustomEvent('theme:slider:select', {
            bubbles: false,
            detail: {
              index: slideIndex,
            },
          })
        );
      }
    }
  }

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

  // Show mega menu on block select
  const hoverDisclosure = event.target.closest('hover-disclosure');
  if (hoverDisclosure) {
    hoverDisclosure.dispatchEvent(new CustomEvent('theme:disclosure:show', {bubbles: false}));
  }

  // Show tab content on block select
  const tabs = event.target.closest('tabs-component');
  if (tabs) {
    const tab = event.target;

    if (tab.hasAttribute('data-tab')) {
      tab.dispatchEvent(new Event('click'));
    }

    tab.parentNode.scrollTo({
      top: 0,
      left: tab.offsetLeft - tab.clientWidth,
      behavior: 'smooth',
    });
  }

  // Logos - select logos slide on block select
  const logosBlockSelectedIsSlide = event.target.hasAttribute('data-slide');
  if (logosBlockSelectedIsSlide) {
    const logosComponent = event.target.closest('logos-component');

    // Go to selected slide, pause autoplay
    logosComponent?.dispatchEvent(
      new CustomEvent('theme:slider-logos:select', {
        bubbles: false,
        detail: {
          evt: event,
        },
      })
    );
  }
});

document.addEventListener('shopify:block:deselect', (event) => {
  // Resume slider on block deselect
  const blockSelectedIsSlide = event.target.hasAttribute('data-slide');
  if (blockSelectedIsSlide) {
    const slide = event.target;
    const slider = event.target.closest('slider-component');
    const flickityEnabled = slider?.classList.contains('flickity-enabled');

    // Go to selected slide, pause autoplay
    if (flickityEnabled) {
      slide.classList.remove('is-selected');
      slider.dispatchEvent(new CustomEvent('theme:slider:deselect', {bubbles: false}));
    }
  }

  // Hide mega menu on block select
  const hoverDisclosure = event.target.closest('hover-disclosure');
  if (hoverDisclosure) {
    hoverDisclosure.dispatchEvent(new CustomEvent('theme:disclosure:hide', {bubbles: false}));
  }

  // Logos - resume logos slider on block deselect
  const logosBlockSelectedIsSlide = event.target.hasAttribute('data-slide');
  if (logosBlockSelectedIsSlide) {
    const logosComponent = event.target.closest('logos-component');

    logosComponent?.dispatchEvent(new CustomEvent('theme:slider-logos:deselect', {bubbles: false}));
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
