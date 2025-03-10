/**
 * Hosts component properties (props) and computed functions for: width, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Adjust the width of this component across all viewports.
     */
    width: {
      type: String,
    },
    /**
     * Adjust the width for viewports higher than or equal to "medium", i.e. tablets, small laptops, etc.
     * Setting this property overrides the value of `width`.
     */
    widthMD: {
      type: String,
    },
    /**
     * Adjust the width for viewports higher than or equal to "large", i.e. desktop, laptops, large tablets, etc.
     * Setting this property overrides the value of `width` and `widthMD`.
     */
    widthLG: {
      type: String,
    },
  },
};
