class RefersionFrom extends HTMLElement {
  constructor() {
    super()
    this.form = this.querySelector('form');
    this.inputsRequired = this.form.querySelectorAll('[required]');
    this.formSubmitBtn = this.querySelector('[type="submit"]');
    this.emailInput = this.form.querySelector('input[type="email"]');
    this.passwordInput = this.form.querySelector('input[type="password"][data-password]');
    this.confirmPasswordInput = this.form.querySelector('input[type="password"][data-confirm-password]');
    this.selects = this.form.querySelectorAll('custom-select');
    this.countryCustomSelect = this.querySelector('.address-custom-select');
    this.customSelectCountryInput = this.querySelector('.address-form__country-input');
    this.provinceSelect = this.querySelector('#address-form-custom-province-new');
    this.formFields = this.form.querySelectorAll('input, select');
    this.supportedCountries = this.getSupportedCountries();
    this.usStates = this.getUSState();
    this.fieldsWithRegex = this.form.querySelectorAll('[data-regex]');
    this.fieldsWithPrefix = this.form.querySelectorAll('[data-prefix]');

    this.eventListeners();
    this.setSelectState();
    this.setupCountries();
    if (this.countryCustomSelect) this.setCustomCountrySelect();
  }

  eventListeners() {
    this.form.addEventListener('submit', this.onSubmitForm.bind(this));
    window.addEventListener('resize', this.setSelectState.bind(this));
    if (this.provinceSelect) {
      this.customSelectCountryInput.addEventListener('change', this.setCustomProvinceSelect.bind(this))
    }

    this.form.addEventListener('change', () => {
      if (this.form.hasAttribute('onsubmit')) {
        this.form.removeAttribute('onsubmit');
      }
      this.clearInvalidMessage();
    })

    this.inputsRequired.forEach((input) => {
      input.addEventListener('invalid', (e) => {
        let errors = e.target.name.toUpperCase();
        let errorMessage = e.target.validationMessage;
        this.sendGAErrorEvent(errors, errorMessage);
        this.showInvalidMessage(e.target, errorMessage)
      })
    })

    this.formFields.forEach(field => {
      field.addEventListener('input', (e) => {
        this.setPrefix(e.target);
        this.clearMessage();
        if (this.invalidTarget === e.target) {
          this.clearInvalidMessage();
        }
      })
    })

    this.fieldsWithPrefix.forEach(field => {
      field.addEventListener('focus', (e) => {
        this.setPrefix(e.target);
      })
      field.addEventListener('blur', (e) => {
        this.clearPrefix(e.target);
      })
      field.addEventListener("keydown", (e) => {
        this.clearPrefix(e.target, e.key);
      });
    })
  }

  setPrefix(input) {
    const prefix = input.dataset.prefix;
    if (!prefix) return;
    if (!input.value.startsWith(prefix)) {
      input.value = prefix + input.value.replace(prefix, '');
    }
  }

