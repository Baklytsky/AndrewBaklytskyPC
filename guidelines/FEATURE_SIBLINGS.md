# Siblings Feature - Protected Files and Markup

This document lists all files and specific markup that **MUST NOT** be changed to ensure the "siblings" feature continues to work correctly after theme customizations.

## Overview

The siblings feature allows customers to switch between related products (typically different colors of the same product) directly from product cards and product pages. It uses metaobjects to group sibling products together and provides interactive swatches/images for navigation.

---

## 🔴 CRITICAL FILES - DO NOT MODIFY

### Core Snippet Files

#### 1. `src/snippets/product-card-siblings.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Renders sibling swatches on product cards
- **Critical Elements:**
  - Custom element `<product-card-siblings>` (line 25)
  - Data attributes: `data-sibling-fieldset`, `data-sibling-inner`, `data-sibling-link`, `data-sibling-price`, `data-sibling-cutline`, `data-sibling-image`
  - Class names: `product-card__siblings`, `sibling__link`, `sibling__link--current`, `sibling__link--sold-out`
  - Part system: `part: 'html'`, `part: 'line-item-props'`, `part: 'image'`

#### 2. `src/snippets/product-siblings.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Renders sibling swatches on product detail pages
- **Critical Elements:**
  - Data attribute: `data-swap-url` on sibling links (line 166)
  - Class names: `product__siblings`, `sibling__link`, `sibling__link--current`, `sibling__link--sold-out`
  - Hidden input with `name="properties[{{ 'general.siblings.label' | t }}]"` (line 47)
  - Form ID reference: `form="{{ product_form_id }}"` (line 46)

#### 3. `src/snippets/product-card-siblings-and-swatches.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Conditional rendering logic for siblings vs swatches
- **Critical Elements:**
  - Render call: `render 'product-card-siblings', part: 'html'` (line 160)
  - Part system: `part: 'html'`, `part: 'check-siblings'`, `part: 'check-swatches'`

### Core JavaScript Files

#### 4. `src/js/globals/product-card-siblings.js`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** JavaScript functionality for sibling interactions on product cards
- **Critical Elements:**
  - Custom element definition: `product-card-siblings` (line 141-199)
  - `SiblingSwatches` class (line 1-139)
  - Selectors: `[data-sibling-inner]`, `[data-sibling-link]`, `[data-product-image-sibling]`, `[data-product-price]`, `[data-product-cutline]`, `[data-product-image-default]`
  - Event handlers: `mouseenter`, `mouseleave`, `focusin`, `focusout`
  - Class manipulation: `.sibling__link--current`, `.is-visible`, `.is-fade`

#### 5. `src/js/components/product-info.js`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Handles sibling product swapping on product detail pages
- **Critical Elements:**
  - `siblingLinks` selector: `[data-swap-url]` (line 25)
  - `siblingChange()` method (line 66-86)
  - Product swap logic using `data-swap-url` attribute

### Core CSS Files

#### 6. `src/css/modules/siblings.scss`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Styles for sibling swatches and interactions
- **Critical Elements:**
  - `.product-card__bg__sibling` class and `is-visible` state
  - `.sibling__link`, `.sibling__link--current`, `.sibling__link--sold-out` classes
  - Image fade animations: `.is-fade` class
  - Swatch style classes: `.swatch__button--circle`, `.swatch__button--square`

---

## 🟡 INTEGRATION POINTS - MODIFY WITH CAUTION

### Product Card Integration

#### 7. `src/snippets/product-card-content.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 29:** Must preserve the render call:
  ```liquid
  {% render 'product-card-siblings-and-swatches',
    product: product,
    part: 'html',
    index: index,
    block_index: block_index
  %}
  ```

#### 8. `src/snippets/product-card-media.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 96-101:** Must preserve sibling image and line item props:
  ```liquid
  {%- if settings.show_siblings -%}
    {%- capture siblings_line_item_props -%}
      {%- render 'product-card-siblings', part: 'line-item-props', product: product -%}
    {%- endcapture -%}
    {%- capture siblings_image -%}
      {%- render 'product-card-siblings', part: 'image', product: product -%}
    {%- endcapture -%}
  {%- endif -%}
  ```
- **Line 202:** Must preserve the sibling image container:
  ```liquid
  <div class="product-card__bg__sibling" data-product-image-sibling></div>
  ```
- **Lines 395-398:** Must preserve product link and default image:
  ```liquid
  data-product-link="{{ product_url }}"
  <div class="product-card__bg" data-product-image-default>
  ```

#### 9. `src/snippets/product-card-cutline.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 11:** Must preserve the check for siblings:
  ```liquid
  {%- render 'product-card-siblings-and-swatches', product: product, part: 'check-siblings' -%}
  ```
- **Line 50:** Must preserve the cutline data attribute:
  ```liquid
  data-product-cutline
  ```

#### 10. `src/blocks/_product-card-price.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 10:** Must preserve the price data attribute:
  ```liquid
  <div class="product-card__price" data-product-price>
  ```

#### 11. `src/snippets/product-card-title.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 18:** Must preserve the product link data attribute:
  ```liquid
  data-product-link="{{ product_url }}"
  ```

### Product Page Integration

#### 12. `src/snippets/product.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 517-525:** Must preserve the siblings block render:
  ```liquid
  {%- when 'siblings' -%}
    {%- render 'product-siblings',
      product: product,
      product_form_id: product_form_id,
      current_variant: current_variant,
      block: block,
      block_style: block_style,
      quick_add_product: false
    -%}
  ```
- **Line 91:** Must preserve sibling color metafield assignment (used for line item properties)

