<template>
  <div :class="containerClasslist" class="">
    <div class="ra-progress-bar__title">
      <span class="text-left block uppercase mono-12 !font-normal">
        <template v-if="remainingSpend > 0">
          You're {{ $filters.moneyWithoutDecimals(remainingSpend) }} away from
          free shipping
        </template>
        <template v-else>You have earned free shipping</template>
      </span>
    </div>
    <div v-if="showBar" class="relative w-full h-2 bg-grey-200 mt-2">
      <div
        class="absolute ra-progress-bar__background top-0 bottom-0 !block transition-all ease-linear"
        :style="{ width: `${thresholdPercentage}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  subtotal: {
    type: Number,
    default: 0,
  },
  threshold: {
    type: Number,
    default: 0,
  },
  containerClasslist: {
    type: String,
    default: "",
  },
  showBar: {
    type: Boolean,
    default: true,
  },
});

const remainingSpend = computed(() => props.threshold - props.subtotal);

const thresholdPercentage = computed(() => {
  const percentage = (props.subtotal * 100) / props.threshold;
  return Math.min(percentage, 100);
});
</script>
