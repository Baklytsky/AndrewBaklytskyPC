<template>
  <component :is="as" class="ra-editorial">
    <div v-html="content"></div>
    <!--@slot Use this slot to place Vue elements inside the editorial component.-->
    <slot />
  </component>
</template>

<script>
/**
 * Generates a generic typographic block.
 *
 * These styles provide an easy way for the business user to create pages or blocks
 * of content without needing to provide specific classes or structure on the elements.
 * This is useful for non-designed pages and sections.
 */
export default {
  name: 'RaEditorial',
  props: {
    /**
     * Customize the HTML tag rendered by the component.
     */
    as: {
      type: String,
      default: 'article',
    },
    /**
     * Provide an HTML String to render.
     */
    content: {
      type: String,
      default: '',
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaEditorial.css';
</style>
