<template>
  <div
    :class="['ra-bone', modifierClass(variant), modifierClass(animation)]"
    :style="[dimensionVariables]"
  ></div>
</template>

<script>
import { formatPercent } from '@bva/ui-shared/helpers';

export default {
  name: 'RaBone',
  props: {
    /**
     * Defines shape for RaSkeleton.
     * Available options: `paragraph`, `image`, `button`, `input`, `avatar`.
     */
    variant: {
      type: String,
      default: 'paragraph',
      validator: (value) => ['paragraph', 'image', 'button', 'input', 'avatar'],
    },
    /**
     * Choose the animation type for this bone.
     * Available options: `linear`, `fade`, `pulsate`, `none`.
     */
    animation: {
      type: String,
      default: 'linear',
      validator: (value) => ['linear', 'fade', 'pulsate', 'none'],
    },
    /**
     * Set how wide the bone will render.
     */
    width: {
      type: [Number, String],
      default: '',
    },
    /**
     * Set how tall the bone will render.
     */
    height: {
      type: [Number, String],
      default: '',
    },
  },
  computed: {
    dimensionVariables() {
      return {
        '--component-width': this.width && formatPercent(this.width),
        '--component-height': this.height && formatPercent(this.height),
      };
    },
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-bone--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
  },
};
</script>
