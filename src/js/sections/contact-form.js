class ContactFrom extends HTMLElement {
  constructor() {
    super()
    this.form = this.querySelector('form');
    this.inputsRequired = this.form.querySelectorAll('[required]');
    this.formSubmitBtn = this.querySelector('[type="submit"]');
    this.emailInput = this.form.querySelector('input[type="email"]');
    this.selects = this.form.querySelectorAll('custom-select');
    this.countryCustomSelect = this.querySelector('.address-custom-select');
    this.customSelectCountryInput = this.querySelector('.address-form__country-input');
    this.provinceSelect = this.querySelector('#address-form-custom-province-new');
    this.klaviyoListId = this.getAttribute('data-klaviyo-list-id');
    this.companyId = 'SJacsh'

    this.eventListeners();
    this.setSelectState();
    this.setupCountries();
    if (this.countryCustomSelect) this.setCustomCountrySelect();
    this.checkSearchParams();
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
    })

    this.inputsRequired.forEach((input) => {
      input.addEventListener('invalid', (e) => {
        let errors = e.target.name.replace('contact[', '').replace(']', '').replace('-', ' ').toUpperCase();
        let errorMessage = e.target.validationMessage;

        this.sendGAErrorEvent(errors, errorMessage);
      })
    })
  }

  checkSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const contactFormModal = document.querySelector('#contact-form-popup');

    if (params.has('contact_posted') && contactFormModal) {
      contactFormModal.show();
    }
  }

  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector && this.provinceSelect) {
      new Shopify.CountryProvinceSelector('address-country-new', 'address-province-new', {
        hideElement: 'address-province-new'
      });
    }
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
    console.log(this.klaviyoListId)
    if (this.checkFormError()) {
      window.dataLayer.push({
        'event': 'generate_lead',
        'customer': {
          'b2b_specialty': '',
          'b2b_role': '',
          'b2b_city': '',
          'b2b_state': '',
          'b2b_registration_reason': new FormData(this.form).getAll('contact[subject]')[0]?.trim() || ''
        },
        'user': {
          'lead': {
            'lead_type': 'B2B: Get in touch',
            'lead_driver': 'Contact Us'
          }
        }
      });

      window.dataLayer.push({
        'event': 'form_complete',
        'form': {
          'form_name': 'Contact Us'
        }
      });

      if (this.klaviyoListId) {
        this.sendForm();
      } else {
        // this.form.submit();
      }
    } else if (!this.emailValidation()){
      this.sendGAErrorEvent('Email', 'Invalid email address')
    }
  }

  checkFormError() {
    const emailError = this.form.querySelector('.form-error--email');
    const successMessage = this.querySelector('.form-success');

   if (!this.emailValidation()) {
     emailError.classList.remove('hide');
     if (successMessage) successMessage.classList.add('hide');
     this.emailInput.classList.add('error');
   }

    return this.emailValidation() && this.requiredSelectsValidation()
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

  sendForm() {
    const _this = this;
    let requestAttribute = {
      email: (this.querySelector('input[type="email"]')) ? this.querySelector('input[type="email"]').value : '',
      properties: {
        'subject': (this.querySelector('custom-select input')) ? this.querySelector('custom-select input').value : '',
        'description': (this.querySelector('[name="contact[description]"]')) ? this.querySelector('[name="contact[description]"]').value : '',
        'i_am_a': (this.querySelector('[name="contact[i-am-a]"]')) ? this.querySelector('[name="contact[i-am-a]"]').value : '',
        'contact_me_via': (this.querySelector('[name="contact[contact-me-via]"]')) ? this.querySelector('[name="contact[contact-me-via]"]').value : '',
      },
      first_name: (this.querySelector('[name="contact[first-name]"]')) ? this.querySelector('[name="contact[first-name]"]').value : '',
      last_name: (this.querySelector('[name="contact[last-name]"]')) ? this.querySelector('[name="contact[last-name]"]').value : '',
    }

    let phoneNumber = (this.querySelector('input[type="tel"]')) ? this.querySelector('input[type="tel"]').value : ''

    if (phoneNumber.length > 10) {
      requestAttribute.phone_number = `+1${phoneNumber.replace('(', '').replace(')', '').replace('-', '').replace(' ', '')}`
    }

    const config = {
      method: 'POST',
      headers: {revision: '2024-02-15', 'content-type': 'application/json'},
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'Contact form',
            profile: {
              data: {
                type: 'profile',
                attributes: requestAttribute
              }
            }
          },
          relationships: {list: {data: {type: 'list', id: this.klaviyoListId}}}
        }
      })
    };

    fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${this.companyId}`, config)
      .then(response => {
        if (response.status === 202) {
          this.formSubmitBtn.value = 'Submitted';
          this.classList.add('submitted');
          _this.showMessage('success');
        } else {
          _this.showMessage('error')
        }
      })
      // .catch(err => {
      //   console.log(err);
      //   this.showMessage('error');
      // });
  }

  objToStrUrlEncode(obj) {
    const str = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] !== 'undefined') {
        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
      }
    }
    return str.join('&')
  }

  formData() {
    let klaviyoData = {
      g: this.klaviyoListId,
      '$fields': '$source,$consent_method,$consent_form_id',
      '$list_fields': '',
      '$timezone_offset': Math.abs(new Date().getTimezoneOffset() / 60),
      '$source': this.querySelector('[name="contact[form-type]"]') ? this.querySelector('[name="contact[form-type]"]').value : 'Contact Us',
      '$consent_method': 'Klaviyo Form',
      '$origin': 'origin'
    }

    const formData = new FormData(this.form);
    for (let pair of formData.entries()) {
      if (pair[0].includes('contact')) {
        const formattedName = pair[0].replace('contact[', '$').replace(']', '').replace('-', '_');
        let formattedValue = pair[1];
        klaviyoData.$fields = klaviyoData.$fields + ',' + formattedName;

        if (formattedName === '$telephone' ) formattedValue = phoneValidation(formattedValue);
        klaviyoData[formattedName] = formattedValue;
      }
    }

    return klaviyoData
  }

  showMessage(type) {
    if(document.querySelector('.form-klaviyo__' + type)) document.querySelector('.form-klaviyo__' + type).classList.remove('hide');
  }

  sendGAErrorEvent(fieldError, message) {
    window.dataLayer.push({
      'event': 'form_error',
      'form': {
        'form_name': 'Contact us',
        'form_validation_errors': fieldError,
        'error_message': message
      },
    });
  }

}
customElements.define('contact-form', ContactFrom);



