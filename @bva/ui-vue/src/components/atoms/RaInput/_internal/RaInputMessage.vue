<template>
  <div
    v-if="isVisible"
    :class="[
      {
        'ra-input__message': !raw,
      },
    ]"
  >
    <!-- @slot Custom message slot for the input -->
    <slot>{{ message }}</slot>
  </div>
</template>

<script>
import { computed } from 'vue-demi';
import { useHasSlot } from '@bva/ui-vue/src/composables';

export default {
  name: 'RaInputMessage',
  props: {
    /**
     * Controls visibility of the message.
     */
    visible: {
      type: Boolean,
      default: true,
    },
    /**
     * Set the message to display.
     */
    message: {
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
  setup(props) {
    const hasDefaultSlot = useHasSlot();

    const isVisible = computed(() => {
      return props.visible && (props.message || hasDefaultSlot.value);
    });

    return {
      isVisible,
    };
  },
};
</script>
