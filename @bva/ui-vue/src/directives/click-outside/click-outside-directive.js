import {
  getIsOutsideClick,
  bindClickOutside,
  unbindClickOutside,
} from '@bva/ui-shared/helpers/click-outside';

export const clickOutside = {
  bind(el, binding, vnode) {
    const closeHandler = binding.value.handler || binding.value;

    binding.name = 'click-outside';

    el._outsideClickHandler = function (evt) {
      if (getIsOutsideClick(evt, el, binding.value)) {
        closeHandler();
      }
    };

    bindClickOutside(el._outsideClickHandler);
  },
  unbind(el) {
    unbindClickOutside(el._outsideClickHandler);

    el._outsideClickHandler = null;
  },
};
