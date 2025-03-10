import { closeBuyBox } from "../utils/buy-box";
import { hideDarkIcons } from "../utils/toggleIcons.js";
export default class RaHeader extends HTMLElement {
  constructor() {
    super();
    this.stickyOffset = 50;
    this.isSearchOpen = false;
    this.headerPositionTop = "0px";
    this.childLinks = this.querySelectorAll(
      ".header__navigation-item--has-child"
    );
    this.hamburgers = document.querySelectorAll(".header__hamburger");
    this.headerSearch = document.querySelector(".header__search");
    this.mobileNav = document.querySelector(".header__mobile-navigation");
    this.searchResponse = document.querySelector("#SearchResponse");
    this.searchBarInput = document.querySelector(
      "#SearchBar .ra-input__control--text"
    );
    this.mobileNavBackDrop = document.querySelector(
      ".header__mobile-navigation__backdrop"
    );
    this.dropdownToggles = document.querySelectorAll("[data-toggle-dropdown]");
    this.drawerToggles = document.querySelectorAll("[data-toggle-drawer]");
    this.drawerCloseBtns = document.querySelectorAll("[data-close-drawer]");
    this.drawers = document.querySelectorAll(
      ".header__mobile-navigation-drawer"
    );
    this.dropdowns = document.querySelectorAll(
      ".header__mobile-navigation-dropdown"
    );
    this.searchIcon = document.querySelector("#header-action-search");
    this.checkpoint = document.querySelector(".checkpoint");
  }

  connectedCallback() {
    this.init();
    window.addEventListener("scroll", this.handleWindowScroll.bind(this));
  }

  init() {
    this.preventEmptyLinks();
    this.setHeaderPosition();
    this.toggleMegaMenu();
    this.handleMobileNav();
    this.handleMobileDrawer();
    this.handleMobileDropdowns();
    this.navBackDropHandler();
    this.setHeaderHeightVar();

    window.addEventListener("closedPreheader", () => {
      this.setHeaderPosition();
    });
  }

  preventEmptyLinks() {
    const links = this.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        link.getAttribute("href") == "#" ? e.preventDefault() : true;
      });
    });
  }

  navBackDropHandler() {
    this.mobileNavBackDrop?.addEventListener("click", this.closeNav.bind(this));
  }

  setHeaderPosition(reset = false) {
    const getHeader = document.querySelector(".header");
    const getPreHeader = document.querySelector(".ra-preheader");
    const getGlobale = document.getElementById("FreeShippingBanner");

    if (reset) {
      getHeader.classList.add("isSticky");
    } else {
      getHeader.classList.remove("isSticky");
    }

    if (reset) {
      this.headerPositionTop = "0px";
    } else if (getGlobale || window.CURRENCY_DATA.currencyCode != "USD") {
      this.headerPositionTop = "46px";
    } else if (getPreHeader) {
      setTimeout(() => {
        this.headerPositionTop = getPreHeader.clientHeight + "px";
      }, 100);
    }

    // set global CSS vars
    setTimeout(() => {
      this.style.setProperty("--header-position-top", this.headerPositionTop);
      document.documentElement.style.setProperty(
        "--header-height",
        this.clientHeight + "px"
      );
      document.documentElement.style.setProperty(
        "--content-position-top",
        parseInt(this.headerPositionTop) + this.clientHeight + "px"
      );
      document.documentElement.style.setProperty(
        "--search-min-height",
        getPreHeader + this.clientHeight + 100 + "px"
      );
      document.documentElement.style.setProperty(
        "--search-bottom-position",
        this.clientHeight + 100 + "px"
      );
    }, 100);
  }

  setHeaderHeightVar() {
    let height =
      document.querySelector(".header").getBoundingClientRect().bottom + 46;
    document.documentElement.style.setProperty(
      "--header-bottom-position",
      height + "px"
    );
  }

  handleWindowScroll() {
    if (window.scrollY >= 50) {
      this.setHeaderPosition(true);
    } else {
      this.setHeaderPosition();
    }
  }

  toggleMegaMenu() {
    this.childLinks.forEach((link) => {
      link.addEventListener("mouseover", () => {
        link
          .querySelector(".header__navigation-dropdown")
          .classList.add("active");
        link.classList.add("active");
      });

      link.addEventListener("mouseout", () => {
        link
          .querySelector(".header__navigation-dropdown")
          .classList.remove("active");
        link.classList.remove("active");
      });
    });
  }

  handleMobileNav() {
    this.hamburgers.forEach((hamburger) => {
      hamburger.addEventListener("click", (e) => {
        if (this.headerSearch.classList.contains("h-screen")) {
          this.headerSearch.classList.add("h-[0px]");
          this.headerSearch.classList.remove("h-screen", "md:h-[188px]");
          this.searchResponse.innerHTML = "";
          this.searchBarInput.value = "";
          window.isSearchVisible = true;
          hideDarkIcons();
        }
        document.body.classList.toggle("overflow-hidden");
        this.mobileNav?.classList.toggle("active");
        closeBuyBox();
        e.preventDefault();
      });
    });
  }

  closeNav() {
    document.body.classList.toggle("overflow-hidden");
    this.mobileNav?.classList.toggle("active");
  }

  handleMobileDrawer() {
    if (!this.drawerToggles) return;

    // open drawers
    this.drawerToggles.forEach((btn) => {
      const btnToggleId = btn.getAttribute("data-toggle-drawer");
      const btnText = btn.getAttribute("title");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.drawers.forEach((drawer) => {
          drawer.classList.remove("active");
        });
        const selectedDropdown = document.getElementById(btnToggleId);
        selectedDropdown.querySelector(
          ".header__mobile-navigation-drawer-title"
        ).innerHTML = btnText;
        selectedDropdown.classList.add("active");
      });
    });
    // close drawers
    this.drawerCloseBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.drawers.forEach((drawer) => {
          drawer.classList.remove("active");
        });
      });
    });
  }

  handleMobileDropdowns() {
    this.dropdownToggles.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const isActive = btn.classList.contains("active");
        this.dropdowns.forEach((dropdown) => {
          dropdown.classList.remove("active");
          dropdown.style.setProperty("--dropdown-height", "0px");
        });
        this.querySelectorAll("[data-toggle-dropdown]").forEach(
          (dropdownLink) => {
            dropdownLink.classList.remove("active");
          }
        );

        if (!isActive) {
          const toggleId = btn.getAttribute("data-toggle-dropdown");
          btn.classList.toggle("active");
          const selectedDropdown = document.getElementById(toggleId);
          const dropdownHeight = selectedDropdown.querySelector(
            "[data-header-inner-mobile]"
          ).offsetHeight;
          selectedDropdown.style.setProperty(
            "--dropdown-height",
            dropdownHeight + "px"
          );
          document.getElementById(toggleId).classList.toggle("active");
        }
      });
    });
  }
}
