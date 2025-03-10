<template>
  <div
    ref="trackedEl"
    :class="['ra-infinite-scroll', `text-align--${align}`]"
    :style="{
      '--component-max-width': maxWidth,
    }"
  >
    <p class="ra-infinite-scroll__description">
      <!--@slot Customize the progress description label.-->
      <slot
        name="progress-description"
        v-bind="{
          currentCount,
          totalCount,
          progressDescription,
          progressPercent,
        }"
      >
        {{ progressDescription }}
      </slot>
    </p>

    <!--@slot Customize the progress bar with an entirely different behavior.-->
    <slot
      name="progress-bar"
      v-bind="{ currentCount, totalCount, progressPercent }"
    >
      <RaProgress
        :progress="currentCount"
        :target="totalCount"
        v-bind="{
          ...progressBarProps,
        }"
        @change:progress="handleProgressUpdate"
      />
    </slot>

    <transition name="ra-slide-top">
      <!--@slot Customize the progress loader markup.-->
      <slot name="progress-loader" v-bind="{ loading, loadingLabel }">
        <p v-if="loading" class="ra-infinite-scroll__loader">
          {{ loadingLabel }}
        </p>
      </slot>
    </transition>
  </div>
</template>

<script>
import { ref, watch } from 'vue-demi';
import { useIntersectionObserver } from '@vueuse/core';
import RaProgress from '../RaProgress/RaProgress.vue';

export default {
  name: 'RaInfiniteScroll',
  components: {
    RaProgress,
  },
  props: {
    /**
     * Specify the current amount of "items" from the `totalCount`.
     */
    currentCount: {
      type: Number,
      default: 1,
    },
    /**
     * The max or total amount of items available.
     */
    totalCount: {
      type: Number,
      default: 2,
    },
    /**
     * Control the horizontal text alignment of the component: `left`, `center`, `right`.
     */
    align: {
      type: String,
      default: 'center',
    },
    /**
     * Signals the component that it is in a loading state.
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Customize the label to display when the component is `loading`.
     */
    loadingLabel: {
      type: String,
      default: 'Loading...',
    },
    /**
     * Control the vertical offset to trigger the `intersected` event.
     * The higher this number is, the earlier the event fires.
     * For example: when set to `200` the event will fire when the bottom of the viewport
     * is 200px away from the top of this component, and vice-versa.
     */
    offset: {
      type: Number,
      default: 200,
    },
    /**
     * Set a custom max width for the component.
     * Changing this value affects the overall width of the bar.
     */
    maxWidth: {
      type: String,
      default: '',
    },
    /**
     * Pass custom props directly into the progress bar.
     * Refer to the `RaProgress` component docs to learn more.
     */
    progressBarProps: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  setup(props, context) {
    const trackedEl = ref();

    const { stop } = useIntersectionObserver(
      trackedEl,
      ([entry], observerElement) => {
        //Only fire event if component isn't loading to prevent unintentional triggers.
        if (entry.isIntersecting && !props.loading) {
          context.emit('intersected', entry, stop);
        }
      },
      {
        rootMargin: `${props.offset}px 0px ${props.offset}px 0px`,
      }
    );

    return {
      trackedEl,
    };
  },
  data() {
    return {
      progressPercent: null,
    };
  },
  computed: {
    /**
     * This description can be updated using the `#progress-description` slot.
     */
    progressDescription() {
      return `Showing ${this.currentCount} of ${this.totalCount} products`;
    },
  },
  methods: {
    handleProgressUpdate(evtData) {
      this.progressPercent = evtData.percent;
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaInfiniteScroll.css';
</style>