#### 13. `src/snippets/product-modal.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Line 136:** Must preserve the siblings render in modal:
  ```liquid
  {%- render 'product-siblings', product: product, product_form_id: product_form_id, metafields: true, product_api: true, animation_name: animation_name, animation_delay: animation_delay -%}
  ```

### Configuration Files

#### 14. `src/config/settings_schema.json`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 1389-1419:** Must preserve the "Siblings" settings section:
  - `theme_siblings` setting ID (line 1398)
  - `show_siblings` setting ID (line 1406)
  - `sibling_style` setting ID (line 1411)

#### 15. `src/locales/*.json`
**Status:** 🟡 **MODIFY WITH CAUTION**
- Must preserve the translation key: `general.siblings.label`
- Used in: `en.default.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `pt.json`

---

## 🔵 CRITICAL DATA ATTRIBUTES

These data attributes are used by JavaScript and **MUST NOT** be changed or removed:

### Product Card Data Attributes

- `data-sibling-fieldset` - Container for sibling swatches
- `data-sibling-inner` - Inner scrollable container for siblings
- `data-sibling-link` - Individual sibling product URL
- `data-sibling-price` - Sibling product price HTML
- `data-sibling-cutline` - Sibling product cutline text
- `data-sibling-image` - Sibling product image URL
- `data-sibling-count` - Display count of siblings
- `data-product-image-sibling` - Container for sibling product image overlay
- `data-product-image-default` - Default product image container
- `data-product-price` - Product price container (updated on hover)
- `data-product-cutline` - Product cutline container (updated on hover)
- `data-product-link` - Product link element

### Product Page Data Attributes

- `data-swap-url` - URL for swapping to sibling product (used in `product-info.js`)

---

## 🟢 CRITICAL CSS CLASSES

These CSS classes are used by JavaScript and styles, and **MUST NOT** be changed:

### Core Classes

- `.product-card__siblings` - Main container for sibling swatches
- `.sibling__link` - Individual sibling swatch/link
- `.sibling__link--current` - Currently selected sibling
- `.sibling__link--sold-out` - Sold out sibling indicator
- `.product-card__bg__sibling` - Sibling image overlay container
- `.product__siblings` - Siblings container on product pages
- `.is-visible` - Shows sibling fieldset (used by JavaScript)
- `.is-fade` - Image fade animation class
- `.swatch__button--circle` - Circle swatch style
- `.swatch__button--square` - Square swatch style

---

## 🟣 CRITICAL HTML STRUCTURE

### Product Card Siblings Structure

```liquid
<product-card-siblings class="product-card__siblings ...">
  <native-scrollbar class="radio__fieldset ..." data-sibling-fieldset>
    <div class="selector-wrapper__scrollbar" data-sibling-inner data-scrollbar>
      <tooltip-component class="swatches ..."
        data-sibling-link="..."
        data-sibling-price="..."
        data-sibling-cutline="..."
        data-sibling-image="...">
        <div class="sibling__link sibling__link--current">
          <!-- swatch content -->
        </div>
      </tooltip-component>
      <!-- more siblings -->
    </div>
  </native-scrollbar>
  <span class="product-card__swatches__count">
    <span data-sibling-count>...</span>
  </span>
</product-card-siblings>
```

### Product Page Siblings Structure

```liquid
<div class="product__siblings ...">
  <input type="hidden"
    form="{{ product_form_id }}"
    name="properties[{{ 'general.siblings.label' | t }}]"
    value="{{ sibling_color }}">
  <fieldset>
    <div class="radio__fieldset radio__fieldset--swatches">
      <!-- sibling links with data-swap-url -->
    </div>
  </fieldset>
</div>
```

---

## ⚠️ IMPORTANT NOTES

1. **Metaobject Dependency:** The feature relies on Shopify metaobjects configured via `settings.theme_siblings`. This setting must exist in the theme settings.

2. **Custom Element:** `<product-card-siblings>` is a custom web component. Do not change the element name or its structure.

3. **Part System:** The `product-card-siblings.liquid` snippet uses a `part` parameter system:
   - `part: 'html'` - Main HTML output
   - `part: 'line-item-props'` - Hidden input for cart line item properties
   - `part: 'image'` - Image overlay container
   - These parts are rendered in different locations and must be preserved.

4. **JavaScript Event Listeners:** The JavaScript attaches event listeners to specific elements. Changing class names or data attributes will break functionality.

5. **Image Overlay System:** The sibling image overlay uses a complex fade-in/fade-out system. The `.is-fade` class and `data-sibling-image` attribute are critical.

6. **Form Integration:** Siblings add a hidden input to product forms with the property name from translations. This ensures the sibling color is included in cart line items.

7. **URL Swapping:** On product pages, clicking siblings uses `data-swap-url` to fetch and swap product content without a full page reload.

---

## ✅ SAFE TO MODIFY

You can safely modify:
- Visual styling (colors, sizes, spacing) in `siblings.scss` as long as you preserve class names
- Translation text values (not keys) in locale files
- Settings labels and descriptions in `settings_schema.json` (not IDs)
- Additional CSS classes for styling purposes (as long as core classes remain)

---

## 🧪 Testing Checklist

After any customization, verify:
- [ ] Sibling swatches appear on product cards
- [ ] Hovering over siblings updates product image, price, and cutline
- [ ] Clicking siblings on product pages swaps the product without page reload
- [ ] Current sibling is visually indicated
- [ ] Sold-out siblings are marked correctly
- [ ] Sibling color is added to cart line item properties
- [ ] Siblings work in product modals/quick add
- [ ] Siblings work on collection pages
- [ ] Image fade animations work smoothly

---

**Last Updated:** Generated automatically
**Feature Version:** Based on current codebase structure
