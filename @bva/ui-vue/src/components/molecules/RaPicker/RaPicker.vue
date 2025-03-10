<template>
  <div :class="['ra-picker', modifierClass(variant)]">
    <!-- @slot Replace the display label portion of the component. -->
    <slot
      name="label"
      v-bind="{
        label,
        selectedLabelKey,
        displaySelected,
        selectedLabelValue,
      }"
    >
      <div v-if="label" class="ra-picker__label">
        <span class="ra-picker__label-key">
          {{ selectedLabelKey }}
        </span>
        <span v-if="displaySelected" class="ra-picker__label-value">
          {{ selectedLabelValue }}
        </span>

        <!-- @slot Set additional content to the side of the label. -->
        <slot name="label-after" />
      </div>
    </slot>

    <div class="ra-picker__contents">
      <!-- @slot Replace the option list portion of the component. -->
      <slot
        v-bind="{
          ...$props,
          limitedOptions,
          selectedLabelValue,
          selectedLabelKey,
          getKeyValue,
          isOptionSelected,
          handleOptionChange,
          handleDropdownChange,
        }"
      />
    </div>

    <div v-if="hasMessage" class="ra-picker__message">
      <!-- @slot Display a custom message under the option picker. -->
      <slot name="message" />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue-demi';
import { usePicker } from '@bva/ui-vue/src/composables';

export default {
  name: 'RaPicker',
  props: {
    /**
     * The type for the current option set, i.e. "size", "color", etc.
     */
    type: {
      type: String,
      default: '',
    },
    /**
     * Label to display with the option picker, i.e. "Select color".
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Label to display after a selection has been made, i.e. "Selected color:".
     */
    labelSelected: {
      type: String,
      default: '',
    },
    /**
     * Array of individual options to render.
     * Alternatively, you can pass an options component as a slot.
     */
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * A Key-Value pairs representing mappings for the individual `option` items within the `options` prop Array.
     * This allows passing data into the Picker's inner components without re-structuring the original data source.
     */
    optionKeyMap: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * One or more values to set as selected.
     */
    selected: {
      type: [String, Number, Object, Array],
      default: '',
    },
    /**
     * Displays the selected option's `label` or `value`.
     */
    displaySelected: {
      type: Boolean,
      default: true,
    },
    /**
     * Separator to use between selected items when `displaySelected` is enabled.
     */
    selectedSeparator: {
      type: String,
      default: ', ',
    },
    /**
     * Option dimension size. Accepts: `sm`, `md`, `lg`.
     */
    size: {
      type: [Object, String],
      default: '',
    },
    /**
     * Modify the option's look and feel by using one of the preset modifiers.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Define how many items or options to display per row.
     * Only applicable when in combination with `type` `"grid"`.
     * Supported formats:
     * * Single global value in the form of a string or integer.
     * * Object literal with individual values for `sm`, `md`, and/or `lg` viewports.
     * * Array of Integers which are parsed in the order they're set.
     *   The 1st item in the array is used for the global viewport, the 2nd for medium viewports, and so forth.
     */
    itemsPerRow: {
      type: [Object, Array, String, Number],
      default() {
        return 5;
      },
    },
    /**
     * Specify one or more gap values to between each item in the option picker.
     * Supported formats:
     * * Single global value in the form of a string or integer.
     * * Object literal with individual values for `sm`, `md`, and/or `lg` viewports.
     * * Array of Strings which are parsed in the order they're set.
     *   The first item in the array is used for the global viewport, the second for medium viewports, and so forth.
     * * Boolean which when set to `false` removes the gaps.
     */
    gap: {
      type: [Object, Array, String, Number],
      default() {
        return ['var(--spacing-xs)'];
      },
    },
    /**
     * When set to `true` the option buttons within the grid utilize as much
     * available space as possible inside each grid item.
     * This is necessary when setting the `size` prop to a percentage.
     * When set to `false` the option buttons are able to dictate the overall size of the grid.
     */
    fillSpace: {
      type: Boolean,
      default: true,
    },
    /**
     * Enable selecting more than one option at a time.
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Set a max limit of how many options to render,
     * regardless of how many total options are there.
     */
    limit: {
      type: Number,
      default: 999,
    },
  },
  setup(props, { slots }) {
    const {
      selectedLabelValue,
      selectedLabelKey,
      getKeyValue,
      isOptionSelected,
      handleOptionChange,
      handleDropdownChange,
    } = usePicker();

    const hasMessage = computed(() => {
      return slots.hasOwnProperty('message');
    });

    const limitedOptions = computed(() =>
      [...props.options].splice(0, props.limit)
    );

    const modifierClass = (modifier, prefix) => {
      return modifier
        ? `ra-picker--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    };

    return {
      slots,
      limitedOptions,
      hasMessage,
      modifierClass,
      selectedLabelValue,
      selectedLabelKey,
      getKeyValue,
      isOptionSelected,
      handleOptionChange,
      handleDropdownChange,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaPicker.css';
</style>
