const selectors = {
  pageHeader: '.page-header',
};

const classes = {
  stuck: 'js__header__stuck',
  sticky: 'has-header-sticky',
  headerGroup: 'shopify-section-group-header-group',
};

const attributes = {
  stickyHeader: 'data-header-sticky',
  scrollLock: 'data-scroll-locked',
};

let sections = {};

class Sticky {
  constructor(el) {
    this.wrapper = el;
    this.sticks = this.wrapper.hasAttribute(attributes.stickyHeader);

    document.body.classList.toggle(classes.sticky, this.sticks);

    if (!this.sticks) return;

    this.isStuck = false;
    this.cls = this.wrapper.classList;
    this.headerOffset = document.querySelector(selectors.pageHeader)?.offsetTop;
    this.updateHeaderOffset = this.updateHeaderOffset.bind(this);
    this.scrollEvent = (e) => this.onScroll(e);

    this.listen();
    this.stickOnLoad();
  }

  listen() {
    document.addEventListener('theme:scroll', this.scrollEvent);
    document.addEventListener('shopify:section:load', this.updateHeaderOffset);
    document.addEventListener('shopify:section:unload', this.updateHeaderOffset);
  }

  onScroll(e) {
    if (e.detail.down) {
      if (!this.isStuck && e.detail.position > this.headerOffset) {
        this.stickSimple();
      }
    } else if (e.detail.position <= this.headerOffset) {
      this.unstickSimple();
    }
  }

  updateHeaderOffset(event) {
    if (!event.target.classList.contains(classes.headerGroup)) return;

    // Update header offset after any "Header group" section has been changed
    setTimeout(() => {
      this.headerOffset = document.querySelector(selectors.pageHeader)?.offsetTop;
    });
  }

  stickOnLoad() {
    if (window.scrollY > this.headerOffset) {
      this.stickSimple();
    }
  }

  stickSimple() {
    this.cls.add(classes.stuck);
    this.isStuck = true;
  }

  unstickSimple() {
    if (!document.documentElement.hasAttribute(attributes.scrollLock)) {
      // check for scroll lock
      this.cls.remove(classes.stuck);
      this.isStuck = false;
    }
  }

  unload() {
    document.removeEventListener('theme:scroll', this.scrollEvent);
    document.removeEventListener('shopify:section:load', this.updateHeaderOffset);
    document.removeEventListener('shopify:section:unload', this.updateHeaderOffset);
  }
}

const stickyHeader = {
  onLoad() {
    sections = new Sticky(this.container);
  },
  onUnload: function () {
    if (typeof sections.unload === 'function') {
      sections.unload();
    }
  },
};

export default stickyHeader;
