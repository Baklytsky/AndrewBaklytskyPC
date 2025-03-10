<template>
  <div
    :class="['ra-progress', `text-align--${align}`, modifierClass(variant)]"
    :style="{
      '--progress-max-width': maxWidth,
      '--progress-bar-height': barHeight,
      '--progress-bar-percent': progressPercent,
      '--progress-bar-radius': barRadius,
    }"
  >
    <p v-if="hasLabel" class="ra-progress__label">
      <!--@slot Customize the progress label label.-->
      <slot
        name="progress-label"
        v-bind="{
          label,
          progress,
          target,
          progressPercent,
          progressRemaining,
          hasProgress,
          reachedTarget,
        }"
        >{{ label }}</slot
      >
    </p>

    <!--@slot Customize the progress bar with an entirely different behavior.-->
    <slot
      name="progress-bar"
      v-bind="{
        progress,
        target,
        progressPercent,
        progressRemaining,
        hasProgress,
        reachedTarget,
      }"
    >
      <div class="ra-progress__bar"></div>
    </slot>
  </div>
</template>

<script>
import { watch, computed } from 'vue-demi';
import {
  getHasProgress,
  getHasReachedTarget,
  getProgressRemaining,
  getProgressPercent,
} from '@bva/ui-shared/helpers/progress';

export default {
  name: 'RaProgress',
  props: {
    /**
     * The bar's label or title.
     * Should contain information about the current state of the bar.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * The amount that has been progressed from the `target`.
     */
    progress: {
      type: Number,
      default: 0,
      required: true,
      validator(value) {
        return value >= 0;
      },
    },
    /**
     * The max, total, or limit value to be reached.
     */
    target: {
      type: Number,
      default: 10,
      required: true,
      validator(value) {
        return value >= 0;
      },
    },
    /**
     * Control the horizontal text alignment of the component: `left`, `center`, `right`.
     */
    align: {
      type: String,
      default: 'center',
    },
    /**
     * Change the look and feel of the bar using one of the available presets.
     */
    variant: {
      type: String,
      default: 'primary',
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
     * Style the height of the bar so that it is taller or thicker.
     * Accepts any valid CSS unit (except percentages).
     */
    barHeight: {
      type: String,
      default: '',
    },
    /**
     * Adjust the border radius for the bar.
     * Accepts any valid CSS unit.
     */
    barRadius: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots, emit }) {
    //Computed
    const hasLabel = computed(() => {
      return !!props.label || slots.hasOwnProperty('progress-label');
    });

    const hasProgress = computed(() => {
      return getHasProgress(props.progress);
    });

    const reachedTarget = computed(() => {
      return getHasReachedTarget(props.progress, props.target);
    });

    const progressRemaining = computed(() => {
      return getProgressRemaining(props.progress, props.target);
    });

    const progressPercent = computed(() => {
      return getProgressPercent(props.progress, props.target);
    });

    //Methods
    const modifierClass = (modifier, prefix) => {
      return modifier
        ? `ra-progress--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    };

    //Watchers
    watch(progressPercent, (newVal) => {
      emit('change:progress', {
        progress: props.progress,
        target: props.target,
        percent: newVal,
        hasProgress: hasProgress.value,
        remaining: progressRemaining.value,
      });
    });

    watch(reachedTarget, (newVal) => {
      const evtName = newVal ? 'change:complete' : 'change:incomplete';

      emit(evtName, {
        progress: props.progress,
        target: props.target,
        percent: newVal,
        hasProgress: hasProgress.value,
        remaining: progressRemaining.value,
      });
    });

    return {
      slots,
      hasLabel,
      hasProgress,
      reachedTarget,
      progressRemaining,
      progressPercent,
      modifierClass,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaProgress.css';
</style>
