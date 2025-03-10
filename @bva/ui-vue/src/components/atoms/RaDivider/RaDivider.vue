<template>
  <hr
    :class="['ra-divider', modifierClass(variant), dividerTextClasses]"
    :data-text="text"
  />
</template>
<script>
import { formatModifier } from '@bva/ui-shared/helpers';
import { computed } from 'vue-demi';

export default {
  name: 'RaDivider',
  props: {
    /**
     * Control the divider's main look and feel using one of the presets:
     * `dark`, `dark-50`, `light`, `light-50`.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Optional "overlay" text to add to divider
     */
    text: {
      type: String,
      default: '',
    },
    /**
     * Text algin along the divider
     */
    textPosition: {
      type: String,
      default: 'center',
      validator: () => ['center', 'left', 'right'],
    },
  },
  setup(props) {
    const modifierClass = formatModifier.bind(this, 'ra-divider');

    const dividerTextClasses = computed(() =>
      props.text
        ? `${modifierClass('text')} ${modifierClass(
            `text-${props.textPosition}`
          )}`
        : ''
    );

    return {
      modifierClass,
      dividerTextClasses,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaDivider.css';
</style>
