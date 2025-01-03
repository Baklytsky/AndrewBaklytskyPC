const selectors = {
  collapsible: '[data-collapsible]',
  trigger: '[data-collapsible-trigger]',
  body: '[data-collapsible-body]',
  content: '[data-collapsible-content]',
};

const attributes = {
  desktop: 'desktop',
  disabled: 'disabled',
  mobile: 'mobile',
  open: 'open',
  single: 'single',
};

class CollapsibleElements extends HTMLElement {
  constructor() {
    super();

    this.collapsibles = this.querySelectorAll(selectors.collapsible);
    this.single = this.hasAttribute(attributes.single);
    this.toggle = this.toggle.bind(this);
  }

  connectedCallback() {
    this.toggle();
    document.addEventListener('theme:resize:width', this.toggle);

    this.collapsibles.forEach((collapsible) => {
      const trigger = collapsible.querySelector(selectors.trigger);
      const body = collapsible.querySelector(selectors.body);

      trigger?.addEventListener('click', (event) => this.onCollapsibleClick(event));

      body?.addEventListener('transitionend', (event) => {
        if (event.target !== body) return;

        if (collapsible.getAttribute(attributes.open) == 'true') {
          this.setBodyHeight(body, 'auto');
        }

        if (collapsible.getAttribute(attributes.open) == 'false') {
          collapsible.removeAttribute(attributes.open);
          this.setBodyHeight(body, '');
        }
      });
    });
  }

  disconnectedCallback() {
    document.removeEventListener('theme:resize:width', this.toggle);
  }

  toggle() {
    const isDesktopView = !window.theme.isMobile();

    this.collapsibles.forEach((collapsible) => {
      if (!collapsible.hasAttribute(attributes.desktop) && !collapsible.hasAttribute(attributes.mobile)) return;

      const enableDesktop = collapsible.hasAttribute(attributes.desktop) ? collapsible.getAttribute(attributes.desktop) : 'true';
      const enableMobile = collapsible.hasAttribute(attributes.mobile) ? collapsible.getAttribute(attributes.mobile) : 'true';
      const isEligible = (isDesktopView && enableDesktop == 'true') || (!isDesktopView && enableMobile == 'true');
      const body = collapsible.querySelector(selectors.body);

      if (isEligible) {
        collapsible.removeAttribute(attributes.disabled);
        collapsible.querySelector(selectors.trigger).removeAttribute('tabindex');
        collapsible.removeAttribute(attributes.open);

        this.setBodyHeight(body, '');
      } else {
        collapsible.setAttribute(attributes.disabled, '');
        collapsible.setAttribute('open', true);
        collapsible.querySelector(selectors.trigger).setAttribute('tabindex', -1);
      }
    });
  }

  open(collapsible) {
    if (collapsible.getAttribute('open') == 'true') return;

    const body = collapsible.querySelector(selectors.body);
    const content = collapsible.querySelector(selectors.content);

    collapsible.setAttribute('open', true);

    this.setBodyHeight(body, content.offsetHeight);
  }

  close(collapsible) {
    if (!collapsible.hasAttribute('open')) return;

    const body = collapsible.querySelector(selectors.body);
    const content = collapsible.querySelector(selectors.content);

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
    const collapsible = trigger.closest(selectors.collapsible);

    // When we want only one item expanded at the same time
    if (this.single) {
      this.collapsibles.forEach((otherCollapsible) => {
        // if otherCollapsible has attribute open and it's not the one we clicked on, remove the open attribute
        if (otherCollapsible.hasAttribute(attributes.open) && otherCollapsible != collapsible) {
          requestAnimationFrame(() => {
            this.close(otherCollapsible);
          });
        }
      });
    }

    if (collapsible.hasAttribute(attributes.open)) {
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

if (!customElements.get('collapsible-elements')) {
  customElements.define('collapsible-elements', CollapsibleElements);
}
