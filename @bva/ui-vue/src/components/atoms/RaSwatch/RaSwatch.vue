<template>
  <RaButton
    :class="[
      'ra-swatch',
      {
        'ra-swatch--selected': selected,
        'ra-swatch--no-badge': !displayBadge,
        'ra-swatch--disabled': disabled,
        'ra-swatch--invisible': invisible,
      },
      modifierClass(dimensions.preset),
      modifierClass(shape),
    ]"
    :style="{
      '--swatch-value': color || value,
      '--swatch-image': formattedImage,
      '--swatch-size': dimensions.size,
      '--swatch-width': dimensions.width,
      '--swatch-height': dimensions.height,
    }"
    :aria-pressed="selected.toString()"
    :aria-label="label || value"
    :data-testid="value"
    :raw="true"
    :disabled="disabled"
    v-bind="$attrs"
    v-on="$listeners"
    @click="$emit('change', !selected)"
  >
    <!-- @click="listeners['change'](!selected)" -->
    <transition name="ra-bounce">
      <!-- @slot Use it to replace badge to custom element -->
      <slot name="badge" v-bind="{ ...$props }">
        <RaBadge
          v-if="selected && displayBadge"
          class="ra-swatch__badge"
          icon="check"
          :notification="true"
          size="xs"
          variant="tertiary"
        />
      </slot>
    </transition>

    <span v-if="disabled" class="ra-swatch__disabled-icon"></span>
  </RaButton>
</template>

<script>
import { computed } from 'vue-demi';
import {
  getDimensions,
  getCSSMediaURL,
  formatModifier,
} from '@bva/ui-shared/helpers';

import RaBadge from '../RaBadge/RaBadge.vue';
import RaButton from '../RaButton/RaButton.vue';

export default {
  name: 'RaSwatch',
  components: {
    RaBadge,
    RaButton,
  },
  props: {
    /**
     * The label/aria-label value for this swatch.
     * May be displayed when hovering over the swatch or for accessibility reasons.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Specify a value for the swatch.
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * Optionally pass a color to display, in case the `value` prop is not a good fit.
     * The color can be a hex, RGB, HSL, or image URL.
     */
    color: {
      type: String,
      default: '',
    },
    /**
     * Optionally pass an image URL to display, in case the `value` or `color` props are not a good fit.
     */
    image: {
      type: String,
      default: undefined,
    },
    /**
     * Use a string to control both the width and height for the swatch.
     * The string can be either a CSS Unit or one of the preset keywords: `sm`, `md`, `lg`.
     * Alternatively pass an object with independent `width` and `height` properties.
     * The properties must include CSS Units and Variables.
     */
    size: {
      type: [Object, String],
      default: '',
    },
    /**
     * Modify the Swatch's look and feel by using one of the shape modifiers: `rounded`, `square` (default).
     */
    shape: {
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
    /**
     * Whether or not to display a selection marker.
     */
    displayBadge: {
      type: Boolean,
      default: false,
    },
    /**
     * Controls the swatch visibility but it does not remove it from the DOM.
     */
    invisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const dimensions = computed(() => getDimensions(props.size));
    const formattedImage = computed(() => getCSSMediaURL(props.image));

    const modifierClass = formatModifier.bind(this, 'ra-swatch');

    return {
      dimensions,
      formattedImage,
      modifierClass,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaSwatch.css';
</style>
