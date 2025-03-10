<template>
  <div class="ctl bg-bg-primary" :class="'product-ctl--' + id">
    <div
      class="max-lg:px-6 max-lg:py-12 max-lg:border-y max max-lg:border-stroke-secondary"
    >
      <div v-if="title" class="product-ctl__details mb-12 lg:mb-6">
        <p class="sans-16 text-text-inverse-primary normal-case">
          {{ title }}
        </p>
      </div>

      <div
        class="product-ctl__inner mt-12 w-full overflow-hidden grid grid-cols-1 gap-6 mx-auto"
      >
        <div v-for="(prod, i) in products" :key="prod.handle + '-' + i">
          <CompleteTheLookItem
            :product="prod"
            :vip-customer="vipCustomer"
            :show-sibling-products="showSiblingProducts"
            :waitlist-text="waitlistText"
            :sold-out-text="soldOutText"
            :bis-text="bisText"
            :product-badge-settings="productBadgeSettings"
            :waitlist-modal-title="waitlistModalTitle"
            :waitlist-modal-description="waitlistModalDescription"
            :waitlist-modal-legal-text="waitlistModalLegalText"
            :waitlist-modal-cta="waitlistModalCta"
            :bis-modal-title="bisModalTitle"
            :bis-modal-description="bisModalDescription"
            :bis-modal-legal-text="bisModalLegalText"
            :bis-modal-cta="bisModalCta"
            :enable-sale-event="enableSaleEvent"
            :sale-event-tooltip-color="saleEventTooltipColor"
            :sale-event-tooltip-copy="saleEventTooltipCopy"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import CompleteTheLookItem from "../CompleteTheLookItem.vue";

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  products: {
    type: Object,
    default: () => {},
  },
  title: { type: String },
  showSiblingProducts: { type: Boolean },
  id: { type: String },
  waitlistText: {
    type: String,
    default: "Waitlist for Early Access",
  },
  soldOutText: String,
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
  waitlistModalLegalText: { type: String },
  waitlistModalCta: { type: String },
  bisModalTitle: { type: String },
  bisModalDescription: { type: String },
  bisModalLegalText: { type: String },
  bisModalCta: { type: String },
  bisText: { type: String },
  vipCustomer: Boolean,
  orderLimit: String,
  productBadgeSettings: String,
  enableSaleEvent: { type: Boolean },
  saleEventTooltipColor: { type: String },
  saleEventTooltipCopy: { type: String },
});
</script>
