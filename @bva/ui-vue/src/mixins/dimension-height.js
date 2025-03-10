/**
 * Hosts component properties (props) and computed functions for: height, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Adjust the height of this component across all viewports.
     */
    height: {
      type: String,
    },
    /**
     * Adjust the height for viewports higher than or equal to "medium", i.e. tablets, small laptops, etc.
     * Setting this property overrides the value of `height`.
     */
    heightMD: {
      type: String,
    },
    /**
     * Adjust the height for viewports higher than or equal to "large", i.e. desktop, laptops, large tablets, etc.
     * Setting this property overrides the value of `height` and `heightMD`.
     */
    heightLG: {
      type: String,
    },
  },
};
