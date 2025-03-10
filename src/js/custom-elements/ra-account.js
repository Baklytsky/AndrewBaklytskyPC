import { validateForm } from "../utils/account-utils.js";

export default class RaAccount extends HTMLElement {
  super() {
    this.accountForms = [];
  }

  connectedCallback() {
    this.accountForms = this.querySelectorAll("form");
    Array.from(this.accountForms)?.forEach((form) => {
      form.addEventListener("submit", validateForm.bind(this));
    });
  }
}
