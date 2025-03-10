<template>
  <div class="ra-picker__contents">
    <div
      class="ra-grid ra-option-picker__items"
      data-gap="-*"
      data-columns="-sm,-lg"
      style="
        --grid-gap: 15px;
        --grid-columns: 6;
        --grid-columns-lg: 8;
        --grid-repeat-tracks: 0fr;
      "
    >
      <button
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="ra-button--raw ra-option ra-option--grid"
        :style="{ width: `calc(100% / ${options.length} - 12px)` }"
        :class="[
          'ra-button--raw ra-option ra-option--grid',
          {
            'ra-option--selected': selected === option.value,
            'ra-option--disabled': option.disabled,
          },
        ]"
        @click="optionSelected({ selected: option.value, option })"
        type="button"
        :aria-label="option.label"
      >
        <span class="ra-option__label">
          {{
            option.value.includes("$")
              ? option.value.split(".")[0]
              : option.value
          }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selected: String,
  options: Object,
  tags: Array,
  waitlistProduct: Boolean,
  vipCustomer: Boolean,
});

const emit = defineEmits(["change"]);

const optionSelected = ({ selected, option }) => {
  emit("change", selected, option);
};
</script>
