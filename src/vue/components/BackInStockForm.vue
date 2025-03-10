<template>
  <div
    class="bis__main-container flex items-center justify-center fixed top-0 left-0 w-full h-full z-[501]"
  >
    <div
      class="absolute top-0 left-0 w-full h-full bg-grey-900 opacity-[0.4]"
      @click="closeModal"
    ></div>
    <div
      class="bis__form relative rounded w-[397px] md:w-[445px] z-[502] px-6 py-8"
    >
      <button
        class="flex items-center justify-center group w-[17px] h-[17px] absolute right-6 top-6"
        title="toggle menu"
        aria-label="toggle menu"
        @click="closeModal"
      >
        <span
          class="ra-icon close-icon group-[.active]:flex transition-all delay-300"
          style="
            --icon-color: var(--white);
            --icon-width: 17px;
            --icon-height: 17px;
          "
          aria-hidden="true"
        >
          <svg>
            <use xlink:href="#close"></use>
          </svg>
        </span>
      </button>
      <p class="mono-12 text-white mb-10">
        {{ isComingSoon ? waitlistModalTitle : bisModalTitle }}
      </p>
      <div
        class="mono-24 text-white bis__main-container--modal-description mb-8"
        v-html="isComingSoon ? waitlistModalDescription : bisModalDescription"
      ></div>
      <form @submit.prevent="signUpwithEmailOrPhone">
        <div
          class="flex w-full justify-start md:max-w-[1124px] px-3 lg:px-0 mx-auto mt-4"
        >
          <div class="ra-tab__button-container">
            <button
              class="ra-tab__button py-0"
              :class="activeTab == 'email' ? 'active' : ''"
              @click="activeTab = 'email'"
            >
              EMAIL
            </button>
            <button
              class="ra-tab__button py-0"
              :class="activeTab == 'phone' ? 'active' : ''"
              @click="activeTab = 'phone'"
            >
              SMS
            </button>
          </div>
        </div>
        <input
          v-if="activeTab == 'email'"
          v-model="bisEmail"
          class="mb-2 ra-input__control ra-input__control--text color-white"
          type="email"
          id="bis-email"
          placeholder="Email"
          :required="activeTab == 'email'"
        />
        <div v-else class="flex gap-2">
          <input
            class="mb-2 ra-input__control ra-input__control--text max-w-[64px]"
            type="tel"
            value="+1"
            disabled
          />
          <input
            v-model="bisPhone"
            class="mb-2 ra-input__control ra-input__control--text"
            type="tel"
            id="bis-phone"
            placeholder="(123) 456-7890"
            :required="activeTab == 'phone'"
            pattern="^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$"
            title="Please enter a 10-digit phone number"
          />
        </div>
        <template
          v-for="(options, optionKey) in formattedOptions"
          :key="`${optionKey}`"
        >
          <CartOptionPicker
            :options="options"
            :selected="
              selectedOptions[optionKey] ? selectedOptions[optionKey] : ''
            "
            variant="dropdown"
            :itemsPerRow="itemsPerRow"
            @change:option="
              (selected, option) =>
                handleOptionSelect(optionKey, selected, option)
            "
          />
        </template>
        <p
          v-if="errorMessageSizing && !hasSelectedOption"
          class="bis__error-message"
        >
          Please select a size.
        </p>
        <div
          v-if="activeTab == 'email'"
          class="ra-choice ra-choice ra-choice--checkbox ra-choice--classic ra-choice--checkbox-classic light mb-lg"
        >
          <input
            class="ra-choice__input"
            type="checkbox"
            id="accepts-marketing"
            name="accepts-marketing"
            value="newsletter"
            v-model="acceptsMarketing"
          />
          <label
            class="ra-choice__container set--sibling-deep-focus mt-3"
            for="accepts-marketing"
          >
            <div class="ra-choice__checkmark set--inherit-focus hover">
              <span
                aria-hidden="true"
                class="ra-choice__checkmark-icon ra-icon ra-icon--sm"
              >
                <svg class="ra-icon ra-icon--xs">
                  <use xlink:href="#check-black"></use>
                </svg>
              </span>
            </div>
            <span
              class="ra-choice__label mono-12-spaced uppercase text-stroke-inverse-primary"
              >EMAIL ME WITH NEWS AND OFFERS
            </span>
          </label>
        </div>
        <button
          type="submit"
          class="w-[100%] ra-button ra-button ra-button--md text-white mb-lg"
          :class="{
            'ra-button--disabled':
              !emailOrPhoneInputIsValid || !hasSelectedOption,
            'ra-button--primary': emailOrPhoneInputIsValid && hasSelectedOption,
          }"
        >
          {{ isComingSoon ? waitlistModalCta : bisModalCta }}
        </button>
        <div v-if="showSubmitResp" class="mt-3">
          <p class="mono-12 text-white">
            {{ successMessage != "" ? successMessage : errorMessage }}
          </p>
        </div>
      </form>
      <p class="mono-12 text-white mt-2 mb-2 pt-1 pb-1">
        {{ isComingSoon ? waitlistModalLegalText : bisModalLegalText }}
      </p>
    </div>
  </div>
