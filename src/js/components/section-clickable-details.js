if (!customElements.get('clickable-details')) {
  customElements.define(
    'clickable-details',
    class CarClickableDetails extends HTMLElement {
      constructor() {
        super();
        this.currentSelectedButton = this.querySelector('.hotspot__button.is-selected');
        this.currentSelectedTarget = this.querySelector('.hotspot__content-mobile.is-selected');
      }

      connectedCallback() {
        this.initHotspotButtons();
      }

      initHotspotButtons() {
        this.querySelectorAll('.hotspot__button')?.forEach((button) => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleHotspotClick(button);
          });
        });
      }

      handleHotspotClick(clickedButton) {
        // Remove previous selections
        this.clearPreviousSelections();

        // Get the target ID from data-target attribute
        const targetId = clickedButton.getAttribute('data-target');
        if (!targetId) return;

        // Find the target element
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        // Add is-selected class to both button and target
        clickedButton.classList.add('is-selected');
        targetElement.classList.add('is-selected');

        // Store current selections
        this.currentSelectedButton = clickedButton;
        this.currentSelectedTarget = targetElement;
      }

      clearPreviousSelections() {
        // Remove is-selected class from previously selected elements
        if (this.currentSelectedButton) {
          this.currentSelectedButton.classList.remove('is-selected');
        }
        if (this.currentSelectedTarget) {
          this.currentSelectedTarget.classList.remove('is-selected');
        }

        // Clear stored references
        this.currentSelectedButton = null;
        this.currentSelectedTarget = null;
      }
    }
  );
}
