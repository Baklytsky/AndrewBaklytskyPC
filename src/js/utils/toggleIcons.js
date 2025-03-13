const hamburgerIcon = document.querySelector(".hamburger-icon");
const hamburgerIconDark = document.querySelector(".hamburger-icon-dark");
const searchIcon = document.querySelector(".search-icon");
const searchIconDark = document.querySelector(".search-icon-dark");
const cartIcon = document.querySelector(".cart-icon");
const cartIconDark = document.querySelector(".cart-icon-dark");
const logoIcon = document.querySelector(".logo-icon");
const logoIconDark = document.querySelector(".logo-icon-dark");

const showDarkIcons = () => {
  hamburgerIcon?.classList.add("hidden");
  hamburgerIconDark?.classList.remove("hidden");
  searchIcon?.classList.add("hidden");
  searchIconDark?.classList.remove("hidden");
  cartIcon?.classList.add("hidden");
  cartIconDark?.classList.remove("hidden");
  logoIcon?.classList.add("hidden");
  logoIconDark?.classList.remove("hidden");
};

const hideDarkIcons = () => {
  if (!window.location.pathname.includes("search")) {
    hamburgerIcon?.classList.remove("hidden");
    hamburgerIconDark?.classList.add("hidden");
    searchIcon?.classList.remove("hidden");
    searchIconDark?.classList.add("hidden");
    cartIcon?.classList.remove("hidden");
    cartIconDark?.classList.add("hidden");
    logoIcon?.classList.remove("hidden");
    logoIconDark?.classList.add("hidden");
  }
};

export { showDarkIcons, hideDarkIcons };
