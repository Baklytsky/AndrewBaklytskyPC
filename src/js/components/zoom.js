class ZoomImages extends HTMLElement {
  constructor() {
    super();

    this.container = this.closest('[data-section-id]');
    this.images = this.querySelectorAll('[data-zoom-image]');
    this.thumbsContainer = document.querySelector('.pswp__thumbs');
  }

  connectedCallback() {
    this.images.forEach((image, index) => {
      image.addEventListener('click', (e) => {
        e.preventDefault();

        // Don't open Zoom popup if Swiper is being dragged
        const productImages = image.closest('product-images-swiper') || image.closest('product-images');
        if (productImages) {
          const swiperContainer = productImages.querySelector('swiper-container');
          if (swiperContainer?.swiper?.touching) return;
        }

        this.createZoom(index);

        window.theme.a11y.lastElement = image;
      });

      image.addEventListener('keyup', (e) => {
        // On keypress Enter move the focus to the first focusable element in the related slide
        if (e.code === 'Enter') {
          e.preventDefault();

          this.createZoom(index);

          window.theme.a11y.lastElement = image;
        }
      });
    });
  }

  createZoom(indexImage) {
    const thumbsTemplate = this.container.querySelector('[data-pswp-thumbs-template]');
    const thumbs = thumbsTemplate?.innerHTML;
    let items = [];
    let counter = 0;

    this.images.forEach((image) => {
      const imgSrc = image.getAttribute('data-image-src');

      counter += 1;

      items.push({
        src: imgSrc,
        w: parseInt(image.getAttribute('data-image-width')),
        h: parseInt(image.getAttribute('data-image-height')),
        msrc: imgSrc,
      });

      if (this.images.length === counter) {
        const options = {
          history: false,
          focus: false,
          index: indexImage,
          mainClass: counter === 1 ? 'pswp-zoom-gallery pswp-zoom-gallery--single' : 'pswp-zoom-gallery',
          showHideOpacity: true,
          howAnimationDuration: 150,
          hideAnimationDuration: 250,
          closeOnScroll: false,
          closeOnVerticalDrag: false,
          captionEl: true,
          closeEl: true,
          closeElClasses: ['caption-close', 'title'],
          tapToClose: false,
          clickToCloseNonZoomable: false,
          maxSpreadZoom: 2,
          loop: true,
          spacing: 0,
          allowPanToNext: true,
          pinchToClose: false,
          getThumbBoundsFn: () => {
            const imageLocation = this.images[indexImage];
            const pageYScroll = window.scrollY || document.documentElement.scrollTop;
            const rect = imageLocation.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
          },
        };

        new window.theme.LoadPhotoswipe(items, options);

        if (this.thumbsContainer && thumbs !== '') {
          this.thumbsContainer.innerHTML = thumbs;
        }
      }
    });
  }
}

if (!customElements.get('zoom-images')) {
  customElements.define('zoom-images', ZoomImages);
}
