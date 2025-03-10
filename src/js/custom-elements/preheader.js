export default class Preheader extends HTMLElement {
  constructor() {
    super();
    this.preheader = this.querySelector(".ra-preheader");
    this.header = document.querySelector("ra-header");
    this.preheaderCloseButton = this.querySelector("[data-preheader-close]");
  }

  connectedCallback() {
    window.addEventListener("scroll", this.handleWindowScroll.bind(this));
    this.setPreHeaderHeight();
    if (!sessionStorage.getItem("preheader-status")) {
      this.preheader.classList.add("ra-preheader--active");
      scrollBy(0, 1);
    }

    this.preheaderCloseButton.addEventListener("click", () => {
      this.preheader.classList.remove("ra-preheader--active");
      if (this.header) this.header.setHeaderPosition();
      document.documentElement.style.setProperty(
        "--countdown-margin-top",
        "0px"
      );
      sessionStorage.setItem("preheader-status", false);
      scrollBy(0, 1);
      window.dispatchEvent(
        new CustomEvent("closedPreheader", {
          detail: {
            track: true,
          },
        })
      );
    });
  }

  setPreHeaderHeight() {
    const preHeader = this.querySelector(".ra-preheader");
    const preHeaderHeight = preHeader?.clientHeight || 46;
    document.documentElement.style.setProperty(
      "--preheader-height",
      preHeaderHeight + "px"
    );
  }

  handleWindowScroll() {
    // MARK: pre header banner
    const globalEBanner = document.getElementById("FreeShippingBanner");
    if (window.scrollY >= 50) {
      if (globalEBanner) {
        globalEBanner.style.setProperty("height", "0px", "important");
        globalEBanner.style.setProperty("padding", "0px");
      }
      this.preheader.classList.remove("ra-preheader--active");
    } else {
      if (globalEBanner) {
        globalEBanner.style.setProperty("height", "46px", "important");
        globalEBanner.style.setProperty("padding", "4px");
      }
      if (!sessionStorage.getItem("preheader-status")) {
        this.preheader.classList.add("ra-preheader--active");
      }
    }
  }
}
