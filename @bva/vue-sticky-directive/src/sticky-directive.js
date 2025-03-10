import Stickie from "@bva/stickie";

const DEFAULTS = {
  contained: false,
  classScope: "sticky",
  eventScope: "sticky",
};

const Sticky = (options = {}) => {
  return {
    inserted(el, binding, vnode) {
      vnode.context.$nextTick(() => {
        new Stickie(el, { ...DEFAULTS, ...binding.value });
      });
    },
    unbind(el, binding, vnode) {
      const sticky = Stickie.get(el);

      if (sticky) {
        sticky.destroy();
      }
    },
    update(el, binding, vnode) {
      if (binding.value === binding.oldValue) {
        return;
      }

      const sticky = Stickie.get(el);

      if (sticky && sticky.initialized) {
        sticky.options = { ...sticky.options, ...binding.value };
        sticky.updateSticky();
      }
    },
    componentUpdated(el, binding, vnode) {
      const sticky = Stickie.get(el);

      if (sticky && sticky.initialized) {
        sticky.updateSticky();
      }
    },
  };
};

export default Sticky();