  clearPrefix(input, key) {
    const prefix = input.dataset.prefix;
    if (!prefix) return;
    if ((key === "Backspace" || key === "Delete") && input.value === prefix) {
      this.value = "";
    }
    if (input.value === prefix) {
      input.value = '';
    }
  }

  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector && this.provinceSelect) {
      new Shopify.CountryProvinceSelector('address-country-new', 'address-province-new', {
        hideElement: 'address-province-new'
      });
    }

    this.removeUnsupportedCountries()
  }

  removeUnsupportedCountries() {
    const countrySelect = this.form.querySelector('[data-country-select]');
    if (!countrySelect) return;

    const customOptions = countrySelect.querySelectorAll('[data-custom-select] [data-option-value]');
    const originalOptions = countrySelect.querySelectorAll('[data-original-select] option');

    customOptions.forEach(option => {
      const value = option.getAttribute('data-option-value');
      const supported = this.supportedCountries.some(el => el.country === value);
      if (!supported) option.parentNode.remove();
    })

    originalOptions.forEach(option => {
      const supported = this.supportedCountries.some(el => el.country === option.value);
      if (!supported) option.remove();
    })
  }

  setCustomCountrySelect() {
    const value = this.countryCustomSelect.querySelector('.form__input-hidden').value;
    setTimeout(() => {
      this.countryCustomSelect.querySelector(`[data-option-value="${value}"]`).click()
    }, 0)
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

  setSelectState() {
    const customSelectInputs = this.querySelectorAll('[data-custom-select-input]');
    const originalSelects = this.querySelectorAll('[data-original-select]');

    if (window.matchMedia('(max-width: 768px)').matches) {
      customSelectInputs.forEach(elem => this.disableSelect(elem));
      originalSelects.forEach(elem => this.enableSelect(elem));
    } else {
      originalSelects.forEach(elem => this.disableSelect(elem));
      customSelectInputs.forEach(elem => this.enableSelect(elem));
    }
  }

  disableSelect(el) {
    el.setAttribute('disabled', 'disabled');
    if (el.classList.contains('form__select--required')) {
      el.removeAttribute('required');
    }
  }

  enableSelect(el) {
    el.removeAttribute('disabled');
    if (el.classList.contains('form__select--required')) {
      el.setAttribute('required', '');
    }
  }

  onSubmitForm(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (this.checkFormError()) {
      window.dataLayer.push({
        'event': 'form_complete',
        'form': {
          'form_name': 'Refersion affiliate registration'
        }
      });
      this.sendForm();
    } else if (!this.emailValidation()) {
      this.sendGAErrorEvent('Email', 'Invalid email address')
    }
  }

  checkFormError() {
    if (!this.emailValidation()) {
      this.showMessage('custom', 'Please enter a valid email address.')
      this.emailInput.classList.add('error');
    }

    if (!this.passwordValidation()) {
      this.showMessage('custom', 'Please check your password.')
      this.passwordInput.classList.add('error');
      this.confirmPasswordInput.classList.add('error');
    }

    return this.emailValidation() && this.requiredSelectsValidation() && this.passwordValidation() && this.regexValidation()
  }

  requiredSelectsValidation() {
    let valid = true
    this.selects.forEach(select => {
      const input = select.querySelector('input')
      const selectName = select.querySelector('.form-select__btn-text')?.textContent.replace('*', '');
      if (input.hasAttribute('required') && input.value === '') {
        select.classList.add('error')
        this.sendGAErrorEvent(selectName, 'Please select an item in the list')
        if (valid) valid = false
      }
    })

    return valid
  }

  passwordValidation() {
    if (!this.passwordInput) return true;
    if (!this.confirmPasswordInput) return true;
    if (this.passwordInput.value === '') return false;
    return this.passwordInput.value === this.confirmPasswordInput.value;
  }

  emailValidation() {
    if (this.emailInput) {
      const emailValue = this.emailInput.value;
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const result = re.test(emailValue);

      return result && result !== ''
    } else {
      return true
    }
  }

  regexValidation() {
    let validation = true;
    Array.from(this.fieldsWithRegex).some(field => {
      const regexPattern = field.dataset.regex;
      const regex = new RegExp(regexPattern);
      const errorMessage = field.dataset.regexError
      if (!regex.test(field.value)) {
        validation = false;
        this.showMessage('custom', errorMessage)
        field.classList.add('error');
        return true;
      }
    });
    return validation;
  }

  sendForm() {
    const body = this.buildBody();
    const config = {
      method: 'POST',
      headers: {accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    };


    fetch('https://obagi-api.westus.cloudapp.azure.com/api/affiliate/refersion-new', config)
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          this.showMessage('custom', res.error)
          return;
        }
        this.formSubmitBtn.value = 'Submitted';
        this.classList.add('submitted');
        this.showMessage('success');
      })
      .catch(err => {
        this.showMessage('error')
      });
  }

  buildBody() {
    const newAffiliateParams = [
      'offer',
      'first_name',
      'last_name',
      'email',
      'password',
      'company',
      'paypal_email',
      'address1',
      'address2',
      'city',
      'zip',
      'country',
      'state',
      'phone',
      'send_welcome',
      'status',
      'conversion_trigger_coupon',
      'unique_merchant_id'
    ];
    const body = {};
    body.custom_fields = [];
    this.formFields.forEach(field => {
      const name = field.name;
      let value = field.value;

      if (name === 'country') {
        value = this.supportedCountries.find(el => el.country === field.value)?.code || null;
      }

      if (name === 'state') {
        value = this.usStates.find(el => el.state === field.value)?.code || null;
      }

      if (value?.length && name?.length && name !== 'utf8') {
        newAffiliateParams.includes(name)
          ? body[name] = value
          : (name.includes('custom_')) && body.custom_fields.push({[name]: value});
      }
    })
    return body
  }

  showInvalidMessage(target, message) {
    if (this.invalidTarget) return;
    this.invalidTarget = target;
    this.InvalidMessage = this.invalidTarget?.closest('.form-field')?.querySelector('[data-invalid-message]');

    if (!this.InvalidMessage) {
      this.invalidTarget = null;
      return;
    }

    this.invalidTarget.classList.add('error');
    this.InvalidMessage.innerHTML = message;
    this.InvalidMessage.classList.remove('hide');

    setTimeout(() => {
      this.clearInvalidMessage();
    }, 5000)
  }

  clearInvalidMessage() {
    if (!this.invalidTarget || !this.InvalidMessage) return;
    this.InvalidMessage.classList.add('hide');
    this.InvalidMessage.innerHTML = '';
    this.invalidTarget.classList.remove('error');
    this.invalidTarget = null;
    this.InvalidMessage = null;
  }

  showMessage(type, text) {
    this.clearMessage();
    const messageTarget = this.form.querySelector('[data-form-message=' + type + ']');
    if (messageTarget) messageTarget.classList.remove('hide');
    if (text) messageTarget.innerHTML = text;
  }

  clearMessage() {
    this.form.querySelectorAll('[data-form-message]').forEach(msg => msg.classList.add('hide'));
    this.formFields.forEach(field => field.classList.remove('error'));
  }

  sendGAErrorEvent(fieldError, message) {
    window.dataLayer.push({
      'event': 'form_error',
      'form': {
        'form_name': 'Refersion form',
        'form_validation_errors': fieldError,
        'error_message': message
      },
    });
  }

  getSupportedCountries() {
    return [
      {"code": "US", "country": "United States"}
    ]
  }

  allRefersionSupportedCoutries() {
    return [
      {"code": "US", "country": "United States"},
      {"code": "AE", "country": "United Arab Emirates"},
      {"code": "AR", "country": "Argentina"},
      {"code": "AS", "country": "American Samoa"},
      {"code": "AT", "country": "Austria"},
      {"code": "AU", "country": "Australia"},
      {"code": "BA", "country": "Bosnia and Herzegovina"},
      {"code": "BD", "country": "Bangladesh"},
      {"code": "BE", "country": "Belgium"},
      {"code": "BG", "country": "Bulgaria"},
      {"code": "BR", "country": "Brazil"},
      {"code": "CA", "country": "Canada"},
      {"code": "CH", "country": "Switzerland"},
      {"code": "CL", "country": "Chile"},
      {"code": "CN", "country": "China"},
      {"code": "CO", "country": "Colombia"},
      {"code": "CR", "country": "Costa Rica"},
      {"code": "CZ", "country": "Czech Republic"},
      {"code": "DE", "country": "Germany"},
      {"code": "DK", "country": "Denmark"},
      {"code": "DZ", "country": "Algeria"},
      {"code": "EE", "country": "Estonia"},
      {"code": "ES", "country": "Spain"},
      {"code": "FI", "country": "Finland"},
      {"code": "FM", "country": "Federated States of Micronesia"},
      {"code": "FO", "country": "Faroe Islands"},
      {"code": "FR", "country": "France"},
      {"code": "GB", "country": "United Kingdom"},
      {"code": "GH", "country": "Ghana"},
      {"code": "GR", "country": "Greece"},
      {"code": "GU", "country": "Guam"},
      {"code": "HK", "country": "Hong Kong"},
      {"code": "HN", "country": "Honduras"},
      {"code": "HR", "country": "Croatia"},
      {"code": "HU", "country": "Hungary"},
      {"code": "ID", "country": "Indonesia"},
      {"code": "IE", "country": "Ireland"},
      {"code": "IL", "country": "Israel"},
      {"code": "IM", "country": "Isle of Man"},
      {"code": "IN", "country": "India"},
      {"code": "IS", "country": "Iceland"},
      {"code": "IT", "country": "Italy"},
      {"code": "JM", "country": "Jamaica"},
      {"code": "JP", "country": "Japan"},
      {"code": "KR", "country": "South Korea"},
      {"code": "KW", "country": "Kuwait"},
      {"code": "LT", "country": "Lithuania"},
      {"code": "LU", "country": "Luxembourg"},
      {"code": "LV", "country": "Latvia"},
      {"code": "MA", "country": "Morocco"},
      {"code": "MH", "country": "Marshall Islands"},
      {"code": "MK", "country": "North Macedonia"},
      {"code": "MP", "country": "Northern Mariana Islands"},
      {"code": "MT", "country": "Malta"},
      {"code": "MX", "country": "Mexico"},
      {"code": "MY", "country": "Malaysia"},
      {"code": "NG", "country": "Nigeria"},
      {"code": "NL", "country": "Netherlands"},
      {"code": "NO", "country": "Norway"},
      {"code": "NZ", "country": "New Zealand"},
      {"code": "OM", "country": "Oman"},
      {"code": "PE", "country": "Peru"},
      {"code": "PH", "country": "Philippines"},
      {"code": "PK", "country": "Pakistan"},
      {"code": "PL", "country": "Poland"},
      {"code": "PR", "country": "Puerto Rico"},
      {"code": "PT", "country": "Portugal"},
      {"code": "PW", "country": "Palau"},
      {"code": "QA", "country": "Qatar"},
      {"code": "RO", "country": "Romania"},
      {"code": "RS", "country": "Serbia"},
      {"code": "RU", "country": "Russia"},
      {"code": "SA", "country": "Saudi Arabia"},
      {"code": "SE", "country": "Sweden"},
      {"code": "SG", "country": "Singapore"},
      {"code": "SI", "country": "Slovenia"},
      {"code": "SK", "country": "Slovakia"},
      {"code": "SV", "country": "El Salvador"},
      {"code": "TH", "country": "Thailand"},
      {"code": "TN", "country": "Tunisia"},
      {"code": "TR", "country": "Turkey"},
      {"code": "TW", "country": "Taiwan"},
      {"code": "TZ", "country": "Tanzania"},
      {"code": "UA", "country": "Ukraine"},
      {"code": "UY", "country": "Uruguay"},
      {"code": "VG", "country": "British Virgin Islands"},
      {"code": "VI", "country": "U.S. Virgin Islands"},
      {"code": "VN", "country": "Vietnam"},
      {"code": "WS", "country": "Samoa"},
      {"code": "ZA", "country": "South Africa"}
    ]
  }

  getUSState() {
    return [
      {"code": "AL", "state": "Alabama"},
      {"code": "AK", "state": "Alaska"},
      {"code": "AS", "state": "American Samoa"},
      {"code": "AZ", "state": "Arizona"},
      {"code": "AR", "state": "Arkansas"},
      {"code": "AA", "state": "Armed Forces Americas"},
      {"code": "AE", "state": "Armed Forces Europe"},
      {"code": "AP", "state": "Armed Forces Pacific"},
      {"code": "CA", "state": "California"},
      {"code": "CO", "state": "Colorado"},
      {"code": "CT", "state": "Connecticut"},
      {"code": "DE", "state": "Delaware"},
      {"code": "DC", "state": "District of Columbia"},
      {"code": "FM", "state": "Federated States of Micronesia"},
      {"code": "FL", "state": "Florida"},
      {"code": "GA", "state": "Georgia"},
      {"code": "GU", "state": "Guam"},
      {"code": "HI", "state": "Hawaii"},
      {"code": "ID", "state": "Idaho"},
      {"code": "IL", "state": "Illinois"},
      {"code": "IN", "state": "Indiana"},
      {"code": "IA", "state": "Iowa"},
      {"code": "KS", "state": "Kansas"},
      {"code": "KY", "state": "Kentucky"},
      {"code": "LA", "state": "Louisiana"},
      {"code": "ME", "state": "Maine"},
      {"code": "MH", "state": "Marshall Islands"},
      {"code": "MD", "state": "Maryland"},
      {"code": "MA", "state": "Massachusetts"},
      {"code": "MI", "state": "Michigan"},
      {"code": "MN", "state": "Minnesota"},
      {"code": "MS", "state": "Mississippi"},
      {"code": "MO", "state": "Missouri"},
      {"code": "MT", "state": "Montana"},
      {"code": "NE", "state": "Nebraska"},
      {"code": "NV", "state": "Nevada"},
      {"code": "NH", "state": "New Hampshire"},
      {"code": "NJ", "state": "New Jersey"},
      {"code": "NM", "state": "New Mexico"},
      {"code": "NY", "state": "New York"},
      {"code": "NC", "state": "North Carolina"},
      {"code": "ND", "state": "North Dakota"},
      {"code": "MP", "state": "Northern Mariana Islands"},
      {"code": "OH", "state": "Ohio"},
      {"code": "OK", "state": "Oklahoma"},
      {"code": "OR", "state": "Oregon"},
      {"code": "PW", "state": "Palau"},
      {"code": "PA", "state": "Pennsylvania"},
      {"code": "PR", "state": "Puerto Rico"},
      {"code": "RI", "state": "Rhode Island"},
      {"code": "SC", "state": "South Carolina"},
      {"code": "SD", "state": "South Dakota"},
      {"code": "TN", "state": "Tennessee"},
      {"code": "TX", "state": "Texas"},
      {"code": "UT", "state": "Utah"},
      {"code": "VT", "state": "Vermont"},
      {"code": "VI", "state": "Virgin Islands"},
      {"code": "VA", "state": "Virginia"},
      {"code": "WA", "state": "Washington"},
      {"code": "WV", "state": "West Virginia"},
      {"code": "WI", "state": "Wisconsin"},
      {"code": "WY", "state": "Wyoming"}
    ]
  }
}

customElements.define('refersion-form', RefersionFrom);
