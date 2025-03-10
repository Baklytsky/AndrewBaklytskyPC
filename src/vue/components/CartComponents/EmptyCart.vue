<template>
  <div class="max-w-[325px] flex flex-col">
    <h3 class="mb-10 text-center" v-text="settings.empty_cart_header" />
    <a
      v-for="(cta, i) in settings.links"
      :key="`cta-${i}`"
      class="ra-button ra-button ra-button--secondary ra-button--lg mb-2"
      :href="cta.url"
      v-text="cta.title"
    />
  </div>
</template>

<script setup>
defineProps({
  settings: {
    type: Object,
    default: () => {},
  },
});
</script>
