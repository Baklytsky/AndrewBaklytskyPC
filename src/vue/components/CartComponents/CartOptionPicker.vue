<template>
  <RaOptionPicker
    v-bind="$attrs"
    class="cart-tile__option-picker"
    variant="dropdown"
    size="lg"
    placeholderLabel="Select a size"
  />
</template>

<script setup>
import { RaOptionPicker } from "@bva/ui-vue";
</script>

<style>
.cart-tile__option-picker .ra-input__label {
  display: none !important;
}
</style>
