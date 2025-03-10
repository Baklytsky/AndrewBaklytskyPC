<template>
  <RaSwatchPicker
    v-bind="$attrs"
    class="product-form__option-picker mb-[16px]"
    size="sm"
    shape="rounded"
    :style="defaultStyles"
    :fillSpace="false"
    gap="16px"
    variant="grid"
  />
</template>

<script setup>
import { RaSwatchPicker } from "@bva/ui-vue";
const defaultStyles = {
  "--picker-border-width": 0,
};
</script>
