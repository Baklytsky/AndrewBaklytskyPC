<template>
  <div
    class="ra-bar"
    :class="{
      'ra-bar--no-back': !back,
      'ra-bar--sticky': sticky,
    }"
    :style="{
      '--bar-title-align': titleAlign,
    }"
  >
    <div class="ra-bar__side ra-bar__back">
      <slot name="back">
        <RaIconButton
          v-if="back"
          aria-label="back"
          class="ra-bar__icon"
          v-bind="{
            icon: backIcon,
            size: 'sm',
            iconSize: 'lg',
            variant: 'ghost',
            ...backProps,
          }"
          @click="$emit('click:back')"
        />
      </slot>
    </div>

    <div class="ra-bar__title">
      <slot name="title" v-bind="{ title }">
        {{ title }}
      </slot>
    </div>

    <div class="ra-bar__side ra-bar__close">
      <slot name="close">
        <RaIconButton
          v-if="close"
          class="ra-bar__icon"
          aria-label="close"
          v-bind="{
            icon: closeIcon,
            size: 'sm',
            iconSize: 'lg',
            variant: 'ghost',
            ...closeProps,
          }"
          @click="$emit('click:close')"
        />
      </slot>
    </div>
  </div>
</template>

<script>
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';

export default {
  name: 'RaBar',
  components: {
    RaIconButton,
  },
  props: {
    /**
     * The title for the bar.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Set a custom alignment for the bar's title.
     */
    titleAlign: {
      type: String,
      default: '',
    },
    /**
     * Toggle visibility of the "back" button on the bar.
     */
    back: {
      type: Boolean,
      default: false,
    },
    /**
     * Choose the "back" icon to display on the bar.
     */
    backIcon: {
      type: String,
      default: 'chevron_left',
    },
    /**
     * Set additional props to be passed directly into the "back" button.
     * Refer to the `RaIconButton` component to learn more.
     */
    backProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Toggle visibility of the "close" button on the bar.
     */
    close: {
      type: Boolean,
      default: false,
    },
    /**
     * Choose the "close" icon to display on the bar.
     */
    closeIcon: {
      type: String,
      default: 'cross',
    },
    /**
     * Set additional props to be passed directly into the "close" button.
     * Refer to the `RaIconButton` component to learn more.
     */
    closeProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Makes the bar stick to the viewport top.
     */
    sticky: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaBar.css';
</style>
