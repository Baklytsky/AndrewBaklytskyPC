<template>
  <transition :name="transition" v-bind="transitionProps">
    <div
      v-if="visible"
      ref="overlay"
      :class="['ra-overlay']"
      :style="[
        {
          '--overlay-background': background,
          '--overlay-opacity': opacity,
          '--overlay-position': position,
        },
      ]"
      v-bind="$attrs"
      v-on="$listeners"
    ></div>
  </transition>
</template>

<script>
export default {
  name: 'RaOverlay',
  inheritAttrs: false,
  props: {
    /**
     * Transition effect to apply when overlay visibility is changed
     */
    transition: {
      type: String,
      default: 'ra-fade',
    },
    /**
     * Transitions properties to apply to the Overlay's Transition component.
     */
    transitionProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Visibility state.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Customize the overlay's background color.
     */
    background: {
      type: String,
      default: '',
    },
    /**
     * Set the CSS `position` property for the overlay.
     */
    position: {
      type: String,
      default: '',
    },
    /**
     * Customize the overlay's opacity.
     */
    opacity: {
      type: String,
      default: '',
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaOverlay.css';
</style>
