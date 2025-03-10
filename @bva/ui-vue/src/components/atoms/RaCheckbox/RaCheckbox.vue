<template>
  <RaChoice type="checkbox" v-bind="$attrs" v-on="$listeners">
    <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
      <slot :name="slotName" v-bind="data"></slot>
    </template>
  </RaChoice>
</template>

<script>
import RaChoice from '../RaChoice/RaChoice.vue';

/**
 * This component is a proxy for `RaChoice` set to `type="checkbox"` for easy usage.
 *
 * It accepts all of the same props and slots of `RaChoice`.
 */
export default {
  name: 'RaCheckbox',
  components: {
    RaChoice,
  },
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'change',
  },
  setup(props, { slots }) {
    return { slots };
  },
};
</script>
