<template>
  <div
    :class="['ra-split-button', modifierClass(size), inherited.classes]"
    :style="[inherited.styles]"
  >
    <!--@slot Replace the markup for the "main" CTA. -->
    <slot name="main">
      <RaButton
        class="ra-split-button__main-action"
        v-bind="{
          variant,
          size,
          fullWidth: true,
          disabled,
          ...inherited.attrs,
          ...inherited.listeners,
        }"
        v-on="$listeners"
      >
        <!--@slot Populate the contents of the "main" CTA. -->
        <slot />
      </RaButton>
    </slot>

    <!--@slot Replace the markup for the "alt" CTA. -->
    <slot name="alt">
      <!--
        Triggered when clicking on the "alt" CTA, i.e. the carat or chevron.
        @event click:alt
      -->
      <RaChevron
        class="ra-split-button__alt-action"
        :variant="variant"
        :size="size"
        :interact="true"
        :disabled="disabled"
        :active="active"
        :icon="icon"
        :icon-active="iconActive"
        @click="$emit('click:alt')"
      />
    </slot>
  </div>
</template>

<script>
import { useInherited } from '@bva/ui-vue/src/composables';
import { formatModifier } from '@bva/ui-shared/helpers';

import RaButton from '../RaButton/RaButton.vue';
import RaChevron from '../RaChevron/RaChevron.vue';

export default {
  name: 'RaSplitButton',
  components: {
    RaButton,
    RaChevron,
  },
  inheritAttrs: false,
  props: {
    /**
     * Modify the Button's main look and feel by using one of the preset modifiers.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Split Button size. Accepted values: `xs`, `sm`, `lg`.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Control the active state for the "alt" CTA.
     */
    active: {
      type: Boolean,
      default: false,
    },
    /**
     * Update the default/inactive state for the "alt" CTA.
     */
    icon: {
      type: String,
      default: 'chevron_down',
    },
    /**
     * Update the active state icon for the "alt" CTA.
     */
    iconActive: {
      type: String,
      default: 'chevron_down',
    },
    /**
     * Control the disable state for both CTAs.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const modifierClass = formatModifier.bind(this, 'ra-split-button');

    return {
      inherited: useInherited(),
      modifierClass,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaSplitButton.css';
</style>
