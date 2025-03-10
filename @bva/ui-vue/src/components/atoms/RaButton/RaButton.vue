<template>
  <component
    :is="link ? 'RaLink' : 'button'"
    :class="[
      {
        'ra-button': !raw && !asText,
        'ra-button--raw': raw,
        'ra-button--full-width': fullWidth,
        'ra-button--has-icon': icon,
        'ra-button--loading': loading,
        'ra-link': asText,
      },
      modifierClass(variant),
      modifierClass(size),
      modifierClass(validIconPosition, 'icon'),
    ]"
    :disabled="disabled || loading"
    :link="link || undefined"
    :raw="!!link || undefined"
    :type="effectiveButtonType"
    v-on="$listeners"
  >
    <RaIcon
      v-if="allowIconRender('leading')"
      :icon="icon"
      :size="iconSize"
      :color="iconColor"
    />

    <!--@slot Use this slot to place content inside the button.-->
    <slot />

    <slot name="loader">
      <RaLoader v-if="loading" :overlay="true" />
    </slot>

    <RaIcon
      v-if="allowIconRender('trailing')"
      :icon="icon"
      :size="iconSize"
      :color="iconColor"
    />
  </component>
</template>

<script>
import { focus } from '@bva/ui-vue/src/directives';
import RaLink from '../RaLink/RaLink.vue';
import RaIcon from '../RaIcon/RaIcon.vue';
import RaLoader from '../RaLoader/RaLoader.vue';

export default {
  name: 'RaButton',
  components: { RaLink, RaIcon, RaLoader },
  directives: {
    focus,
  },
  props: {
    /**
     * Disables the button using native browser functionality.
     */
    disabled: {
      type: Boolean,
      default: undefined,
    },
    /**
     * If provided, button renders as an anchor tag (RaLink) instead.
     */
    link: {
      type: String,
      default: undefined,
    },
    /**
     * Renders the button in a style that mimics the base RaLink component.
     */
    asText: {
      type: Boolean,
      default: false,
    },
    /**
     * Modify the Button's main look and feel by using one of the preset modifiers.
     */
    variant: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'button',
    },
    /**
     * Button size. Accepted values: `xs`, `sm`, `lg`.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Expands the button to the full width of its container.
     */
    fullWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * Specify an icon to render on either side of the Button by using the `iconPosition` property.
     */
    icon: {
      type: String,
      default: '',
    },
    /**
     * Control the position of the icon relative to the Button.
     * Accepted values: `leading`, `trailing`.
     */
    iconPosition: {
      type: String,
      default: 'leading',
    },
    /**
     * Adjust the size for the icon on this button.
     */
    iconSize: {
      type: String,
      default: 'sm',
    },
    /**
     * Sets the color for the icon(s) in the component.
     */
    iconColor: {
      type: String,
      default: '',
    },
    /**
     * Handles the use of certain styles specific to the RaButton component.
     * For instance, this may be used to prevent adding the default "ra-button" class
     * to this component, which is useful when rendering buttons as part of something else
     * when all you need is the "raw" routing functionality.
     */
    raw: {
      type: Boolean,
      default: false,
    },
    /**
     * Add a loading state/indicator on the button.
     */
    loading: {
      type: Boolean,
      default: undefined,
    },
    /**
     * Set the timeout to fire a "done" event after `afterLoadingTimeout` ellapses.
     * Triggers after the loading state switches from `true` to `false`.
     */
    afterLoadingTimeout: {
      type: Number,
      default: 3000,
    },
  },
  data() {
    return {
      loadingTimeout: undefined,
    };
  },
  computed: {
    validIconPosition() {
      return !!this.icon && this.iconPosition;
    },
    effectiveButtonType() {
      return !this.link ? this.type : undefined;
    },
  },
  watch: {
    loading(newVal) {
      if (newVal) {
        clearTimeout(this.loadingTimeout);

        this.$emit('start:loading');
      }

      if (!newVal) {
        this.$emit('done:loading');

        if (this.afterLoadingTimeout >= 0) {
          this.loadingTimeout = setTimeout(
            () => this.$emit('done:loading-timeout'),
            this.afterLoadingTimeout
          );
        }
      }
    },
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-button--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
    allowIconRender(desiredPosition) {
      return this.icon && this.validIconPosition === desiredPosition;
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaButton.css';
</style>
