<template>
  <option
    v-if="isDropdown"
    :class="[
      'ra-option',
      {
        'ra-option--selected': selected,
        'ra-option--disabled': disabled,
      },
      modifierClass(dimensions.preset),
      modifierClass(variant),
    ]"
    :value="value"
    :disabled="disabled"
    v-bind="$attrs"
  >
    {{ label || value }}
  </option>

  <RaButton
    v-else
    :class="[
      'ra-option',
      {
        'ra-option--selected': selected,
        'ra-option--disabled': disabled,
      },
      modifierClass(dimensions.preset),
      modifierClass(variant),
    ]"
    :style="{
      '--picker-option-size': dimensions.size,
      '--picker-option-width': dimensions.width,
      '--picker-option-height': dimensions.height,
    }"
    :aria-pressed="selected.toString()"
    :aria-label="label || value"
    :data-testid="value"
    :raw="true"
    :disabled="disabled"
    v-bind="$attrs"
    v-on="$listeners"
    @click="$emit('change', !selected)"
    ><span class="ra-option__label">{{ label || value }}</span></RaButton
  >
</template>

<script>
import { computed } from 'vue-demi';
import { formatModifier, getDimensions } from '@bva/ui-shared/helpers';

import RaButton from '../../../atoms/RaButton/RaButton.vue';

export default {
  name: 'RaOption',
  components: {
    RaButton,
  },
  props: {
    /**
     * The label/aria-label value for this option.
     * May be displayed when hovering over the option or for accessibility reasons.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Specify a value for the option.
     */
    value: {
      type: String,
      default: '',
      required: true,
    },
    /**
     * Use a string to control both the width and height for the option.
     * The string can be either a CSS Unit or one of the preset keywords: `sm`, `md`, `lg`.
     * Alternatively pass an object with independent `width` and `height` properties.
     * The properties must include CSS Units and Variables.
     */
    size: {
      type: [Object, String],
      default: '',
    },
    /**
     * Modify the Option's look and feel by using one of the preset modifiers.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Determines the selection state for the component.
     */
    selected: {
      type: Boolean,
      default: false,
    },
    /**
     * Toggles the disabled state for the component.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const isDropdown = computed(() => {
      return props.variant === 'dropdown';
    });

    const dimensions = computed(() => {
      return getDimensions(props.size);
    });

    const modifierClass = formatModifier.bind(this, 'ra-option');

    return {
      isDropdown,
      dimensions,
      modifierClass,
    };
  },
};
</script>
