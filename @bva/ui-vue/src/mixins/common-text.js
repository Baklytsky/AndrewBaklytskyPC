/**
 * Hosts component properties (props) for: text (title, description), copy, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * The main title for the component.
     * Optional styles for the title's level and display can be set separately.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * DOM element rendering level for this component.
     * i.e. h1, h2, ... hn.
     */
    titleLevel: {
      type: Number,
      default: 2,
    },
    /**
     * Display the title as another level.
     * i.e. the DOM heading tag can be h1, and displayed as an h3 with CSS.
     */
    titleAs: {
      type: Number,
      default: null,
    },
    /**
     * The subtitle for the component.
     * Typically this renders before the component's `title`.
     */
    subtitle: {
      type: String,
      default: '',
    },
    /**
     * Additional details to display within this component.
     * Typically this renders in the form of a paragraph.
     */
    description: {
      type: String,
      default: '',
    },
  },
};
