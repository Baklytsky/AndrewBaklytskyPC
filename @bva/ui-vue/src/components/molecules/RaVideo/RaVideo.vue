<template>
  <div
    class="ra-video"
    :class="[
      {
        'ra-video--use-aspect-ratio': useAspectRatio,
        'ra-video--use-as-background': useAsBackground,
        'ra-video--display-button-hover': playButtonShowOnHover,
      },
      inherited.classes,
    ]"
    :style="dimensionVariables"
  >
    <video
      ref="mediaEl"
      :class="['ra-video__media', mediaLoadClasses]"
      :loop="loop"
      :autoplay="autoplay"
      :muted="muted"
      :playsinline="playsinline"
      v-bind="{ ...inherited.attrs, ...inherited.listeners }"
      @click="pauseOnClick ? handlePlayToggle() : () => {}"
      @loadeddata="handleLoad"
      v-on="$listeners"
    />

    <RaIconButton
      :class="['ra-video__button-play', buttonModifier(playButtonPosition)]"
      v-bind="{
        ...playButtonProps,
        icon: playButtonIcon,
        size: playButtonSize,
        variant: 'tertiary',
      }"
      @click="handlePlayToggle"
    />
  </div>
</template>

<script>
import { formatModifier } from '@bva/ui-shared/helpers';
import { useVideo, useMedia, useInherited } from '@bva/ui-vue/src/composables';

import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';

export default {
  name: 'RaVideo',
  components: {
    RaIconButton,
  },
  inheritAttrs: false,
  props: {
    /**
     * Video source(s) for individual `<source>` tags.
     * Provide a URL String to the video resource.
     * Alternatively, pass an Object of the format:
     *   ```
     *   {
     *     src: String,
     *     codec?: String,
     *   }
     *   ```
     *  Or an Array of Objects with the same format.
     */
    src: {
      type: [String, Array, Object],
      default() {
        return '';
      },
    },
    /**
     * Automatically re-starts video after it reaches the end.
     */
    loop: {
      type: Boolean,
      default: true,
    },
    /**
     * Start playback as soon as video is loaded.
     */
    autoplay: {
      type: Boolean,
      default: true,
    },
    /**
     * Pause playback immediately after the video exits the viewport.
     */
    autopause: {
      type: Boolean,
      default: true,
    },
    /**
     * Pause the video when clicking on the video element itself.
     */
    pauseOnClick: {
      type: Boolean,
      default: true,
    },
    /**
     * Disable any audio tracks on the video.
     * Note: This must be set to `true` for autoplay to work on certain browsers.
     */
    muted: {
      type: Boolean,
      default: true,
    },
    /**
     * Forces video to play in the location it was originally in instead of opening a full-screen view.
     * This is mostly required for mobile devices, specially when using background/autoplay/muted videos.
     */
    playsinline: {
      type: Boolean,
      default: true,
    },
    /**
     * Display the "play" button when hovering over the video.
     */
    playButtonShowOnHover: {
      type: Boolean,
      default: false,
    },
    /**
     * Specify the render location for the "play" button.
     */
    playButtonPosition: {
      type: String,
      default: 'middle-center',
    },
    /**
     * Additional properties to pass to the play button component directly.
     * These can be used to alter the look and feel of that component.
     * Refer to the RaIconButton docs to learn more.
     */
    playButtonProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Choose how large should the "play" button display.
     */
    playButtonSize: {
      type: String,
      default: 'lg',
    },
    /**
     * Customize the icon for the button' "play" state.
     */
    playIcon: {
      type: String,
      default: 'chevron_right',
    },
    /**
     * Customize the icon for the button' "pause" state.
     */
    pauseIcon: {
      type: String,
      default: 'cross',
    },
    /**
     * Width of the video.
     * Can be used to determine the aspect-ratio.
     */
    width: {
      type: [String, Number],
      default: '',
    },
    /**
     * Height of the video.
     * Can be used to determine the aspect-ratio.
     */
    height: {
      type: [String, Number],
      default: '',
    },
    /**
     * Adds a special CSS helper class which is used to calculate a reserved
     * space, i.e. an aspect ratio, for the video's container.
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
  },
  setup() {
    const { mediaEl, handleLoad, mediaLoadClasses, dimensionVariables } =
      useMedia('video');
    const { videoIsVisible, playButtonIcon, handlePlayToggle } =
      useVideo(mediaEl);

    //Methods
    const buttonModifier = formatModifier.bind(this, 'ra-video__button-play');

    return {
      //Refs
      mediaEl,
      videoIsVisible,
      //Computed
      inherited: useInherited(),
      playButtonIcon,
      mediaLoadClasses,
      dimensionVariables,
      //Methods
      buttonModifier,
      handleLoad,
      handlePlayToggle,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaVideo.css';
</style>
