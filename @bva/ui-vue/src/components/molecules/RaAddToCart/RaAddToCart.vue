<template>
  <div
    :class="['ra-add-to-cart', inherited.classes]"
    :style="[inherited.styles]"
  >
    <!--@slot Custom content to render at the beginning of the add to cart component.-->
    <slot name="before" />

    <slot v-if="qtyVisible" name="input" v-bind="{ qty }">
      <RaQuantitySelector
        aria-label="Quantity"
        class="ra-add-to-cart__select-quantity"
        v-bind="{
          qty,
          disabled,
          ...qtyProps,
        }"
        v-on="qtyEvents"
        @change="(value) => $emit('input', value)"
      />
    </slot>

    <div class="ra-add-to-cart__cta-container">
      <!--@slot Custom content to render before the add to cart CTA.-->
      <slot name="cta-before" />

      <!--@slot Custom content that will replace default Add to cart button design.-->
      <slot name="cta">
        <RaButton
          class="ra-add-to-cart__button"
          v-bind="{
            size: 'sm',
            disabled,
            fullWidth: true,
            ...inherited.attrs,
            ...inherited.listeners,
            ...buttonProps,
          }"
          v-on="$listeners"
        >
          {{ buttonLabel }}
        </RaButton>
      </slot>

      <!--@slot Custom content to render after the add to cart CTA.-->
      <slot name="cta-after" />
    </div>

    <!--@slot Custom content to render at the end of the add to cart component.-->
    <slot name="after" />
  </div>
</template>
<script>
import { useInherited } from '@bva/ui-vue/src/composables';
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaQuantitySelector from '../../atoms/RaQuantitySelector/RaQuantitySelector.vue';

export default {
  name: 'RaAddToCart',
  components: {
    RaButton,
    RaQuantitySelector,
  },
  inheritAttrs: false,
  model: {
    prop: 'qty',
    event: 'input',
  },
  props: {
    /**
     * Disables both the quantity selector and the ATC button.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Selected quantity
     */
    qty: {
      type: [Number, String],
      default: 1,
    },
    /**
     * Additional properties to pass to the quantity selector component directly.
     * These can be used to alter the look and feel of that component.
     * Refer to the RaQuantitySelector docs to learn more.
     */
    qtyProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Events to pass to the RaQuantitySelector component.
     */
    qtyEvents: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Controls visibility of the qty component.
     */
    qtyVisible: {
      type: Boolean,
      deafult: true,
    },
    /**
     * Additional properties to pass to the button component directly.
     * These can be used to alter the look and feel of that component.
     * Refer to the RaButton docs to learn more.
     */
    buttonProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Set a custom label on the ATC Button element.
     */
    buttonLabel: {
      type: String,
      default: 'Add to Cart',
    },
  },
  setup(props) {
    return {
      inherited: useInherited(),
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaAddToCart.css';
</style>
