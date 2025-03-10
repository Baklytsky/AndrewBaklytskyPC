import {
  getForegroundVars,
  getBackgroundVars,
  getForegroundClasses,
  getBackgroundClasses,
} from '@bva/ui-shared/helpers';

/**
 * Hosts component properties (props) and computed functions for: styles such as font size, text color, background color, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Overall text & icons color for the component.
     * Small viewport styles can be set separately.
     */
    foregroundColor: {
      type: String,
      default: null,
    },
    /**
     * Adjust the value of `foregroundColor` for viewports higher than or equal to "medium", i.e. tablets, small laptops, etc.
     */
    foregroundColorMD: {
      type: String,
      default: null,
    },
    /**
     * Overall background color for the component.
     * Small viewport styles can be set separately.
     */
    backgroundColor: {
      type: String,
      default: null,
    },
    /**
     * Adjust the value of `backgroundColor` for viewports higher than or equal to "medium", i.e. tablets, small laptops, etc.
     */
    backgroundColorMD: {
      type: String,
      default: null,
    },
  },
  computed: {
    foregroundVariables() {
      return getForegroundVars(this.foregroundColor, this.foregroundColorMD);
    },
    backgroundVariables() {
      return getBackgroundVars(this.backgroundColor, this.backgroundColorMD);
    },
    foregroundClasses() {
      return getForegroundClasses(this.foregroundColor, this.foregroundColorMD);
    },
    backgroundClasses() {
      return getBackgroundClasses(this.backgroundColor, this.backgroundColorMD);
    },
  },
};
