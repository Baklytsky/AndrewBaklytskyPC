import { computed, getCurrentInstance } from 'vue-demi';

export const usePicker = () => {
  const _this = getCurrentInstance().proxy;

  const selectedLabelValue = computed(() => {
    if (Array.isArray(_this.selected)) {
      const labelsArray = _this.selected.map((selectedItem) =>
        _getLabelFromSelection(selectedItem)
      );

      return labelsArray.join(_this.selectedSeparator);
    } else {
      return _getLabelFromSelection(_this.selected);
    }
  });

  const hasSelected = computed(() => {
    return Array.isArray(_this.selected)
      ? _this.selected.length > 0
      : !!_this.selected;
  });

  const selectedLabelKey = computed(() => {
    return _this.displaySelected && hasSelected.value
      ? `${_this.labelSelected || _this.label}`
      : _this.label;
  });

  // Variable formatting

  /**
   * Retrieves the selected option(s) label property,
   * or the value property if the former is not present.
   * If the option was provided as a string, returns the string.
   */
  const _getLabelFromSelection = (selected) => {
    const selectedOption = _this.options.find((option) => {
      return (
        getKeyValue(option, 'value') ===
        (getKeyValue(selected, 'value') || selected)
      );
    });

    if (selectedOption) {
      return (
        getKeyValue(selectedOption, 'label') ||
        getKeyValue(selectedOption, 'value')
      );
    }

    return '';
  };

  const _valueMatchesPrimitive = (value, selected) => {
    if (typeof selected === 'string') {
      return value === selected;
    } else if (selected) {
      return value === getKeyValue(selected, 'value');
    }

    return false;
  };

  /**
   * Returns the `key` from a given `option` object.
   * If that fails, look for a replacement `key` in the `this.optionKeyMap` bindings.
   */
  const getKeyValue = (option, key) => {
    if (!option) {
      return option;
    }

    return option.hasOwnProperty(key)
      ? option[key]
      : option[_this.optionKeyMap[key]];
  };

  const isOptionSelected = (option, selected = _this.selected) => {
    const optionValue = getKeyValue(option, 'value');

    if (getKeyValue(option, 'selected')) {
      return true;
    } else if (Array.isArray(selected)) {
      return (
        selected.filter((item) => _valueMatchesPrimitive(optionValue, item))
          .length > 0
      );
    } else {
      return _valueMatchesPrimitive(optionValue, selected);
    }
  };

  //Event handlers

  const handleOptionChange = (selected, option) => {
    /**
     * Fires every time a option is changed.
     * Arguments:
     *   `selected`: Whether or not the changed option is selected.
     *   `option`: The changed option configuration object.
     */
    _this.$emit('change:option', selected, option, _this.type);

    /**
     * Fires either a "select" or "unselect" event.
     * Arguments:
     *   `option`: The selected option configuration object.
     */
    _this.$emit(
      `${selected ? 'select' : 'unselect'}:option`,
      option,
      _this.type
    );
  };

  const handleDropdownChange = (value) => handleOptionChange(true, { value });

  return {
    //Computed props
    selectedLabelValue,
    selectedLabelKey,
    hasSelected,
    //Methods
    getKeyValue,
    isOptionSelected,
    //Event handlers
    handleDropdownChange,
    handleOptionChange,
  };
};
