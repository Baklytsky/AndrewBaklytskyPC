(function () {
  'use strict';

  if (!customElements.get('addresses-component')) {
    customElements.define(
      'addresses-component',
      class AddressesComponent extends HTMLElement {
        constructor() {
          super();

          this.addressNewForm = this.querySelector('#AddressNewForm');
        }

        connectedCallback() {
          if (!this.addressNewForm) return;

          this.customerAddresses();

          this.querySelectorAll('.address-new-toggle')?.forEach((btnNew) => {
            btnNew.addEventListener('click', () => {
              this.addressNewForm.classList.toggle('hidden');
            });
          });

          this.querySelectorAll('.address-edit-toggle').forEach((btnEdit) => {
            btnEdit.addEventListener('click', () => {
              const formId = btnEdit.getAttribute('data-form-id');
              this.querySelector(`#EditAddress_${formId}`).classList.toggle('hidden');
            });
          });

          this.querySelectorAll('.address-delete')?.forEach((btnDelete) => {
            btnDelete.addEventListener('click', () => {
              const formId = btnDelete.getAttribute('data-form-id');
              const confirmMessage = btnDelete.getAttribute('data-confirm-message');
              if (confirm(confirmMessage)) {
                Shopify.postLink(window.theme.routes.addresses_url + '/' + formId, {parameters: {_method: 'delete'}});
              }
            });
          });
        }

        customerAddresses() {
          // Initialize observers on address selectors, defined in shopify_common.js
          if (Shopify.CountryProvinceSelector) {
            new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
              hideElement: 'AddressProvinceContainerNew',
            });
          }

          // Initialize each edit form's country/province selector
          const countryOptions = this.querySelectorAll('.address-country-option');
          countryOptions.forEach((element) => {
            const formId = element.getAttribute('data-form-id');
            const countrySelector = `AddressCountry_${formId}`;
            const provinceSelector = `AddressProvince_${formId}`;
            const containerSelector = `AddressProvinceContainer_${formId}`;

            new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
              hideElement: containerSelector,
            });
          });
        }
      }
    );
  }

})();
//# sourceMappingURL=customer-addresses.js.map
