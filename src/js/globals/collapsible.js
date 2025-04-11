const selectors = {
  collapsible: '[data-collapsible]',
  trigger: '[data-collapsible-trigger]',
  body: '[data-collapsible-body]',
  content: '[data-collapsible-content]',
  shopifySection: '.shopify-section',
  cartBlock: '.cart-block',
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
    this.bindEditorOpen = this.bindEditorOpen.bind(this);
    this.bindEditorClose = this.bindEditorClose.bind(this);
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

    if (Shopify.designMode) {
      const section = this.closest(selectors.shopifySection);
      section.addEventListener('shopify:section:deselect', this.bindEditorClose);

      this.collapsibles.forEach((element) => {
        const cartBlock = element.closest(selectors.cartBlock);
        const collapsible = cartBlock ? cartBlock : element;

        collapsible.addEventListener('shopify:block:select', this.bindEditorOpen);
        collapsible.addEventListener('shopify:block:deselect', this.bindEditorClose);
      });
    }
  }

  disconnectedCallback() {
    document.removeEventListener('theme:resize:width', this.toggle);
  }

  bindEditorOpen(event) {
    // Open accordions on Block select
    const target = event.target;
    const targetCollapsible = target.matches(selectors.collapsible) ? target : null;
    const parentCollapsible = target.closest(selectors.collapsible);
    const nestedCollapsible = target.querySelector(`:scope > ${selectors.collapsible}`);
    const collapsible = nestedCollapsible || targetCollapsible || parentCollapsible;

    if (collapsible && !collapsible.hasAttribute(attributes.open)) {
      const isEligible = !collapsible.hasAttribute(attributes.disabled);
      if (!isEligible) return;
      const trigger = collapsible.querySelector(selectors.trigger);
      trigger?.dispatchEvent(new Event('click'));
    }
  }

  bindEditorClose(event) {
    // Close accordions on Block/Section deselect
    const target = event.target;
    const collapsibleSection = target.matches(selectors.shopifySection) ? target : null;
    const targetCollapsible = target.matches(selectors.collapsible) ? target : null;
    const nestedCollapsible = target.querySelector(`:scope > ${selectors.collapsible}`);
    // exclude parent collapsible elements for "Accordion" section
    let collapsible = nestedCollapsible || targetCollapsible;
    if (collapsibleSection) {
      collapsible = collapsibleSection.querySelector(selectors.collapsible);
    }

    if (collapsible && collapsible.hasAttribute(attributes.open)) {
      const isEligible = !collapsible.hasAttribute(attributes.disabled);
      if (!isEligible) return;
      const trigger = collapsible.querySelector(selectors.trigger);
      trigger?.dispatchEvent(new Event('click'));
    }
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
