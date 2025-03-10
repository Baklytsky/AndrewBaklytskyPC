<template>
  <div :class="['ra-product-line-item', modifierClass(layout, 'layout')]">
    <div class="ra-product-line-item__media">
      <slot name="image" v-bind="{ image, title }">
        <component
          :is="componentType"
          :link="link ? link : ''"
          raw
          tabindex="-1"
          class="ra-product-line-item__media-link"
          @click.native="handleProductClick"
        >
          <RaImage
            :src="image"
            :alt="title"
            :width="imageWidth"
            :height="imageHeight"
            :use-aspect-ratio="true"
            class="ra-product-line-item__image"
          />
        </component>
      </slot>
    </div>

    <div class="ra-product-line-item__main">
      <div class="ra-product-line-item__details">
        <slot name="details-start" />

        <slot name="title" v-bind="{ title }">
          <component
            :is="componentType"
            class="ra-product-line-item__title ra-product-line-item__details-section"
            :link="link ? link : ''"
            raw
            @click.native="handleProductClick"
            >{{ title }}</component
          >
        </slot>

        <div
          class="ra-product-line-item__attributes ra-product-line-item__details-section"
        >
          <slot name="attributes">
            <RaProperty
              v-for="(attribute, index) in attributes"
              :key="`pli-attribute-${attribute.name}-${index}`"
              :name="attribute.name"
              :value="attribute.value"
              stack
              :separator="false"
              v-bind="attributesProps"
            />
          </slot>
        </div>
        <slot name="details-end" />
      </div>

      <footer class="ra-product-line-item__footer">
        <slot v-if="!hideActions" name="actions">
          <div class="ra-product-line-item__actions">
            <slot name="actions-start" />

            <slot name="qty-selector">
              <div class="ra-product-line-item__quantity-wrapper">
                <RaQuantitySelector
                  v-bind="{
                    qty: qty,
                    ...qtyProps,
                  }"
                  class="ra-product-line-item__quantity-selector"
                  @input="(value) => $emit('input', value)"
                />
              </div>
            </slot>

            <slot name="remove" v-bind="{ handleRemove }">
              <RaIconButton
                class="ra-product-line-item__action ra-product-line-item__remove"
                v-bind="{
                  icon: 'trash',
                  size: 'sm',
                  variant: 'tertiary',
                  shape: false,
                  ...removeBtnProps,
                }"
                @click="handleRemove"
              />
            </slot>

            <slot name="actions-end" />
          </div>
        </slot>

        <slot name="price" v-bind="{ priceSpecial, priceRegular }">
          <RaPrice
            v-if="priceRegular"
            :regular="priceRegular"
            :special="priceSpecial"
            :stacked="stackPrice"
            class="ra-product-line-item__price ra-product-line-item__details-section"
          />
        </slot>
      </footer>
    </div>
  </div>
</template>

<script>
import RaPrice from '../../atoms/RaPrice/RaPrice.vue';
import RaImage from '../../atoms/RaImage/RaImage.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import RaQuantitySelector from '../../atoms/RaQuantitySelector/RaQuantitySelector.vue';
import RaLink from '../../atoms/RaLink/RaLink.vue';
import RaProperty from '../../atoms/RaProperty/RaProperty.vue';

export default {
  name: 'RaProductLineItem',
  components: {
    RaImage,
    RaIconButton,
    RaPrice,
    RaQuantitySelector,
    RaLink,
    RaProperty,
  },
  model: {
    prop: 'qty',
    event: 'input',
  },
  props: {
    /**
     * Product image
     * It should be an url of the product
     */
    image: {
      type: String,
      default: '',
    },
    /**
     * Product image width, without unit
     */
    imageWidth: {
      type: [String, Number],
      default: 1,
    },
    /**
     * Product image height, without unit
     */
    imageHeight: {
      type: [String, Number],
      default: 1.25,
    },
    /**
     * Product title
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Product regular price
     */
    priceRegular: {
      type: [Number, String],
      default: null,
    },
    /**
     * Product special price
     */
    priceSpecial: {
      type: [Number, String],
      default: null,
    },
    /**
     * Selected quantity
     */
    qty: {
      type: [Number, String],
      default: 1,
    },
    /**
     * Pass custom props directly to the `RaQuantitySelector` component.
     */
    qtyProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Link to product
     */
    link: {
      type: String,
      default: '',
    },
    /**
     * Specify the rendering layout for the product.
     * Available options: 'detailed'
     */
    layout: {
      type: String,
      default: '',
    },
    /**
     * The list of line item attributes, options, or properties to display.
     */
    attributes: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * Provide additional configurations to pass to the "attributes" component.
     * Refer to the `RaProperty` component docs to learn more.
     */
    attributesProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Provide additional configurations to pass to the "remove item" component.
     * Refer to the `RaIconButton` component docs to learn more.
     */
    removeBtnProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Hides PLI actions so this is more of a display PLI. Useful in checkout
     */
    hideActions: {
      type: Boolean,
      default: false,
    },
    /**
     * Stack the regular and special price
     */
    stackPrice: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    componentType() {
      return this.link ? 'RaLink' : 'div';
    },
  },
  methods: {
    handleRemove() {
      this.$emit('click:remove');
    },
    handleProductClick() {
      if (this.link) {
        this.$emit('click:product');
      }
    },
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-product-line-item--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaProductLineItem.css';
</style>
