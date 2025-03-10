<template>
  <transition
    :name="effectiveTransition"
    @before-enter="setBounds"
    @enter="setHeightWithBounds"
    @after-enter="resetHeight"
    @before-leave="setHeight"
    @after-leave="resetHeight"
    v-on="$listeners"
  >
    <slot />
  </transition>
</template>

<script>
import {
  getTotalVerticalBounds,
  setElementHeight,
  resetElementHeight,
} from '@bva/ui-shared/helpers';

export default {
  props: {
    /**
     * Allow for controlling easing, duration, and other non-logical aspects of this transition through CSS classes.
     * Refer to `/src/css/_transitions.css` to learn more.
     */
    name: {
      type: [String, Boolean],
      default: 'ra-expand',
    },
    /**
     * Specify a custom target height for the transition to expand to/from.
     */
    targetHeight: {
      type: String,
      default: undefined,
    },
    group: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      boundsSum: 0,
    };
  },
  computed: {
    effectiveTransition() {
      return this.name || '';
    },
  },
  methods: {
    setBounds(el) {
      this.boundsSum = getTotalVerticalBounds(el);
    },
    setHeight(el) {
      setElementHeight(el, { height: this.targetHeight });
    },
    setHeightWithBounds(el) {
      setElementHeight(el, {
        inreaseBy: this.boundsSum,
        height: this.targetHeight,
      });
    },
    resetHeight(el) {
      resetElementHeight(el);
    },
  },
};
</script>
