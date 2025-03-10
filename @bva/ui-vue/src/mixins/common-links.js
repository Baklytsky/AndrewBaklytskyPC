import {
  getLinks,
  getMainLink,
  getFormattedLink,
} from '@bva/ui-shared/helpers/links';

/**
 * Hosts component properties (props) for: links, CTAs, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * The main link for this component.
     * Additionally, you may provide a `linkList` if more than one Link/CTA is necessary.
     * For more granular control, pass an Object which aligns with the `RaButton` or `RaLink` APIs.
     */
    link: {
      type: [String, Object],
      default: null,
    },
    /**
     * Specify one or more Links/CTAs to render within this component.
     * If in use, you may skip the `link` prop.
     */
    linkList: {
      type: [Array, Object],
      default: () => [],
    },
  },
  computed: {
    standaloneLink() {
      return getFormattedLink(this.link);
    },
    links() {
      return getLinks(this.linkList, this.standaloneLink);
    },
    /**
     * Returns the first link object in the `links` computed array that has a `.link` property.
     * If nothing is found, returns null.
     */
    mainLink() {
      return getMainLink(this.links);
    },
  },
};
