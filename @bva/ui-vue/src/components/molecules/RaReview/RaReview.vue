<template>
  <article class="ra-review">
    <RaGrid :columns="columns" :gap="gap">
      <RaGridItem :column-span="infoColumnSpan" class="ra-review__info">
        <!-- @slot Additional slot to add custom content before the review info section. -->
        <slot name="pre_info" />

        <!-- @slot Review rating. Slot content will replace the rating component. -->
        <slot name="rating" v-bind="{ rating, ratingProps }">
          <RaRating
            v-if="rating"
            v-bind="{
              score: rating,
              ...ratingProps,
            }"
            class="ra-review__rating"
          />
        </slot>

        <!-- @slot Review author. Slot content will replace default author tag. -->
        <slot name="author" v-bind="{ author }">
          <p v-if="author" class="ra-review__author">{{ author }}</p>
        </slot>

        <!-- @slot Review date. Slot content will replace default date tag. -->
        <slot name="date" v-bind="{ date }">
          <time v-if="date" class="ra-review__date">{{ date }}</time>
        </slot>

        <!-- @slot Additional slot to add custom content after the review info section. -->
        <slot name="post_info" />
      </RaGridItem>

      <RaGridItem :column-span="descrColumnSpan" class="ra-review__description">
        <!-- @slot Additional slot to add custom content before the review description. -->
        <slot name="pre_description" />

        <!-- @slot Review title. Slot content will replace default title tag. -->
        <slot name="title" v-bind="{ title, rating }">
          <p v-if="title" class="ra-review__title">{{ title }}</p>
        </slot>

        <!-- @slot Review body. Slot will replace review's body/description and toggle. -->
        <slot name="body" v-bind="{ formattedBody, toggleLabel }">
          <blockquote v-if="body" class="ra-review__body">
            {{ formattedBody }}
          </blockquote>

          <RaButton
            v-if="body && bodyIsLong"
            class="ra-review__read-more"
            :as-text="true"
            @click="handleToggle"
            >{{ toggleLabel }}</RaButton
          >
        </slot>

        <!-- @slot Review voting. Slot will replace review's voting functionality. -->
        <slot
          name="voting"
          v-bind="{
            voteLabel,
            voteUp,
            voteUpCount,
            votedUp,
            voteUpProps,
            voteDown,
            voteDownCount,
            votedDown,
            voteDownProps,
          }"
        >
          <div v-if="voting" class="ra-review__voting">
            <p v-if="voteLabel" class="ra-review__voting-label">
              {{ voteLabel }}
            </p>

            <RaButton
              v-if="voteUp"
              :class="[
                'ra-review__vote',
                {
                  'ra-review__vote--voted': votedUp,
                },
              ]"
              v-bind="{
                icon: 'thumbs_up',
                variant: votedUp ? 'secondary' : 'ghost',
                size: 'xs',
                iconSize: 'md',
                ...voteUpProps,
              }"
              @click="$emit('click:voteUp')"
              >{{ voteUpCount }}</RaButton
            >

            <RaButton
              v-if="voteDown"
              :class="[
                'ra-review__vote',
                {
                  'ra-review__vote--voted': votedDown,
                },
              ]"
              v-bind="{
                icon: 'thumbs_down',
                variant: votedDown ? 'secondary' : 'ghost',
                size: 'xs',
                iconSize: 'md',
                ...voteDownProps,
              }"
              @click="$emit('click:voteDown')"
              >{{ voteDownCount }}</RaButton
            >
          </div>
        </slot>

        <!-- @slot Additional slot to add custom content after the review description. -->
        <slot name="post_description" />
      </RaGridItem>
    </RaGrid>
  </article>
</template>
<script>
import RaGrid from '../../atoms/RaGrid/RaGrid.vue';
import RaGridItem from '../../atoms/RaGrid/_internal/RaGridItem.vue';
import RaRating from '../../atoms/RaRating/RaRating.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';

export default {
  name: 'RaReview',
  components: {
    RaGrid,
    RaGridItem,
    RaRating,
    RaButton,
  },
  props: {
    /**
     * Review's author name.
     */
    author: {
      type: String,
      default: '',
    },
    /**
     * Date when then review was posted.
     */
    date: {
      type: String,
      default: '',
    },
    /**
     * A title to display before the review's body.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * The review's main description portion.
     */
    body: {
      type: String,
      default: '',
    },
    /**
     * Rating to give the review.
     * Pass `false` to disable.
     */
    rating: {
      type: [Number, String, Boolean],
      default: false,
    },
    /**
     * Additional props to pass directly into the rating component.
     * Refer to the `RaRating` component docs to learn more.
     */
    ratingProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Character limit for the review before the "truncate" CTA appears.
     */
    truncate: {
      type: Number,
      default: 250,
    },
    /**
     * When the review body is collapsed, this label prompts the user to expand it.
     */
    expandLabel: {
      type: String,
      default: 'Read more',
    },
    /**
     * When the review body is expanded, this label prompts the user to collapse it.
     */
    collapseLabel: {
      type: String,
      default: 'Read less',
    },
    /**
     * Toggle to enable voting for this review.
     */
    voting: {
      type: Boolean,
      default: false,
    },
    /**
     * A label to render alongside the voting options.
     */
    voteLabel: {
      type: String,
      default: 'Was this review helpful?',
    },
    /**
     * Toggle to disable the "vote up" button.
     */
    voteUp: {
      type: Boolean,
      default: true,
    },
    /**
     * Toggle to disable the "vote down" button.
     */
    voteDown: {
      type: Boolean,
      default: true,
    },
    /**
     * Controls the "vote up" count.
     */
    voteUpCount: {
      type: Number,
      default: 0,
    },
    /**
     * Controls the "vote down" count.
     */
    voteDownCount: {
      type: Number,
      default: 0,
    },
    /**
     * Pass additional props directly into the "vote up" component.
     * Refer to the `RaButton` docs to learn more.
     */
    voteUpProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Pass additional props directly into the "vote down" component.
     * Refer to the `RaButton` docs to learn more.
     */
    voteDownProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Signals the component that the user voted up.
     */
    votedUp: {
      type: Boolean,
      default: false,
    },
    /**
     * Signals the component that the user voted down.
     */
    votedDown: {
      type: Boolean,
      default: false,
    },
    /**
     * Set how many grid columns should be used in this layout.
     * Refer to the `RaGrid` docs to learn more.
     */
    columns: {
      type: [String, Array],
      default() {
        return [1, 12];
      },
    },
    /**
     * Set the spacing between each grid column.
     * Refer to the `RaGrid` docs to learn more.
     */
    gap: {
      type: [String, Array],
      default() {
        return ['1.25rem', '1.25rem', '2.25rem'];
      },
    },
    /**
     * Specify how many columns to span for the "info" section of the review.
     * Refer to the `RaGridItem` docs to learn more.
     */
    infoColumnSpan: {
      type: [String, Array],
      default() {
        return [1, 3];
      },
    },
    /**
     * Specify how many columns to span for the "description" section of the review.
     * Refer to the `RaGridItem` docs to learn more.
     */
    descrColumnSpan: {
      type: [String, Array],
      default() {
        return [1, 9];
      },
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    bodyIsLong() {
      return this.body.length > this.truncate;
    },
    toggleLabel() {
      return this.isOpen ? this.collapseLabel : this.expandLabel;
    },
    formattedBody() {
      return this.bodyIsLong && !this.isOpen
        ? this.body.slice(0, this.truncate) + '...'
        : this.body;
    },
  },
  methods: {
    handleToggle() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaReview.css';
</style>
