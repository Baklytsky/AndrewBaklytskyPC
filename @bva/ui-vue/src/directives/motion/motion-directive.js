import { usePageMotion } from '@bva/ui-vue/src/composables';
import { nextTick } from 'vue-demi';

const instanceMap = new Map();

export const motion = {
  bind(el, binding) {
    nextTick(() => {
      //An override can be passed to the directive's arg using:
      //v-motion:[`overrides`]="someConfig"
      //Where `overrides` is a prop, data object, or other valid Vue/JS Object.
      const rawConfig = binding.hasOwnProperty('arg')
        ? binding.arg
        : binding.value;

      const isString = typeof rawConfig === 'string';
      const motionConfig = isString ? {} : { ...rawConfig };

      //Exit initialization if cosnfiguration is disabled.
      if (rawConfig === false) {
        return false;
      }

      if (isString) {
        motionConfig.children = rawConfig;
      } else if (
        typeof rawConfig === 'boolean' ||
        !rawConfig ||
        !rawConfig.children
      ) {
        //Default to the el's direct children if no `children` option is provided.
        motionConfig.children = el.children;
      }

      instanceMap.set(el, usePageMotion(el, motionConfig));
    });
  },
  unbind(el) {
    if (instanceMap.get(el)) {
      instanceMap.get(el).destroy();

      instanceMap.delete(el);
    }
  },
};
