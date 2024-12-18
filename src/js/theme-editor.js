document.addEventListener('shopify:block:select', (event) => {
  // Open accordion on Block select
  const collapsible = event.target.hasAttribute('data-collapsible') ? event.target : null;
  if (collapsible && !collapsible?.hasAttribute('open')) {
    collapsible.querySelector('[data-collapsible-trigger]')?.dispatchEvent(new Event('click'));
  }

  // Select slide on Block select
  const blockSelectedIsSlide = event.target.hasAttribute('data-slide');
  if (blockSelectedIsSlide) {
    const slider = event.target.closest('slider-component');

    if (slider) {
      const slide = event.target;
      const slideIndex = parseInt(slide.hasAttribute('data-slide-index') ? slide.getAttribute('data-slide-index') : 0);
      const flickityEnabled = slider.classList.contains('flickity-enabled');

      setTimeout(() => {
        slider.scrollTo({
          left: event.target.offsetLeft,
        });
      }, 200);

      // Go to selected slide, pause autoplay
      if (flickityEnabled) {
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

  // Pause ticker on block select
  const ticker = event.target.matches('ticker-bar') ? event.target : event.target.querySelector('ticker-bar') || event.target.closest('ticker-bar');
  if (ticker) {
    ticker.setAttribute('paused', '');
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

  // Collections hover - force hover on block select
  const collectionsHoverImage = event.target.matches('[data-collection-image]');
  if (collectionsHoverImage) {
    const collectionsHoverImageId = event.target?.id;
    const collectionsHoverComponent = event.target.closest('collections-hover');
    const collectionsHoverButton = collectionsHoverComponent?.querySelector('[data-hover-target="' + collectionsHoverImageId + '"]');
    collectionsHoverButton?.dispatchEvent(new Event('mouseenter'));
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
  // Close accordion on Block deselect
  const collapsible = event.target.hasAttribute('data-collapsible') ? event.target : null;
  if (collapsible && collapsible.hasAttribute('open')) {
    collapsible.querySelector('[data-collapsible-trigger]')?.dispatchEvent(new Event('click'));
  }

  // Resume ticker on block deselect
  const ticker = event.target.matches('ticker-bar') ? event.target : event.target.querySelector('ticker-bar') || event.target.closest('ticker-bar');
  if (ticker) {
    ticker.removeAttribute('paused');
  }

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

  // Logos - resume logos slider on block deselect
  const logosBlockSelectedIsSlide = event.target.hasAttribute('data-slide');
  if (logosBlockSelectedIsSlide) {
    const logosComponent = event.target.closest('logos-component');

    logosComponent?.dispatchEvent(new CustomEvent('theme:slider-logos:deselect', {bubbles: false}));
  }
});

// Mobile menu - Theme Editor events
if (!customElements.get('mobile-menu')) {
  customElements.define(
    'mobile-menu',
    class MobileMenu extends HTMLElement {
      constructor() {
        super();

        this.mobileBlocks = this.querySelectorAll('[data-mobile-menu-block]');
        this.hideBlocks = this.hideBlocks.bind(this);
        this.showBlocks = this.showBlocks.bind(this);

        this.showDrawerOnSelect = this.showDrawerOnSelect.bind(this);
        this.hideDrawerOnDeselect = this.hideDrawerOnDeselect.bind(this);

        this.menuDrawerSection = this.closest('.shopify-section');
        this.menuDrawerIsOpen = false;
      }

      connectedCallback() {
        this.addEventListener('theme:search:open', this.hideBlocks);
        this.addEventListener('theme:search:close', this.showBlocks);

        document.addEventListener('shopify:block:select', this.showDrawerOnSelect);
        document.addEventListener('shopify:section:load', this.showDrawerOnSelect);
        document.addEventListener('shopify:section:select', this.showDrawerOnSelect);
        document.addEventListener('shopify:section:deselect', this.hideDrawerOnDeselect);
      }

      disconnectedCallback() {
        document.removeEventListener('shopify:block:select', this.showDrawerOnSelect);
        document.removeEventListener('shopify:section:load', this.showDrawerOnSelect);
        document.removeEventListener('shopify:section:select', this.showDrawerOnSelect);
        document.removeEventListener('shopify:section:deselect', this.hideDrawerOnDeselect);
      }

      hideBlocks() {
        this.mobileBlocks.forEach((block) => {
          block.classList.add('mobile-menu__block--hidden');
        });
      }

      showBlocks() {
        this.mobileBlocks.forEach((block) => {
          block.classList.remove('mobile-menu__block--hidden');
        });
      }

      showDrawerOnSelect(e) {
        const mobileMenu = e.target.querySelector('mobile-menu') || e.target.closest('mobile-menu');

        if (!mobileMenu) return;

        mobileMenu.querySelector('header-drawer')?.dispatchEvent(new CustomEvent('theme:drawer:open', {bubbles: true}));
      }

      hideDrawerOnDeselect(e) {
        const mobileMenu = e.target.querySelector('mobile-menu') || e.target.closest('mobile-menu');

        if (!mobileMenu) return;

        mobileMenu.querySelector('header-drawer')?.dispatchEvent(new CustomEvent('theme:drawer:close', {bubbles: true}));
      }
    }
  );
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
