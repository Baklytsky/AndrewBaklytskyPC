<template>
  <RaButton
    :class="[
      'ra-icon-button',
      modifierClass(variant),
      modifierClass(size),
      modifierClass(shape),
      {
        'ra-badge-interact-container': hasBadge,
      },
    ]"
    :disabled="disabled"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!--@slot Custom content that will replace default icon. can be used for inlined SVG's-->
    <slot>
      <RaIcon
        aria-hidden="true"
        class="ra-icon-button__icon"
        :icon="icon"
        :color="iconColor"
        :size="iconSize || size"
      />
    </slot>

    <RaBadge
      v-if="hasBadge"
      class="ra-icon-button__badge"
      :notification="true"
      :size="badgeSize"
      :variant="badgeVariant"
      >{{ badgeLabel }}</RaBadge
    >
  </RaButton>
</template>
<script>
import { formatModifier } from '@bva/ui-shared/helpers';

import RaButton from '../RaButton/RaButton.vue';
import RaIcon from '../RaIcon/RaIcon.vue';
import RaBadge from '../RaBadge/RaBadge.vue';

export default {
  name: 'RaIconButton',
  components: {
    RaButton,
    RaIcon,
    RaBadge,
  },
  props: {
    /**
     * Modify the Button's main look and feel by using one of the preset modifiers.
     * Available options: `primary`, `secondary`, `success`, `info`, `warning`, `danger`, `ghost`.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Specify the Button size.
     * Available options: `sm`, `base`, `lg`, `xl`.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Define the Button's shape.
     * Available options: `rounded`, `square`.
     */
    shape: {
      type: [String, Boolean],
      default: 'rounded',
    },
    /**
     * Specify the icon ID to render inside the Button.
     */
    icon: {
      type: [String, Array],
      default: 'home',
    },
    iconColor: {
      type: String,
      default: '',
    },
    iconSize: {
      type: String,
      default: '',
    },
    hasBadge: {
      type: Boolean,
      default: false,
    },
    badgeSize: {
      type: String,
      default: '',
    },
    badgeVariant: {
      type: String,
      default: 'danger',
    },
    badgeLabel: {
      type: [Number, String],
      default: '',
    },
    /**
     * Disables the Button using native browser functionality.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const modifierClass = formatModifier.bind(this, 'ra-icon-button');

    return {
      modifierClass,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaIconButton.css';
</style>
