class ProductMonogram extends HTMLElement {
  constructor() {
    super();
    this.form = this.closest('form')
    if (!this.form) return

    this.sectionId = this.form.dataset.sectionId;
    this.section = document.querySelector(`#shopify-section-${this.sectionId}`);
    this.patchOptions = this.querySelector('.product-form__options--patch')
    this.patchName = this.querySelector('[data-patch-name]')

    if (!this.patchOptions) return;
    this.setPatch();
    this.patchOptions.addEventListener('change', ()=> this.setPatch())
  }

  setPatch() {
    const selectedPatch = this.patchOptions.querySelector('input:checked')
    const featuredImageWrapper = this.section.querySelector('.product__media-list .product__media-item');
    const zoomImageWrapper = this.section.querySelector('product-media-zoom .product__media-item');
    const customImage = this.section.querySelectorAll('.product-custom-image');
    if (customImage.length) customImage.forEach(image => image.remove());
    const src = selectedPatch.value;
    const imageWrapper = `<div class="product-custom-image">
                            <div class="product-custom-image-wrapper rel">
                              <img src="${src}" class="image-abs-contain" alt="Custom logo">
                            </div>
                          </div>`
    featuredImageWrapper.insertAdjacentHTML('beforeend', imageWrapper);
    zoomImageWrapper.insertAdjacentHTML('beforeend', imageWrapper);

    if (this.patchName) this.patchName.value = selectedPatch.dataset.patch;
  }
}
customElements.define('product-monogram', ProductMonogram);
