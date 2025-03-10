import { ref, inject, watch, getCurrentInstance } from 'vue-demi';

/**
 * Expects a provided state with these properties:
 * {
 *   count: Number,
 *   activeList: Array,
 *   activeLast: null,
 *   multiple: Boolean,
 * }
 */
export const useScopedToggle = () => {
  const _this = getCurrentInstance().proxy;

  const scopedState = ref(inject('scopedState')).value;

  //Setup defaults once
  if (!scopedState.ready) {
    scopedState.ready = true;

    scopedState.count = scopedState.count || 0;
    scopedState.activeList = scopedState.activeList || [];
    scopedState.activeLast =
      scopedState.activeLast >= 0 ? scopedState.activeLast : null;
  }

  //If no index is provided, attempt to get an index based on the current scope.
  const itemIndex = ref(_this.index >= 0 ? _this.index : scopedState.count++);

  /**
   * Serves as a side-effect after toggling the current `open` state.
   * Updates the scoped state so that other items within the same context update their state.
   */
  const updateScopedState = (value) => {
    //Force the `scopedState` watcher to trigger.
    scopedState.activeLast = value ? itemIndex.value : null;

    //Clean the active list if `multiple` isn't enabled.
    if (!scopedState.multiple) {
      scopedState.activeList = [];
    }

    scopedState.activeList[itemIndex.value] = value;
  };

  const handleToggle = () => {
    const newState = !_this.open;

    //Do nothing when self toggling off is disabled.
    if (_this.open && _this.disableSelfOff) {
      return false;
    }

    _this.$emit('toggle', newState);

    updateScopedState(newState);

    //Emit information to the parent about the current state of the item list.
    _this.$parent.$emit(
      'toggle',
      scopedState.activeList,
      itemIndex.value,
      newState
    );
  };

  //Update the model when the injected `scopedState` changes.
  if (!scopedState.multiple) {
    watch(scopedState, (newValue) => {
      if (
        newValue.activeLast !== null &&
        newValue.activeLast !== itemIndex.value &&
        _this.open
      ) {
        _this.$emit('toggle', !!newValue.activeList[itemIndex.value]);
      }
    });
  }

  return {
    itemIndex,
    scopedState,
    updateToggle: handleToggle,
    updateScopedState,
  };
};
