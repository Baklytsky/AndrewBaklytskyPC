<template>
  <RaGrid class="ra-gallery-grid" :gap="gap" :columns="columns">
    <RaGridItem
      v-for="(image, index) in $parent.processedMedia"
      :key="index"
      class="ra-gallery__item"
      :column-span="getFeaturedSpan(index)"
    >
      <RaIconButton
        v-if="$parent.zoom && $parent.zoomButton"
        :class="[
          'ra-gallery__zoom-button',
          {
            'ra-gallery__zoom-button--interactive': index > 0,
          },
        ]"
        :size="'lg'"
        :icon="'plus'"
        :icon-size="'lg'"
        :shape="'square'"
        :variant="'tertiary'"
        @click="$emit('click:zoomButton', { image, index })"
      />

      <RaBone
        v-if="$parent.loading"
        :variant="'image'"
        :width="$parent.imageWidth"
        :height="$parent.imageHeight"
      />

      <!--@slot Use these slots to replace the contents of a specific container within the grid.-->
      <slot
        v-else
        :name="`media-${index}`"
        v-bind="{
          isGallery: true,
          index,
          image,
          handleClick,
          handleLoad: () => {},
        }"
      >
        <RaImage
          class="ra-gallery-grid__image"
          :src="image.src || image.url"
          :alt="image.alt"
          :width="$parent.imageWidth || image.width"
          :height="$parent.imageHeight || image.height"
          :use-aspect-ratio="true"
          @click="handleClick(index, image)"
        />
      </slot>
    </RaGridItem>
  </RaGrid>
</template>

<script>
import RaGrid from '../../../atoms/RaGrid/RaGrid.vue';
import RaGridItem from '../../../atoms/RaGrid/_internal/RaGridItem.vue';
import RaImage from '../../../atoms/RaImage/RaImage.vue';
import RaIconButton from '../../../atoms/RaIconButton/RaIconButton.vue';
import RaBone from '../../../atoms/RaSkeleton/_internal/RaBone.vue';

export default {
  name: 'RaGalleryGrid',
  components: {
    RaGrid,
    RaGridItem,
    RaImage,
    RaBone,
    RaIconButton,
  },
  inheritAttrs: false,
  props: {
    /**
     * Display images matching this "nth" position larger than the rest.
     * For example, if `featureAtNth` is 3, then the images at index 0, 3, 6, 9, etc. will be larger.
     */
    featureAtNth: {
      type: Number,
      default: 3,
    },
    /**
     * Toggle the display for the last "uneven" image as either featured or not.
     * Works in conjunction with the `$parent.featureAtNth` prop.
     */
    featureLastUneven: {
      type: Boolean,
      default: false,
    },
    /**
     * Specify one or more gap values to use within the grid.
     * Currently either a single global value, or values for `sm`, `md`, and `lg` viewports are supported.
     */
    gap: {
      type: [Object, Array, String, Boolean],
      default() {
        return {
          base: '.25rem',
          md: '.25rem',
          lg: '.25rem',
        };
      },
    },
    /**
     * Define the column count/size for the grid.
     * Supported formats:
     * * Single global value in the form of a string or integer.
     * * Object literal with individual values for `sm`, `md`, and/or `lg` viewports.
     * * Array of Integers which are parsed in the order they're set.
     *   The 1st item in the array is used for the global viewport, the 2nd for medium viewports, and so forth.
     */
    columns: {
      type: [Object, Array, String, Number],
      default() {
        return 2;
      },
    },
  },
  computed: {
    /**
     * Confirms that the image count is uneven.
     */
    hasUnevenImageCount() {
      return this.$parent.media.length % this.featureAtNth !== 0;
    },
    /**
     * Returns the index for the image that will be affected by the "uneven" styling.
     */
    lastUnevenAffectedIndex() {
      return this.$parent.media.length - (this.featureLastUneven ? 1 : 2);
    },
  },
  methods: {
    /**
     * Determines whether or not the current image at `index` should be displayed as "featured".
     */
    featureImageAtIndex(index) {
      if (index === this.lastUnevenAffectedIndex && this.hasUnevenImageCount) {
        return this.featureLastUneven;
      }

      return index % this.featureAtNth === 0;
    },
    getFeaturedSpan(index) {
      if (this.featureImageAtIndex(index)) {
        return this.columns;
      }

      return '';
    },
    handleClick(index, image) {
      this.$emit('click:galleryMedia', { index, image });
    },
  },
};
</script>
