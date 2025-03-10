<template>
  <div :class="variantClass" class="ra-alert">
    <!--@slot Custom alert icon. Slot content will replace default icon <RaIcon/> tag.-->
    <slot name="icon" v-bind="{ effectiveIcon }">
      <RaIcon
        class="ra-alert__icon"
        v-bind="{
          icon: effectiveIcon,
          ...iconProps,
        }"
      />
    </slot>
    <!--@slot Custom message . Slot content will replace default message <span> tag.-->
    <slot name="message" v-bind="{ message }">
      <span v-if="message" class="ra-alert__message">{{ message }}</span>
    </slot>
  </div>
</template>
<script>
import RaIcon from '../../atoms/RaIcon/RaIcon.vue';
export default {
  name: 'RaAlert',
  components: {
    RaIcon,
  },
  props: {
    /**
     * Message to be displayed with the alert.
     */
    message: {
      type: String,
      default: '',
    },
    /**
     * Alert type using one of the standard UI colors.
     */
    variant: {
      type: String,
      default: 'info',
      validator: function (value) {
        return [
          'primary',
          'secondary',
          'tertiary',
          'info',
          'success',
          'warning',
          'danger',
        ].includes(value);
      },
    },
    /**
     * Custom icon to display instead of the inferred one from the alert `type`.
     */
    icon: {
      type: String,
      default: '',
    },
    /**
     * Props to pass through directly to the `RaIcon` component.
     * Read the `RaIcon` docs to learn more.
     */
    iconProps: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    effectiveIcon() {
      if (this.icon) {
        return this.icon;
      }

      switch (this.variant) {
        case 'success':
          return 'check';
        case 'danger':
          return 'error';
        default:
          return 'info';
      }
    },
    variantClass() {
      return `ra-alert--${this.variant}`;
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaAlert.css';
</style>
