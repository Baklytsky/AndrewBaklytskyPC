/**
 * Variant Sellout Precrime Click Preview
 * I think of this like the precrime machine in Minority report.  It gives a preview
 * of every possible click action, given the current form state.  The logic is:
 *
 * for each clickable name=options[] variant selection element
 * find the value of the form if the element were clicked
 * lookup the variant with those value in the product json
 * clear the classes, add .unavailable if it's not found,
 * and add .sold-out if it is out of stock
 *
 * Caveat: we rely on the option position so we don't need
 * to keep a complex map of keys and values.
 */

const selectors = {
  form: '[data-product-form]',
  optionPosition: '[data-option-position]',
  optionInput: '[name^="options"], [data-popout-option]',
};

const classes = {
  soldOut: 'sold-out',
  unavailable: 'unavailable',
};

const attributes = {
  optionPosition: 'data-option-position',
  selectOptionValue: 'data-value',
};

class SelloutVariants {
  constructor(container, productJSON) {
    this.container = container;
    this.productJSON = productJSON;
    this.form = this.container.querySelector(selectors.form);
    this.formData = new FormData(this.form);
    this.optionElements = this.container.querySelectorAll(selectors.optionInput);

    if (this.productJSON && this.form) {
      this.init();
    }
  }

  init() {
    this.update();
  }

  update() {
    this.getCurrentState();

    this.optionElements.forEach((el) => {
      const val = el.value || el.getAttribute(attributes.selectOptionValue);
      const optionSelector = el.closest(selectors.optionPosition);

      if (!optionSelector) {
        return;
      }

      const positionString = optionSelector.getAttribute(attributes.optionPosition);
      // subtract one because option.position in liquid does not count form zero, but JS arrays do
      const position = parseInt(positionString, 10) - 1;

      let newVals = [...this.selections];
      newVals[position] = val;

      const found = this.productJSON.variants.find((element) => {
        // only return true if every option matches our hypothetical selection
        let perfectMatch = true;
        for (let index = 0; index < newVals.length; index++) {
          if (element.options[index] !== newVals[index]) {
            perfectMatch = false;
          }
        }
        return perfectMatch;
      });

      el.parentElement.classList.remove(classes.soldOut, classes.unavailable);
      if (typeof found === 'undefined') {
        el.parentElement.classList.add(classes.unavailable);
      } else if (found?.available === false) {
        el.parentElement.classList.add(classes.soldOut);
      }
    });
  }

  getCurrentState() {
    this.formData = new FormData(this.form);
    this.selections = [];
    for (var value of this.formData.entries()) {
      if (value[0].includes('options[')) {
        // push the current state of the form, dont worry about the group name
        // we will be using the array position instead of the name to match values
        this.selections.push(value[1]);
      }
    }
  }
}

export {SelloutVariants};
