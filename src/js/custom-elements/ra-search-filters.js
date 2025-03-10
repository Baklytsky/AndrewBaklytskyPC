import axios from "axios";
import { getSearchParamsFromForm, updateURL } from "../utils/search-params.js";
import { refreshReviewWidgets } from "../utils/vendors.js";
export default class RaSearchFilters extends HTMLElement {
  constructor() {
    super();
  }

  //* TODO: Add a method to render from cache
  //* Reference Dawn's implementation for example

  static renderSectionFromFetch(searchParamString) {
    const sectionId =
      document.getElementById("ra-search-section").dataset.sectionId;
    const url = `${window.location.pathname}?section_id=${sectionId}&${searchParamString}`;

    axios
      .get(url)
      .then((res) => {
        const html = res.data;

        // Grab grid html from fetch with params and update DOM element
        const responseDOM = new DOMParser().parseFromString(html, "text/html");

        document.querySelector("[data-product-grid]").innerHTML =
          responseDOM.querySelector("[data-product-grid]").innerHTML;
        document.querySelector("[data-search-filters]").innerHTML =
          responseDOM.querySelector("[data-search-filters]").innerHTML;
        document.querySelector("[data-active-filters]").innerHTML =
          responseDOM.querySelector("[data-active-filters]").innerHTML;
        document.querySelector("[data-results-count]").innerHTML =
          responseDOM.querySelector("[data-results-count]").innerHTML;

        if (
          responseDOM.querySelector(
            "[data-active-filters] [data-action-remove-filter]"
          )
        ) {
          document.querySelector("#SearchActiveFilters").style.display = "flex";
          document.querySelector("[data-clear-filters]").style.opacity = "1";
        } else {
          document.querySelector("#SearchActiveFilters").style.display = "none";
          document.querySelector("[data-clear-filters]").style.opacity = "0";
        }
      })
      .then(() => {
        RaSearchFilters.addActiveFilterEventListeners();
        refreshReviewWidgets();
      });
  }

  static onBrowserPrev() {
    let params = new URLSearchParams(window.location.search);
    RaSearchFilters.renderSectionFromFetch(params);
  }

  static clearFilters() {
    const searchTerms = document
      .querySelector(".ra-search")
      .getAttribute("data-search-terms");
    const searchParamString = new URLSearchParams({
      q: searchTerms,
    }).toString();

    RaSearchFilters.renderSectionFromFetch(searchParamString);
    updateURL(searchParamString);
  }

  static getSearchParamString() {
    const searchTerms = document
      .querySelector(".ra-search")
      .getAttribute("data-search-terms");
    const filterForm = document.getElementById("SearchFilters");
    const sortForm = document.querySelector("[name='searchSortBy']");
    const filterFormData = getSearchParamsFromForm(filterForm);
    const sortFormData = sortForm ? getSearchParamsFromForm(sortForm) : null;
    let searchParamString;

    if (sortFormData) {
      searchParamString = [
        new URLSearchParams({ q: searchTerms }).toString(),
        new URLSearchParams(filterFormData).toString(),
        new URLSearchParams(sortFormData).toString(),
      ].join("&");
    } else {
      searchParamString = [
        new URLSearchParams({ q: searchTerms }),
        new URLSearchParams(filterFormData).toString(),
      ].join("&");
    }

    return searchParamString;
  }

  static removeParamFromSearch(param) {
    let searchParamString = RaSearchFilters.getSearchParamString();

    searchParamString = searchParamString
      .replace(param + "&", "")
      .replace(param, "");
    return searchParamString;
  }

  static onRemoveBtnClick(e) {
    e.preventDefault();

    const btn = e.currentTarget;
    const param = btn.getAttribute("data-param");
    const value = btn.getAttribute("data-value").replaceAll("+", " ");
    // TODO: There may be an issue with filter values that contain a + in them

    const formOptionInput = document.querySelector(
      `input[name="${param}"][value="${value}"]`
    );

    formOptionInput.checked = false;
    const filterForm = document.getElementById("SearchFilters");
    const changeEvent = new Event("change");
    filterForm.dispatchEvent(changeEvent);
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
    const sidebar = document.querySelector("[data-search-sidebar]");
    document.body.classList.remove("overflow-hidden");
    sidebar.classList.add("hidden");
  }

  static toggleMobileFilters() {
    const sidebar = document.querySelector("[data-search-sidebar]");
    document.body.classList.toggle("overflow-hidden");
    sidebar.classList.toggle("hidden");
  }

  connectedCallback() {
    const filterForm = document.getElementById("SearchFilters");
    const clearAllBtn = document.querySelector("[data-clear-filters]");
    const mobileFilterToggles = document.querySelectorAll(
      "[data-action-toggle-mobile-filters]"
    );

    const mobileFilterCloseTriggers = document.querySelectorAll(
      "[data-action-close-filters]"
    );

    mobileFilterCloseTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        RaSearchFilters.closeMobileFilters();
      });
    });

    mobileFilterToggles.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        RaSearchFilters.toggleMobileFilters();
      });
    });

    clearAllBtn.addEventListener("click", () => {
      RaSearchFilters.clearFilters();
    });

    filterForm.addEventListener("change", () => {
      const searchParamString = RaSearchFilters.getSearchParamString();
      RaSearchFilters.renderSectionFromFetch(searchParamString);
      updateURL(searchParamString);
    });

    RaSearchFilters.addActiveFilterEventListeners();

    let params = new URLSearchParams(window.location.search);
    RaSearchFilters.renderSectionFromFetch(params);

    /* Ensure that navigating through the browser "Back" button properly applies filters */
    window.addEventListener("popstate", RaSearchFilters.onBrowserPrev);
  }
}
