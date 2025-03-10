<template>
  <component
    :is="asButton || link ? 'RaButton' : 'div'"
    :class="[
      'ra-rating',
      {
        'ra-rating--has-cta': asButton || link,
      },
    ]"
    :raw="asButton || link || ''"
    :link="link"
    v-on="$listeners"
  >
    <!--@slot custom icon for the score. Provide single icon that will be automatically repeated -->
    <slot
      v-for="index in constrainedScore.ceil"
      name="icon-positive"
      v-bind="{
        coverage: getCoverage(index),
      }"
    >
      <RaIcon
        :key="`p${index}`"
        class="ra-rating__icon"
        :icon="icon"
        :size="iconSize"
        :coverage="getCoverage(index)"
      />
    </slot>

    <slot v-for="index in scoreRemainder" name="icon-negative">
      <RaIcon
        :key="`n${index}`"
        class="ra-rating__icon ra-rating__icon--negative"
        :icon="icon"
        :size="iconSize"
      />
    </slot>

    <slot name="rating-score">
      <span v-if="displayScore" class="ra-rating__score"> ({{ score }}) </span>
    </slot>

    <slot name="rating-label">
      <span v-if="label" class="ra-rating__label">
        {{ label }}
      </span>
    </slot>
  </component>
</template>
<script>
import { computed } from 'vue-demi';
import {
  getScore,
  getScoreCoverage,
  getScoreRemainder,
} from '@bva/ui-shared/helpers';

import RaIcon from '../../atoms/RaIcon/RaIcon.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';

export default {
  name: 'RaRating',
  components: { RaIcon, RaButton },
  props: {
    /**
     * Maximum score
     */
    max: {
      type: Number,
      default: 5,
    },
    /**
     * Score (obviously must be less than maximum)
     */
    score: {
      type: Number,
      default: 0,
    },
    /**
     * Choose which icon to display as the rating "stars".
     */
    icon: {
      type: String,
      default: 'star',
    },
    /**
     * Control the rating icon size, follows the RaIcon API.
     */
    iconSize: {
      type: String,
      default: 'sm',
    },
    /**
     * Displays the rating score as a number.
     */
    displayScore: {
      type: Boolean,
      default: false,
    },
    /**
     * Renders a textual message next to the visual rating score.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Renders the rating component as a Button tag, allowing user interaction.
     */
    asButton: {
      type: Boolean,
      default: false,
    },
    /**
     * Adds a link to the rating CTA, uses the `RaLink` API.
     */
    link: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const constrainedScore = computed(() => {
      return getScore(props.score, props.max);
    });

    const scoreRemainder = computed(() => {
      return getScoreRemainder(props.score, props.max);
    });

    const getCoverage = (index) => {
      return getScoreCoverage(index, props.score, props.max);
    };

    return {
      constrainedScore,
      scoreRemainder,
      getCoverage,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaRating.css';
</style>
