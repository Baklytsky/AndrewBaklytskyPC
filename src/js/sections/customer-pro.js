class CustomerPro extends HTMLElement {
  constructor() {
    super()
    this.form = this.querySelector('form');
    this.formSubmitBtn = this.querySelector('button[type="submit"]');
    this.emailInput = this.form.querySelector('input[type="email"]');
    this.inputs = this.form.querySelectorAll('input');
    this.selects = this.form.querySelectorAll('custom-select');
    this.countrySelect = this.querySelector('[data-address-country-select]');
    this.countryCustomSelect = this.querySelector('.address-custom-select');
    this.customSelectCountryInput = this.querySelector('.address-form__country-input');
    this.errorsFields = this.form.querySelectorAll('.form-error');
    this.errorState = false;
    this.klaviyoListId = this.getAttribute('data-klaviyo-list-id');
    this.companyId = 'SJacsh'
    this.initEvents();
    this.setupCountries();
    this.setCustomCountrySelect();
    this.setSelectState();
  }

  initEvents() {
    this.form.addEventListener('submit', this.onSubmitForm.bind(this))
    this.form.addEventListener('change', this.resetErrors.bind(this))
    this.customSelectCountryInput.addEventListener('change', this.setCustomProvinceSelect.bind(this))
    window.addEventListener('resize', this.setSelectState.bind(this))
  }

  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
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

  onSubmitForm(e) {
    e.preventDefault();
    if (this.checkFormError()) {
      this.sendForm(e);
    }
  }

  checkFormError() {
    const emailError = this.form.querySelector('.form-error--email');
    const emptyFieldError = this.form.querySelector('.form-error--empty-field');

   if (!this.emailValidation()) {
     emailError.classList.remove('hide');
     this.emailInput.classList.add('error');
   }

   if (!this.requiredSelectsValidation()) emptyFieldError.classList.remove('hide');
   if (!this.requiredSelectsValidation() || !this.emailValidation()) this.errorState = true;

    return this.emailValidation() && this.requiredSelectsValidation()
  }

  requiredSelectsValidation() {
    let valid = true
    this.selects.forEach(select => {
      const input = select.querySelector('input')
      if (input.hasAttribute('required') && input.value === '') {
        select.classList.add('error')
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

  resetErrors() {
    if (!this.errorState) return
    this.errorsFields.forEach(field => field.classList.add('hide'))
    this.inputs.forEach(input => {if (input.classList.contains('error')) input.classList.remove('error')})
    this.selects.forEach(select => {if (select.classList.contains('error')) select.classList.remove('error')})
    this.errorState = false
  }

  sendForm() {
    const _this = this;

    fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${this.companyId}`, this.formData())
      .then(response => {
        if (response.status === 202) {
          this.formSubmitBtn.textContent = 'Submitted!';
          this.classList.add('submitted');
          this.sendEventData();
        } else {
          if(document.querySelector('.form-error-klaviyo--email')) document.querySelector('.form-error-klaviyo--email').classList.remove('hide');
        }
      })
      // .catch(err => {
      //   console.log(err)
      //   if(document.querySelector('.form-error-klaviyo--email')) document.querySelector('.form-error-klaviyo--email').classList.remove('hide');
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

  sendEventData() {
    const formData = new FormData(this.form);

    window.dataLayer.push({
      'event': 'generate_lead',
      'user': {
        'customer': {
          'b2b_specialty': formData.getAll('specialty')[0],
          'b2b_role': formData.getAll('role')[0],
          'b2b_city': formData.getAll('city')[0],
          'b2b_state': formData.getAll('state')[0],
          'b2b_registration_reason': formData.getAll('reason')[0]
        },
        'lead': {
          'lead_type': 'B2B: Become a partner',
          'lead_driver': 'Register'
        }
      }
    });

    window.dataLayer.push({
      'event': 'create_account',
      'user': {
        'customer': {
          'b2b_specialty': formData.getAll('specialty')[0],
          'b2b_role': formData.getAll('role')[0],
          'b2b_city': formData.getAll('city')[0],
          'b2b_state': formData.getAll('state')[0],
          'b2b_registration_reason': formData.getAll('reason')[0]
        }
      }
    });
  }

  formData() {
    const name = this.querySelector('[name="first_name"]');
    const lastName = this.querySelector('[name="last_name"]');
    const phone = this.querySelector('[name="phone"]');
    const businessName = this.querySelector('[name="business_name"]');
    const specialty = this.querySelector('[name="specialty"]:not([disabled])');
    const role = this.querySelector('[name="role"]:not([disabled])');
    const city = this.querySelector('[name="city"]');
    const state = this.querySelector('[name="state"]:not([disabled])');
    const zip = this.querySelector('[name="zip"]');
    const country = this.querySelector('[name="country"]:not([disabled])');
    const reason = this.querySelector('[name="reason"]:not([disabled])');
    const message = this.querySelector('[name="message"]');
    // return {
    //   g: this.klaviyoListId,
    //   '$fields': '$source,$email,$consent_method,$consent_form_id,$name,$lastName,$phoneNumber,$businessName,$specialty,$role,$city,$state,$zip,$country,$reason,$message',
    //   '$list_fields': '',
    //   '$timezone_offset': Math.abs(new Date().getTimezoneOffset() / 60),
    //   '$source': 'Professional register',
    //   '$email': (this.emailInput) ? this.emailInput.value : '',
    //   '$name': (name) ? name.value : '',
    //   '$lastName': (lastName) ? lastName.value : '',
    //   '$phoneNumber': (phone) ? phoneValidation(phone.value) : '',
    //   '$businessName': (businessName) ? businessName.value : '',
    //   '$specialty': (specialty) ? specialty.value : '',
    //   '$role': (specialty) ? role.value : '',
    //   '$city': (city) ? city.value : '',
    //   '$state': (state) ? state.value : '',
    //   '$zip': (zip) ? zip.value : '',
    //   '$country': (country) ? country.value : '',
    //   '$message': (message) ? message.value : '',
    //   '$reason': (reason) ? reason.value : '',
    //   '$consent_method': 'Klaviyo Form',
    //   '$origin': 'origin'
    // };

    let requestAttribute = {
      email: (this.emailInput) ? this.emailInput.value : '',
      properties: {
        'businessName': (businessName) ? businessName.value : '',
        'specialty': (specialty) ? specialty.value : '',
        'role': (role) ? role.value : '',
        'reason': (reason) ? reason.value : '',
        'message': (message) ? message.value : ''
      },
      location: {
        city: (city) ? city.value : '',
        country: (country) ? country.value : '',
        zip: (zip) ? zip.value : '',
        region: (state) ? state.value : ''
      },
      first_name: (name) ? name.value : '',
      last_name: (lastName) ? lastName.value : ''
    }

    if (phone.length > 10) {
      requestAttribute.phone_number = `+1${phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '')}`
    }

    return {
      method: 'POST',
      headers: {revision: '2024-02-15', 'content-type': 'application/json'},
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'Professional register',
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
  }
}
customElements.define('customer-pro', CustomerPro);
