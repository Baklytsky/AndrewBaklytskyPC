<template>
  <div class="bg-grey-100 mb-4 p-4 flex flex-col">
    <div
      class="ra-choice ra-choice ra-choice--checkbox ra-choice--classic ra-choice--checkbox-classic"
    >
      <input
        class="ra-choice__input"
        id="gift_message"
        type="checkbox"
        v-model="giftMessageActive"
      />
      <label
        class="ra-choice__container set--sibling-deep-focus flex flex-row gap-[6px] flex-nowrap"
        for="gift_message"
      >
        <div class="ra-choice__checkmark set--inherit-focus">
          <span
            aria-hidden="true"
            class="ra-choice__checkmark-icon ra-icon ra-icon--sm"
          >
            <svg class="ra-icon ra-icon--xs">
              <use xlink:href="#check"></use>
            </svg>
          </span>
        </div>
        <span class="ra-choice__label leading-tight" v-text="message" />
      </label>
    </div>
    <textarea
      v-if="giftMessageActive"
      v-model="note"
      class="ra-textarea__control mt-4 border border-grey-300"
      rows="4"
      placeholder="Gift Message Text"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useCartStore } from "../../stores/cart.js";

defineProps({
  message: {
    type: String,
    default: "",
  },
});

const cartStore = useCartStore();

const { cart } = cartStore;

let note = ref(cart.note);

let tempNote = ref(cart.note);

let giftMessageActive = ref(false);

const debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
};

watch(
  note,
  debounce((updatedNote) => {
    tempNote.value = updatedNote;
    cartStore.updateNote(updatedNote);
  }, 500)
);

watch(giftMessageActive, () => {
  if (!giftMessageActive.value) cartStore.updateNote("");
  else cartStore.updateNote(tempNote.value);
});

onMounted(() => {
  giftMessageActive.value = note?.value?.length > 0;
});
</script>
