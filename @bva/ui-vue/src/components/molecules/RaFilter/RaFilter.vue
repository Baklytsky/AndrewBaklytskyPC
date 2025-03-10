<template>
  <RaChoice
    class="ra-filter"
    :class="{
      'ra-filter--active': selected,
      'ra-filter--color': color,
      'ra-filter--checkbox': !color,
      'ra-filter--hide-labels': hideLabels,
    }"
    :name="label"
    :label="label"
    :checked="selected"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #checkmark>
      <!-- @slot Replaces the swatch functionality -->
      <slot name="filter-color" v-bind="{ color, selected }">
        <RaSwatch
          v-if="color"
          :color="color"
          :value="color"
          :selected="selected"
          size="sm"
          class="ra-filter__color"
          @change="$emit('change', !selected)"
        />
      </slot>
    </template>

    <template #label>
      <div class="ra-filter__label">
        <span class="ra-filter__label-key">
          <!-- @slot Replaces the default label key -->
          <slot name="filter-label" v-bind="{ label }">
            {{ label }}
          </slot>
        </span>

        <span class="ra-filter__label-value">
          <!-- @slot Replaces the default label value -->
          <slot name="filter-count" v-bind="{ count }">
            {{ count }}
          </slot>
        </span>
      </div>
    </template>
  </RaChoice>
</template>
<script>
import RaChoice from '../../atoms/RaChoice/RaChoice.vue';
import RaSwatch from '../../atoms/RaSwatch/RaSwatch.vue';
export default {
  name: 'RaFilter',
  components: {
    RaChoice,
    RaSwatch,
  },
  props: {
    /**
     * Label for the filter, what the user sees when selcting a filter.
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Number specifying how many matches are included after applying this filter.
     */
    count: {
      type: [String, Number],
      default: '',
    },
    /**
     * Whether or not the filter has been selected.
     */
    selected: {
      type: Boolean,
      default: false,
    },
    /**
     * If present, renders the filter as a swatch instead.
     */
    color: {
      type: String,
      default: '',
    },
    /**
     * Hides all labels, including the filter `count` value.
     */
    hideLabels: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaFilter.css';
</style>
