import { computed, getCurrentInstance } from 'vue-demi';

/**
 * Determines if a given `slotName` is present in the current instance slot list.
 * Works with Vue2 and Vue3.
 */
export const useHasSlot = (slotName = 'default') => {
  const { proxy } = getCurrentInstance();

  return computed(() => {
    if (typeof proxy.$slots[slotName] === 'function') {
      return proxy.$slots[slotName]().length > 0;
    }

    return proxy.$slots[slotName] && proxy.$slots[slotName].length > 0;
  });
};
