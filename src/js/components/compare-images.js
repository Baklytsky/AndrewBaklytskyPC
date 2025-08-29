if (!customElements.get('compare-images')) {
  customElements.define(
    'compare-images',
    class CompareImages extends HTMLElement {
      constructor() {
        super();

        this.imageHolder = this.querySelector('[data-image-holder]');
        this.imageElement = this.querySelector('[data-image-element]');
        this.rangeButton = this.querySelector('[data-range-button]');
        this.rangeInput = this.querySelector('[data-range-input]');
        this.setOverlapImageSize = this.setOverlapImageSize.bind(this);
      }

      connectedCallback() {
        this.setOverlapImageSize();
        this.setImagePosition();
        this.rangeInput.addEventListener('input', () => this.setImagePosition());

        document.addEventListener('theme:resize', this.setOverlapImageSize);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize', this.setOverlapImageSize);
      }

      setImagePosition() {
        const value = this.rangeInput.value;
        const imageWidth = this.imageElement.offsetWidth;
        const buttonWidth = this.rangeButton.offsetWidth;

        this.rangeButton.style.left = `${value}%`;
        this.imageHolder.style.width = `${((imageWidth - buttonWidth) * (100 - value)) / 100 + buttonWidth / 2}px`;
      }

      setOverlapImageSize() {
        const containerWidth = this.offsetWidth;
        this.imageElement.style.width = `${containerWidth}px`;
        this.setImagePosition();
      }
    }
  );
}
