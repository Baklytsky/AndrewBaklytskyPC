# Bundles Feature - Protected Files and Markup

This document lists all files and specific markup that **MUST NOT** be changed to ensure the "bundles" feature continues to work correctly after theme customizations.

## Overview

The bundles feature consists of two main components:

1. **Bundle Collection** - A "Build Your Own Bundle" interface where customers can select a specific number of products from a collection page
2. **Product Bundles** - Products that contain multiple sub-products (configured via metafields) that are displayed together on product pages and in the cart

---

## 🔴 CRITICAL FILES - DO NOT MODIFY

### Core JavaScript Files

#### 1. `src/js/components/bundle-collection.js`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** JavaScript functionality for the "Build Your Own Bundle" collection interface
- **Critical Elements:**
  - Custom element definition: `bundle-collection` (line 1-358)
  - All data attribute selectors (lines 9-24)
  - Event handlers: `bundleButtonAdd`, `bundleButtonChange`, `addProductsToCart`, `addProductToBundleModal`, `scrollToBundle`
  - LocalStorage management: `bundleProducts-${window.location.pathname}`
  - Product data structure with `_bundle_unique_id` property
  - Animation classes: `is-adding`, `is-removing`, `is-animate-in`, `is-animate-out`, `is-filled`, `is-dot-active`, `is-line-active`

### Core Section Files

#### 2. `src/sections/bundle-collection.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Main section for bundle collection pages
- **Critical Elements:**
  - Custom element: `<bundle-collection>` (line 55)
  - Data attributes: `data-bundle`, `data-bundle-max-selection`, `data-bundle-animation-timing`, `data-bundle-id`, `data-bundle-discount-type`, `data-bundle-discount-value` (lines 59-65)
  - Template: `<template data-bundle-template>` (line 143)
  - Placeholder structure: `data-bundle-placeholder`, `data-bundle-placeholder-filled` (lines 199, 214)
  - Bundle widget blocks: `bundle_products`, `bundle_price`, `bundle_button` (lines 140, 219, 233)
  - Button: `data-bundle-add-to-cart` (line 247)
  - Sticky button: `data-bundle-scroll-button` (line 278)
  - Selected count: `data-bundle-selected-count` (line 280)
  - Total price: `data-bundle-total` (line 230)

### Core CSS Files

#### 3. `src/css/components/bundle-collection.scss`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Styles for bundle collection interface
- **Critical Elements:**
  - Custom element: `bundle-collection` (line 4)
  - Animation classes: `.is-adding`, `.is-removing`, `.is-animate-in`, `.is-animate-out`, `.is-filled`, `.is-dot-active`, `.is-line-active`
  - Placeholder structure: `.bundle-placeholder`, `.bundle-placeholder__filled`, `.bundle-placeholder__empty`
  - CSS custom properties: `--animation-timing`, `--animation-duration`, `--animation-delay`

### Product Bundle Integration Files

#### 4. `src/snippets/product-variant-picker.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Renders bundle product options and variant picker for product bundles
- **Critical Elements:**
  - Bundle detection: `is_bundle` variable (line 12)
  - Bundle products loop: `product.metafields.theme_modules.bundle_products.value` (line 38)
  - Bundle separator: `bundle_separator_open` and `bundle_separator_close` (lines 14-15)
  - Option name formatting: `Product Name (Option Name)` pattern (lines 277-279, 331-332)
  - Bundle product cards: `.card-bundle` structure (lines 60-84)
  - Bundle label: `'products.general.bundle_products' | t` (line 523)

#### 5. `src/snippets/cart-line-items.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Renders bundle items in cart with grouping and discount calculation
- **Critical Elements:**
  - Bundle unique ID: `line_item.properties._bundle_unique_id` (line 40)
  - Bundle grouping logic (lines 49-56, 523-528)
  - Bundle cart item: `data-bundle-cart-item="{{ bundle_id }}"` (line 528)
  - Bundle remove: `data-bundle-cart-remove` (line 599)
  - Bundle sub-items: `cart__item__sub` structure (lines 91-410)
  - Bundle price calculation (lines 58-70, 207-218)
  - Bundle discount calculation (lines 63-69)

---

## 🟡 INTEGRATION POINTS - MODIFY WITH CAUTION

### Product Card Integration

#### 6. `src/snippets/product-card-media.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 10-11:** Must preserve bundle variables:
  ```liquid
  assign bundle_product = bundle_product | default: false
  assign bundle_template = bundle_template | default: false
  ```
- **Lines 232-273:** Must preserve bundle JSON and button structure:
  ```liquid
  {%- if bundle_product or bundle_template -%}
    <script type="application/json" data-bundle-json>
      {
        "product": {{ product | json }},
        "variant": {{ product.selected_or_first_available_variant | json }}
      }
    </script>
    <button data-bundle-product-button="{{ product.id }}"
            data-bundle-product-url="{{ product.url }}">
  ```
