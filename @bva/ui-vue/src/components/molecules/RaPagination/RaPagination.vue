<template>
  <nav class="ra-pagination">
    <!-- @slot Custom markup for previous page button -->
    <slot
      name="prev"
      v-bind="{
        isDisabled: !pagination.prev,
        handleClick,
        prev: pagination.prev,
      }"
    >
      <RaIconButton
        v-if="canShowPrev"
        class="ra-pagination__item ra-pagination__item--prev"
        aria-label="Go to previous page"
        :link="getLinkTo(pagination.prev)"
        :disabled="!hasRouter && !pagination.prev"
        :icon="'chevron_left'"
        :variant="'ghost'"
        :size="'sm'"
        :icon-size="'lg'"
        v-bind="{
          ...prevProps,
        }"
        @click="hasRouter ? null : handleClick(pagination.prev)"
      />
    </slot>

    <template v-if="pagination.skipToStart">
      <slot name="number" v-bind="{ page: 1 }">
        <RaButton
          class="ra-pagination__item ra-pagination__item--number"
          :variant="'ghost'"
          :link="getLinkTo(1)"
          @click="hasRouter ? null : handleClick(1)"
        >
          1
        </RaButton>
      </slot>
      <slot v-if="pagination.hasDistantStart" name="dots">
        <div class="ra-pagination__item ra-pagination__item--dots">...</div>
      </slot>
    </template>

    <template v-for="page in pagination.visibleList">
      <slot name="number" v-bind="{ page, current }">
        <RaButton
          :key="page"
          class="ra-pagination__item ra-pagination__item--number"
          :class="{
            'ra-pagination__item--current': current === page,
          }"
          :variant="current === page ? 'primary' : 'ghost'"
          :link="hasRouter && current !== page ? getLinkTo(page) : null"
          @click="!hasRouter && current !== page ? handleClick(page) : null"
        >
          {{ page }}
        </RaButton>
      </slot>
    </template>

    <template v-if="pagination.skipToEnd">
      <slot v-if="pagination.hasDistantEnd" name="dots">
        <div class="ra-pagination__item ra-pagination__item--dots">...</div>
      </slot>
      <slot name="number" v-bind="{ page: total }">
        <RaButton
          class="ra-pagination__item ra-pagination__item--number"
          :variant="'ghost'"
          :link="getLinkTo(total)"
          @click="hasRouter ? null : handleClick(total)"
        >
          {{ total }}
        </RaButton>
      </slot>
    </template>

    <!-- @slot Custom markup for next page button -->
    <slot
      name="next"
      v-bind="{
        isDisabled: !pagination.next,
        handleClick,
        next: pagination.next,
      }"
    >
      <RaIconButton
        v-if="canShowNext"
        class="ra-pagination__item ra-pagination__item--next"
        aria-label="Go to next page"
        :link="getLinkTo(pagination.next)"
        :disabled="!hasRouter && !pagination.next"
        :icon="'chevron_right'"
        :variant="'ghost'"
        :size="'sm'"
        :icon-size="'lg'"
        v-bind="{
          ...nextProps,
        }"
        @click="hasRouter ? null : handleClick(pagination.next)"
      />
    </slot>
  </nav>
</template>
<script>
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import { getPagination } from '@bva/ui-shared/helpers';

export default {
  name: 'RaPagination',
  components: {
    RaButton,
    RaIconButton,
  },
  model: {
    prop: 'current',
    event: 'click',
  },
  props: {
    /**
     * Total number of pages
     */
    total: {
      type: Number,
      default: 0,
    },
    /**
     * Maximum visible pagination items
     */
    visible: {
      type: Number,
      default: 5,
    },
    /**
     * Current page number, for non router
     */
    current: {
      type: Number,
      default: 1,
    },
    /**
     * Status of arrows display
     */
    hasArrows: {
      type: Boolean,
      default: true,
    },
    /**
     * Displays navigation arrows even when they're disabled.
     */
    showArrowsDisabled: {
      type: Boolean,
      default: true,
    },
    /**
     * Name of page query param for router
     */
    pageParamName: {
      type: String,
      default: 'page',
    },
    /**
     * Props to pass directly into the "Previous" CTA.
     * Review the RaIconButton docs to learn more.
     */
    prevProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Props to pass directly into the "Next" CTA.
     * Review the RaIconButton docs to learn more.
     */
    nextProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Enables automatic routing when interacting with pagination elements.
     */
    routing: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    hasRouter() {
      return this.routing && this.$route;
    },
    pagination() {
      return getPagination(this.current, this.total, this.visible);
    },
    canShowPrev() {
      return this.getArrowVisibility(this.pagination.prev);
    },
    canShowNext() {
      return this.getArrowVisibility(this.pagination.next);
    },
  },
  methods: {
    handleClick(page) {
      this.$emit('click', page);
    },
    getLinkTo(page) {
      if (this.hasRouter && page) {
        return {
          ...this.$route,
          query: { ...this.$route.query, [this.pageParamName]: page },
        };
      } else {
        return null;
      }
    },
    getArrowVisibility(isEnabled) {
      return (
        this.hasArrows && (isEnabled || (!isEnabled && this.showArrowsDisabled))
      );
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaPagination.css';
</style>
