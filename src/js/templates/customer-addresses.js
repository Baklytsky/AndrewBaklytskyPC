const selectors = {
  templateAddresses: '.template-customers-addresses',
  accountForm: '[data-form]',
  addressNewForm: '[data-form-new]',
  btnNew: '[data-button-new]',
  btnEdit: '[data-button-edit]',
  btnDelete: '[data-button-delete]',
  btnCancel: '[data-button-cancel]',
  editAddress: 'data-form-edit',
  addressCountryNew: 'AddressCountryNew',
  addressProvinceNew: 'AddressProvinceNew',
  addressProvinceContainerNew: 'AddressProvinceContainerNew',
  addressCountryOption: '[data-country-option]',
  addressCountry: 'AddressCountry',
  addressProvince: 'AddressProvince',
  addressProvinceContainer: 'AddressProvinceContainer',
  requiredInputs: 'input[type="text"]:not(.optional)',
};

const attributes = {
  dataFormId: 'data-form-id',
};

const classes = {
  hidden: 'is-hidden',
  validation: 'validation--showup',
};

class Addresses {
  constructor(section) {
    this.section = section;
    this.addressNewForm = this.section.querySelector(selectors.addressNewForm);
    this.accountForms = this.section.querySelectorAll(selectors.accountForm);

    this.init();
    this.validate();
  }

  init() {
    if (this.addressNewForm) {
      const section = this.section;
      const newAddressForm = this.addressNewForm;
      this.customerAddresses();

      const newButtons = section.querySelectorAll(selectors.btnNew);
      if (newButtons.length) {
        newButtons.forEach((button) => {
          button.addEventListener('click', function (e) {
            e.preventDefault();
            button.classList.add(classes.hidden);
            newAddressForm.classList.remove(classes.hidden);
          });
        });
      }

      const editButtons = section.querySelectorAll(selectors.btnEdit);
      if (editButtons.length) {
        editButtons.forEach((button) => {
          button.addEventListener('click', function (e) {
            e.preventDefault();
            const formId = this.getAttribute(attributes.dataFormId);
            section.querySelector(`[${selectors.editAddress}="${formId}"]`).classList.toggle(classes.hidden);
          });
        });
      }

      const deleteButtons = section.querySelectorAll(selectors.btnDelete);
      if (deleteButtons.length) {
        deleteButtons.forEach((button) => {
          button.addEventListener('click', function (e) {
            e.preventDefault();
            const formId = this.getAttribute(attributes.dataFormId);
            if (confirm(theme.strings.delete_confirm)) {
              Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
            }
          });
        });
      }

      const cancelButtons = section.querySelectorAll(selectors.btnCancel);
      if (cancelButtons.length) {
        cancelButtons.forEach((button) => {
          button.addEventListener('click', function (e) {
            e.preventDefault();
            this.closest(selectors.accountForm).classList.add(classes.hidden);
            document.querySelector(selectors.btnNew).classList.remove(classes.hidden);
          });
        });
      }
    }
  }

  customerAddresses() {
    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector(selectors.addressCountryNew, selectors.addressProvinceNew, {
        hideElement: selectors.addressProvinceContainerNew,
      });
    }

    // Initialize each edit form's country/province selector
    const countryOptions = this.section.querySelectorAll(selectors.addressCountryOption);
    countryOptions.forEach((element) => {
      const formId = element.getAttribute(attributes.dataFormId);
      const countrySelector = `${selectors.addressCountry}_${formId}`;
      const provinceSelector = `${selectors.addressProvince}_${formId}`;
      const containerSelector = `${selectors.addressProvinceContainer}_${formId}`;

      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector,
      });
    });
  }

  validate() {
    this.accountForms.forEach((accountForm) => {
      const form = accountForm.querySelector('form');
      const inputs = form.querySelectorAll(selectors.requiredInputs);

      form.addEventListener('submit', (event) => {
        let isEmpty = false;

        // Display notification if input is empty
        inputs.forEach((input) => {
          if (!input.value) {
            input.nextElementSibling.classList.add(classes.validation);
            isEmpty = true;
          } else {
            input.nextElementSibling.classList.remove(classes.validation);
          }
        });

        if (isEmpty) {
          event.preventDefault();
        }
      });
    });
  }
}

const template = document.querySelector(selectors.templateAddresses);
if (template) {
  new Addresses(template);
}