- **Lines 276-280:** Must preserve bundle template:
  ```liquid
  {%- if bundle_template -%}
    <template data-bundle-item-template>
      {{ bundle_code }}
    </template>
  {%- endif -%}
  ```
- **Line 305:** Must preserve bundle item replace:
  ```liquid
  <quick-add-product data-bundle-item-replace>
  ```

#### 7. `src/snippets/product-card.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 55-56:** Must preserve bundle variables:
  ```liquid
  assign bundle_product = bundle_product | default: false
  assign bundle_template = bundle_template | default: false
  ```
- **Lines 83-84:** Must pass bundle variables to product-card-media:
  ```liquid
  bundle_product: bundle_product,
  bundle_template: bundle_template
  ```

### Product Page Integration

#### 8. `src/snippets/product.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 15-18:** Must preserve bundle detection:
  ```liquid
  assign is_bundle = false
  if product.metafields.theme_modules.is_bundle
    assign is_bundle = true
  endif
  ```
- **Line 394:** Must pass `is_bundle` to variant picker:
  ```liquid
  is_bundle: is_bundle,
  ```

#### 9. `src/snippets/product-buttons.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 24:** Must preserve bundle variable:
  ```liquid
  assign is_bundle = is_bundle | default: false
  ```
- **Lines 337-339:** Must preserve bundle modal button attribute:
  ```liquid
  {% if is_bundle %}
    data-bundle-modal-button="{{ 'products.general.add_bundle' | t }}"
  {% endif %}
  ```
- **Lines 408-415:** Must preserve bundle JSON:
  ```liquid
  {%- if is_bundle -%}
    <script type="application/json" data-bundle-json>
      {
        "product": {{ product | json }},
        "variant": {{ current_variant | json }}
      }
    </script>
  {%- endif -%}
  ```

#### 10. `src/snippets/product-modal.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 9:** Must preserve bundle variable:
  ```liquid
  assign is_bundle = is_bundle | default: false
  ```
- **Line 109:** Must pass `is_bundle` to variant picker:
  ```liquid
  is_bundle: is_bundle,
  ```

### Section Files

#### 11. `src/sections/section-product-bundle-form.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 6:** Must preserve featured product bundle flag:
  ```liquid
  is_featured_product_bundle: true
  ```

#### 12. `src/sections/api-product-bundle.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 1:** Must preserve bundle modal render:
  ```liquid
  {%- render 'product-modal', is_bundle: true -%}
  ```

### Template Files

#### 13. `src/templates/collection.bundle-collection.json`
**Status:** 🟡 **MODIFY WITH CAUTION**
- Must preserve the `bundle_products` block type in schema

### JavaScript Integration

#### 14. `src/js/globals/product-form.js`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 21-26:** Must preserve bundle modal button detection:
  ```javascript
  const isBundle = this.submitButton.hasAttribute('data-bundle-modal-button');
  const productJSONhtml = this.querySelector('[data-bundle-json]')?.innerHTML;
  const bundleButton = document.querySelector(`[data-bundle-product-button="${productJSON.product.id}"]`);
  ```

#### 15. `src/js/globals/cart.js`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 314-323:** Must preserve bundle cart removal logic:
  ```javascript
  const cartBundleRemove = document.querySelectorAll('[data-bundle-cart-remove]');
  // Bundle removal logic
  ```
- **Line 763:** Must preserve bundle quantity input exclusion:
  ```javascript
  const inputs = this.cart.querySelectorAll('input:not([data-bundle-cart-quantity]');
  ```

#### 16. `src/js/components/quick-add-product.js`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 190, 303:** Must preserve bundle button exclusion:
  ```javascript
  if (this.modalButton && !this.modalButton.hasAttribute('data-bundle-product-button'))
  ```
- **Line 313:** Must preserve bundle API URL selection:
  ```javascript
  const apiUrl = this.modalButton.hasAttribute('data-bundle-product-button') ? 'api-product-bundle' : 'api-product-upsell';
  ```

---

## 🔵 CRITICAL DATA ATTRIBUTES

These data attributes are used by JavaScript and **MUST NOT** be changed or removed:

### Bundle Collection Data Attributes

