<template>
  <component
    :is="as"
    :class="[
      {
        'ra-container': !raw,
      },
      ...isCombinedMaxWidthClasses,
    ]"
    :style="[backgroundVariables, foregroundVariables, boundaryVars]"
    v-bind="{ ...boundaryScope }"
  >
    <!-- @slot Use this slot to add a custom heading. -->
    <slot
      name="heading"
      v-bind="{ title, titleLevel, titleAs, description, headingAlign }"
    >
      <RaHeading
        v-if="title"
        :class="[
          {
            'ra-container__heading': !raw,
          },
          headingClass,
          ...classesMaxWidth,
        ]"
        :level="titleLevel"
        :as="titleAs"
        :title="title"
        :description="description"
        :align="headingAlign"
        :margin="headingMargin"
        :cms-bindings="cmsBindings"
      />
    </slot>

    <template v-if="combined">
      <!-- @slot Use this slot to add content within this container. -->
      <slot />
    </template>
    <div v-else :class="[...classesMaxWidth, innerClass]">
      <!-- @slot Use this slot to add content within this container. -->
      <slot />
    </div>
  </component>
</template>

<script>
import { computed, toRef, toRefs } from 'vue-demi';

import RaHeading from '../../atoms/RaHeading/RaHeading.vue';
import StylesMixins from '@bva/ui-vue/src/mixins/common-styles';
import ContainerMixins from '@bva/ui-vue/src/mixins/container-layout';
import TextMixins from '@bva/ui-vue/src/mixins/common-text';
import CMSMixins from '@bva/ui-vue/src/mixins/common-cms';
import { useBoundaries, useScopedVars } from '@bva/ui-vue/src/composables';

/**
 * A container which can be used to wrap content or components.
 * Has controls for max width, vertical & horizontal spacing, background & text color, and more.
 */
export default {
  name: 'RaContainer',
  components: { RaHeading },
  mixins: [ContainerMixins, TextMixins, StylesMixins, CMSMixins],
  props: {
    /**
     * Choose the HTML tag to use for rendering.
     */
    as: {
      type: String,
      default: 'section',
    },
    /**
     * Uses only layout classes and logic on this container.
     */
    raw: {
      type: Boolean,
      default: false,
    },
    maxWidth: {
      type: String,
      default: 'large',
    },
    /**
     * Forces the compoment to render using a single `<div>`,
     * instead of separating the spacing `<div>` and the max-width `<div>`.
     */
    combined: {
      type: Boolean,
      default: false,
    },
    titleLevel: {
      type: Number,
      default: 2,
    },
    titleAs: {
      type: Number,
      default: 3,
    },
    /**
     * Control the default alignment for the heading.
     * Available options: `left`, `center`, `right`.
     */
    headingAlign: {
      type: String,
      default: '',
    },
    /**
     * Adjust the spacing used in the heading. Accepts any valid CSS unit value or a CSS Custom Property.
     */
    headingMargin: {
      type: String,
      default: 'var(--spacing-lg)',
    },
    /**
     * Provide a class for the container heading element.
     */
    headingClass: {
      type: [Object, String],
      default: '',
    },
    /**
     * Provide a class for the inner container element.
     */
    innerClass: {
      type: [Object, String],
      default: '',
    },
  },
  setup(props) {
    const reactiveProps = toRefs(props);

    const {
      vars: boundaryVars,
      scope: boundaryScope,
      classesMaxWidth,
    } = useBoundaries({
      top: reactiveProps.spacingTop,
      bottom: reactiveProps.spacingBottom,
      edge: reactiveProps.spacingEdge,
      maxWidth: reactiveProps.maxWidth,
    });

    /**
     * Returns the list of classes to use only if the `combined` flag is `true`.
     */
    const isCombinedMaxWidthClasses = computed(() => {
      return props.combined ? classesMaxWidth.value : [];
    });

    return {
      isCombinedMaxWidthClasses,
      classesMaxWidth,
      boundaryVars,
      boundaryScope,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaContainer.css';
</style>
