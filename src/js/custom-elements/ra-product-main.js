import { debounce } from "../utils/helpers";

const mobileBuyBox = document.getElementById("product-buy-box-child");
const footer = document.getElementById("shopify-section-footer");
const footerClone = footer.cloneNode(true);
const location = window.location.href;
footerClone.classList.add("footer-clone");
footerClone.querySelector(".footer").style.border = "none";

const observer = new MutationObserver((mutationsList, observer) => {
  const targetElement = document.querySelector(".locale-selectors__container");
  if (
    targetElement &&
    window.innerWidth < 1024 &&
    location.includes("products")
  ) {
    footerClone.appendChild(targetElement);
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

const adjustPDPLayout = () => {
  if (window.innerWidth < 1024) {
    window.scrollTo(0, 0);
    document.body.classList.add("overflow-hidden");
  }

  window.addEventListener(
    "resize",
    debounce(() => {
      const countrySelector = document.querySelector(
        ".locale-selectors__container"
      );
      if (window.innerWidth < 1024) {
        window.scrollTo(0, 0);
        document.body.classList.add("overflow-hidden");
        document.body.classList.add("fixed");
        mobileBuyBox.appendChild(footerClone);
        if (countrySelector && location.includes("products")) {
          footerClone.appendChild(countrySelector);
        }
      } else {
        document.body.classList.remove("overflow-hidden");
        document.body.classList.remove("fixed");
        if (mobileBuyBox.querySelector("#shopify-section-footer")) {
          mobileBuyBox.removeChild(footerClone);
        }
        if (countrySelector && location.includes("products")) {
          document.body.appendChild(countrySelector);
        }
      }
    })
  );
};

const passwordProtectedPage = document.body.hasAttribute(
  "data-password-protection"
);

if (window.location.pathname.includes("products") && !passwordProtectedPage) {
  adjustPDPLayout();
}
