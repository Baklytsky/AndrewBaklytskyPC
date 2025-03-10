<template>
  <component
    :is="`h${level}`"
    class="ra-title"
    :style="titleVars"
    v-on="$listeners"
  >
    <div v-html="title"></div>
    <slot />
  </component>
</template>

<script>
import { computed } from 'vue-demi';
import { getTitleVars } from '@bva/ui-shared/helpers/title';

export default {
  name: 'RaTitle',
  props: {
    /**
     * The title to display. Use this property when passing a string with HTML.
     * Alternatively you can pass the title as a slot (if string, HTML entities won't render).
     */
    title: {
      type: String,
      default: null,
    },
    /**
     * HTML DOM element rendering level for this component.
     * i.e. h1, h2, ... hn.
     */
    level: {
      type: Number,
      default: 2,
    },
    /**
     * Display the heading's title as another level.
     * i.e. the real heading tag can be h1, and displayed as an h3 with CSS.
     */
    as: {
      type: [Number, String],
      default: null,
    },
  },
  setup(props) {
    const hLevel = computed(() => {
      return props.as || props.level;
    });

    const titleVars = computed(() => {
      return getTitleVars(hLevel.value, props.as);
    });

    return {
      hLevel,
      titleVars,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaTitle.css';
</style>
