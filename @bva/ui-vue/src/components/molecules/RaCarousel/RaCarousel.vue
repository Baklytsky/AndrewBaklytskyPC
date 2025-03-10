<template>
  <RaContainer
    class="ra-carousel-outer"
    :title="title"
    :title-level="titleLevel"
    :title-as="titleAs"
    :description="description"
    :heading-align="headingAlign"
    :heading-class="'ra-carousel__details'"
    :max-width="maxWidth"
    :spacing-top="spacingTop"
    :spacing-bottom="spacingBottom"
    :spacing-edge="spacingEdge"
    :background-color="backgroundColor"
    :foreground-color="foregroundColor"
    :background-color-m-d="backgroundColorMD"
    :foreground-color-m-d="foregroundColorMD"
    raw
    v-bind="$attrs"
  >
    <div
      :class="[
        'ra-carousel',
        {
          'ra-carousel--has-nav': hasNavigation,
          'ra-carousel--auto-align': cssAutoAlign,
        },
      ]"
    >
      <!--@slot Use this slot to customize the navigation/nav for the carousel -->
      <slot name="navigation" v-bind="{ navLocation: effectiveNavLocation }">
        <div
          v-if="hasNavigation"
          ref="navigation"
          :class="[
            'ra-carousel__nav',
            `ra-carousel__nav--${effectiveNavLocation}`,
          ]"
        >
          <slot
            v-for="navItem in navList"
            :name="navItem.dir"
            v-bind="{
              navIcons: effectiveNavIcons,
              navSize,
              navIconSize,
              navShape,
              navVariant,
              go: () => go(navItem.dir),
            }"
          >
            <RaIconButton
              :key="`nav-item-${navItem.dir}`"
              :ref="navItem.ref"
              :data-testid="`carousel-${navItem.dir}-button`"
              :class="[
                'ra-carousel__nav-cta',
                `ra-carousel__nav-cta--${navItem.dir}`,
              ]"
              :icon="effectiveNavIcons[navItem.dir]"
              :size="navSize"
              :icon-size="navIconSize"
              :shape="navShape"
              :variant="navVariant"
              v-bind="{ ...navItem.props }"
              @click="go(navItem.dir)"
            />
          </slot>
        </div>
      </slot>

      <div ref="carousel" class="swiper">
        <div ref="carouselSlides" class="ra-carousel__wrapper swiper-wrapper">
          <!--@slot default slot for RaCarouselItem tags -->
          <slot />
        </div>
      </div>
    </div>
  </RaContainer>
</template>
<script>
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import RaContainer from '../RaContainer/RaContainer.vue';
import {
  getNavIcons,
  getNavLocation,
  requestNavigationAlign,
} from '@bva/ui-shared/helpers/carousel';
import { mergeDeep } from '@bva/ui-shared/helpers';

import Swiper, {
  Navigation,
  Pagination,
  Thumbs,
  Autoplay,
  FreeMode,
  Mousewheel,
} from 'swiper';

import TextMixins from '@bva/ui-vue/src/mixins/common-text';
import StylesMixins from '@bva/ui-vue/src/mixins/common-styles';
import ContainerMixins from '@bva/ui-vue/src/mixins/container-layout';

/**
 * Renders one or more items in a carousel with options to fine tune display count across viewports.
 *
 * Has controls for carousel navigation toggling and positioning.
 */
