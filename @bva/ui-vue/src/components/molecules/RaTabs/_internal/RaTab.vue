<template>
  <div class="ra-tab">
    <!--@slot Title. Here you should pass a title tab-->
    <slot name="title" v-bind="{ updateToggle, open, title }">
      <RaButton
        :aria-pressed="open.toString()"
        class="ra-tab__toggle"
        :class="{ 'ra-tab__toggle--open': open }"
        raw
        @click="updateToggle"
      >
        {{ title }}
        <RaChevron class="ra-tab__chevron" :rotate="open" />
      </RaButton>
    </slot>

    <div
      v-if="open"
      class="ra-tab__content"
      :class="{ 'ra-tab__content--open': open }"
    >
      <!--@slot Default. Here you should pass your tab content -->
      <slot />
    </div>
  </div>
</template>

<script>
import RaChevron from '../../../atoms/RaChevron/RaChevron.vue';
import RaButton from '../../../atoms/RaButton/RaButton.vue';
import { useScopedToggle } from '@bva/ui-vue/src/composables';

export default {
  name: 'RaTab',
  components: {
    RaChevron,
    RaButton,
  },
  model: {
    prop: 'open',
    event: 'toggle',
  },
  props: {
    /**
     * Sets this item as open.
     */
    open: {
      type: Boolean,
      default: false,
    },
    /**
     * Optionally provide an index for this item.
     * If none is provided, uses the current context to generate one.
     */
    index: {
      type: Number,
      default: -1,
    },
    /**
     * Tab title.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Disables the ability for a tab to toggle itself off.
     */
    disableSelfOff: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const { updateToggle } = useScopedToggle();

    return {
      updateToggle,
    };
  },
};
</script>