</template>
<script setup>
import { computed, reactive, watch, ref, onMounted } from "vue";
import { useProductPageStore } from "../stores/productPage";
import { CartOptionPicker } from "./CartComponents";

const props = defineProps({
  product: { type: Object },
  selectedVariant: { type: Object },
  vipCustomer: { type: Boolean },
  closeModal: { type: Function },
  waitlistModalTitle: { type: String },
  waitlistModalDescription: { type: String },
  waitlistModalLegalText: { type: String },
  waitlistModalCta: { type: String },
  bisModalTitle: { type: String },
  bisModalDescription: { type: String },
  bisModalLegalText: { type: String },
  bisModalCta: { type: String },
});

const variantSelected = ref(false);

// const swatchOptions = ["Color"];

const itemsPerRow = "3";
const bisEmail = ref("");
const bisPhone = ref("");
const showSubmitResp = ref(false);
const acceptsMarketing = ref(true);
const successMessage = ref("");
const errorMessage = ref("");
const activeTab = ref("email");
const errorMessageSizing = ref(false);

const optionsWithValues = reactive(props.product.options_with_values);

// Set initial options from first_available_variant
const selectedOptions = reactive({});

const handleOptionSelect = (optionKey, selected, selectedOption) => {
  if (!optionsSelected.value.includes(optionKey)) {
    // optionsSelected.value.push(optionKey);
  }
  selectedOptions[optionKey] = selectedOption.value;
};

const optionHasInStockVariant = (optionValue, optionKeyIndex) => {
  // Get indices of variant option keys not currently selected
  const variants = props.product.variants;
  const optionKeyIndices = [0, 1, 2];
  const currentOptionIndex = optionKeyIndices.splice(optionKeyIndex, 1)[0];

  // Find the variant that matches the optionValue passed in along with the currentvariant's remaining selected options,
  // check availability and return a Boolean
  const filteredAvailableVariants = variants
    .filter((variant) => {
      const options = variant.options.filter((option) => option);
      const currentVariantOptions = currentVariant.value.options.filter(
        (option) => option
      );
      return (
        options[optionKeyIndices[0]] ===
          currentVariantOptions[optionKeyIndices[0]] &&
        options[optionKeyIndices[1]] ===
          currentVariantOptions[optionKeyIndices[1]] &&
        variant.available
      );
    })
    .some((variant) => variant.options[currentOptionIndex] === optionValue);
  return filteredAvailableVariants;
};
// Set keyed object for all option values and disabled state
const formattedOptions = computed(() => {
  const formattedOptions = {};

  props.product.options.forEach((option, optionIndex) => {
    formattedOptions[option] = [];
    let optionIsAvailable = null;

    optionsWithValues[option].forEach((value) => {
      optionIsAvailable = optionHasInStockVariant(value, optionIndex);
      formattedOptions[option].push({
        label: value,
        value,
        disabled: !(
          props.product.coming_soon === true || optionIsAvailable === false
        ),
      });
    });
  });

  return formattedOptions;
});

