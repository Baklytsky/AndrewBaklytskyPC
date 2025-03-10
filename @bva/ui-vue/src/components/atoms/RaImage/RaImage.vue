<template>
  <div
    :class="[
      'ra-image',
      {
        'ra-image--use-aspect-ratio': useAspectRatio,
        'ra-image--use-as-background': useAsBackground,
      },
      inherited.classes,
    ]"
    :style="dimensionVariables"
    data-testid="image-wrapper"
    v-bind="{ ...containerProps }"
  >
    <picture v-if="sortedSrcset.length > 1 && !hasWidthOrResolution">
      <source
        v-for="item in sortedSrcset"
        :key="item.src"
        :srcset="item.src"
        :media="formatBreakpoint(item.breakpoint, false)"
      />
      <img
        ref="mediaEl"
        :loading="loading"
        v-bind="{ ...inherited.attrs, ...inherited.listeners }"
        :src="src"
        :class="mediaClasses"
        :width="width"
        :height="height"
        :alt="alt"
        @load="handleLoad"
        v-on="$listeners"
      />
      <img
        v-if="!loaded && placeholder"
        class="ra-image__placeholder"
        :src="placeholder"
        :alt="alt"
      />
    </picture>

    <template v-else-if="src || formattedSrcset">
      <img
        ref="mediaEl"
        :loading="loading"
        v-bind="{ ...inherited.attrs, ...inherited.listeners }"
        :src="src"
        :srcset="formattedSrcset"
        :sizes="formattedSizes"
        :class="mediaClasses"
        :width="width"
        :height="height"
        :alt="alt"
        @load="handleLoad"
        v-on="$listeners"
      />
      <img
        v-if="!loaded && placeholder"
        class="ra-image__placeholder"
        :src="placeholder"
        :alt="alt"
      />
    </template>
  </div>
</template>

<script>
import { computed } from 'vue-demi';
import { useImage, useMedia, useInherited } from '@bva/ui-vue/src/composables';

export default {
  name: 'RaImage',
  inheritAttrs: false,
  props: {
    /**
     * Main source url for the image.
     */
    src: {
      type: String,
      default: '',
    },
    /**
     * Array of image sources, dimensions, and breakpoints to generate the image's HTML `srcset` attribute.
     */
    srcset: {
      type: Array,
      default: () => [],
      validator: (value) =>
        value.length === 0 || value.every((item) => item.src),
    },
    /**
     * Alternative text in case image is not loaded. Use empty string " " for decorative-only image and full text otherwise.
     */
    alt: {
      type: String,
      default: '',
    },
    /**
     * Width of the image.
     * Can be used to determine the aspect-ratio of the image.
     */
    width: {
      type: [String, Number],
      default: '',
    },
    /**
     * Height of the image.
     * Can be used to determine the aspect-ratio of the image.
     */
    height: {
      type: [String, Number],
      default: '',
    },
    /**
     * Url source of the image's placeholder while it is loading.
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Provide a custom class to add to the `img` HTML tag.
     */
    imageClass: {
      type: String,
      default: '',
    },
    /**
     * Native loading attribute supported, either "eager", "lazy" or none.
     */
    loading: {
      type: String,
      default: 'lazy',
      validator: (value) => ['', 'lazy', 'eager'].includes(value),
    },
    /**
     * Controls image visibility while it is loading.
     */
    loadingVisible: {
      type: Boolean,
      default: false,
    },
    /**
     * Adds a special CSS helper class which is used to calculate a reserved
     * space, i.e. an aspect ratio, for the image's container.
     */
    useAspectRatio: {
      type: Boolean,
      default: false,
    },
    /**
     * Adds a special CSS helper class which makes the component
     * expand to its container as a background instead of occupying any space.
     */
    useAsBackground: {
      type: Boolean,
      default: false,
    },
    /**
     * Provide props to specifically attach on the container, since this component
     * by default attaches any inherited props to the `img` tag.
     */
    containerProps: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  setup(props, { emit }) {
    const {
      sortedSrcset,
      formattedSrcset,
      formattedSizes,
      hasWidthOrResolution,
      formatBreakpoint,
    } = useImage({ srcset: props.srcset });
    const {
      mediaEl,
      loaded,
      handleLoad,
      mediaLoadClasses,
      dimensionVariables,
    } = useMedia('image', props.loadingVisible);

    const mediaClasses = computed(() => {
      return ['ra-image__media', mediaLoadClasses.value, props.imageClass];
    });

    return {
      mediaEl,
      loaded,
      //Computed
      inherited: useInherited(),
      sortedSrcset,
      formattedSrcset,
      formattedSizes,
      hasWidthOrResolution,
      dimensionVariables,
      mediaClasses,
      //Methods
      handleLoad,
      formatBreakpoint,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaImage.css';
</style>
