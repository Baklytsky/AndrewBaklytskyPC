<template>
  <label
    v-if="isVisible"
    :class="[
      {
        'ra-input__label': !raw,
      },
    ]"
  >
    <!-- @slot Custom input label -->
    <slot>{{ label }}</slot>
  </label>
</template>

<script>
import { computed } from 'vue-demi';
import { useHasSlot } from '@bva/ui-vue/src/composables';

export default {
  name: 'RaInputLabel',
  props: {
    /**
     * Form input label
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Removes any style-specific default properties such as CSS classes.
     */
    raw: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const hasDefaultSlot = useHasSlot();

    const isVisible = computed(() => {
      return props.label || hasDefaultSlot.value;
    });

    return {
      isVisible,
    };
  },
};
</script>
