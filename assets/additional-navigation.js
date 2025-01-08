class AdditionalNavigation extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.navigation = document.querySelector('.additional-navigation__section');
    this.navigationBounds = {};
    this.currentScrollTop = 0;
    this.positionBottom = this.navigation.getBoundingClientRect().bottom + 50;
    this.preventReveal = false;
    this.onScroll.bind(this);
    window.addEventListener('DOMContentLoaded', () => {
      this.setSectionHeight()
    });

    window.addEventListener('resize', () => {
      requestAnimationFrame(this.reset.bind(this));
      this.setSectionHeight()
    });

    if (window.innerWidth < 990) requestAnimationFrame(this.reset.bind(this));

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
      this.navigationBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.navigation);
  }

  setSectionHeight() {
    const sectionHeight = this.offsetHeight;
    document.documentElement.style.setProperty('--additional-navigation-height', sectionHeight + 'px');
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.currentScrollTop && scrollTop > (this.navigationBounds.bottom + 50)) {
      requestAnimationFrame(this.show.bind(this));
    }  else if (scrollTop < this.currentScrollTop && scrollTop > (this.navigationBounds.bottom + 50) && scrollTop > this.positionBottom) {
      if (!this.preventReveal) {
        requestAnimationFrame(this.hide.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.show.bind(this));
      }
    } else if (scrollTop <= (this.navigationBounds.bottom + 50) || scrollTop <= this.positionBottom) {
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  show() {
    this.navigation.classList.add('additional-navigation__show');
    this.navigation.classList.remove('additional-navigation__hide');
  }

  hide() {
    this.navigation.classList.add('additional-navigation__hide');
    this.navigation.classList.remove('additional-navigation__show');
  }

  reset() {
    this.navigation.classList.remove('additional-navigation__hide');
    this.navigation.classList.remove('additional-navigation__show-mobile')
  }
}

customElements.define('additional-navigation', AdditionalNavigation);