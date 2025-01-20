class CustomerAccount extends HTMLElement {
  constructor() {
    super()

    this.birthdayForm = this.querySelector('#account-birthday-form');
    this.countrySelects = this.querySelectorAll('[data-address-country-select]');
    this.addressesForm = this.querySelectorAll('.address-update-form');
    this.customSelectCountryInputs = this.querySelectorAll('.address-form__country-input');
    this.navButton = this.querySelectorAll('.account-nav__item-button[aria-controls]');

    this.selectors = {
      orderPaginationButton: 'js-orders-pagination-button',
      accountDeleteAddress: 'js-delete-address',
      editAddresses: 'js-edit-address',
      deleteAddresses: 'js-delete-address',
      openerBlockButton: 'js-opener-block',
      navButton: 'js-nav-button',
      editNameSubmitButton: 'js-edit-name-submit',
      editBirthSubmitButton: 'js-edit-birth-submit',
    }

    this.eventListeners()
    this.setupCountries();
    this.setCustomCountrySelect();
    this.checkUrlHash();
    this.setSelectState();
  }

  eventListeners() {
    if (this.birthdayForm) this.birthdayForm.addEventListener('change', this.birthdayFormChange.bind(this));
    this.addressesForm.forEach(elem => {elem.addEventListener('submit', this.updateAddress.bind(this))});
    this.customSelectCountryInputs.forEach(elem => {elem.addEventListener('change', this.setCustomProvinceSelect.bind(this))});
    window.addEventListener('resize', this.setSelectState.bind(this))

    this.addEventListener('click', (e) => {
      const target = e.target;

      // Order Pagination
      if (target.classList.contains(this.selectors.orderPaginationButton)) {
        this.updateOrdersPage(e)
      }

      // Opener block
      if (target.classList.contains(this.selectors.openerBlockButton)) {
        this.showHideBlock(e);
      }

      // Edit address
      if (target.classList.contains(this.selectors.editAddresses)) {
        this.showHideAddress(e);
      }

      // Delete address
      if (target.classList.contains(this.selectors.deleteAddresses)) {
        const url = target.closest('.account-addresses__delete').dataset.target;
        const message = target.closest('.account-addresses__delete').dataset.confirm_message;
        this.deleteAddress(url, message);
      }

      // Account navigation
      if (target.classList.contains(this.selectors.navButton)) {
        e.preventDefault();
        if (e.target.getAttribute('aria-expanded') === 'false') {
          const activeBtns = this.querySelectorAll(`.account-nav__item-button[aria-controls="${e.target.getAttribute('aria-controls')}"]`)
          this.setActiveAccountTab(e.target.getAttribute('aria-controls'), activeBtns)
        }
      }

      // Account edit name form submit
      if (target.classList.contains(this.selectors.editNameSubmitButton)) {
        target.classList.add('disabled');
        const form = e.target.closest('form');
        this.updateData('#' + form.getAttribute('id'));

        window.dataLayer.push({
          'event': 'form_complete',
          'form': {
            'form_name': form.getAttribute('data-form-name'),
          }
        })
      }

      // Account edit birthday form submit
      if (target.classList.contains(this.selectors.editBirthSubmitButton)) {
        const form_error = target.closest('form').querySelector('.form-error');
        if (this.allDateValueValidated) {
          target.classList.add('disabled');
          const form = e.target.closest('form');
          this.updateData('#' + form.getAttribute('id'));
        } else {
          e.preventDefault();
          form_error.classList.remove('hidden');
        }
      }
    })
  }

  setSelectState() {
    const customSelectInputs = this.querySelectorAll('[data-custom-select-input]');
    const originalSelects = this.querySelectorAll('[data-original-select]');

    if (window.matchMedia('(max-width: 768px)').matches) {
      customSelectInputs.forEach(elem => this.disableSelect(elem))
      originalSelects.forEach(elem => this.enableSelect(elem))
    } else {
      originalSelects.forEach(elem => this.disableSelect(elem))
      customSelectInputs.forEach(elem => this.enableSelect(elem))
    }
  }

  disableSelect(el) {
    el.setAttribute('disabled', 'disabled')
    el.removeAttribute('required')
  }

  enableSelect(el) {
    el.removeAttribute('disabled')
    el.setAttribute('required', '')
  }

  deleteAddress(url, message) {
    const config = {type: 'POST', method: 'delete'};

    if (window.confirm(message)) {
      fetch(url, config)
        .finally(() => {
          this.getContent();
        });
    }
  }

  updateData(formId) {
    const _self = this;

    Accentuate($(formId), function (data) {
      if (data.status == 'OK') {
        _self.getContent();
      } else {
        console.log(data.errors);
      }
    })
  }

  getContent() {
    const fetchTarget = '/account';
    const config = { method: 'GET'};

    fetch(fetchTarget, config)
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        const html = new DOMParser().parseFromString(data, 'text/html');
        history.pushState("", document.title, window.location.pathname);
        this.parentElement.innerHTML = html.querySelector(".main-account ").innerHTML;
      })
      .catch((error) => {
        console.error('Error:', error);
      })
  }

  birthdayFormChange() {
    this.allDateValueValidated = false;
    const submitBtn = this.birthdayForm.querySelector('button[type="submit"]');
    const hiddenInput = this.birthdayForm.querySelector('#birthday_input')
    const dateYear = this.birthdayForm.querySelector('input[name="birthday_year"]').value || this.birthdayForm.querySelector('select[name="birthday_year"]').value;
    const dateMonth = this.birthdayForm.querySelector('input[name="birthday_month"]').value || this.birthdayForm.querySelector('select[name="birthday_month"]').value;
    const dateDay = this.birthdayForm.querySelector('input[name="birthday_day"]').value || this.birthdayForm.querySelector('select[name="birthday_day"]').value;

    if (dateYear !== '' && dateMonth !== '' && dateDay !== '') {
      hiddenInput.value = dateMonth + '/' + dateDay + '/' + dateYear
      submitBtn.removeAttribute('disabled');
      submitBtn.classList.remove('disabled');
      if (this.isValidDate(dateYear, dateMonth, dateDay)) this.allDateValueValidated = true;
    }
  }

  isValidDate(Y, M, D) {
    const d = new Date(Y, --M, D);
    return Y == d.getFullYear() && M == d.getMonth() && D == d.getDate();
  }

  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {

      new Shopify.CountryProvinceSelector('address-country-new', 'address-province-new', {
        hideElement: 'address-province-new'
      });

      this.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;

        new Shopify.CountryProvinceSelector(`address-country-${formId}`, `address-province-${formId}`, {
          hideElement: `address-province-${formId}`
        });
      });
    }
  }

  showHideBlock(e) {
    const elementToShow = document.getElementById(e.target.getAttribute('data-element-open'));
    const elementToHide = document.getElementById(e.target.getAttribute('data-element-hide'));

    if (elementToShow) {
      elementToShow.classList.remove('hidden');
      elementToHide.classList.add('hidden');
    }
  }

  showHideAddress(e) {
    const allAddressFrom = this.querySelectorAll('.address-edit-form');
    const addressForm = this.querySelector(`#address_form_${e.target.dataset.addressId}`);

    window.scrollTo(0,0);
    allAddressFrom.forEach(elem => {
      if (elem !== addressForm) {elem.classList.add('hidden')}
    })
    if (addressForm) addressForm.classList.remove('hidden');
  }

  updateAddress(e) {
    e.preventDefault()
    const form = e.target.closest('form');
    const formBtn = form.querySelector('button[type="submit"]')
    const formData = new FormData(form);
    const config = {method: 'POST', body: formData};
    const url = formBtn.getAttribute('data-target') || '/account/addresses';

    formBtn.classList.add('disabled');

    fetch(url, config)
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        this.getContent();

        window.dataLayer.push({
          'event': 'form_complete',
          'form': {
            'form_name': form.getAttribute('data-form-name'),
          }
        })
      });
  }

  setCustomCountrySelect() {
    const customSelects = this.querySelectorAll('.address-custom-select');

    customSelects.forEach((elem => {
      const value = elem.querySelector('.form__input-hidden').value;
      setTimeout(() => {
        elem.querySelector(`[data-option-value="${value}"]`).click();
      }, 0)
    }))
  }

  setCustomProvinceSelect(e) {
    const customProvinceSelect = this.querySelector(e.target.getAttribute('data-select-province'));
    const dataProvinces = e.target.closest('custom-select').querySelector(`[data-option-value="${e.target.value}"]`).getAttribute('data-provinces');
    const provincesArray = JSON.parse(dataProvinces);
    const customProvinceSelectList = customProvinceSelect.querySelector('.form-select__dropdown');

    if (provincesArray.length) {
      customProvinceSelectList.innerHTML = '';
      for (let i = 0; i < provincesArray.length; i++) {
        const option = `<li class="form-select__dropdown-option a" aria-selected="false">
                          <button type="button" class="btn--reset form-select__dropdown-button body3" data-option-value="${provincesArray[i][1]}">
                            ${provincesArray[i][1]}
                          </button>
                        </li>`
        customProvinceSelectList.insertAdjacentHTML('beforeend', option)
      }
      customProvinceSelect.classList.remove('hidden');

      const customProvinceSelectElem = customProvinceSelect.querySelector('custom-select');
      const provinceValue = customProvinceSelectElem.querySelector('.form__input-hidden').getAttribute('data-default');
      customProvinceSelectElem.initOptions();

      // set custom province select value
      provinceValue ? customProvinceSelectElem.querySelector(`[data-option-value="${provinceValue}"]`)?.click()
                    : customProvinceSelectElem.querySelector('.form-select__dropdown-button').click();
      customProvinceSelectElem.querySelector('.form__input-hidden').setAttribute('data-default', '');
    } else {
      customProvinceSelect.classList.add('hidden');
    }
  }

  setActiveAccountTab(targetId = null, activeBtns) {
    const target = this.querySelector('#' + targetId);
    if (!target) return
    const accountBlock = this.querySelectorAll('.account-block');
    accountBlock.forEach(elem => {elem.classList.add('hidden')});
    target.classList.remove('hidden');
    this.navButton.forEach(elem => {elem.setAttribute('aria-expanded', 'false')});

    activeBtns.forEach(elem => {
      if (elem.classList.contains('form-select__dropdown-button')) {
        setTimeout(() => {elem.click();}, 0) // trigger click on custom select mobile nav
      }
      elem.setAttribute('aria-expanded', 'true')
    })
    history.pushState({}, "",   '#' + targetId);
  }

  checkUrlHash() {
    if (!window.location.hash) return
    setTimeout(function() {window.scrollTo(0, 0)}, 1);
    const targetId = window.location.hash.slice(1);
    const activeBtns = this.querySelectorAll(`.account-nav__item-button[aria-controls="${targetId}"]`)
    this.setActiveAccountTab(targetId, activeBtns);
  }

  updateOrdersPage(e) {
    e.preventDefault();
    const ordersContainer = this.querySelector('#account-orders');
    const nextPageUrl =  e.target.getAttribute('href');
    const config = { method: 'GET'};

    fetch(nextPageUrl, config)
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        ordersContainer.innerHTML = new DOMParser().parseFromString(data, 'text/html').querySelector('#account-orders').innerHTML;
      })
      .catch((error) => {
        console.error('Error:', error);
      })

  }
}

customElements.define('customer-account', CustomerAccount);

