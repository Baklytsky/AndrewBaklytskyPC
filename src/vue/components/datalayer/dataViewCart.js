import { itemList } from "./utilities.js";

export function dataViewCart(cart) {
  if (!cart.value.items) return false;
  const items = Array.from(cart.value.items).map((line_item) => {
    return {
      item_id: line_item.id,
      shopify_product_id: line_item.product_id,
      shopify_variant_id: line_item.variant_id,
      shopify_sku: line_item.sku,
      shopify_handle: line_item.handle,
      shopify_compare_price: "",
      item_name: line_item.product_title,
      affiliation: window.shop_name,
      currency: Shopify.currency.active,
      item_brand: line_item.vendor,
      item_category: line_item.product_type,
      item_variant: line_item.variant_title,
      item_featured_image: line_item.image,
      option_one: line_item.variant_options[0],
      option_two: line_item.variant_options[1],
      option_three: line_item.variant_options[2],
      price: line_item.price / 100,
      quantity: line_item.quantity,
      ...itemList(line_item),
    };
  });

  // eslint-disable-next-line no-undef
  dataLayer.push({ ecommerce: null });
  // eslint-disable-next-line no-undef
  dataLayer.push({
    event: "acn_view_cart",
    ecommerce: {
      currency: Shopify.currency.active,
      value: cart.value.total_price / 100,
      items: items,
    },
  });
}
