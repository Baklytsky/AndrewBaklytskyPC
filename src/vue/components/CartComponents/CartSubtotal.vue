<template>
  <div class="flex flex-row justify-between mono-12 mb-6 md:mb-6 pt-7">
    <span class="mt-auto">SUBTOTAL:</span>
    <span class="mono-16 !font-normal">{{
      $filters.moneyWithoutDecimals(subtotal)
    }}</span>
  </div>
</template>

<script setup>
defineProps({
  subtotal: {
    type: Number,
    default: 0,
  },
});
</script>
