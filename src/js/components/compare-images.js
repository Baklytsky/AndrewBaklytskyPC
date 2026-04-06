if (!customElements.get('compare-images')) {
  customElements.define(
    'compare-images',
    class CompareImages extends HTMLElement {
      connectedCallback() {
        this.imageHolder = this.querySelector('[data-image-holder]');
        this.imageElement = this.querySelector('[data-image-element]');
        this.rangeButton = this.querySelector('[data-range-button]');
        this.rangeInput = this.querySelector('[data-range-input]');

        if (!this.imageHolder || !this.imageElement || !this.rangeButton || !this.rangeInput) return;

        this.inputHandler = () => this.setImagePosition();
        this.rangeInput.addEventListener('input', this.inputHandler);

        this.resizeObserver = new ResizeObserver(() => this.setOverlapImageSize());
        this.resizeObserver.observe(this);
      }

      disconnectedCallback() {
        if (this.resizeObserver) {
          this.resizeObserver.disconnect();
        }

        if (this.rangeInput && this.inputHandler) {
          this.rangeInput.removeEventListener('input', this.inputHandler);
        }
      }

      setImagePosition() {
        if (!this.imageElement || !this.rangeButton || !this.imageHolder) return;

        const value = this.rangeInput.value;
        const imageWidth = this.imageElement.offsetWidth;
        const buttonWidth = this.rangeButton.offsetWidth;

        this.rangeButton.style.left = `${value}%`;
        this.imageHolder.style.width = `${((imageWidth - buttonWidth) * (100 - value)) / 100 + buttonWidth / 2}px`;
      }

      setOverlapImageSize() {
        if (!this.imageElement) return;

        const containerWidth = this.offsetWidth;
        if (containerWidth === 0) return;

        this.imageElement.style.width = `${containerWidth}px`;
        this.setImagePosition();
      }
    }
  );
}
