import { validateForm } from "../utils/account-utils.js";

export default class RaAccountAuth extends HTMLElement {
  constructor() {
    super();
    this.accountToggles = this.querySelectorAll("[data-toggle-account]");
    this.accountForms = this.querySelectorAll("form");
    this.passwordResetText = this.querySelector(
      "[data-password-reset-success]"
    );
  }

  connectedCallback() {
    this.accountToggles.forEach((toggle) => {
      toggle.addEventListener("click", this.accountModalToggle.bind(this));
    });
    this.accountForms.forEach((form) => {
      const button = form.querySelector("button");
      button.addEventListener("click", validateForm.bind(this));
    });
    if (
      localStorage.getItem("RA_PW_RESET_NOTIFICATION") &&
      !window.location.pathname.includes("/challenge")
    ) {
      this.passwordResetText.classList.remove("hidden");
      localStorage.removeItem("RA_PW_RESET_NOTIFICATION");
    }
  }

  accountModalToggle(e) {
    e.preventDefault();
    Array.from(this.children).forEach((c) => {
      if (c.dataset.accountContainer === e.target.dataset.toggleAccount) {
        c.classList.remove("hidden");
      } else {
        c.classList.add("hidden");
      }
    });
  }
}
