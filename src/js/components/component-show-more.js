/* important - use next css for data-show-more-opener
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
*/

if (!customElements.get('show-more')) {
  class ShowMore extends HTMLElement {
    constructor() {
      super();

      this.controls = this.querySelectorAll('[data-show-more-heading]');
      this.connectedAccodrions = document.querySelectorAll(`[data-connected-target="${this.dataset.connectedTarget}"]`);
      this.body = this.querySelector('[data-show-more-body]');
      this.event = new Event("expanded", {"bubbles":false, "cancelable":true});
      this.init();
    }

    init() {
      let currentWidth = window.innerWidth;
      if (!this.controls.length) return false;

      // window.addEventListener("resize", () => {
      //   if (this.getAttribute('aria-expanded') === 'true') {
      //     if (window.innerWidth >= 990) return;
      //     if (window.innerWidth !== currentWidth) {
      //       this.setAttribute("aria-expanded", "false");
      //       this.slideUp(this.querySelector('[data-show-more-opener]'));
      //     }
      //   }
      //
      //   currentWidth = window.innerWidth;
      // });

      this.controls.forEach(item => item.addEventListener('click', (e) => {
        e.preventDefault();
        this.connectedAccodrions.forEach((element) => {
          const panel = element.querySelector('[data-show-more-opener]');

          if (element.contains(item.parentNode)) {
            if ( this.getAttribute('aria-expanded') === 'true') {
              element.setAttribute("aria-expanded", "true");
              element.slideToggle(panel);
            } else {
              element.setAttribute("aria-expanded", "false");
              element.slideToggle(panel);
            }
          } else {
            element.setAttribute("aria-expanded", "false");
            element.slideToggle(panel);
          }
        })
      }));
    }

    scrollToTop (panel) {
      if (this.classList.contains('show-more-safety')) {
        window.scrollTo({
            top: panel.offsetTop - 300,
            left: 0,
            behavior: 'smooth'
          });

        }
      }

    slideUp(panel) {
      if (panel.style.maxHeight) {
        if( this.hasAttribute('data-inline')) {
          panel.style.display = 'block';
        }

        panel.style.maxHeight = null;

        this.setAttribute('aria-expanded', 'false');

        panel.addEventListener('transitionend', () => {
          this.scrollToTop(panel);
        }, {once: true});

        this.controls.forEach((element) => {
          element.setAttribute('aria-expanded', 'false');
        })
      }
    }

    slideDown(panel) {
      panel.style.maxHeight = panel.scrollHeight + "px";
      this.setAttribute('aria-expanded', 'true');

      this.controls.forEach((element) => {
        element.setAttribute('aria-expanded', 'true');
      })

      if( this.hasAttribute('data-inline')) {
        setTimeout(() =>(panel.style.display = 'inline'), 200);
      }
    }

    slideToggle(panel) {
      if (panel.style.maxHeight) {
        this.slideUp(panel)
      } else {
        this.slideDown(panel)
      }

      document.dispatchEvent(this.event);
    }
  }

  customElements.define('show-more', ShowMore);
}
