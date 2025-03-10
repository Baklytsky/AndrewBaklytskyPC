<template>
  <div>
    <div class="pt-4 md:px-0 mb-4">
      <!-- FREE SHIPPING BAR -->
      <CartMessage
        v-if="settings.cart_message_1?.length > 0"
        :message="settings.cart_message_1"
        :color="settings.cart_message_1_color"
        container-classlist="mb-8 hidden md:block"
      />
      <CartProgressBar
        v-if="settings.free_shipping_bar_enabled && progressBarData"
        :threshold="progressBarData.free_shipping_threshold"
        :subtotal="cart.total_price"
        :showBar="settings.free_shipping_bar_enabled"
        container-classlist="hidden md:block"
      />
      <CartGiftMessage
        v-if="settings.gift_message_enabled"
        :message="settings.gift_message_text"
      />
      <CartUpsell
        v-if="settings.upsell_enabled && settings.upsell_product"
        :product="settings.upsell_product"
        :title="settings.upsell_title"
        :order-limit="orderLimit"
        :vip-customer="vipCustomer"
        :waitlistText="waitlistText"
        :sold-out-text="soldOutText"
        :bisText="bisText"
        :preOrderText="preOrderText"
        container-classlist="md:mt-12 md:mb-12"
      />
      <div
        class="fixed z-10 bottom-0 p-6 left-0 w-full bg-[#a8a6a1] md:bg-transparent md:w-auto md:relative md:p-0"
      >
        <CartProgressBar
          v-if="settings.free_gift_enabled && progressBarData"
          :threshold="progressBarData.free_shipping_threshold"
          :subtotal="cart.total_price"
          :showBar="settings.free_gift_progress_bar_enabled"
          container-classlist="md:hidden"
        />
        <CartSubtotal :subtotal="cart.total_price" />
        <CartCheckoutButton
          :checkout-ready="readyForCheckout"
          container-classlist="-mb-[5px]"
          :order-limit-checkout-button="orderLimitCheckoutButton"
          :over-order-limit="overOrderLimit"
        />
        <CartMessage
          v-if="settings.cart_message_2?.length > 0"
          :message="settings.cart_message_2"
          :color="settings.cart_message_2_color"
          container-classlist="mt-8 md:hidden"
        />
      </div>
    </div>
    <CartMessage
      v-if="settings.cart_message_2?.length > 0"
      :message="settings.cart_message_2"
      :color="settings.cart_message_2_color"
      container-classlist="mt-2 hidden md:block"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  CartProgressBar,
  CartSubtotal,
  CartCheckoutButton,
  CartGiftMessage,
  CartMessage,
  CartUpsell,
} from "./";

const props = defineProps({
  cart: {
    type: Object,
    default: () => {},
  },
  settings: {
    type: Object,
    default: () => {},
  },
  orderLimit: String,
  orderLimitCheckoutButton: String,
  overOrderLimit: Boolean,
  vipCustomer: Boolean,
  waitlistText: String,
  soldOutText: String,
  bisText: String,
  preOrderText: String,
});

const settings = ref(props.settings);
const freeShippingCsvData = ref(null);

const progressBarData = computed(() => {
  const { free_gift_threshold, country_code, currency_code } = settings.value;
  let currentLocationData = null;
  if (freeShippingCsvData.value) {
    currentLocationData = freeShippingCsvData.value.find(
      (location) => location.country_code === country_code
    );
  }
  if (currency_code === "USD" && !currentLocationData) {
    currentLocationData = {
      country_code: country_code,
      free_shipping_threshold: free_gift_threshold,
    };
  }
  return currentLocationData;
});

const readyForCheckout = computed(() => {
  return props.cart.item_count > 0 && props.cart.items_subtotal_price > 0;
});

const getShippingCsv = async () => {
  try {
    const { free_shipping_csv_url } = settings.value;
    if (!free_shipping_csv_url) return;
    const csvData = await fetchCsv(free_shipping_csv_url);
    freeShippingCsvData.value = csvToJson(csvData);
  } catch (error) {
    console.error("Error processing CSV file:", error);
  }
};

const fetchCsv = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error in fetchCsv()! Status: ${response.status}`);
  }
  return await response.text();
};

const csvToJson = (csv) => {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(",");
    headers.forEach((header, index) => {
      if (header && currentLine[index]) {
        obj[header.trim()] = currentLine[index].trim();
      }
    });
    result.push(obj);
  }
  return result;
};

onMounted(() => {
  getShippingCsv();
});
</script>
