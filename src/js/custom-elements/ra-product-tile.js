import { money, moneyWithoutDecimals } from "../utils/money.js";
import { getToken } from "../../../@bva/ui-shared/helpers";
import axios from "axios";

export default class RaProductTile extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.getProductData(this.getAttribute("data-product")).then(() => {
      this.currentVariant = this.product.variants?.find(
        (variant) => variant.id == this.getAttribute("data-current-variant")
      );

      // Swatch Properties
      this.breakpointPixelMD = getToken("breakpoints.px.md");
      this.productTileBreakpoint;
      this.overflowStyleDesktop = "expand"; // expecting expand, arrow, or drag
      this.overflowStyleMobile = "arrow";
      this.optionContainer = this.querySelector("[data-option-container]");
      this.variantOptions = this.querySelector("[data-variant-options]");
      this.variantCarousel = this.querySelector("swiper-container");
      this.variantSwatches = [...(this.variantCarousel?.children || [])];
      this.swatches = this.querySelectorAll("[data-product-swatch]");
      if (this.swatches.length > 0) {
        this.initializeSwatches();
      }

      // Properties that update on Variant Switch
      this.featuredImage = this.querySelector("[data-featured-image]");
      this.productTileMedia = this.querySelector("[data-tile-media]");
      this.altImage = this.querySelector("[data-alt-image]");
      this.price = this.querySelector("[data-price]");
      this.priceCompare = this.querySelector("[data-price-compare]");
      this.productUrl = this.querySelector("[data-product-link]");
      this.productTitle = this.querySelector("[data-variant-title]");
      this.productBadge = this.querySelector("[data-product-badge]");

      this.setCurrentVariant(this.currentVariant);
      this.productTileBreakpoint =
        window.innerWidth > this.breakpointPixelMD ? "desktop" : "mobile";
      if (this.variantSwatches.length > 1) {
        this.updateCurrentVariant();
        this.buildArrows();
        this.buildViewMore();
      }

      this.sizeOption = this.querySelector("[data-option-size]");

      if (this.sizeOption)
        this.sizeOption.addEventListener(
          "change",
          this.onSizeChange.bind(this)
        );
    });
  }

  onSizeChange(e) {
    this.setCurrentVariant(this.getVariantDataElement(e.target.id));
    this.updateProductUrl(null, true);
  }

  getVariantDataElement(inputId) {
    return JSON.parse(
      this.querySelector(
        `script[type="application/json"][data-resource="${inputId}"]`
      ).textContent
    );
  }

  productBadgeManager(product) {
    let totalInventory = 0;
    product.variants.forEach(
      (variant) => (totalInventory += variant.inventory_quantity)
    );

    if (product.custom_badge) {
      this.badgeBuilder(product.custom_badge);
    } else if (product.pre_order) {
      this.badgeBuilder("pre-order");
    } else if (totalInventory < 1 && product.coming_soon) {
      this.badgeBuilder("waitlist");
    } else if (totalInventory < 1) {
      this.badgeBuilder("sold out");
    } else if (totalInventory < product.few_items_left_quantity) {
      this.badgeBuilder("Few items left");
    } else if (totalInventory < product.selling_fast_quantity) {
      this.badgeBuilder("Selling fast");
    } else if (
      !product.few_items_left_quantity &&
      totalInventory < window.GLBE_SETTINGS.fewItemsLeft
    ) {
      this.badgeBuilder("Few items left");
    } else if (
      !product.selling_fast_quantity &&
      totalInventory < window.GLBE_SETTINGS.sellingFast
    ) {
      this.badgeBuilder("Selling fast");
    } else {
      this.badgeBuilder(false);
    }
  }

  badgeBuilder(badge) {
    const currentBadge = this.querySelector(".ra-product-title_media-badge");
    const badgeContainer = this.querySelectorAll(".ra-product-tile__image")[0];
    if (currentBadge) currentBadge.remove();
    if (!badge) return;
    const newBadge = document.createElement("div");
    newBadge.classList.add(
      "ra-badge",
      "ra-badge--standard",
      "ra-badge--has-text",
      "ra-badge--primary",
      "ra-badge--md",
      "ra-product-title_media-badge",
      "rounded"
    );
    newBadge.setAttribute("label", badge);
    newBadge.innerHTML = badge;
    badgeContainer.prepend(newBadge);
  }

  handleResize() {
    const newBreakpoint =
      window.innerWidth > this.breakpointPixelMD ? "desktop" : "mobile";
    if (this.productTileBreakpoint !== newBreakpoint) {
      this.productTileBreakpoint = newBreakpoint;
      this.toggleArrows();
      this.toggleExpander();
    }
    if (this.expandActive()) {
      // this.displayViewMore();
    }
  }

  toggleExpander() {
    const viewMore = this.querySelector("[data-view-more]");
    const viewLess = this.querySelector("[data-view-less]");
    if (this.expandActive()) {
      viewMore.classList.remove("hidden");
      viewLess.classList.add("hidden");
      if (this.variantCarousel.swiper) {
        this.variantCarousel.swiper.disable();
      }
    } else {
      viewMore.classList.add("hidden");
      viewLess.classList.add("hidden");
      if (this.variantCarousel.swiper) {
        this.variantCarousel.swiper.enable();
        this.variantCarousel.swiper.update();
      }
    }
  }

  expandActive() {
    return (
      (this.productTileBreakpoint === "desktop" &&
        this.overflowStyleDesktop === "expand") ||
      (this.productTileBreakpoint === "mobile" &&
        this.overflowStyleMobile === "expand")
    );
  }

  buildViewMore() {
    const viewMore = document.createElement("div");
    viewMore.innerHTML = `
    <span data-count></span>+ more`;
    viewMore.classList.add("product-tile__view-more", "hidden");
    viewMore.setAttribute("data-view-more", "");
    viewMore.addEventListener("click", () => toggleViewMore());
    const viewLess = document.createElement("span");
    viewLess.innerText = "See Less";
    viewLess.classList.add("hidden", "product-tile__view-less");
    viewLess.setAttribute("data-view-less", "");
    viewLess.addEventListener("click", () => toggleViewLess());
    this.optionContainer.append(viewMore);
    this.optionContainer.append(viewLess);

    const toggleViewMore = () => {
      this.variantCarousel.swiper.enable();
      this.variantCarousel.swiper.update();
      viewMore.classList.add("hidden");
      viewLess.classList.toggle("hidden");
    };

    const toggleViewLess = () => {
      viewMore.classList.remove("hidden");
      viewLess.classList.add("hidden");
      this.variantCarousel.swiper.disable();
    };
  }

  displayViewMore() {
    const viewMore = this.querySelector(`
      [data-view-more]
    `);
    const viewLess = this.querySelector(`
      [data-view-less]
    `);
    if (this.hasOverflow()) {
      this.variantCarousel.swiper.disable();
      viewLess.classList.add("hidden");
      viewMore.classList.remove("hidden");
      const maxWidth = this.variantOptions.clientWidth - viewMore.offsetWidth;
      const gridGap = 8;
      let currentOffset = 0;
      const visibleChildren = this.variantSwatches.reduce((acc, child) => {
        if (currentOffset + child.offsetWidth < maxWidth) {
          child.style.opacity = 1;
          currentOffset += child.offsetWidth + gridGap;
          return [...acc, child];
        } else {
          return acc;
        }
      }, []);
      this.querySelector("[data-count]").textContent =
        this.variantSwatches?.length - visibleChildren?.length;
    } else {
      viewMore.classList.add("hidden");
      if (this.variantCarousel?.swiper) {
        this.variantCarousel.swiper.enable();
        this.variantCarousel.swiper.update();
      }
    }
  }

  buildArrows() {
    const arrowHandles = ["left", "right"];
    arrowHandles.forEach((handle) => {
      const arrow = document.createElement("button");
      const arrow_background = document.createElement("span");
      arrow.prepend(arrow_background);
      arrow.classList.add(`product-tile__arrow--${handle}`, "hidden");
      arrow.setAttribute("data-scroll-button", "");
      arrow.setAttribute(`data-scroll-${handle}`, "");
      if (handle === "left") {
        this.variantCarousel?.addEventListener("reachbeginning", () => {
          arrow.classList.add("hidden");
        });
      } else if (handle === "right") {
        this.variantCarousel?.addEventListener("reachend", () => {
          arrow.classList.add("hidden");
        });
      }
      this.variantCarousel?.addEventListener("fromedge", () => {
        if (this.arrowsActive()) {
          if (
            (!this.variantCarousel.swiper.isBeginning && handle === "left") ||
            (!this.variantCarousel.swiper.isEnd && handle === "right")
          ) {
            arrow.classList.remove("hidden");
          }
        }
      });
      this.optionContainer.prepend(arrow);
    });
  }

  arrowsActive() {
    return (
      (this.productTileBreakpoint === "desktop" &&
        this.overflowStyleDesktop === "arrow") ||
      (this.productTileBreakpoint === "mobile" &&
        this.overflowStyleMobile === "arrow")
    );
  }

  toggleArrows() {
    const arrows = this.querySelectorAll("[data-scroll-button]");
    if (this.arrowsActive()) {
      if (this.variantCarousel.swiper) {
        this.variantCarousel.swiper.enable();
        this.variantCarousel.swiper.update();
      }
      arrows.forEach((arrow) => {
        if (
          (arrow.hasAttribute("data-scroll-left") &&
            this.variantCarousel?.swiper?.isBeginning === false) ||
          (arrow.hasAttribute("data-scroll-right") &&
            this.variantCarousel?.swiper?.isEnd === false)
        ) {
          arrow.classList.remove("hidden");
        }
      });
    } else {
      arrows.forEach((arrow) => arrow.classList.add("hidden"));
    }
  }

  // SWATCH FUNCTIONS
  initializeSwatches() {
    this.swatches.forEach((option) => {
      let swatchData = {};
      if (this.product.id.toString() === option.dataset.swatchData) {
        swatchData = this.product;
      } else if (
        this.product.parent_product?.id.toString() === option.dataset.swatchData
      ) {
        swatchData = this.product.parent_product;
      } else {
        const children =
          option.parentNode.classList.contains("parent-product-swatches") &&
          this.product.child_products.length > 0
            ? this.product.child_products
            : this.product.parent_product.child_products;
        swatchData = children.find((c_product) => {
          return c_product.id.toString() === option.dataset.swatchData;
        });
      }
      if (swatchData == {}) return;
      option.addEventListener("click", (e) => {
        this.productBadgeManager(swatchData);
        const parentContainer = e.target.closest("[data-product-swatch]");
        this.querySelector(".active[data-product-swatch]")?.classList.remove(
          "active"
        );
        parentContainer.classList.add("active");
        this.price.dataset.price = swatchData.price;
        this.price.textContent = moneyWithoutDecimals(swatchData.price);
        this.updateProductUrl(swatchData);
        this.updateAttribute(swatchData);
        this.updateImages(swatchData);
      });
    });
  }

  setCurrentVariant(variant) {
    this.currentVariant = variant;
  }

  updateCurrentVariant() {
    this.updateProductUrl();
    this.updateImages();
    this.updatePrice();
    this.updateAttribute();
    this.updateSwatch();
    this.updateBadge();
  }

  swatchClick(e) {
    const { optionPosition, optionValue } = e.target.dataset;
    const newOptions = [...this.currentVariant.options];
    newOptions[optionPosition - 1] = optionValue;
    const newVariant = this.product.variants?.find((variant) =>
      variant.options.every((value, index) => value === newOptions[index])
    );
    this.setCurrentVariant(newVariant);
    this.updateCurrentVariant();
  }

  // VARIANT CHANGE FUNCTIONS

  updatePrice() {
    if (this.currentVariant.compare_at_price) {
      this.priceCompare.classList.remove("hidden");
      this.price.classList.add("ra-price__special");
    } else {
      this.priceCompare.classList.add("hidden");
      this.price.classList.remove("ra-price__special");
    }
    if (this.price.dataset.price != this.currentVariant.price) {
      this.price.dataset.price = this.currentVariant.price;
      this.price.textContent = money(this.currentVariant.price);
    }
    if (
      this.price.dataset.priceCompare != this.currentVariant.compare_at_price
    ) {
      this.priceCompare.dataset.priceCompare =
        this.currentVariant.compare_at_price;
      this.priceCompare.textContent = money(
        this.currentVariant.compare_at_price
      );
    }
  }

  updateImages(swatchData) {
    if (!swatchData) return;
    const mediaContent =
      swatchData?.["product_tile_media_content"] ||
      this.product["product_tile_media_content"];

    if (mediaContent && mediaContent.length) {
      this.productTileMedia.innerHTML = mediaContent;
    }
  }

  updateAttribute(swatchData) {
    this.productTitle.textContent = swatchData.title.split(" | ")[0];
  }

  updateProductUrl(swatchData, isSize = false) {
    let productUrl;

    if (isSize) {
      productUrl = `/products/${this.getAttribute("data-product")}`;
      if (this.currentVariant?.id) {
        productUrl += `?variant=${this.currentVariant.id}`;
      }

      window.location.href = productUrl;
    } else {
      if (
        Shopify.country?.toLowerCase() !==
        window.shopify_country_default?.toLowerCase()
      ) {
        productUrl = `/products/${swatchData.handle}`;
      } else {
        productUrl = `/products/${swatchData.handle}`;
      }
    }
    if (this.currentVariant?.id) {
      productUrl += `?variant=${this.currentVariant.id}`;
    }
    this.productUrl.setAttribute("href", productUrl);
  }

  updateBadge() {
    const updatedBadge = this.currentVariant?.badge || this.product?.badge;
    if (
      updatedBadge &&
      this.productBadge?.textContent?.length >= 0 &&
      this.productBadge?.textContent != updatedBadge
    ) {
      this.productBadge.textContent = updatedBadge;
      this.productBadge?.classList.remove("hidden");
    } else if (!updatedBadge) {
      this.productBadge?.classList.add("hidden");
    }
  }

  updateSwatch() {
    this.variantSwatches.forEach((option) => {
      const input = option.querySelector("input");
      const label = option.querySelector("label");
      if (!input) return false;
      const { optionValue, optionPosition } = input.dataset;
      if (this.currentVariant[`option${optionPosition}`] == optionValue) {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    });
  }

  // HELPERS

  calculateGridGap() {
    return (
      this.variantSwatches[1].offsetLeft -
      (this.variantSwatches[0].offsetLeft + this.variantSwatches[0].offsetWidth)
    );
  }

  hasOverflow() {
    return this.variantOptions.scrollWidth > this.variantOptions.clientWidth;
  }

  async getProductData(handle) {
    const resp = await axios.get(`/products/${handle}?view=json-data`);
    this.product = resp.data;
  }
}
