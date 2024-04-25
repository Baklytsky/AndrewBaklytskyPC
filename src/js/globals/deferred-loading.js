/**
 * This component prevents any HTML from being loaded,
 * until user's cursor is over the component or over specific trigger referenced by the <deferred-loading> element.
 * The main focus is for deferred loading of images.
 * Loading is triggered by a 'mouseenter' event rendering depends on a `<template>` element that should hold all of the HTML
 *
 * @example
 *  <deferred-loading data-deferred-container=".parent-container-selector" data-deferred-triggers=".button-element-selector">
 *    <template>
 *      <div data-deferred-content>
 *        // Insert deferred markup or images here:
 *        {%- render 'image', image: section.settings.image_1 -%}
 *        {%- render 'image', image: section.settings.image_2 -%}
 *      </div>
 *    </template>
 *  </deferred-loading>
 */
const selectors = {
  img: 'img',
  template: 'template',
  shopifySection: '.shopify-section',
  deferredContent: '[data-deferred-content]',
  reloadSrcsetException: '[data-product-image]',
};

const attributes = {
  srcset: 'srcset',
  loaded: 'data-loaded',
  deferredContainer: 'data-deferred-container',
};

export default class DeferredLoading extends HTMLElement {
  constructor() {
    super();

    this.container = this;
    if (this.hasAttribute(attributes.deferredContainer)) {
      this.container = this.closest(this.getAttribute(attributes.deferredContainer)) || this.closest(selectors.shopifySection);
    }

    this.deferredTriggers = this.container.querySelectorAll(this.dataset.deferredTriggers);
  }

  connectedCallback() {
    if (this.deferredTriggers.length == 0) {
      this.container.addEventListener(
        'mouseenter',
        () => {
          if (this.hasAttribute(attributes.loaded)) return;
          this.loadTemplate();
        },
        {once: true}
      );

      return;
    }

    this.deferredTriggers.forEach((trigger) => {
      trigger.addEventListener(
        'mouseenter',
        () => {
          if (this.hasAttribute(attributes.loaded)) return;
          this.loadTemplate();
        },
        {once: true}
      );
    });
  }

  loadTemplate() {
    const content = document.createElement('div');
    const template = this.querySelector(selectors.template);
    if (!template || !template?.content?.firstElementChild) return;

    content.appendChild(template.content.firstElementChild.cloneNode(true));

    const deferredContent = content.querySelector(selectors.deferredContent);
    if (!deferredContent) return;

    this.append(deferredContent);
    this.setAttribute(attributes.loaded, true);

    const containsImages = deferredContent.querySelectorAll(selectors.img).length > 0;
    if (containsImages) {
      this.reloadSrcset(this);
    }
  }

  // Reload srcset for correct image render on Safari - fixes 'object-fit: cover' issues
  reloadSrcset(container) {
    if (!container) return;
    container.querySelectorAll(selectors.img).forEach((img) => {
      const reloadSrcsetException = img.parentNode.matches(selectors.reloadSrcsetException);

      if (!reloadSrcsetException) {
        const srcset = img.getAttribute(attributes.srcset);
        img.setAttribute(attributes.srcset, '');
        img.setAttribute(attributes.srcset, srcset);
      }
    });
  }
}
