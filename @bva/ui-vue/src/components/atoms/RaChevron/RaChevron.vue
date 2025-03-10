<template>
  <component
    :is="interact ? 'RaButton' : 'div'"
    :class="[
      'ra-chevron',
      {
        'ra-chevron--non-interactive': !interact,
        'ra-chevron--rotate': rotate,
      },
      modifierClass(size),
    ]"
    :variant="variant"
    v-on="$listeners"
  >
    <!-- @slot Custom chevron markup -->
    <slot>
      <RaIcon
        :icon="active ? iconActive : icon"
        :size="iconSize"
        :color="iconColor"
        class="ra-chevron__icon"
      />
    </slot>
  </component>
</template>

<script>
import { formatModifier } from '@bva/ui-shared/helpers';

import RaIcon from '../RaIcon/RaIcon.vue';
import RaButton from '../RaButton/RaButton.vue';

export default {
  name: 'RaChevron',
  components: {
    RaIcon,
    RaButton,
  },
  props: {
    /**
     * Modify the Chevron's main look and feel by using one of the preset modifiers.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Chevron size. Accepted values: `xs`, `sm`, `lg`.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Signals the component to render its "active" view.
     */
    active: {
      type: Boolean,
      default: false,
    },
    /**
     * Update the default/inactive state icon for the component.
     */
    icon: {
      type: String,
      default: 'chevron_down',
    },
    /**
     * Update the active state icon for the component.
     */
    iconActive: {
      type: String,
      default: 'chevron_down',
    },
    /**
     * Chevron icon size. Accepted values: `sm`, `lg`, `xl`.
     */
    iconSize: {
      type: String,
      default: '',
    },
    /**
     * Sets the color for the icon(s) in the component.
     */
    iconColor: {
      type: String,
      default: '',
    },
    /**
     * Enables interaction with the Chevron by rendering it as a Button.
     */
    interact: {
      type: Boolean,
      default: false,
    },
    /**
     * Rotates the component's icon.
     */
    rotate: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const modifierClass = formatModifier.bind(this, 'ra-chevron');

    return {
      modifierClass,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaChevron.css';
</style>
