<template>
  <Transition name="fade" mode="out-in">
    <div v-if="submitSuccess">
      <p class="mono-24 text-white mb-8">YOU ARE ON THE LIST!</p>
      <p class="mono-12 text-white mb-8">
        We will reach out when this item becomes available.
      </p>
    </div>
    <div v-else>
      <p class="flex items-center justify-between mono-12 text-white mb-8">
        Be the first to know
      </p>
      <p class="mono-24 text-white mb-8">
        Sign up to join<br />
        the waitlist
      </p>
      <form id="backInStockForm" @submit.prevent="submitForm">
        <div class="ra-input ra-input--md mb-8">
          <label class="ra-input__label sr-only" for="email">Email</label>
          <div class="ra-input__wrapper">
            <input
              type="text"
              class="ra-input__control ra-input__control--text bg-black-25"
              id="email"
              placeholder="Email"
              v-model="email"
            />
          </div>
          <span
            class="text-e11 font-light text-red mt-1 peer-[.border-red]:flex"
            v-if="showEmailError"
            >Enter a valid email address</span
          >
        </div>
        <div
          class="ra-choice ra-choice ra-choice--checkbox ra-choice--classic ra-choice--checkbox-classic light mb-8"
        >
          <input
            class="ra-choice__input"
            name=""
            value=""
            id="checkobx_1_title"
            type="checkbox"
            v-model="isSubscribed"
          />
          <label
            class="ra-choice__container set--sibling-deep-focus"
            for="checkobx_1_title"
          >
            <div class="ra-choice__checkmark set--inherit-focus mr-3">
              <span
                aria-hidden="true"
                class="ra-choice__checkmark-icon ra-icon ra-icon--sm"
              >
                <svg class="ra-icon ra-icon--xs">
                  <use xlink:href="#check"></use>
                </svg>
              </span>
            </div>
            <span class="uppercase mono-12 text-white"
              >Subscribe to our newsletter</span
            >
          </label>
        </div>
        <button
          class="ra-button ra-button ra-button--primary ra-button--md w-full"
          title="Submit"
          type="submit"
          :disabled="!email?.length"
        >
          Submit
        </button>
      </form>
    </div>
  </Transition>
</template>

<script setup>
import { toRefs, ref } from "vue";

const props = defineProps({
  variant: Object,
  product: Object,
  vipCustomer: Boolean,
});

const { id } = toRefs(props.variant);
const email = ref(null);
const isSubscribed = ref(false);
const submitSuccess = ref(false);
const showEmailError = ref(false);

const isEmailValid = () => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.value);
};

const listId =
  props.product?.tags?.includes("coming-soon") && props.vipCustomer === false
    ? "XUMHwr"
    : "Uc7Lec";

const submitForm = () => {
  if (!isEmailValid()) {
    showEmailError.value = true;
    return false;
  }

  fetch("https://a.klaviyo.com/onsite/components/back-in-stock/subscribe", {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams({
      a: "Rf3A4Q",
      email: email.value,
      variant: id.value,
      platform: "shopify",
    }),
  })
    .then((resp) => resp.json())
    .then((resp) => (submitSuccess.value = resp.success));

  if (isSubscribed.value) {
    const urlEncodedFormData = new URLSearchParams();
    urlEncodedFormData.append("email", email.value);

    return fetch(
      `https://manage.kmail-lists.com/ajax/subscriptions/subscribe?a=Rf3A4Q&g=${listId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: urlEncodedFormData,
      }
    );
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
</style>
