import { ref } from 'vue-demi';

const DEFAULTS = {};

export const useCSSMotion = (target, variants = {}, options = {}) => {
  options = { ...DEFAULTS, ...options };

  const _transitionEndCallback = ref(() => {});
  const _appliedVariantsList = ref([]);
  const _activeTransitionList = ref(new Map());

  /**
   * Keep track of the transitions that are firing bu pushing them into a map.
   */
  const _handleTransitionRun = (evt) => {
    _activeTransitionList.value.set(evt.propertyName, true);
  };

  /**
   * Delete each transition from the `_activeTransitionList` map as they complete.
   * Resolves the pending promise once all tracked transitions are complete.
   */
  const _handleTransitionEnd = (evt) => {
    _activeTransitionList.value.delete(evt.propertyName);

    if (_activeTransitionList.value.size === 0) {
      _transitionEndCallback.value({ target, variants });

      //Detach transition listeners as to not unintentionally keep firing these once entry/exist motion is done.
      target.removeEventListener('transitionend', _handleTransitionEnd);
      target.removeEventListener('transitionrun', _handleTransitionRun);
    }
  };

  /**
   * Removes all of the motion state classes from the `target` DOM element.
   */
  const removeAll = () => {
    target.classList.remove(..._appliedVariantsList.value);

    _appliedVariantsList.value = [];
  };

  /**
   * Applies a new motion state to the `target` DOM element.
   * Any previous states removed before applying and listening for changes.
   *
   * Returns a promise.
   */
  const apply = (variantID) => {
    return new Promise((resolve, reject) => {
      _transitionEndCallback.value = resolve;

      removeAll();

      if (variantID) {
        const classToAdd = variants[variantID] || variantID;

        _appliedVariantsList.value.push(classToAdd);

        target.addEventListener('transitionrun', _handleTransitionRun);
        target.addEventListener('transitionend', _handleTransitionEnd);

        target.classList.add(classToAdd);
      } else {
        _transitionEndCallback.value();
      }
    });
  };

  //Automatically apply the `initial` variant when the composable is first run.
  apply('initial');

  return {
    apply,
    removeAll,
    variants,
  };
};
