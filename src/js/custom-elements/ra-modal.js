import dialogPolyfill from "dialog-polyfill";

export default class RaModal extends HTMLElement {
  constructor() {
    super();
    this.modalToggleButtons = document.querySelectorAll(
      `[id*='${this.getAttribute("dialog-id")}']`
    );
    this.dialog = this.querySelector("dialog");
    this.modalCloseButton = this.querySelector("[data-modal-close]");
    this.modalCloseButtons = this.querySelectorAll("[data-modal-close]");
  }

  connectedCallback() {
    dialogPolyfill.registerDialog(this.dialog);
    if (this.modalToggleButtons?.length) {
      this.modalToggleButtons.forEach((modalToggleBtn) => {
        modalToggleBtn.addEventListener("click", () => {
          const buttonId = modalToggleBtn.getAttribute("id");
          if (!buttonId) return;
          this.toggleModal();
        });
      });
    }

    this.dialog.addEventListener("click", (e) => {
      if (
        e.target.tagName.toLowerCase() == "dialog" ||
        e.target.classList.contains("ra-overlay") // This was added from the theme base to close the modal when clicking on the overlay
      ) {
        this.dialog.close();
      }
    });

    if (this.modalCloseButtons.length > 0) {
      this.modalCloseButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.dialog.close();
        });
      });
    }
  }

  toggleModal = () => {
    if (this.dialog === null || this.dialog === undefined) return;
    this.dialog.showModal();

    //-- Fix a the modal from flashing on PDP Scroll to top of size guide when modal is opened
    setTimeout(() => {
      const sizeGuideEl = document.querySelector(".size-guide-modal");
      if (sizeGuideEl) {
        sizeGuideEl.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }
    }, 100);
  };
}
