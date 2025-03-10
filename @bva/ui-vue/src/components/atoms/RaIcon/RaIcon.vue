<template>
  <span
    ref="icon"
    :class="['ra-icon', modifierClass(dimensions.preset)]"
    :style="[iconCustomStyle]"
    aria-hidden="true"
    v-on="$listeners"
  >
    <!-- @slot Use the default slot to provide a custom Icon/SVG -->
    <slot v-bind="{ ...$props }">
      <svg class="ra-icon-path" :viewBox="iconViewBox">
        <defs v-if="coverage < 1">
          <linearGradient :id="coverage" x1="0" y1="0" x2="1" y2="0">
            <stop :offset="coverage" stop-color="var(--icon-color)" />
            <stop
              offset="0"
              stop-color="var(--icon-color-negative, var(--c-gray-800))"
            />
          </linearGradient>
        </defs>

        <use v-if="iconSymbol" :xlink:href="iconSymbol" :fill="fillPath"></use>

        <path
          v-for="(path, index) in iconPaths"
          v-else-if="iconPaths"
          :key="index"
          :d="path"
          :fill="fillPath"
        />
      </svg>
    </slot>
  </span>
</template>

<script>
import {
  getDimensions,
  getColorToken,
  getViewBox,
  getPaths,
  getFillPathURL,
  getSymbol,
} from '@bva/ui-shared/helpers';

export default {
  name: 'RaIcon',
  props: {
    /**
     * Icon SVG path(s)
     * It can be single SVG path (string) or array of SVG paths or icon name
     * from our icons list (such as 'added_to_cart`)
     */
    icon: {
      type: [String, Array],
      default: '',
    },
    /**
     * Use a string to control both the width and height for the icon.
     * The string can be either a CSS Unit or one of the preset keywords: `sm`, `md`, `lg`.
     * Alternatively pass an object with independent `width` and `height` properties.
     * The properties must include CSS Units and Variables.
     */
    size: {
      type: [Object, String],
      default: '',
    },
    /**
     * Custom color of the icon
     * It can be according to our standard colors, or legitimate CSS color such as `#fff`, `rgb(255,255,255)`), and `lightgray` or nothing.
     */
    color: {
      type: String,
      default: '',
    },
    /**
     * Set a custom overall spacing for the icon.
     * Follows the CSS margin property structure.
     */
    spacing: {
      type: String,
      default: null,
    },
    /**
     * Set a custom top margin for the icon.
     * Use any valid CSS value+unit.
     */
    top: {
      type: String,
      default: null,
    },
    /**
     * Set a custom right margin for the icon.
     * Use any valid CSS value+unit.
     */
    right: {
      type: String,
      default: null,
    },
    /**
     * Set a custom bottom margin for the icon.
     * Use any valid CSS value+unit.
     */
    bottom: {
      type: String,
      default: null,
    },
    /**
     * Set a custom left margin for the icon.
     * Use any valid CSS value+unit.
     */
    left: {
      type: String,
      default: null,
    },
    /**
     * Custom viewBox size of the icon
     * It should be according to the standard `"min-x min-y width height"`.
     * By default it will be `0 0 24 24`. If you use our icons, you don't need to pass this prop at all.
     * Recommendations: try to get your SVG designed with our default viewBox value and reduce the number of props passed to the component.
     */
    viewBox: {
      type: String,
      default: '0 0 24 24',
    },
    /**
     * The fraction in which the icon is partially collored with --icon-color value and the rest with --icon-color-negative.
     * To be used in RaRating.
     * */
    coverage: {
      type: [String, Number],
      default: 1,
    },
  },
  computed: {
    iconViewBox() {
      return getViewBox(this.icon, this.viewBox);
    },
    dimensions() {
      return getDimensions(this.size);
    },
    iconCustomStyle() {
      return {
        '--icon-color': getColorToken(this.color),
        '--icon-size': this.dimensions.size,
        '--icon-width': this.dimensions.width,
        '--icon-height': this.dimensions.height,
        '--icon-margin': this.spacing,
        '--icon-margin-top': this.top,
        '--icon-margin-right': this.right,
        '--icon-margin-bottom': this.bottom,
        '--icon-margin-left': this.left,
      };
    },
    fillPath() {
      return getFillPathURL(this.coverage);
    },
    iconPaths() {
      return getPaths(this.icon);
    },
    iconSymbol() {
      return getSymbol(this.icon);
    },
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-icon--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaIcon.css';
</style>
