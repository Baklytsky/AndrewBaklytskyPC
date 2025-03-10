export default class RaNotification extends HTMLElement {
  constructor() {
    super();
    this.btn = this.querySelector(".ra-notification__close");
  }

  connectedCallback() {
    this.btn.addEventListener("click", () => this.closeNotification());
  }

  closeNotification() {
    this.remove();
  }
}
