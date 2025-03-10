import { closeBuyBox } from "../utils/buy-box";
import { hideDarkIcons } from "../utils/toggleIcons.js";
export default class RaCartToggle extends HTMLElement {
  super() {}

  connectedCallback() {
    window.isSearchVisible = false;
    this.toggleButton = this.querySelector("[data-toggle-cart]");
    this.toggleButton.addEventListener("click", this.cartClick);
  }

  cartClick(e) {
    e.preventDefault();
    closeBuyBox();
    const navMenu = document.querySelector(".header__mobile-navigation");
    const searchPanel = document.querySelector(".header__search");
    this.searchResponse = document.querySelector("#SearchResponse");
    this.searchBarInput = document.querySelector(
      "#SearchBar .ra-input__control--text"
    );

    if (window.location.pathname !== "/cart") {
      window.dispatchEvent(
        new CustomEvent("toggleCart", {
          detail: {
            track: true,
          },
        })
      );

      // Close Menu
      if (navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        document.body.classList.toggle("overflow-hidden");
      }

      // Close Search
      if (searchPanel.classList.contains("h-screen")) {
        document.body.classList.toggle("overflow-hidden");
        this.searchResponse.innerHTML = "";
        this.searchBarInput.value = "";
        searchPanel.classList.add("h-[0px]");
        searchPanel.classList.remove("h-screen", "md:h-[188px]");
        hideDarkIcons();
        window.isSearchVisible = true;
      }
    }
    e.preventDefault();
  }
}
