class ProductMediaZoom extends ModalDialog {
  constructor() {
    super();

    this.slideshowParent = this.querySelector('slideshow-swiper');

    if (!this.slideshowParent) return;

    this.slideshow = this.slideshowParent.querySelector('.swiper');

    this.addEventListener('ModalDialogOpen',  (evt) => {
      const opener = evt.detail.opener;
      const mediaIdNavigable = opener.getAttribute('data-target-media-id');
      const slides = this.slideshowParent.querySelectorAll(`[data-media-id]`);
      const currentSlide = this.slideshowParent.querySelector(`[data-media-id="${mediaIdNavigable}"]`);
      const slideIndex = Array.from(slides).indexOf(currentSlide);

      this.slideshow.swiper.slideTo(slideIndex, 1000);
    });
  }
}
customElements.define('product-media-zoom', ProductMediaZoom);
