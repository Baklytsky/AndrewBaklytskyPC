import { computed, getCurrentInstance, isVue2 } from 'vue-demi';

/**
 * Vue3 removes support for the dedicated `$listeners` object:
 * https://v3-migration.vuejs.org/breaking-changes/listeners-removed.html
 * In some instances this may be a problem, such as when needing to place
 * inherited attributes in one element and the listeners in another.
 */
export const useInherited = ({ filter = [] } = {}) => {
  const { proxy } = getCurrentInstance();

  return computed(() => {
    if (isVue2) {
      return {
        attrs: proxy.$attrs,
        //The following properties are intentionally empty.
        //This is to prevent duplicate binding in Vue2.
        //Listeners are accessible in Vue2 with the `$listeners` object.
        listeners: {},
        classes: {},
        styles: {},
      };
    }

    //Vue3 tests event listeners with this regex
    //https://github.com/vuejs/core/blob/a26cd9ca7ff8e8f987ac86925a7c861536582d3e/packages/shared/src/index.ts#L41
    const onRE = /^on[^a-z]/;
    const result = {
      attrs: {},
      listeners: {},
      classes: {},
      styles: {},
    };

    //Vue3 groups listeners, attributes, classes, and styles into the single `$attrs` object.
    //Loop through these and place them into separate buckets.
    for (const property in proxy.$attrs) {
      if (onRE.test(property) && typeof proxy.$attrs[property] === 'function') {
        //Exclude event listeners that are in the `filter` list.
        //The comparison tests by removing the 'on' prefix, which is added by Vue3.
        //This prevents event name collisions when emitting events of the same name, for example:
        // `@click="$emit('click', arg)"`
        //**This may be removed once full transition to Vue3 is complete.**
        if (filter.indexOf(property.toLowerCase().substring(2)) === -1) {
          result.listeners[property] = proxy.$attrs[property];
        }
      } else if (property === 'class') {
        result.classes = proxy.$attrs[property];
      } else if (property === 'style') {
        result.styles = proxy.$attrs[property];
      } else {
        result.attrs[property] = proxy.$attrs[property];
      }
    }

    return result;
  });
};
