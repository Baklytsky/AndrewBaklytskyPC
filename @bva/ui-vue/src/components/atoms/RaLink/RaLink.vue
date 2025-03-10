<template>
  <component
    :is="linkComponentTag"
    v-bind="urlAttribute"
    :class="[
      {
        'ra-link': !raw,
        'ra-link--flex': flex,
        'ra-link--no-underline': !underline,
        'ra-link--inherit-color': inheritColor,
      },
      modifierClass(size),
    ]"
    v-on="$listeners"
  >
    <!-- @slot -->
    <slot />
  </component>
</template>
<script>
import { focus } from '@bva/ui-vue/src/directives';
import { getIsAbsoluteURL } from '@bva/ui-shared/helpers';

export default {
  name: 'RaLink',
  directives: { focus },
  props: {
    /**
     * Customize the HTML tag rendered by the component.
     */
    as: {
      type: String,
      default: 'a',
    },
    /**
     * URL or Page Route to link to.
     */
    link: {
      type: String,
      default: '',
    },
    /**
     * Specify the routing attribute to use for this link.
     * Set to `true` to replace the default routing mechanism "href" with "to".
     */
    router: {
      type: [Boolean, String],
      default: undefined,
    },
    /**
     * Handles the use of certain styles specific to the RaLink component.
     * For instance, this may be used to prevent adding the default "ra-link" class
     * to this component, which is useful when rendering links as part of something else
     * when all you need is the "raw" routing functionality.
     */
    raw: {
      type: Boolean,
      default: false,
    },
    /**
     * Adds a special class to render the link using `display: inline-flex;`.
     */
    flex: {
      type: Boolean,
      default: false,
    },
    /**
     * Controls the display of the link's underline.
     */
    underline: {
      type: Boolean,
      default: true,
    },
    /**
     * Link size. Accepted values: `xs`, `sm`, `lg`.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Forces the link to display using the current color.
     */
    inheritColor: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isDefaultTag() {
      return this.as === 'a';
    },
    customTag() {
      return this.isDefaultTag
        ? this.$nuxt
          ? 'nuxt-link'
          : 'router-link'
        : this.as;
    },
    isNativeLink() {
      return (
        (this.isDefaultTag && !this.$router && !this.router) ||
        getIsAbsoluteURL(this.link)
      );
    },
    routerAttr() {
      return typeof this.router === 'string' ? this.router : 'to';
    },
    urlAttribute() {
      return this.isNativeLink
        ? { href: this.link }
        : { [this.routerAttr]: this.link };
    },
    linkComponentTag() {
      return this.isNativeLink ? 'a' : this.customTag;
    },
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-link--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaLink.css';
</style>
