import axios from "axios";
import { getSearchParamsFromForm, updateURL } from "../utils/search-params.js";
import { refreshReviewWidgets } from "../utils/vendors.js";
export default class RaCollectionFilters extends HTMLElement {
  constructor() {
    super();
    this.section = document.getElementById("ra-collection-section");
  }

  //* TODO: Add a method to render from cache
  //* Reference Dawn's implementation for example

  static renderSectionFromFetch(searchParamString) {
    const sectionId = document.getElementById("ra-collection-section").dataset
      .sectionId;
    const url = `${window.location.pathname}?section_id=${sectionId}&${searchParamString}`;

    axios
      .get(url)
      .then((res) => {
        const html = res.data;

        // Grab grid html from fetch with params and update DOM element
        const responseDOM = new DOMParser().parseFromString(html, "text/html");

        document.querySelector("[data-product-grid]").innerHTML =
          responseDOM.querySelector("[data-product-grid]").innerHTML;
        document.querySelector("[data-collection-filters]").innerHTML =
          responseDOM.querySelector("[data-collection-filters]").innerHTML;
        document.querySelector("[data-active-filters]").innerHTML =
          responseDOM.querySelector("[data-active-filters]").innerHTML;

        if (
          responseDOM.querySelector(
            "[data-active-filters] [data-action-remove-filter]"
          )
        ) {
          document.querySelector("#CollectionActiveFilters").style.display =
            "flex";
          document.querySelector("[data-clear-filters]").style.opacity = "1";
        } else {
          document.querySelector("#CollectionActiveFilters").style.display =
            "none";
          document.querySelector("[data-clear-filters]").style.opacity = "0";
        }
      })
      .then(() => {
        RaCollectionFilters.addActiveFilterEventListeners();
      })
      .then(() => {
        refreshReviewWidgets();
      });
  }

  static onBrowserPrev() {
    let params = new URLSearchParams(window.location.search);
    RaCollectionFilters.renderSectionFromFetch(params);
  }

  static clearFilters() {
    RaCollectionFilters.renderSectionFromFetch("");
    updateURL("");
  }

  static getSearchParamString() {
    const filterForm = document.getElementById("CollectionFilters");
    const sortForm = document.querySelector("[name='sortBy']");
    const filterFormData = getSearchParamsFromForm(filterForm);
    const sortFormData = sortForm ? getSearchParamsFromForm(sortForm) : null;
    let searchParamString;

    if (sortFormData) {
      searchParamString = [
        new URLSearchParams(filterFormData).toString(),
        new URLSearchParams(sortFormData).toString(),
      ].join("&");
    } else {
      searchParamString = new URLSearchParams(filterFormData).toString();
    }

    return searchParamString;
  }

  static removeParamFromSearch(param) {
    let searchParamString = RaCollectionFilters.getSearchParamString();

    searchParamString = searchParamString
      .replace(param + "&", "")
      .replace(param, "");
    return searchParamString;
  }

  static onRemoveBtnClick(e) {
    e.preventDefault();

    const btn = e.currentTarget;
    const param = btn.getAttribute("data-param");
    const value = btn.getAttribute("data-value");

    const formOptionInput = document.querySelector(
      `input[name="${param}"][value="${value}"]`
    );

    formOptionInput.checked = false;
    const filterForm = document.getElementById("CollectionFilters");
    const changeEvent = new Event("change");
    filterForm.dispatchEvent(changeEvent);

    let params = new URLSearchParams(window.location.search);
    RaCollectionFilters.renderSectionFromFetch(params);
  }

