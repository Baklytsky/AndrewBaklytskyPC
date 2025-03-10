<template>
  <div
    class="ra-heading"
    :style="[
      {
        '--heading-margin': margin,
        '--heading-text-align': align,
      },
    ]"
    v-on="$listeners"
  >
    <!--@slot Heading title. Slot content will replace default <h> tag-->
    <slot name="title" v-bind="{ ...$props }">
      <RaTitle
        :level="level"
        :as="as"
        :title="title"
        :class="[titleClass, 'ra-heading__title']"
        v-bind="{ ...cmsBindings.title }"
      />
    </slot>
    <!--@slot Heading description. Slot content will replace default <div> tag-->
    <slot name="description" v-bind="{ ...$props }">
      <div
        v-if="description"
        class="ra-heading__description"
        :class="descriptionClass"
        v-bind="{ ...cmsBindings.description }"
        v-html="description"
      ></div>
    </slot>
  </div>
</template>

<script>
import RaTitle from '../RaTitle/RaTitle.vue';
import CommonCMSMixins from '@bva/ui-vue/src/mixins/common-cms';

export default {
  name: 'RaHeading',
  components: {
    RaTitle,
  },
  mixins: [CommonCMSMixins],
  props: {
    /**
     * Renders the heading tag using this level, i.e. a value of 2 renders an h2 tag.
     */
    level: {
      type: Number,
      default: 2,
    },
    /**
     * Display the heading's title as another level.
     * i.e. the real heading tag can be h1, and displayed as an h3 with CSS.
     */
    as: {
      type: Number,
      default: null,
    },
    /**
     * The copy to render as the title.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * A description or subtitle to go along the title.
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * Heading title custom classes
     */
    titleClass: {
      type: String,
      default: '',
    },
    /**
     * Heading description custom classes
     */
    descriptionClass: {
      type: String,
      default: '',
    },
    /**
     * Control the default alignment for the heading.
     * Available options: `left`, `center`, `right`.
     */
    align: {
      type: String,
      default: '',
    },
    /**
     * Adjust the spacing used in the heading. Accepts any valid CSS unit value or a CSS Custom Property.
     */
    margin: {
      type: String,
      default: '',
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaHeading.css';
</style>
