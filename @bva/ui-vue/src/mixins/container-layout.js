import { getBoundarySizeClasses } from '@bva/ui-shared/helpers';

/**
 * Hosts component properties (props) and computed functions for: layout, copy alignment, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Specify how wide should the container expand to using one of the available presets:
     * `min`,`tiny`,`small`,`xsmall`,`medium`,`xmedium`,`large`,`xlarge`,`max`, `full`.
     * The presets are rendered with PostCSS from the configured `breakpoints` tokens.
     * Refer to `~/styles/global/_layout.css` to learn more.
     */
    maxWidth: {
      type: [String, Boolean],
      default: '',
    },
    /**
     * Control the spacing from the top of a given component.
     * The presets are rendered with PostCSS from the configured `spacing` tokens.
     * Refer to `~/styles/global/_layout.css` to learn more.
     */
    spacingTop: {
      type: [Object, Array, String],
      default: '',
    },
    /**
     * Control the spacing from the bottom of a given component.
     * The presets are rendered with PostCSS from the configured `spacing` tokens.
     * Refer to `~/styles/global/_layout.css` to learn more.
     */
    spacingBottom: {
      type: [Object, Array, String],
      default: '',
    },
    /**
     * Control the spacing from the sides of a given component.
     * The presets are rendered with PostCSS from the configured `spacing` tokens.
     * Refer to `~/styles/global/_layout.css` to learn more.
     */
    spacingEdge: {
      type: [Object, Array, String],
      default: '',
    },
  },
};
