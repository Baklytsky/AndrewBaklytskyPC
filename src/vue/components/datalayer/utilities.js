// eslint-disable-next-line no-unused-vars
export function itemList(product = {}, variant = {}, collection = {}) {
  const splitPath = window.location.pathname.split("/").slice(1);
  const pageType = splitPath[0];
  let item_list_id, item_list_name;
  if (pageType === "products") {
    item_list_id = product?.id;
    item_list_name = "product";
  } else if (pageType === "collections") {
    item_list_id = `${product?.id}_${collection?.id}`;
    item_list_name = "product_collection";
  } else if (pageType === "cart") {
    item_list_id = "cart1";
    item_list_name = "cart_quickshop";
  } else {
    item_list_id = pageType;
    item_list_name = "";
  }

  return {
    item_list_id: item_list_id,
    item_list_name: item_list_name,
  };
}

export function featuredVariantImage(product, variant) {
  const featuredImage = variant?.images?.default || product?.featured_image;
  let featuredImagePath;
  if (featuredImage) {
    let featuredImageSrc =
      typeof featuredImage == "string"
        ? featuredImage
        : featuredImage.sizes.original ||
          Object.keys(featuredImage.sizes)[0] ||
          null;
    if (featuredImageSrc.includes("/products")) {
      // we get the index of /products so we can make sure we are getting the product image
      // and add 1 to that index to account for the / that we don't need
      const srcIndex = featuredImageSrc.indexOf("/products");
      featuredImagePath = featuredImageSrc.substring(srcIndex + 1);
      if (featuredImagePath.includes("?")) {
        featuredImagePath = featuredImagePath.split("?").shift();
      }
    }
  }
  return featuredImagePath;
}
