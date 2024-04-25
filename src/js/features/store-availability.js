import {Modals} from './modals';

const selectors = {
  body: 'body',
  storeAvailabilityModal: '[data-store-availability-modal]',
  storeAvailabilityModalOpen: '[data-store-availability-modal-open]',
  storeAvailabilityModalClose: '[data-store-availability-modal-close]',
  storeAvailabilityModalProductTitle: '[data-store-availability-modal-product__title]',
};

const classes = {
  openClass: 'store-availabilities-modal--active',
};

class StoreAvailability {
  constructor(container) {
    this.container = container;
  }

  updateContent(variantId, productTitle) {
    this._fetchStoreAvailabilities(variantId, productTitle);
  }

  clearContent() {
    this.container.innerHTML = '';
  }

  _initModal() {
    return new Modals('StoreAvailabilityModal', {
      close: selectors.storeAvailabilityModalClose,
      open: selectors.storeAvailabilityModalOpen,
      closeModalOnClick: true,
      openClass: classes.openClass,
      scrollIntoView: false,
    });
  }

  _fetchStoreAvailabilities(variantId, productTitle) {
    const variantSectionUrl = '/variants/' + variantId + '/?section_id=store-availability';
    this.clearContent();

    const self = this;
    fetch(variantSectionUrl)
      .then(function (response) {
        return response.text();
      })
      .then(function (storeAvailabilityHTML) {
        const body = document.querySelector(selectors.body);
        let storeAvailabilityModal = body.querySelector(selectors.storeAvailabilityModal);
        if (storeAvailabilityModal) {
          storeAvailabilityModal.remove();
        }

        self.container.innerHTML = storeAvailabilityHTML;
        self.container.innerHTML = self.container.firstElementChild.innerHTML;

        if (self.container.firstElementChild.innerHTML.trim() === '') {
          self.clearContent();
          return;
        }

        const storeAvailabilityModalOpen = self.container.querySelector(selectors.storeAvailabilityModalOpen);
        // Only create modal if open modal element exists
        if (!storeAvailabilityModalOpen) {
          return;
        }

        self.modal = self._initModal();
        self._updateProductTitle(productTitle);

        storeAvailabilityModal = self.container.querySelector(selectors.storeAvailabilityModal);
        if (storeAvailabilityModal) {
          body.appendChild(storeAvailabilityModal);
        }
      });
  }

  _updateProductTitle(productTitle) {
    const storeAvailabilityModalProductTitle = this.container.querySelector(selectors.storeAvailabilityModalProductTitle);
    storeAvailabilityModalProductTitle.textContent = productTitle;
  }
}

export {StoreAvailability};
