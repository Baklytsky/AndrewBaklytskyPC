class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector('.header-section');
    this.announcementBar = document.getElementById('shopify-section-announcement-bar');
    this.headerBounds = {};
    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = this.querySelector('#search-modal-drawer .search-modal');
    this.mobileDrawer = this.querySelector('#mobile-menu-drawer .drawer');
    this.eventNavLinks = this.querySelectorAll('[data-event-nav-link]');

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => this.preventReveal = true;

    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.addEventListener('scroll', this.onScrollHandler, false);

    this.createObserver();
  }

  disconnectedCallback() {
    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.removeEventListener('scroll', this.onScrollHandler);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const predictiveSearchIsOpen = this.predictiveSearch?.getAttribute('aria-hidden') === 'false';
    const mobileDrawerIsOpen = this.mobileDrawer?.getAttribute('aria-hidden') === 'false';

    if (mobileDrawerIsOpen || predictiveSearchIsOpen) return;

    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      requestAnimationFrame(this.hide.bind(this));
    } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      requestAnimationFrame(this.reset.bind(this));
    }


    this.currentScrollTop = scrollTop;
  }

  hide() {
    this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
    this.closeMenuDisclosure();
    // this.closeSearchModal();
  }

  reveal() {
    this.header.classList.add('shopify-section-header-sticky', 'animate');
    this.header.classList.remove('shopify-section-header-hidden');
    if (this.announcementBar) document.documentElement.style.setProperty('--announcement-bar-height', '0px');
  }

  reset() {
    this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
    if (this.announcementBar) document.documentElement.style.setProperty('--announcement-bar-height', this.announcementBar.offsetHeight + 'px');
  }

  closeMenuDisclosure() {
    this.disclosures = this.disclosures || this.header.querySelectorAll('details-disclosure');
    this.disclosures.forEach(disclosure => disclosure.close());
  }

  closeSearchModal() {
    this.searchModal = this.searchModal || this.header.querySelector('details-modal');
    this.searchModal.close(false);
  }
}

customElements.define('sticky-header', StickyHeader);


class MegaMenu extends HTMLElement {
  constructor() {
    super();
    this.opener = this.querySelector('[data-menu-opener]');
    this.header = document.querySelector('.header-section');
    this.overlay = this.header.querySelector('.header-overlay');
    this.search = document.querySelector('predictive-search')

    const menuTargetId = this.opener?.getAttribute('aria-controls');
    this.megaMenu = this.querySelector(`#${menuTargetId}`);

    this.addEventListener('mouseover', this.open.bind(this));
    this.addEventListener('mouseleave', this.close.bind(this));
  }

  isOpen() {
    return this.opener.getAttribute('aria-expanded') === 'true';
  }

  open() {
    this.header.classList.add('menu-opened');
    if (this.isOpen() || !this.megaMenu) return

    let announcementHeight = 0;
    if (document.getElementById('shopify-section-announcement-bar')) {
      announcementHeight = document.getElementById('shopify-section-announcement-bar').offsetHeight;
    }

    if (window.scrollY < this.header.offsetHeight + announcementHeight) {
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
    }

    this.opener.setAttribute('aria-expanded', 'true');
    this.search?.closeModal();
    this.megaMenu.setAttribute('aria-hidden', 'false');
    this.overlay.setAttribute('aria-hidden', 'false');

    bodyScrollLock.disableBodyScroll(this.megaMenu);
  }

  close() {
    this.header.classList.remove('menu-opened');
    if (!this.isOpen() || !this.megaMenu) return

    this.megaMenu.setAttribute('aria-hidden', 'true');
    this.opener.setAttribute('aria-expanded', 'false');
    this.overlay.setAttribute('aria-hidden', 'true');

    bodyScrollLock.clearAllBodyScrollLocks();
  }
}

customElements.define('mega-menu', MegaMenu);
