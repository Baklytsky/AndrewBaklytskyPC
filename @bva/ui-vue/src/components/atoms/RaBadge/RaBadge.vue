<template>
  <div
    :class="[
      'ra-badge',
      {
        'ra-badge--standard': !notification,
        'ra-badge--notification': notification,
        'ra-badge--has-text': hasContent,
      },
      modifierClass(variant),
      modifierClass(size),
    ]"
    v-on="$listeners"
  >
    <RaIcon v-if="allowIconRender('leading')" :icon="icon" :size="iconSize" />

    <!--@slot Use this slot to place content inside the badge-->
    <slot />

    <RaIcon v-if="allowIconRender('trailing')" :icon="icon" :size="iconSize" />
  </div>
</template>

<script>
import { computed } from 'vue-demi';
import { useHasSlot } from '@bva/ui-vue/src/composables';
import { formatModifier } from '@bva/ui-shared/helpers';

import RaIcon from '../RaIcon/RaIcon.vue';

export default {
  name: 'RaBadge',
  components: {
    RaIcon,
  },
  props: {
    /**
     * Modify the Badge's main look and feel by using one of the preset modifiers.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Badge size, accepted values: `small`, `default`, `large`.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Renders the Badge as a notification, which means its spacing and sizing is smaller.
     */
    notification: {
      type: Boolean,
      default: false,
    },
    /**
     * Specify an icon to render on either side of the Badge by using the `iconPosition` property.
     */
    icon: {
      type: String,
      default: '',
    },
    /**
     * Control the position of the icon relative to the Button.
     * Accepted values: `leading`, `trailing`.
     */
    iconPosition: {
      type: String,
      default: 'leading',
    },
    /**
     * Adjust the size for the icon on this badge.
     */
    iconSize: {
      type: String,
      default: 'sm',
    },
  },
  setup(props, { slots }) {
    const validIconPosition = computed(() => {
      return !!props.icon && props.iconPosition;
    });

    const hasContent = useHasSlot();

    const modifierClass = formatModifier.bind(this, 'ra-badge');

    const allowIconRender = (desiredPosition) => {
      return props.icon && validIconPosition.value === desiredPosition;
    };

    return {
      validIconPosition,
      hasContent,
      modifierClass,
      allowIconRender,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaBadge.css';
</style>
