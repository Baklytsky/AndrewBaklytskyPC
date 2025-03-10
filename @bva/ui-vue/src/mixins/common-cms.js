/**
 * Hosts component properties (props) and computed functions for: CMS properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Holds standard configurations to bind component properties
     * with editing functionalities on a CMS.
     */
    cmsBindings: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
