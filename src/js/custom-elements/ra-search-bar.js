import { debounce } from "../utils/helpers.js";
import { refreshReviewWidgets } from "../utils/vendors.js";
import { getToken } from "@bva/ui-shared/helpers";
import axios from "axios";
export default class RaSearchBar extends HTMLElement {
  constructor() {
    super();
    this.isVisible = window.isSearchVisible || false;
    this.header = document.querySelector("ra-header");
    this.preHeader = document.querySelector(".ra-preheader");
    this.headerInner = document.querySelector(".header__inner");
    this.searchForm = document.querySelector("[data-search-form]");
    this.searchInput = this.searchForm.querySelector("[name='q']");
    this.toggleEl = document.querySelector("[data-action-toggle-search]");
    this.closeEls = document.querySelectorAll("[data-action-close-search]");
    this.searchResponse = document.querySelector("#SearchResponse");
    this.mobileSearchToggle = document.querySelector(".mobile-search-toggle");
    this.mobileSearchClose = document.querySelector(".mobile-search-close");
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.toggleEl?.addEventListener("click", this.toggleSearch.bind(this));
    this.mobileSearchToggle?.addEventListener(
      "click",
      this.showSearch.bind(this)
    );
    this.mobileSearchClose?.addEventListener(
      "click",
      this.hideSearch.bind(this)
    );
    this.closeEls.forEach((el) => {
      el.addEventListener("click", this.hideSearch.bind(this));
    });

    this.searchForm?.addEventListener(
      "input",
      debounce((e) => {
        this.onInputChange(e);
      }, 300).bind(this)
    );

    this.searchResponse?.addEventListener("click", (e) => {
      if (e.target.classList.contains("predictive-search__overlay")) {
        this.hideSearch();
      }
    });
  }

  showSearch() {
    const scrollPosition = window.scrollY || window.pageYOffset;
    const bodyStyle = document.body.style;
    if (window.innerWidth < 768) {
      bodyStyle.overflow = "hidden";
      bodyStyle.position = "fixed";
      bodyStyle.top = `-${scrollPosition}px`;
    }
    this.classList.remove("h-[0px]");
    this.classList.add("h-screen", "md:h-[188px]");
    this.isVisible = true;
    this.searchInput?.focus();
    const breakpointMd = getToken("breakpoints.px.md"); // 768px
    if (window.innerWidth < breakpointMd) {
      document.querySelector("body").classList.add("overflow-hidden");
    }
  }

  hideSearch() {
    const bodyStyle = document.body.style;
    const scrollPosition = parseInt(bodyStyle.top || 0, 10) * -1;
    if (window.innerWidth < 768) {
      bodyStyle.overflow = "";
      bodyStyle.position = "";
      bodyStyle.top = "";
      window.scrollTo(0, scrollPosition);
    }
    this.isVisible = false;
    this.classList.add("h-[0px]");
    this.classList.remove("h-screen", "md:h-[188px]");
    this.clearSearchResults();
    document.querySelector("body").classList.remove("overflow-hidden");
  }

  toggleSearch() {
    if (window.isSearchVisible) {
      this.showSearch();
      window.isSearchVisible = false;
    } else {
      this.isVisible ? this.hideSearch() : this.showSearch();
    }
  }

  getSearchResponse(q) {
    const url = `${window.Shopify.routes.root}search/suggest`;
    const params = {
      q,
      section_id: "ra-predictive-search",
      resources: {
        limit: 4,
        limit_scope: "each",
        options: {
          unavailable_products: "hide",
        },
      },
    };

    axios
      .get(url, { params })
      .then((res) => {
        const responseDOM = new DOMParser().parseFromString(
          res.data,
          "text/html"
        );

        this.searchResponse.innerHTML = responseDOM.querySelector(
          "#shopify-section-ra-predictive-search"
        ).innerHTML;
      })
      .then(() => {
        refreshReviewWidgets();
      });
  }

  clearSearchResults() {
    this.searchResponse.innerHTML = "";
    this.searchInput.value = "";
  }

  onInputChange(e) {
    const val = e.target.value;
    if (val === "") {
      this.clearSearchResults();
    } else {
      this.getSearchResponse(val);
    }
  }
}
