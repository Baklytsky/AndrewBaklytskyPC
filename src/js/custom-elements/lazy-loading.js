export default class LazyLoading extends HTMLElement {
  constructor() {
    super();
    this.pages = this.dataset.pages ? parseInt(this.dataset.pages) : 0;
    this.currentPage = this.dataset.currentPage
      ? parseInt(this.dataset.currentPage)
      : 0;
    this.elementsToAdd = this.dataset.elementsSelector || "";
    this.inner = this.dataset.innerSelector || "";
    this.loadBtn = this.querySelector("[data-load-btn]") || null;
    this.loadingType = this.dataset.loadingType || "";
    this.checkVisibility();

    if (
      !this.elementsToAdd.length ||
      !this.inner.length ||
      !this.currentPage > 0 ||
      !this.pages > 0
    ) {
      return;
    }

    this.loadingType === "button" && this.loadBtn
      ? this.loadBtn.addEventListener("click", () => this.loadMore())
      : this.loadByScroll();
  }

  checkVisibility() {
    this.currentPage === this.pages
      ? this.classList.add("hidden")
      : this.classList.remove("hidden");
  }

  loading(state) {
    this.setAttribute("data-loading", state);
  }

  getUrl() {
    this.urlStr =
      this.dataset.url && this.dataset.url.length
        ? this.dataset.url
        : window.location.href;

    try {
      const paginationNextPage = this.currentPage + 1;
      const url = new URL(this.urlStr);
      url.searchParams.set("page", paginationNextPage);
      this.url = url;
      this.currentPage = paginationNextPage;
      this.setAttribute("data-current-page", paginationNextPage);
    } catch (e) {
      this.url = null;
      console.log("Invalid URL in this.getUrl():", e.message);
    }
  }

  handleErrors(htmlInner, inner, elements) {
    let error = null;

    if (!htmlInner) {
      error = new Error("Inner element not found in response.");
    } else if (!inner) {
      error = new Error("Container for inner elements not found");
    } else if (!elements || elements.length === 0) {
      error = new Error("No elements found to add.");
    }

    if (error) {
      throw error;
    }
  }

  loadByScroll() {
    const options = {
      root: null,
      threshold: 0.01,
    };

    const observer = new IntersectionObserver((entries) => {
      this.checkVisibility();

      if (this.currentPage === this.pages) {
        observer.disconnect();
        return false;
      }

      entries.forEach((entry) => {
        if (entry.isIntersecting) this.loadMore();
      });
    }, options);

    observer.observe(this);
  }

  async loadMore() {
    this.getUrl();
    this.loading(true);
    try {
      if (!this.url) {
        throw new Error("Invalid URL.");
      }
      const response = await fetch(this.url);
      const responseText = await response.text();
      const html = new DOMParser().parseFromString(responseText, "text/html");
      const htmlInner = html.querySelector(`${this.inner}`);
      const elements = htmlInner?.querySelectorAll(`${this.elementsToAdd}`);
      const inner = document.querySelector(`${this.inner}`);
      this.checkVisibility();
      this.handleErrors(htmlInner, inner, elements);
      elements.forEach((element) => {
        inner.insertAdjacentHTML("beforeend", element.outerHTML);
      });
      this.loading(false);
    } catch (e) {
      this.loading(false);
      console.log(e);
    }
  }
}
