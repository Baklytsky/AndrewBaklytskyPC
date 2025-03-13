import { itemList } from "./utilities.js";

export function dataAddToCart(product, variant, qty) {
  // eslint-disable-next-line no-undef
  dataLayer.push({ ecommerce: null });
  // eslint-disable-next-line no-undef
  dataLayer.push({
    event: "acn_add_to_cart",
    event_id:
      new Date().getTime() + "." + Math.random().toString(36).substring(5),
    ecommerce: {
      currency: Shopify.currency.active,
      value: variant.value.price / 100,
      items: [
        {
          item_id: variant.value.id,
          shopify_product_id: product.id,
          shopify_variant_id: variant.value.id,
          shopify_sku: variant.value.sku,
          shopify_handle: product.handle,
          shopify_compare_price: variant.value.compare_at_price,
          item_name: product.title,
          affiliation: window.shop_name,
          currency: Shopify.currency.active,
          item_brand: product.vendor,
          item_category: product.type,
          item_variant: variant.value.title,
          item_featured_image: variant.value.featured_image,
          option_one: variant.value.option1,
          option_two: variant.value.option2,
          option_three: variant.value.option3,
          price: variant.value.price / 100,
          quantity: qty.value,
          ...itemList(product),
        },
      ],
    },
  });
}
