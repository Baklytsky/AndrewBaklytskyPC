<template>
  <transition name="ra-fade">
    <div
      v-if="visible"
      v-bind="$attrs"
      :class="[
        {
          'ra-input__error-message': !raw,
        },
      ]"
    >
      <!-- @slot Custom error message slot for the input -->
      <slot>{{ message }}</slot>
    </div>
  </transition>
</template>

<script>
import { computed } from 'vue-demi';

export default {
  name: 'RaInputError',
  inheritAttrs: false,
  props: {
    /**
     * Controls visibility of the message.
     */
    visible: {
      type: Boolean,
      default: false,
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
};
</script>
