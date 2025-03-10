export default class RaShopTheLook extends HTMLElement {
  constructor() {
    super();
    this.lookItems = Array.from(
      this.querySelectorAll(".ra-shop-the-look__item")
    );
    this.swiperEl = this.querySelector("swiper-container") || null;
  }

  connectedCallback() {
    this.initDots();
  }

  initDots() {
    this.lookItems.forEach((item) => {
      item.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.hasAttribute("data-popover")) {
            this.togglePopover(button);
          } else if (button.hasAttribute("data-slider")) {
            this.toggleSlider(button);
          }
        });
      });
    });
  }

  toggleSlider(toggleBtn) {
    const index = toggleBtn.getAttribute("data-index");
    if (!index) return;
    this.swiperEl.swiper.slideTo(index, 500, false);
  }

  togglePopover(toggleBtn) {
    this.lookItems.forEach((item) => {
      const product = item.querySelector(".ra-shop-the-look__product");
      product.style.setProperty(
        "--product-width",
        parseInt(product.offsetWidth) + "px"
      );

      if (
        product.getAttribute("id") === toggleBtn.getAttribute("data-popover")
      ) {
        product.toggleAttribute("open");
      } else {
        product.removeAttribute("open");
      }
    });
  }
}
