import {
  getDetailsLocationClasses,
  getVerticalAlignClasses,
  getHorizontalAlignClasses,
} from '@bva/ui-shared/helpers';

/**
 * Hosts component properties (props) and computed functions for: layout, copy alignment, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Location of the "details" container for this component.
     * The location is relative to the "media" portion of this component.
     * Options: `before`, `overlay`, `after`.
     */
    detailsLocation: {
      type: String,
      default: 'after',
    },
    /**
     * Adjust the value of `detailsLocation` for viewports higher than or equal to "medium", i.e. tablets, small laptops, etc.
     */
    detailsLocationMD: {
      type: String,
    },
    /**
     * Control vertical alignment on this component.
     * This generally applies to the details/copy/text portion of the component.
     * Options: `top`, `middle`, `bottom`.
     */
    verticalAlign: {
      type: String,
      default: 'middle',
    },
    /**
     * Adjust the value of `verticalAlign` for viewports higher than or equal to "medium", i.e. tablets, small laptops, etc.
     */
    verticalAlignMD: {
      type: String,
    },
    /**
     * Control horizontal alignment on this component.
     * This generally applies to the details/copy/text portion of the component.
     * Options: `left`, `center`, `right`.
     */
    horizontalAlign: {
      type: String,
      default: 'left',
    },
    /**
     * Adjust the value of `horizontalAlign` for viewports higher than or equal to "medium", i.e. tablets, small laptops, etc.
     */
    horizontalAlignMD: {
      type: String,
    },
  },
  computed: {
    detailsLocationClasses() {
      return getDetailsLocationClasses(
        this.detailsLocation,
        this.detailsLocationMD
      );
    },
    verticalAlignClasses() {
      return getVerticalAlignClasses(this.verticalAlign, this.verticalAlignMD);
    },
    horizontalAlignClasses() {
      return getHorizontalAlignClasses(
        this.horizontalAlign,
        this.horizontalAlignMD
      );
    },
  },
};