export default {
  name: 'RaCarousel',
  components: {
    RaIconButton,
    RaContainer,
  },
  mixins: [ContainerMixins, TextMixins, StylesMixins],
  props: {
    /**
     * Carousel configuration settings following the plugin's API:
     * https://swiperjs.com/swiper-api
     */
    settings: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Provide a reference name to use as an external thumbnail navigation in a carousel.
     */
    thumbsRef: {
      type: [String, Object],
      default: '',
    },
    /**
     * Customize the icons for the navigation nav by assigning icon names to the `prev` and `next` properties.
     */
    navIcons: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Set the default shape for the navigation nav.
     */
    navShape: {
      type: String,
      default: 'rounded',
    },
    /**
     * Control the overall size of the navigation nav.
     */
    navSize: {
      type: String,
      default: 'sm',
    },
    /**
     * Control the icon size within the navigation nav.
     */
    navIconSize: {
      type: String,
      default: 'sm',
    },
    /**
     * Choose the variant type to use for the navigation nav.
     */
    navVariant: {
      type: String,
      default: 'tertiary',
    },
    /**
     * Provide additional properties directly into the individual prev/next
     * buttons in the carousel. Follows the `RaIconButton` API.
     */
    navProps: {
      type: Object,
      default() {
        return {
          prev: {},
          next: {},
        };
      },
    },
    /**
     * Vertically aligns carousel items by using CSS instead of "auto height".
     */
    cssAutoAlign: {
      type: Boolean,
      default: false,
    },
    titleLevel: {
      type: Number,
      default: 2,
    },
    titleAs: {
      type: Number,
      default: 4,
    },
    headingAlign: {
      type: String,
      default: 'left',
    },
    slideToIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      carouselPlugin: null,
      defaultSettings: {
        //AVOID USING LOOP IF YOUR SLIDES AREN'T REACTIVE.
        //THIS IS FIXED WITH Vue3 + Swiper@latest.
        //https://github.com/nolimits4web/swiper/issues/4349
        //https://github.com/nolimits4web/swiper/issues/2629
        loop: true,
        slidesPerView: 1,
        spaceBetween: 0,
        modules: [
          Navigation,
          Pagination,
          Thumbs,
          Autoplay,
          FreeMode,
          Mousewheel,
        ],
      },
      navList: [
        {
          dir: 'prev',
          ref: 'navPrevRef',
          props: {
            'aria-label': 'Go to previous slide',
            ...this.navProps['prev'],
          },
        },
        {
          dir: 'next',
          ref: 'navNextRef',
          props: {
            'aria-label': 'Go to next slide',
            ...this.navProps['next'],
          },
        },
      ],
    };
  },
  computed: {
    /**
     * Holds any settings that are currently applied into the plugin.
     * Note that these may change on a per-breakpoint basis.
     */
    appliedSettings() {
      return this.carouselPlugin ? this.carouselPlugin.params || {} : {};
    },
    navigation() {
      return this.appliedSettings.navigation || {};
    },
    pluginSettings() {
      return mergeDeep(this.defaultSettings, this.settings);
    },
    hasNavigation() {
      return (
        !this.navigation.disabled &&
        this.carouselPlugin &&
        (this.carouselPlugin.allowSlideNext ||
          this.carouselPlugin.allowSlidePrev)
      );
    },
    isVertical() {
      return this.appliedSettings.direction === 'vertical';
    },
    isNavigationAuto() {
      return this.effectiveNavLocation === 'auto';
    },
    effectiveNavLocation() {
      return getNavLocation(this.isVertical, this.navigation.location);
    },
    effectiveNavIcons() {
      return getNavIcons(this.isVertical, this.navIcons);
    },
  },
  watch: {
    /**
     * Keep track of when the navigation location changes so that any custom CSS applied to it is reset.
     */
    effectiveNavLocation(newValue) {
      if (newValue !== 'auto') {
        this.resetNavigationPosition();
      }
    },

    slideToIndex: function (newIndex, oldIndex) {
      this.slideTo(newIndex);
    },
  },
  mounted: function () {
    this.$nextTick(() => {
      this.setupCarousel();
    });
  },
  methods: {
    setupCarousel() {
      this.setupThumbs();

      this.carouselPlugin = new Swiper(this.$refs.carousel, {
        ...this.pluginSettings,
        on: {
          init: (plugin) => {
            this.$emit('init:carousel', plugin);
          },
        },
      });

      this.setupEvents();
    },
    // https://swiperjs.com/vue#thumbs
    setupThumbs() {
      const thumbs = this.$parent.$refs[this.thumbsRef];

      if (thumbs) {
        this.pluginSettings.thumbs = {
          swiper: thumbs.carouselPlugin,
        };
      }
    },
    setupEvents() {
      this.carouselPlugin.on('slideChange', () => {
        this.$emit(
          'change:slide',
          this.carouselPlugin,
          this.carouselPlugin.realIndex,
          this.carouselPlugin.slides[this.carouselPlugin.realIndex]
        );
      });

      this.carouselPlugin.on('resize', this.alignNavigation);
    },
    go(direction) {
      if (!this.carouselPlugin) {
        return false;
      }

      switch (direction) {
        case 'prev':
          this.carouselPlugin.slidePrev();

          break;
        case 'next':
          this.carouselPlugin.slideNext();

          break;
      }
    },
    /**
     * Clears out any style changes done to the navigation element.
     */
    resetNavigationPosition() {
      this.$nextTick(() => {
        if (this.$refs.navigation) {
          this.$refs.navigation.style.top = '';
        }
      });
    },
    /**
     * Attempts to update the navigation/nav positioning based on a "reference" element,
     * such as an image or a designated `[data-carousel-align-item]` target.
     */
    alignNavigation() {
      if (this.isNavigationAuto && this.hasNavigation && this.$refs.carousel) {
        requestNavigationAlign(this.$refs.carousel, this.$refs.navigation);
      }
    },
    /**
     * Slides to a specific slide base on index
     */
    slideTo(index) {
      if (!this.carouselPlugin.destroyed) {
        this.carouselPlugin.slideToLoop(index);
      }
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaCarousel.css';
@import 'swiper/swiper.min.css';
</style>