- `data-bundle` - Indicates if bundle collection is enabled (value: "true")
- `data-bundle-max-selection` - Maximum number of products that can be selected
- `data-bundle-animation-timing` - Animation timing in milliseconds
- `data-bundle-id` - Collection ID for bundle grouping
- `data-bundle-discount-type` - Discount type ("percent" or "fixed")
- `data-bundle-discount-value` - Discount value
- `data-bundle-product-button` - Product button identifier (value: product ID)
- `data-bundle-product-url` - Product URL for bundle items
- `data-bundle-json` - JSON data container for product/variant information
- `data-bundle-template` - Template element for bundle placeholder items
- `data-bundle-placeholder` - Individual placeholder container (value: index)
- `data-bundle-placeholder-filled` - Container for filled placeholder content
- `data-bundle-selected-count` - Display element for selected product count
- `data-bundle-total` - Display element for bundle total price
- `data-bundle-total-savings` - Display element for bundle savings amount
- `data-bundle-add-to-cart` - Add to cart button for bundle
- `data-bundle-scroll-button` - Scroll to bundle button
- `data-bundle-remove-button` - Remove product from bundle button
- `data-bundle-item-template` - Template for bundle items in product cards
- `data-bundle-item-replace` - Target for replacing bundle items

### Product Bundle Data Attributes

- `data-bundle-modal-button` - Button text for bundle modal (value: translation key)
- `data-bundle-cart-item` - Cart item container for bundle (value: bundle ID)
- `data-bundle-cart-remove` - Remove entire bundle from cart (value: line item keys)

### Placeholder Template Data Attributes

- `data-placeholder-vendor` - Vendor name display
- `data-placeholder-title` - Product title display
- `data-placeholder-price` - Product price display
- `data-placeholder-price-compare` - Compare at price display
- `data-placeholder-options` - Variant options display
- `data-placeholder-url` - Product URL link
- `data-placeholder-image` - Product image container (value: width in pixels)

---

## 🟢 CRITICAL CSS CLASSES

These CSS classes are used by JavaScript and styles, and **MUST NOT** be changed:

### Bundle Collection Classes

- `bundle-collection` - Custom element class
- `.bundle` - Main bundle container
- `.bundle__container` - Flex container for bundle layout
- `.bundle__content` - Main content area
- `.bundle__aside` - Sidebar area
- `.bundle__widget` - Widget container
- `.bundle__widget--background` - Widget with background
- `.bundle-placeholder` - Individual placeholder container
- `.bundle-placeholder__inner` - Inner placeholder container
- `.bundle-placeholder__empty` - Empty state container
- `.bundle-placeholder__filled` - Filled state container
- `.bundle-placeholder__dot` - Dot indicator
- `.bundle-placeholder__line` - Connecting line
- `.bundle-placeholder__text` - Placeholder text
- `.product-inline` - Inline product display
- `.product-inline__image` - Product image container
- `.product-inline__content` - Product content container
- `.product-inline__info` - Product info container
- `.product-inline__actions` - Product actions container
- `.product-inline__remove` - Remove button
- `.bundle__price` - Price container
- `.bundle__price__row` - Price row
- `.bundle__price__row--subtotal` - Subtotal row
- `.bundle__button` - Add to cart button
- `.bundle__button-add` - Button add text
- `.bundle__button-default` - Button default text
- `.bundle__sticky` - Sticky button container
- `.bundle__error` - Error message container

### Animation State Classes

- `.is-adding` - Adding product animation state
- `.is-removing` - Removing product animation state
- `.is-animate-in` - Fade in animation
- `.is-animate-out` - Fade out animation
- `.is-filled` - Placeholder is filled
- `.is-dot-active` - Dot is active
- `.is-line-active` - Line is active
- `.is-visible` - Error is visible
- `.is-loading` - Button is loading
- `.is-removed` - Bundle item is removed (cart)

### Product Bundle Classes

- `.card-bundle` - Bundle product card container
- `.card-bundle__image` - Bundle product image
- `.card-bundle__content` - Bundle product content
- `.card-bundle__title` - Bundle product title
- `.card-bundle__link` - Bundle product link
- `.card-bundle__price` - Bundle product price
- `.cart__item__sub` - Bundle sub-item in cart
- `.cart__item__sub__image` - Bundle sub-item image
- `.cart__item__sub__options` - Bundle sub-item options

---

## 🟣 CRITICAL HTML STRUCTURE

### Bundle Collection Structure

```liquid
<bundle-collection
  class="bundle"
  data-bundle="true"
  data-bundle-max-selection="3"
  data-bundle-animation-timing="1000"
  data-bundle-id="{{ collection.id }}"
  data-bundle-discount-type="percent"
  data-bundle-discount-value="25">

  <!-- Product Grid -->
  <div class="bundle__products">
    <!-- Products with data-bundle-product-button -->
  </div>

  <!-- Bundle Widget -->
  <div class="bundle__widget">
    <!-- Template for placeholder items -->
    <template data-bundle-template>
      <div class="product-inline">
        <!-- Placeholder content with data-placeholder-* attributes -->
      </div>
    </template>

    <!-- Placeholders -->
    <div class="bundle__placeholders">
      {% for i in (1..max_selection) %}
        <div data-bundle-placeholder="{{ forloop.index0 }}" class="bundle-placeholder">
          <div class="bundle-placeholder__empty">...</div>
          <div data-bundle-placeholder-filled class="bundle-placeholder__filled"></div>
        </div>
      {% endfor %}
    </div>

    <!-- Price -->
    <div class="bundle__price">
      <span data-bundle-total>{{ 0 | money }}</span>
    </div>

    <!-- Button -->
    <button data-bundle-add-to-cart disabled>Add to cart</button>
  </div>

  <!-- Sticky Button -->
  <button data-bundle-scroll-button>
    (<span data-bundle-selected-count>0</span>/3)
  </button>
</bundle-collection>
```

