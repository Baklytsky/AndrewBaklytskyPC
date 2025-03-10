import axios from "axios";
import { updateURL } from "../utils/search-params.js";
import { refreshReviewWidgets } from "../utils/vendors.js";

const getSearchParamsFromFormSearch = (form) => {
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);
  const filtered = Array.from(params.entries()).filter(([, value]) => {
    return !!value;
  });

  return new URLSearchParams(filtered).toString();
};

export default class RaSearchSort extends HTMLElement {
  constructor() {
    super();
  }

  //* TODO: Add a method to render from cache
  //* Reference Dawn's implementation for example

  // Pull this into a util function
  static renderSectionFromFetch(searchParamString) {
    const sectionId =
      document.getElementById("ra-search-section").dataset.sectionId;
    const url = `${window.location.pathname}?section_id=${sectionId}&${searchParamString}`;

    axios
      .get(url)
      .then((res) => {
        const html = res.data;

        document.getElementById("SearchProductGrid").innerHTML = new DOMParser()
          .parseFromString(html, "text/html")
          .getElementById("SearchProductGrid").innerHTML;

        updateURL(searchParamString);
      })
      .then(() => {
        refreshReviewWidgets();
      });
  }

  connectedCallback() {
    //const sortForm = document.querySelector("[name='searchSortBy']");
    const sortForm = document.getElementById("searchSortByForm");
    const filterForm = document.getElementById("SearchFilters");
    const searchTerms = document
      .querySelector(".ra-search")
      .getAttribute("data-search-terms");

    sortForm.addEventListener("change", () => {
      const filterFormData = getSearchParamsFromFormSearch(filterForm);
      const sortFormData = getSearchParamsFromFormSearch(sortForm);

      let searchParamString;

      // Get the keyword searched
      const urlParams = new URLSearchParams(window.location.search);
      let keywordSearched = "";
      for (const [key, value] of urlParams) {
        if (key === "q") {
          keywordSearched = value;
        }
      }

      if (filterFormData) {
        searchParamString = [
          new URLSearchParams({ q: searchTerms }).toString(),
          new URLSearchParams(filterFormData).toString(),
          new URLSearchParams(sortFormData).toString(),
        ].join("&");
      } else {
        searchParamString = new URLSearchParams(sortFormData).toString();
      }

      // Add the keyword searched to the searchParamString
      if (keywordSearched) {
        searchParamString = searchParamString + `&q=${keywordSearched}`;
      }

      RaSearchSort.renderSectionFromFetch(searchParamString);
    });
  }
}
