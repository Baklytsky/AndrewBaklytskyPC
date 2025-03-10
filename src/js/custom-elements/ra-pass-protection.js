export default class PasswordBlock extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.passBlock = this.closest("[data-ra-pass-wrapper]");
    this.pageURL = window.location.href;
    this.collectionHandle = this.dataset.raCollection || null;
    this.passForm = this.querySelector("form");
    this.passField = this.passForm.querySelector("#ra-pass");
    this.passToggleBtn = this.querySelector(".pass-toggle");
    this.messageBlock = this.querySelector(".message-block");

    this.savedPasswords =
      JSON.parse(localStorage.getItem("saved_passwords")) || [];

    this.passData = this.querySelector("[data-ra-pass]")
      ? JSON.parse(this.querySelector("[data-ra-pass]").textContent)
      : null;

    if (!this.passData || !this.passForm || !this.passBlock) {
      this.showContent();
      return;
    }

    this.checkAccess() ? this.showContent() : this.hideContent();
    this.loading(false);

    this.passToggleBtn.addEventListener("click", () => this.passToggle());

    this.passField.addEventListener("input", () => {
      this.messageBlock?.classList.add("hidden");
    });

    this.passForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.loading(true);
      const pass = e.target.pass.value;
      this.passValidation(pass);
      this.loading(false);
    });
  }

  loading(state) {
    state
      ? this.passBlock.classList.add("loading")
      : this.passBlock.classList.remove("loading");
  }

  passToggle() {
    if (!this.passField) return;
    if (this.passField.type === "password") {
      this.passField.type = "text";
      this.passToggleBtn.textContent = "Hide";
      return;
    }
    this.passField.type = "password";
    this.passToggleBtn.textContent = "Show";
  }

  checkAccess() {
    if (!this.savedPasswords) {
      return false;
    }

    if (this.collectionHandle) {
      return this.savedPasswords.some(
        (condition) =>
          condition.handle === this.passData[0].handle &&
          condition.hash === this.passData[0].hash
      );
    }

    return this.savedPasswords.some((savedCondition) =>
      this.passData.find(
        (currentCondition) =>
          savedCondition.handle === currentCondition.handle &&
          savedCondition.hash === currentCondition.hash
      )
    );
  }

  passValidation(pass) {
    this.generatePassHash(pass).then((hash) => {
      this.passCondition = this.getPassCondition(hash);

      if (this.passCondition) {
        this.savePass();
        window.location.href = this.pageURL;
        return;
      }

      this.showMessageBlock();
    });
  }

  hideContent() {
    const main = document.body.querySelector("main#main-content");
    Array.from(main.children).forEach((child) => {
      if (child !== this.passBlock) {
        main.removeChild(child);
      }
    });
  }

  showContent() {
    this.passBlock.remove();
    document.body.removeAttribute("data-password-protection");
  }

  showMessageBlock() {
    if (!this.messageBlock) return;
    this.messageBlock.classList.remove("hidden");
    setTimeout(() => {
      this.messageBlock.classList.add("hidden");
    }, 5000);
  }

  async generatePassHash(pass) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  getPassCondition(hash) {
    if (!hash) return false;

    if (this.collectionHandle) {
      return this.passData.find(
        (item) => item.handle === this.collectionHandle && item.hash === hash
      );
    }

    return this.passData.find((item) => item.hash === hash);
  }

  savePass() {
    if (!this.passCondition) return;

    let savedPasswords = this.savedPasswords;

    if (savedPasswords.length) {
      savedPasswords = savedPasswords.filter(
        (condition) => condition.handle !== this.passCondition.handle
      );
    }

    savedPasswords.push(this.passCondition);
    localStorage.setItem("saved_passwords", JSON.stringify(savedPasswords));
  }
}
