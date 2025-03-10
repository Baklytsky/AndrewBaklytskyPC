<template>
  <component
    :is="componentTag"
    :class="[
      'ra-list',
      {
        'ra-list--show-bullets': bullets,
        'ra-list--hide-bullets': !bullets,
      },
    ]"
    :style="{
      '--list-style': listStyleType,
    }"
  >
    <!-- @slot to hydrate using `RaListItem` or similar components -->
    <slot v-bind="{ as }" />
  </component>
</template>

<script>
export default {
  name: 'RaList',
  props: {
    as: {
      type: String,
      default: '',
    },
    /**
     * If `true`, displays default bullet styles in this list.
     */
    bullets: {
      type: Boolean,
      default: false,
    },
    /**
     * Renders the list as an ordered list `ol` and sets the list-style-type to `decimal`.
     */
    ordered: {
      type: Boolean,
      default: false,
    },
    /**
     * Set the list-style-type for the component.
     */
    styleType: {
      type: String,
      default: null,
    },
  },
  computed: {
    componentTag() {
      return this.as || (this.ordered ? 'ol' : 'ul');
    },
    listStyleType() {
      return this.styleType || (this.ordered ? 'decimal' : null);
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaList.css';
</style>
