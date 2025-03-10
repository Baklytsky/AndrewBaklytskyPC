<template>
  <div v-if="contained && provideContainer" class="ra-sticky-container">
    <div v-sticky="$props" class="ra-sticky" v-bind="$attrs" v-on="$listeners">
      <!-- @slot -->
      <slot />
    </div>
  </div>

  <div
    v-else
    v-sticky="$props"
    class="ra-sticky"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- @slot -->
    <slot />
  </div>
</template>

<script>
import { Sticky } from '@bva/ui-vue/src/directives';

export default {
  name: 'RaSticky',
  directives: {
    Sticky,
  },
  inheritAttrs: false,
  props: {
    enabled: {
      type: [Boolean, String],
      default: true,
    },
    contained: {
      type: [Boolean, String],
      default: false,
    },
    offset: {
      type: Number,
      default: 0,
    },
    offsetEl: {
      type: String,
      default: null,
    },
    classScope: {
      type: String,
      default: 'sticky',
    },
    eventScope: {
      type: String,
      default: 'sticky',
    },
    autoWidth: {
      type: Boolean,
      default: true,
    },
    applyOffset: {
      type: Boolean,
      default: true,
    },
    waitUntilScrolled: {
      type: Boolean,
      default: true,
    },
    heightThereshold: {
      type: Number,
      default: 25,
    },
    enableDirectionUpdates: {
      type: Boolean,
      default: false,
    },
    scrollDirectionResetWait: {
      type: Number,
      default: 20,
    },
    scrollPositionThereshold: {
      type: Number,
      default: 80,
    },
    fromViewportBottom: {
      type: Boolean,
      default: false,
    },
    reversePlaceholderBehavior: {
      type: Boolean,
      default: false,
    },
    camelCaseEvents: {
      type: Boolean,
      default: false,
    },
    provideContainer: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaSticky.css';
</style>
