<template>
  <RaModal
    :class="[
      'ra-zoom',
      {
        'ra-zoom--full-screen': fullScreen,
        'ra-zoom--standard': !fullScreen,
      },
    ]"
    v-bind="{
      visible,
      loading,
      closeButtonSize: 'lg',
      closeButtonShape: 'square',
      contentBackground: 'transparent',
      closeButtonOutside: true,
      ...$attrs,
    }"
    @close:modal="handleModalClose"
    v-on="$listeners"
  >
    <slot
      v-if="isSingleMedia"
      :name="`media-${startAt}`"
      v-bind="{
        isZoom: true,
        index: startAt,
        image: media,
        handleLoad: handleMediaLoad,
      }"
    >
      <RaImage
        ref="imageWrapper"
        class="ra-zoom__image-wrapper"
        :src="getZoomSRC(media)"
        @load:image="handleMediaLoad"
      />
    </slot>

    <RaCarousel
      v-else
      ref="carousel"
      class="ra-zoom__carousel"
      :settings="{
        initialSlide: startAt,
        loop: false,
        rewind: true,
        allowTouchMove: !fullScreen,
        autoHeight: !fullScreen,
        navigation: {
          location: 'fixed',
        },
        breakpoints: false,
      }"
      nav-size="lg"
      nav-icon-size="lg"
      nav-shape="square"
      @init:carousel="handleSlideChange"
      @change:slide="handleSlideChange"
    >
      <RaCarouselItem
        v-for="(image, index) in media"
        :key="index"
        class="ra-zoom__item"
      >
        <slot
          :name="`media-${index}`"
          v-bind="{
            isZoom: true,
            index,
            image,
            imageClass: zoomLayoutClasses,
            handleLoad: handleMediaLoad,
            handleClick: () => {},
          }"
        >
          <RaImage
            class="ra-zoom__image-wrapper"
            :image-class="zoomLayoutClasses"
            :src="getZoomSRC(image)"
            :alt="image.alt"
            @load:image="handleMediaLoad"
          />
        </slot>
      </RaCarouselItem>
    </RaCarousel>
  </RaModal>
</template>

<script>
import RaImage from '../../atoms/RaImage/RaImage.vue';
import RaModal from '../RaModal/RaModal.vue';
import RaCarousel from '../RaCarousel/RaCarousel.vue';
import RaCarouselItem from '../RaCarousel/_internal/RaCarouselItem.vue';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import {
  getMediaSRC,
  getZoomLayoutClasses,
  setZoomScrollPosition,
} from '@bva/ui-shared/helpers/zoom';

export default {
  name: 'RaZoom',
  components: {
    RaImage,
    RaModal,
    RaCarousel,
    RaCarouselItem,
  },
  inheritAttrs: false,
  props: {
    /**
     * Controls visibility of the entire zoom modal.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * The image/video content to display within the zoom modal.
     */
    media: {
      type: [Array, Object, String],
      default: '',
    },
    /**
     * The property to use when attempting to get the zoom image source from the `media` array/object.
     */
    zoomProperty: {
      type: String,
      default: 'zoom',
    },
    /**
     * When `media` is an array, specify at which index to focus on when loading the zoom modal.
     */
    startAt: {
      type: Number,
      default: 0,
    },
    position: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Expands the zoom window to cover the entirety of the available screenspace.
     * If the image is larger than the viewport, user can then scroll horizontally or vertically to see the rest of the image.
     * Note that enabling this option turns off carousel swiping/dragging.
     */
    fullScreen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentSlideIndex: this.startAt,
      loading: true,
      zoomLayoutClasses: null,
    };
  },
  computed: {
    isSingleMedia() {
      return !Array.isArray(this.media);
    },
  },
  watch: {
    startAt(newVal) {
      this.currentSlideIndex = newVal;
    },
  },
  methods: {
    getZoomSRC(image) {
      return getMediaSRC(image, this.zoomProperty);
    },
    handleMediaLoad(evtData = {}) {
      this.$nextTick(() => {
        //Control full screen behavior on an individual item basis if needed.
        if (this.fullScreen && !evtData.disableFullScreen) {
          this.updateImageLayout(event.target, evtData.width, evtData.height);
        }
      });

      this.loading = false;

      this.$emit('load-content:zoom', evtData);
    },
    updateImageLayout(target, mediaWidth, mediaHeight) {
      this.zoomLayoutClasses = getZoomLayoutClasses(mediaWidth, mediaHeight);

      disableBodyScroll(target.parentNode);

      setTimeout(
        () => setZoomScrollPosition(target.parentNode, this.position),
        0
      );
    },
    handleSlideChange(carousel, index) {
      this.currentSlideIndex = index;
    },
    handleModalClose() {
      const closeEvtData = {
        index: this.currentSlideIndex,
      };

      if (this.isSingleMedia) {
        closeEvtData.image = this.media;
      } else {
        closeEvtData.image = this.media[closeEvtData.index];
      }

      clearAllBodyScrollLocks();

      this.loading = true;

      this.$emit('close:zoom', closeEvtData);
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaZoom.css';
</style>
