<template>
  <nav
    :class="[
      'ra-breadcrumbs',
      {
        'ra-breadcrumbs--wrap': wrap,
        'ra-breadcrumbs--no-wrap': !wrap,
      },
    ]"
    v-on="$listeners"
  >
    <ol class="ra-breadcrumbs__list">
      <RaBreadcrumb
        v-for="(breadcrumb, i) in breadcrumbs"
        :key="i"
        :last="isLastBreadcrumb(i)"
        :disabled="breadcrumb.disabled || (disableLast && isLastBreadcrumb(i))"
        v-bind="{ ...dividerProps, ...breadcrumb }"
      >
        <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
          <slot :name="slotName" v-bind="data"></slot>
        </template>
      </RaBreadcrumb>
    </ol>
  </nav>
</template>
<script>
import RaBreadcrumb from './_internal/RaBreadcrumb.vue';

/**
 * Component which renders a breadcrumb with router links for indicating the level of navigation the user is currently in.
 */
export default {
  name: 'RaBreadcrumbs',
  components: {
    RaBreadcrumb,
  },
  props: {
    /**
     * List of breadcrumbs (array of nested objects: `[ { text, link } ]`)
     */
    breadcrumbs: {
      type: Array,
      default: () => [],
    },
    /**
     * Renders the last item as a non-interactive element instead.
     */
    disableLast: {
      type: Boolean,
      default: true,
    },
    /**
     * Wraps the breadcrumbs contents into the next available line if there
     * isn't enough space to render in a single line.
     */
    wrap: {
      type: Boolean,
      default: true,
    },
    /**
     * Controls configurations for the dividers between each breadcrumb.
     * Refer to the `RaBreadcrumb` props to learn more.
     */
    dividerProps: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  setup(props, { slots }) {
    const isLastBreadcrumb = (index) => {
      return props.breadcrumbs.length - 1 === index;
    };

    return {
      slots,
      isLastBreadcrumb,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaBreadcrumbs.css';
</style>
