class customSelect extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('.form-select__btn');
    this.dropdownLabel = this.querySelector('.form-select__dropdown-option--label');
    this.buttonText = this.button.querySelector('.form-select__btn-text');
    this.list = this.querySelector('.form-select__dropdown');
    this.inputHidden = this.querySelector('.form__input-hidden');
    this.isAlternative = this.classList.contains('form-select__alternative');
    this.changeEvent = new Event('change', { bubbles: true })

    this.button.addEventListener('click', (e) => {
      this.button.getAttribute('aria-expanded') === 'true' ? this.close() : this.open();
    })

    if (window.isIosDevice) {
      const _self = this;

      window.addEventListener('click', function (event) {
        if (!_self.contains(event.target) && !_self.button.contains(event.target)) {
          _self.close();
        }
      });
    } else {
      this.addEventListener("focusout", function (event) {
        if ( this.contains(event.relatedTarget) || !document.hasFocus() ) {
          return;
        }
        this.close();  // or whatever logic you want to use to close
      });
    }

    this.initOptions();

    if (this.isAlternative) {
      document.addEventListener('click', (e) => {
        let isClickInside = this.contains(e.target);
        if (!isClickInside) {
          this.close();
        }
      });
    }

    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.close()
      }
    });
  }

  open() {
    this.button.setAttribute('aria-expanded', 'true');
    this.button.parentElement.classList.add('form-select--open');
    slideDown(this.list);
  }

  close() {
    let duration = 300;
    if (this.isAlternative) duration = 0;
    this.button.setAttribute('aria-expanded', 'false');
    this.button.parentElement.classList.remove('form-select--open');
    slideUp(this.list, duration);
    removeTrapFocus();
  }

  initOptions() {
    this.optionsButton = this.querySelectorAll('.form-select__dropdown-button');
    this.options = this.querySelectorAll('.form-select__dropdown-option');

    this.optionsButton.forEach(option => {
      const callback = (e) => {
        const clickedOption = e.target.closest('.form-select__dropdown-option');
        this.close();
        if (clickedOption.getAttribute('aria-selected') === 'true') return;

        this.options.forEach(option => option.setAttribute('aria-selected', 'false'));
        clickedOption.setAttribute('aria-selected', 'true');
        this.buttonText.innerHTML = clickedOption.querySelector('.form-select__dropdown-button').innerHTML;
        if (clickedOption.getAttribute('data-option-value')) {
          this.inputHidden.value = clickedOption.getAttribute('data-option-value');
        } else {
          this.inputHidden.value = clickedOption.querySelector('[data-option-value]')?.getAttribute('data-option-value');
        }
        this.inputHidden.dispatchEvent(this.changeEvent);
        this.button.setAttribute('aria-selected', 'true');
      };

      option.addEventListener('click', callback);

      //fix for iOS
      if (this.dropdownLabel) this.dropdownLabel.addEventListener('click', ()=> this.close());
    })
  }
}

customElements.define('custom-select', customSelect);


/*
<custom-select className="form-select form-select--full-width">
  <button className="btn--reset form-select__btn" tabIndex="0" aria-expanded="false"
          aria-controls="dropdown-{{ section.id }}">
    <span className="form-select__btn-text">Ships every 2 months <span>(shave every 3-4 days)</span></span>
    {%- render 'icon' with 'arrow-down-circle' -%}
  </button>

  <ul className="form-select__dropdown" id="dropdown-{{ section.id }}" style="display: none;">
    <li className="form-select__dropdown-option"
        data-option-value="1-month" aria-selected="false">
      <button className="btn--reset form-select__dropdown-button">
        Ships every 1 month <span>(shave every 3-4 days)</span>
      </button>
    </li>
    <li className="form-select__dropdown-option"
        data-option-value="2-month" aria-selected="true">
      <button className="btn--reset form-select__dropdown-button">
        Ships every 2 month <span>(shave every 3-4 days)</span>
      </button>
    </li>
    <li className="form-select__dropdown-option"
        data-option-value="3-month" aria-selected="false">
      <button className="btn--reset form-select__dropdown-button">
        Ships every 3 month <span>(shave every 3-4 days)</span>
      </button>
    </li>
  </ul>

  <input type="hidden" className="form__input-hidden" value="2-month">
</custom-select>
*/
