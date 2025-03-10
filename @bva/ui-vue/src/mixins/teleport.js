/**
 * Hosts component properties (props) for: teleport functionality.
 * https://vuejs.org/guide/built-ins/teleport.html
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Disables the teleporting functionality, which defaults to rendering
     * this component in the `document.body`.
     */
    teleport: {
      type: Boolean,
      default: true,
    },
    /**
     * Provide a DOM selector for the location where
     * this component should render.
     *
     * See https://vuejs.org/guide/built-ins/teleport.html for more info.
     */
    teleportTo: {
      type: String,
      default: 'body',
    },
  },
};