const signUpwithEmailOrPhone = () => {
  if (!hasSelectedOption.value || !selectedOptions.SIZE) {
    errorMessageSizing.value = true;
    return;
  } else {
    errorMessageSizing.value = false;
  }

  if (activeTab.value == "email") {
    signUpWithEmail();
  } else {
    signUpWithPhone();
  }
};

const signUpWithEmail = () => {
  /* eslint-disable-next-line */
  BIS.create(bisEmail.value, currentVariant.value.id, props.product.id, {
    accepts_marketing: acceptsMarketing.value,
  }).then((resp) => {
    if (resp.status == "OK") {
      successMessage.value = resp.message;
      showSubmitResp.value = !showSubmitResp.value;
    }
    if (resp.status == "Error") {
      errorMessage.value = resp.errors.base[0];
      showSubmitResp.value = !showSubmitResp.value;
    }

    setTimeout(() => {
      props.closeModal();
    }, 3000);
  });
};

const signUpWithPhone = () => {
  const usCanadaPhoneNumber = "+1" + bisPhone.value.replace(/\D/g, ""); // This code uses the regular expression /\D/g to remove all non-digit characters (such as parentheses and hyphens) from the bisPhone.value
  /* eslint-disable-next-line */
  BIS.create(null, currentVariant.value.id, props.product.id, {
    phone_number: usCanadaPhoneNumber,
  }).then((resp) => {
    if (resp.status == "OK") {
      successMessage.value = resp.message;
      showSubmitResp.value = !showSubmitResp.value;
    }
    if (resp.status == "Error") {
      errorMessage.value = resp.errors.base[0];
      showSubmitResp.value = !showSubmitResp.value;
    }

    setTimeout(() => {
      props.closeModal();
    }, 3000);
  });
};

const hasComplexVariants = computed(() => {
  return props.product ? props.product.options?.length > 1 : false;
});

const isComingSoon = computed(() => {
  return !!(props.product.coming_soon && props.vipCustomer === false);
});

const emailOrPhoneInputIsValid = computed(() => {
  if (activeTab.value == "email") {
    // Check if email is in valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(bisEmail.value);
  } else {
    // Check if phone matches the specified pattern
    const phonePattern = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
    return phonePattern.test(bisPhone.value);
  }
});

const hasSelectedOption = computed(() => {
  return Object.keys(selectedOptions).length > 0;
});

const currentVariant = computed(() => {
  let currentVariant = props.product?.variants?.[0];
  if (hasComplexVariants.value) {
    if (props.product.options.length > 2) {
      currentVariant = props.product.variants.find(
        (variant) =>
          variant.option1 === Object.values(selectedOptions)[0] &&
          variant.option2 === Object.values(selectedOptions)[1] &&
          variant.option3 === Object.values(selectedOptions)[2]
      );
    } else {
      currentVariant = props.product.variants.find(
        (variant) =>
          variant.option1 === Object.values(selectedOptions)[0] &&
          variant.option2 === Object.values(selectedOptions)[1]
      );
    }
  } else if (props.product.variants_count > 1) {
    currentVariant = props.product.variants.find(
      (variant) => variant.option1 === Object.values(selectedOptions)[0]
    );
  }
  return currentVariant || props.product.first_available_variant;
});

const productStore = useProductPageStore();

// eslint-disable-next-line no-unused-vars
const variantOptions = computed(() => props.product.options.length);
const optionsSelected = ref([]);

watch(currentVariant, (variant) => {
  variantSelected.value = true;
  productStore.setCurrentVariant(variant);
});

onMounted(() => {
  variantSelected.value = !hasComplexVariants.value;
  const options = props.product.options;
  const optionsWithValues = props.product.options_with_values;
  if (props.selectedVariant.id) {
    selectedOptions["SIZE"] = props.selectedVariant.option1;
  } else {
    for (let i = 0; i < options.length; i++) {
      let productOption = options[i];
      if (optionsWithValues[productOption][0].value) {
        selectedOptions[productOption] =
          optionsWithValues[productOption][0].value;
        optionsSelected.value.push(selectedOptions[productOption]);
      } else {
        optionsSelected.value.push(selectedOptions[productOption]);
      }
    }
  }
});
</script>
