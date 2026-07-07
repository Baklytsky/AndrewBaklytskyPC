if (!customElements.get('collapsible-elements')) {
  customElements.define(
    'collapsible-elements',
    class CollapsibleElements extends HTMLElement {
      constructor() {
        super();

        this.collapsibles = this.querySelectorAll('[data-collapsible]');
        this.single = this.hasAttribute('single');
        this.toggle = this.toggle.bind(this);
        this.siblings = [...this.parentElement.children].filter((el) => el !== this && el.matches('[data-collapsible-element]')).flatMap((el) => [...el.querySelectorAll('[data-collapsible]')]);
      }

      connectedCallback() {
        this.toggle();
        document.addEventListener('theme:resize:width', this.toggle);

        this.collapsibles.forEach((collapsible) => {
          const trigger = collapsible.querySelector('[data-collapsible-trigger]');
          const body = collapsible.querySelector('[data-collapsible-body]');

          trigger?.addEventListener('click', (event) => this.onCollapsibleClick(event));

          body?.addEventListener('transitionend', (event) => {
            if (event.target !== body) return;

            if (collapsible.getAttribute('open') == 'true') {
              this.setBodyHeight(body, 'auto');
            }

            if (collapsible.getAttribute('open') == 'false') {
              collapsible.removeAttribute('open');
              this.setBodyHeight(body, '');
            }
          });
        });
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.toggle);
      }

      toggle() {
        const isDesktopView = !theme.isMobile;

        this.collapsibles.forEach((collapsible) => {
          if (!collapsible.hasAttribute('desktop') && !collapsible.hasAttribute('mobile')) return;

          const enableDesktop = collapsible.hasAttribute('desktop') ? collapsible.getAttribute('desktop') : 'true';
          const enableMobile = collapsible.hasAttribute('mobile') ? collapsible.getAttribute('mobile') : 'true';
          const isEligible = (isDesktopView && enableDesktop == 'true') || (!isDesktopView && enableMobile == 'true');
          const body = collapsible.querySelector('[data-collapsible-body]');

          if (isEligible) {
            collapsible.removeAttribute('disabled');
            collapsible.querySelector('[data-collapsible-trigger]').removeAttribute('tabindex');
            collapsible.removeAttribute('open');

            this.setBodyHeight(body, '');
          } else {
            collapsible.setAttribute('disabled', '');
            collapsible.setAttribute('open', true);
            collapsible.querySelector('[data-collapsible-trigger]').setAttribute('tabindex', -1);
          }
        });
      }

      open(collapsible) {
        if (collapsible.getAttribute('open') == 'true') return;

        const body = collapsible.querySelector('[data-collapsible-body]');
        const content = collapsible.querySelector('[data-collapsible-content]');

        collapsible.setAttribute('open', true);

        this.setBodyHeight(body, content.offsetHeight);
      }

      close(collapsible) {
        if (!collapsible.hasAttribute('open')) return;

        const body = collapsible.querySelector('[data-collapsible-body]');
        const content = collapsible.querySelector('[data-collapsible-content]');

        this.setBodyHeight(body, content.offsetHeight);

        collapsible.setAttribute('open', false);

        setTimeout(() => {
          requestAnimationFrame(() => {
            this.setBodyHeight(body, 0);
          });
        });
      }

      setBodyHeight(body, contentHeight) {
        body.style.height = contentHeight !== 'auto' && contentHeight !== '' ? `${contentHeight}px` : contentHeight;
      }

      onCollapsibleClick(event) {
        event.preventDefault();

        const trigger = event.target;
        const collapsible = trigger.closest('[data-collapsible]');

        // When we want only one item expanded at the same time
        if (this.single) {
          const collapsibles = this.siblings.length ? this.siblings : this.collapsibles;

          collapsibles.forEach((otherCollapsible) => {
            // if otherCollapsible has attribute open and it's not the one we clicked on, remove the open attribute
            if (otherCollapsible.hasAttribute('open') && otherCollapsible != collapsible) {
              requestAnimationFrame(() => {
                this.close(otherCollapsible);
              });
            }
          });
        }

        if (collapsible.hasAttribute('open')) {
          this.close(collapsible);
        } else {
          this.open(collapsible);
        }

        collapsible.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'accordion',
            },
          })
        );
        collapsible.dispatchEvent(
          new CustomEvent('theme:collapsible:toggle', {
            bubbles: true,
          })
        );
      }
    }
  );
}
