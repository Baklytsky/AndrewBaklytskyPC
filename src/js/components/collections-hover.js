const selectors = {
  button: '[data-hover-target]',
  image: '[data-collection-image]',
};

const attributes = {
  target: 'data-hover-target',
};

const classes = {
  visible: 'is-visible',
  selected: 'is-selected',
};

if (!customElements.get('collections-hover')) {
  customElements.define(
    'collections-hover',
    class CollectionsHover extends HTMLElement {
      constructor() {
        super();

        this.buttons = this.querySelectorAll(selectors.button);
        this.bindEditorMouseenter = this.bindEditorMouseenter.bind(this);
      }

      connectedCallback() {
        this.buttons?.forEach((button) => {
          button.addEventListener('mouseenter', (e) => {
            const targetId = e.currentTarget.getAttribute(attributes.target);

            this.updateState(targetId);
          });
        });

        if (Shopify.designMode) {
          this.addEventListener('shopify:block:select', this.bindEditorMouseenter);
        }
      }

      bindEditorMouseenter(event) {
        // Emit mouseenter event on Block select
        const target = event.target.matches(selectors.image);
        if (!target) return;

        const targetId = event.target?.id;
        const parentComponent = event.target.closest('collections-hover');
        const button = parentComponent?.querySelector(`[${attributes.target}="${targetId}"]`);
        button?.dispatchEvent(new Event('mouseenter'));
      }

      updateState(targetId) {
        const button = this.querySelector(`[${attributes.target}="${targetId}"]`);
        const target = this.querySelector(`#${targetId}:not(.${classes.visible})`);
        const buttonSelected = this.querySelector(`${selectors.button}.${classes.selected}`);
        const imageVisible = this.querySelector(`${selectors.image}.${classes.visible}`);

        if (target && !window.theme.isMobile()) {
          imageVisible?.classList.remove(classes.visible);
          buttonSelected?.classList.remove(classes.selected);

          target.classList.add(classes.visible);
          button.classList.add(classes.selected);
        }
      }
    }
  );
}