  static addActiveFilterEventListeners() {
    const removeFilterBtns = document.querySelectorAll(
      "[data-action-remove-filter]"
    );

    removeFilterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.onRemoveBtnClick(e));
    });

    const toggleFilterBtns = document.querySelectorAll("[data-toggle-filter]");

    toggleFilterBtns.forEach((btn) => {
      let filter = btn.getAttribute("data-toggle-filter");
      btn.addEventListener("click", () => this.showMoreFilterToggle(filter));
    });

    const swatchBlocks = document.querySelectorAll("[data-swatch-block]");
    swatchBlocks.forEach((block) => {
      this.checkSwatchLabel(block);
    });
  }

  static showMoreFilterToggle(filterHandle) {
    const filtersToToggle = document.querySelectorAll(
      `[data-filter='${filterHandle}'] .filter-hide`
    );
    console.log("filterHandle", filterHandle);
    filtersToToggle.forEach((filter) => {
      if (filter.classList.contains("active")) {
        filter.classList.remove("active");
        document.querySelector(
          `[data-filter-label='${filterHandle}']`
        ).innerText = "show more";
      } else {
        filter.classList.add("active");
        document.querySelector(
          `[data-filter-label='${filterHandle}']`
        ).innerText = "show less";
        document.querySelector(
          `.${filterHandle} .ra-accordion-item__content`
        ).style.height = "auto";
      }
    });
  }

  static closeMobileFilters() {
    const sidebar = document.querySelector("[data-collection-sidebar]");
    document.body.classList.remove("overflow-hidden");
    sidebar.classList.add("hidden");
  }

  static toggleMobileFilters() {
    const sidebar = document.querySelector("[data-collection-sidebar]");
    const accordion = sidebar.querySelector("ra-accordion");
    const accordionButtons = accordion.querySelectorAll(".ra-accordion-item");
    document.body.classList.toggle("overflow-hidden");
    sidebar.classList.toggle("hidden");
    if (accordion) {
      accordionButtons.forEach((btn) => {
        accordion.toggleHeight(btn);
      });
    }
  }

  static checkSwatchLabel(block) {
    const swatches = block.querySelectorAll(".ra-swatch-filter");
    swatches.forEach((item) => {
      item.addEventListener("mouseover", (e) => {
        if (e.target === item || item.contains(e.target)) {
          this.toggleSwatchLabel(block, item, true);
        }
      });
      item.addEventListener("mouseleave", (e) => {
        if (e.target === item || item.contains(e.target)) {
          this.toggleSwatchLabel(block, item, false);
        }
      });
    });
  }

  static toggleSwatchLabel(block, swatch, toggle) {
    const title = swatch.dataset.title;
    const label = block.querySelector("[data-label]");
    if (!title || !label) return;
    toggle ? (label.textContent = title) : (label.textContent = "");
  }

  connectedCallback() {
    const filterForm = document.getElementById("CollectionFilters");
    const clearAllBtn = document.querySelector("[data-clear-filters]");
    const blocksFilters = document.querySelectorAll(
      ".ra-collection-blocks-label"
    );
    const mobileFilterToggles = document.querySelectorAll(
      "[data-action-toggle-mobile-filters]"
    );

    const mobileFilterCloseTriggers = document.querySelectorAll(
      "[data-action-close-filters]"
    );

    mobileFilterCloseTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        RaCollectionFilters.closeMobileFilters();
      });
    });

    blocksFilters.forEach((block) => {
      block.addEventListener("click", (event) => {
        event.preventDefault();
        // window.scrollTo(0, 0);
        this.section.scrollIntoView();
        let params = new URLSearchParams(window.location.search);
        const inputId = block.getAttribute("for");
        const productTypeValue = block.getAttribute("data-type-value");
        const productMetaFieldValue = block.getAttribute(
          "data-metalield-value"
        );
        const customSearchParam = block.getAttribute("data-search-param");
        const searchProductType = params.get("filter.p.product_type");
        const searchCustomFiled = params.get(customSearchParam);
        let searchParamString = RaCollectionFilters.getSearchParamString();
        let result;
        // const sortForm = document.querySelector("[name='sortBy']");
        // const sortFormData = sortForm
        //   ? getSearchParamsFromForm(sortForm)
        //   : null;

        let decodeSearchParamString = decodeURIComponent(
          searchParamString
        ).replaceAll("+", " ");

        if (searchProductType && productTypeValue) {
          result = decodeSearchParamString.replace(
            customSearchParam,
            productTypeValue
          );
        } else if (searchCustomFiled && productMetaFieldValue) {
          result = decodeSearchParamString.replace(
            searchCustomFiled,
            productMetaFieldValue
          );
        } else {
          result = searchParamString.replace("&", `&${inputId}&`);
        }

        RaCollectionFilters.renderSectionFromFetch(result);
        updateURL(result);
      });
    });

    mobileFilterToggles.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        RaCollectionFilters.toggleMobileFilters();
      });
    });

    clearAllBtn.addEventListener("click", () => {
      RaCollectionFilters.clearFilters();
    });

    filterForm.addEventListener("change", () => {
      const searchParamString = RaCollectionFilters.getSearchParamString();
      RaCollectionFilters.renderSectionFromFetch(searchParamString);
      updateURL(searchParamString);
    });

    RaCollectionFilters.addActiveFilterEventListeners();

    let params = new URLSearchParams(window.location.search);
    RaCollectionFilters.renderSectionFromFetch(params);

    /* Ensure that navigating through the browser "Back" button properly applies filters */
    window.addEventListener("popstate", RaCollectionFilters.onBrowserPrev);
  }
}
