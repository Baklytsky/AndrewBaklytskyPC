const selectors = {
  form: 'form',
  popoutWrapper: '[data-popout]',
  popoutList: '[data-popout-list]',
  popoutToggle: '[data-popout-toggle]',
  popoutInput: '[data-popout-input]',
  popoutOptions: '[data-popout-option]',
  popoutText: '[data-popout-text]',
  ariaCurrent: '[aria-current]',
  productGridImage: '[data-product-image]',
  productGrid: '[data-product-grid-item]',
};

const classes = {
  listVisible: 'select-popout__list--visible',
  popoutAlternative: 'select-popout--alt',
  currentSuffix: '--current',
  visible: 'is-visible',
};

const attributes = {
  ariaCurrent: 'aria-current',
  ariaExpanded: 'aria-expanded',
  dataValue: 'data-value',
  popoutPrevent: 'data-popout-prevent',
  popoutQuantity: 'data-quantity-field',
  quickViewItem: 'data-quick-view-item',
};

let sections = {};

class Popout {
  constructor(popout) {
    this.popout = popout;
    this.popoutList = this.popout.querySelector(selectors.popoutList);
    this.popoutToggle = this.popout.querySelector(selectors.popoutToggle);
    this.popoutText = this.popout.querySelector(selectors.popoutText);
    this.popoutInput = this.popout.querySelector(selectors.popoutInput);
    this.popoutOptions = this.popout.querySelectorAll(selectors.popoutOptions);
    this.popoutPrevent = this.popout.getAttribute(attributes.popoutPrevent) === 'true';
    this.popupToggleFocusoutEvent = (evt) => this.popupToggleFocusout(evt);
    this.popupListFocusoutEvent = (evt) => this.popupListFocusout(evt);
    this.popupToggleClickEvent = (evt) => this.popupToggleClick(evt);
    this.popoutKeyupEvent = (evt) => this.popoutKeyup(evt);
    this.popupOptionsClickEvent = (evt) => this.popupOptionsClick(evt);
    this._connectOptionsDispatchEvent = (evt) => this._connectOptionsDispatch(evt);
    this.bodyClick = this.bodyClick.bind(this);
    this.updatePopout = this.updatePopout.bind(this);

    this._connectOptions();
    this._connectToggle();
    this._onFocusOut();

    if (this.popoutInput && this.popoutInput.hasAttribute(attributes.popoutQuantity)) {
      document.addEventListener('theme:cart:update', this.updatePopout);
    }
  }

