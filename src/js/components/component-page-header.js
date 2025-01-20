class PageHeader extends HTMLElement {
  constructor() {
    super()
    this.headerInit = () => {
      this.headingDescription = this.querySelector(".page__head-description:not(.show-more)");
      this.headingDescriptionShowMore = this.querySelector(".page__head-description.show-more");
      this.headingDescriptionPreview = this.querySelector(".page__head-description--preview");
      this.baseHeight = 2.8 * parseFloat(getComputedStyle(this.headingDescription).fontSize);
      this.showHideDescription();
    }

    window.addEventListener("resize", debounce(this.showHideDescription.bind(this), 200));
    if (Shopify.designMode) document.addEventListener("shopify:section:load", this.headerInit);
    this.headerInit();
  }

  showHideDescription() {
    if (!this.headingDescription || !this.headingDescriptionShowMore) return;

    if (this.headingDescriptionPreview) {
      this.headingDescriptionPreview.classList.add('hide-description');
      this.headingDescriptionPreview = null;
    }

    if (this.headingDescription.clientHeight > this.baseHeight) {
      this.headingDescription.classList.add('hide-description');
      this.headingDescriptionShowMore.classList.remove('hide-description');
    } else if (this.headingDescription.clientHeight < this.baseHeight) {
      this.headingDescription.classList.remove('hide-description');
      this.headingDescriptionShowMore.classList.add('hide-description');
    }
  }
}

customElements.define('page-header', PageHeader);

