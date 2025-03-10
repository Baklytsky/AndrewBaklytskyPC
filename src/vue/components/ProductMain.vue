<template>
  <Transition name="fade" appear>
    <div
      class="ra-product-main__inner w-full relative px-6 pb-2 lg:py-8"
      v-touch:swipe.bottom="closeBuyBox"
    >
      <ProductForm
        v-bind="{ product }"
        :vip-customer="vipCustomer"
        :order-limit="orderLimit"
        :template="template"
        :waitlist-text="waitlistText"
        :bis-text="bisText"
        :sold-out-text="soldOutText"
        :waitlist-modal-disabled="waitlistModalDisabled"
        :waitlist-modal-title="waitlistModalTitle"
        :waitlist-modal-description="waitlistModalDescription"
        :waitlist-modal-legal-text="waitlistModalLegalText"
        :waitlist-modal-cta="waitlistModalCta"
        :bis-modal-title="bisModalTitle"
        :bis-modal-description="bisModalDescription"
        :bis-modal-legal-text="bisModalLegalText"
        :bis-modal-cta="bisModalCta"
        :pre-order-text="preOrderText"
        :complete-the-look-anchor-link="completeTheLookAnchorLink"
        :enable-sale-event="enableSaleEvent"
        :sale-event-tooltip-color="saleEventTooltipColor"
        :sale-event-tooltip-copy="saleEventTooltipCopy"
        :show-klarna-afterpay-message="showKlarnaAfterpayMessage"
        :enable-gift-note="enableGiftNote"
        @update-product="handleUpdateProduct"
      />
    </div>
  </Transition>
</template>

<script setup>
import ProductForm from "./ProductForm.vue";
import { closeBuyBox } from "../../js/utils/buy-box";
import { ref } from "vue";

const props = defineProps({
  product: Object,
  vipCustomer: Boolean,
  orderLimit: String,
  waitlistText: { type: String, default: "Waitlist for Early Access" },
  template: String,
  bisText: { type: String },
  soldOutText: { type: String },
  waitlistModalDisabled: { type: String },
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
  waitlistModalDescriptionSecondLine: { type: String },
  waitlistModalLegalText: { type: String },
  waitlistModalCta: { type: String },
  bisModalTitle: { type: String },
  bisModalDescription: { type: String },
  bisModalDescriptionSecondLine: { type: String },
  bisModalLegalText: { type: String },
  bisModalCta: { type: String },
  preOrderText: { type: String },
  completeTheLookAnchorLink: { type: Boolean },
  enableSaleEvent: { type: Boolean },
  saleEventTooltipColor: { type: String },
  saleEventTooltipCopy: { type: String },
  showKlarnaAfterpayMessage: { type: Boolean },
  enableGiftNote: { type: Boolean },
});

const product = ref(props.product);

const handleUpdateProduct = (data) => {
  product.value = data;
};
</script>

<style>
@media (max-width: 1024px) {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
