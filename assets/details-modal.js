class DetailsModal extends HTMLElement {
  constructor() {
    super();
    this.detailsContainer = this.querySelector('details');
    this.summaryToggle = this.querySelector('summary');
    this.modalOverlay = document.querySelector("#ModalOverlay");

    this.detailsContainer.addEventListener(
      'keyup',
      (event) => event.code.toUpperCase() === 'ESCAPE' && this.close()
    );
    this.summaryToggle.addEventListener(
      'click',
      this.onSummaryClick.bind(this)
    );
    this.querySelector('button[type="button"]').addEventListener(
      'click',
      this.close.bind(this)
    );

    this.summaryToggle.setAttribute('role', 'button');
  }

  isOpen() {
    return this.detailsContainer.hasAttribute('open');
  }

  onSummaryClick(event) {
    event.preventDefault();
    event.target.closest('details').hasAttribute('open')
      ? this.close()
      : this.open(event);
  }

  onBodyClick(event) {
    if (!this.contains(event.target) || event.target.classList.contains('modal-overlay')) this.close(false);
  }

  open(event) {
    if (this.modalOverlay.getAttribute('aria-hidden') === 'true') {
      this.modalOverlay.setAttribute('aria-hidden', 'false');
    }
    modalOverlay.style.zIndex = 4;
    this.onBodyClickEvent =
      this.onBodyClickEvent || this.onBodyClick.bind(this);
    event.target.closest('details').setAttribute('open', true);
    document.body.addEventListener('click', this.onBodyClickEvent);
    const bodyClass = window.isIosDevice ? 'overflow-hidden-ios' : 'overflow-hidden'
    document.body.classList.add(bodyClass);
    document.body.classList.add('overflow-hidden');

    trapFocus(
      this.detailsContainer.querySelector('[tabindex="-1"]'),
      this.detailsContainer.querySelector('input:not([type="hidden"])')
    );
  }

  close(focusToggle = true) {
    if (this.modalOverlay.getAttribute('aria-hidden') === 'false') {
      this.modalOverlay.setAttribute('aria-hidden', 'true');
    }
    // modalOverlay.setAttribute('aria-hidden', 'true');
    modalOverlay.style.zIndex = 6;
    removeTrapFocus(focusToggle ? this.summaryToggle : null);
    this.detailsContainer.removeAttribute('open');
    document.body.removeEventListener('click', this.onBodyClickEvent);
    document.body.classList.remove('overflow-hidden');
    const bodyClass = window.isIosDevice ? 'overflow-hidden-ios' : 'overflow-hidden'
    document.body.classList.remove(bodyClass);
    // document.body.classList.remove('overflow-hidden');
  }
}

customElements.define('details-modal', DetailsModal);