### Product Bundle Structure (Product Page)

```liquid
{% if is_bundle %}
  <!-- Bundle products loop -->
  {% for item in product.metafields.theme_modules.bundle_products.value %}
    <div class="card-bundle">
      <!-- Bundle product display -->
    </div>
  {% endfor %}

  <!-- Variant picker with bundle option names -->
  <!-- Format: "Product Name (Option Name)" -->

  <!-- Bundle JSON -->
  <script type="application/json" data-bundle-json>
    {
      "product": {{ product | json }},
      "variant": {{ current_variant | json }}
    }
  </script>
{% endif %}
```

### Bundle Cart Structure

```liquid
<!-- Bundle container -->
<div class="cart__item" data-bundle-cart-item="{{ bundle_id }}">
  <!-- Bundle header with collection info -->

  <!-- Bundle sub-items -->
  {% for line_item in bundle_items %}
    <div class="cart__item__sub">
      <!-- Sub-item content -->
    </div>
  {% endfor %}

  <!-- Bundle footer with total and remove -->
  <button data-bundle-cart-remove="{{ bundle_keys }}">Remove</button>
</div>
```

---

## ⚠️ IMPORTANT NOTES

1. **Metafield Dependencies:**
   - Bundle Collection: Uses `collection.metafields.carbon.max_selection`, `collection.metafields.carbon.discount_type`, `collection.metafields.carbon.discount_value`
   - Product Bundles: Uses `product.metafields.theme_modules.is_bundle` and `product.metafields.theme_modules.bundle_products.value`

2. **Custom Element:** `<bundle-collection>` is a custom web component. Do not change the element name or its structure.

3. **LocalStorage:** Bundle collection uses localStorage with key pattern: `bundleProducts-${window.location.pathname}`. This persists selected products across page loads.

4. **Bundle Unique ID:** Products added to cart from bundle collections include `_bundle_unique_id` property in format: `${bundleId}_${sequenceNumber}`. This is critical for cart grouping.

5. **Option Name Format:** Product bundles use a special format for option names: `"Product Name (Option Name)"`. The variant picker parses this format to group options by product.

6. **Bundle Separators:** Uses `bundle_separator_open = '('` and `bundle_separator_close = ')'` to format option names. These must match the parsing logic.

7. **Animation Timing:** Bundle collection uses CSS custom properties for animation timing. The `--animation-timing` variable controls all animations.

8. **Cart Grouping:** Bundle items in cart are grouped using `_bundle_unique_id` property. The bundle ID (collection ID) is extracted from the first part before the underscore.

9. **Discount Calculation:** Bundle discounts are calculated client-side and applied via cart discount codes. The discount type and value come from collection metafields.

10. **Template System:** Bundle collection uses a `<template>` element to clone placeholder content. The template must contain all `data-placeholder-*` attributes.

---

## ✅ SAFE TO MODIFY

You can safely modify:
- Visual styling (colors, sizes, spacing) in `bundle-collection.scss` as long as you preserve class names
- Translation text values (not keys) in locale files
- Settings labels and descriptions in section schemas (not IDs)
- Additional CSS classes for styling purposes (as long as core classes remain)
- Layout adjustments that don't affect data attributes or JavaScript selectors

---

## 🧪 Testing Checklist

After any customization, verify:

### Bundle Collection
- [ ] Products can be selected up to max selection limit
- [ ] Selected products appear in placeholders
- [ ] Products can be removed from bundle
- [ ] Bundle total price calculates correctly
- [ ] Discount/savings display correctly (if configured)
- [ ] Add to cart button enables when max selection reached
- [ ] Sticky button shows correct count
- [ ] Selected products persist in localStorage
- [ ] Bundle items are grouped correctly in cart
- [ ] Bundle can be removed from cart as a group

### Product Bundles
- [ ] Bundle products display on product page
- [ ] Variant picker shows bundle products correctly
- [ ] Option names formatted as "Product Name (Option Name)"
- [ ] Bundle products can be added to cart
- [ ] Bundle sub-items display correctly in cart
- [ ] Bundle products maintain correct variant selections

---

**Last Updated:** Generated automatically
**Feature Version:** Based on current codebase structure

