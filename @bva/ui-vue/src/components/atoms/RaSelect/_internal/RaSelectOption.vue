<template>
  <option :value="value" class="ra-select__option" tabindex="0">
    <!-- @slot -->
    <slot />
  </option>
</template>
<script>
export default {
  name: 'RaSelectOption',
  props: {
    value: {
      type: [String, Number, Object],
      default: '',
    },
  },
};
</script>