  unload() {
    if (this.popoutOptions.length) {
      this.popoutOptions.forEach((element) => {
        element.removeEventListener('theme:popout:click', this.popupOptionsClickEvent);
        element.removeEventListener('click', this._connectOptionsDispatchEvent);
      });
    }

    this.popoutToggle.removeEventListener('click', this.popupToggleClickEvent);
    this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusoutEvent);
    this.popoutList.removeEventListener('focusout', this.popupListFocusoutEvent);
    this.popout.removeEventListener('keyup', this.popoutKeyupEvent);
    document.removeEventListener('theme:cart:update', this.updatePopout);
    document.body.removeEventListener('click', this.bodyClick);
  }

  popupToggleClick(evt) {
    const ariaExpanded = evt.currentTarget.getAttribute(attributes.ariaExpanded) === 'true';

    if (this.popoutList.closest(selectors.productGrid)) {
      const productGridItemImage = this.popoutList.closest(selectors.productGrid).querySelector(selectors.productGridImage);

      if (productGridItemImage) {
        productGridItemImage.classList.toggle(classes.visible, !ariaExpanded);
      }
    }

    evt.currentTarget.setAttribute(attributes.ariaExpanded, !ariaExpanded);
    this.popoutList.classList.toggle(classes.listVisible);
  }

  popupToggleFocusout(evt) {
    if (!evt.relatedTarget) {
      return;
    }

    const popoutLostFocus = this.popout.contains(evt.relatedTarget);
    const popoutFromQuickView = evt.relatedTarget.hasAttribute(attributes.quickViewItem);

    if (!popoutLostFocus && !popoutFromQuickView) {
      this._hideList();
    }
  }

  popupListFocusout(evt) {
    const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
    const isVisible = this.popoutList.classList.contains(classes.listVisible);

    if (isVisible && !childInFocus) {
      this._hideList();
    }
  }

  popupOptionsClick(evt) {
    const link = evt.target.closest(selectors.popoutOptions);
    if (link.attributes.href.value === '#') {
      evt.preventDefault();

      let attrValue = '';

      if (evt.currentTarget.getAttribute(attributes.dataValue)) {
        attrValue = evt.currentTarget.getAttribute(attributes.dataValue);
      }

      this.popoutInput.value = attrValue;

      if (this.popoutPrevent) {
        this.popoutInput.dispatchEvent(new Event('change'));

        if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(attributes.popoutQuantity)) {
          this.popoutInput.dispatchEvent(new Event('input'));
        }

        const currentElement = this.popoutList.querySelector(`[class*="${classes.currentSuffix}"]`);
        let targetClass = classes.currentSuffix;

        if (currentElement && currentElement.classList.length) {
          for (const currentElementClass of currentElement.classList) {
            if (currentElementClass.includes(classes.currentSuffix)) {
              targetClass = currentElementClass;
              break;
            }
          }
        }

        const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);

        if (listTargetElement) {
          listTargetElement.classList.remove(`${targetClass}`);
          evt.currentTarget.parentElement.classList.add(`${targetClass}`);
        }

        const targetAttribute = this.popoutList.querySelector(selectors.ariaCurrent);

        if (targetAttribute) {
          targetAttribute.removeAttribute(attributes.ariaCurrent);
          evt.currentTarget.setAttribute(attributes.ariaCurrent, 'true');
        }

        if (attrValue !== '') {
          this.popoutText.textContent = attrValue;
        }

        this.popupToggleFocusout(evt);
        this.popupListFocusout(evt);
      } else {
        this._submitForm(attrValue);
      }
    }
  }

  updatePopout() {
    const targetElement = this.popoutList.querySelector(`[${attributes.dataValue}="${this.popoutInput.value}"]`);
    if (targetElement) {
      targetElement.dispatchEvent(
        new CustomEvent('theme:popout:click', {
          cancelable: true,
          bubbles: true,
          detail: {
            preventTrigger: true,
          },
        })
      );

      if (!targetElement.parentElement.nextSibling) {
        this.popout.classList.add(classes.popoutAlternative);
      }
    } else {
      this.popout.classList.add(classes.popoutAlternative);
    }
  }

  popoutKeyup(event) {
    if (event.code !== theme.keyboardKeys.ESCAPE) {
      return;
    }
    this._hideList();
    this.popoutToggle.focus();
  }

  bodyClick(event) {
    const isOption = this.popout.contains(event.target);
    const isVisible = this.popoutList.classList.contains(classes.listVisible);

    if (isVisible && !isOption) {
      this._hideList();
    }
  }

  _connectToggle() {
    this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
  }

  _connectOptions() {
    if (this.popoutOptions.length) {
      this.popoutOptions.forEach((element) => {
        element.addEventListener('theme:popout:click', this.popupOptionsClickEvent);
        element.addEventListener('click', this._connectOptionsDispatchEvent);
      });
    }
  }

  _connectOptionsDispatch(evt) {
    const event = new CustomEvent('theme:popout:click', {
      cancelable: true,
      bubbles: true,
      detail: {
        preventTrigger: false,
      },
    });

    if (!evt.target.dispatchEvent(event)) {
      evt.preventDefault();
    }
  }

  _onFocusOut() {
    this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
    this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
    this.popout.addEventListener('keyup', this.popoutKeyupEvent);

    document.body.addEventListener('click', this.bodyClick);
  }

  _submitForm() {
    const form = this.popout.closest(selectors.form);
    if (form) {
      form.submit();
    }
  }

  _hideList() {
    this.popoutList.classList.remove(classes.listVisible);
    this.popoutToggle.setAttribute(attributes.ariaExpanded, false);
  }
}

const popoutSection = {
  onLoad() {
    sections[this.id] = [];
    const wrappers = this.container.querySelectorAll(selectors.popoutWrapper);
    wrappers.forEach((wrapper) => {
      sections[this.id].push(new Popout(wrapper));
    });
  },
  onUnload() {
    sections[this.id].forEach((popout) => {
      if (typeof popout.unload === 'function') {
        popout.unload();
      }
    });
  },
};

export {Popout, popoutSection};
