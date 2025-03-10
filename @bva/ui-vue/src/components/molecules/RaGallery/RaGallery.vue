<template>
  <div
    :class="[
      'ra-gallery',
      {
        'ra-gallery--has-zoom': zoom,
      },
    ]"
  >
    <component
      :is="isGrid ? 'RaGalleryGrid' : 'RaGalleryCarousel'"
      v-bind="{ ...inherited.attrs, ...inherited.listeners, ...$props }"
      v-on="{
        ...$listeners,
        'click:galleryMedia': handleMediaClick,
        'click:zoomButton': handleZoomClick,
      }"
    >
      <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
        <slot :name="slotName" v-bind="data"></slot>
      </template>
    </component>

    <RaZoom
      class="ra-gallery-modal"
      :visible="zoomVisible"
      :media="zoomSingle ? selectedMedia : media"
      :full-screen="zoomFullScreen"
      :start-at="selectedIndex"
      :position="zoomToPosition"
      v-bind="{ ...zoomProps }"
      @close:zoom="handleZoomHide"
    >
      <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
        <slot :name="slotName" v-bind="data"></slot>
      </template>
    </RaZoom>
  </div>
</template>

<script>
import { useInherited } from '@bva/ui-vue/src/composables';
import { getClickPosition } from '@bva/ui-shared/helpers/zoom';

import RaZoom from '../RaZoom/RaZoom.vue';
import RaGalleryGrid from './_internal/RaGalleryGrid.vue';
import RaGalleryCarousel from './_internal/RaGalleryCarousel.vue';

export default {
  name: 'RaGallery',
  components: {
    RaZoom,
    RaGalleryGrid,
    RaGalleryCarousel,
  },
  inheritAttrs: false,
  props: {
    /**
     * Images list to display as either a Grid or a Carousel.
     */
    media: {
      type: Array,
      default: () => [],
    },
    /**
     * Images aspect-ratio width, follows the `RaImage` configuration API.
     */
    imageWidth: {
      type: [Number, String],
      default: 1,
    },
    /**
     * Images aspect-ratio height, follows the `RaImage` configuration API.
     */
    imageHeight: {
      type: [Number, String],
      default: 1,
    },
    /**
     * Toggle zoom functionality on the gallery.
     * Zoom is triggered by interacting with the individual items in the gallery.
     */
    zoom: {
      type: Boolean,
      default: false,
    },
    /**
     * Opens the zoom modal using a single image rather than a carousel.
     */
    zoomSingle: {
      type: Boolean,
      default: false,
    },
    /**
     * Expands the zoom window to cover the entirety of the available screenspace.
     * If the image is larger than the viewport, user can then scroll horizontally or vertically to see the rest of the image.
     */
    zoomFullScreen: {
      type: Boolean,
      default: false,
    },
    /**
     * Toggle visibility of the zoom button/trigger that appears when hovering the gallery.
     */
    zoomButton: {
      type: Boolean,
      default: false,
    },
    /**
     * Provide properties directly to the Zoom component.
     * Refer to `RaZoom` docs to learn more.
     */
    zoomProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Renders the gallery as a grid instead of as a carousel.
     */
    isGrid: {
      type: Boolean,
      default: true,
    },
    /**
     * Displays a loading indicator, such as a skeleton view, when set to `true`.
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Set the amount of media to display as a skeleton while the gallery data is loading.
     */
    mockMediaCount: {
      type: Number,
      default: 4,
    },
  },
  setup(props, { slots }) {
    return {
      slots,
      inherited: useInherited([
        'click:galleryMedia',
        'click:zoomButton',
        'change:slide',
      ]),
    };
  },
  data() {
    return {
      zoomVisible: false,
      zoomToPosition: {},
      selectedIndex: 0,
      selectedMedia: null,
    };
  },
  computed: {
    /**
     * Returns the provided `media` prop if it has a length, otherwise returns mock media for loading purposes.
     */
    processedMedia() {
      return this.media.length > 0 ? this.media : this.mockMedia;
    },
    /**
     * Provides an array of mock media to render in case gallery data is not immediately available.
     */
    mockMedia() {
      return Array.from(Array(this.mockMediaCount));
    },
  },
  methods: {
    handleMediaClick(evtData) {
      this.triggerZoom(evtData);

      this.$emit('click:galleryMedia', evtData);
    },
    handleZoomClick(evtData) {
      //Default to the absolute center of the image when triggering zoom using the dedicated button.
      this.triggerZoom(evtData, {
        x: 0.5,
        y: 0.5,
      });

      this.$emit('click:zoomButton', evtData);
    },
    triggerZoom(evtData, clickPosition = null) {
      if (this.zoom) {
        this.handleZoomShow(evtData);
      }

      if (this.zoomFullScreen) {
        //Use a custom `clickPosition` data or attempt to infer the click position from the original event.
        this.zoomToPosition =
          clickPosition ||
          getClickPosition(event.target, event.clientX, event.clientY);
      }
    },
    handleZoomShow(evtData) {
      this.zoomVisible = true;
      this.selectedIndex = evtData.index;
      this.selectedMedia = evtData.image;

      this.$emit('change:zoomToggled', {
        visible: this.zoomVisible,
        ...evtData,
      });
    },
    handleZoomHide(evtData) {
      this.zoomVisible = false;

      this.$emit('change:zoomToggled', {
        visible: this.zoomVisible,
        ...evtData,
      });
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaGallery.css';
</style>
