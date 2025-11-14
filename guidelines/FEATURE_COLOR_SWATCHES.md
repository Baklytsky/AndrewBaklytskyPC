# Color Swatches Feature - Protected Files and Markup

This document lists all files and specific markup that **MUST NOT** be changed to ensure the "color swatches" feature continues to work correctly after theme customizations.

## Overview

The color swatches feature allows customers to select product variants (typically colors) using visual swatches instead of dropdown menus or text buttons. Swatches can be displayed on product cards, product pages, and in filters. The feature supports both native Shopify swatches (configured via category metafields) and theme-defined swatches (via metaobjects and CSS variables).

---

## 🔴 CRITICAL FILES - DO NOT MODIFY

### Core JavaScript Files

#### 1. `src/js/components/swatch.js`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** JavaScript functionality for swatch interactions on product cards
- **Critical Elements:**
  - Custom element definition: `grid-swatch` (line 1-127)
  - Data attribute selectors: `data-swatch-handle`, `data-swatch-label`, `data-swatch-values`, `data-swatch-button`, `data-swatch-variant`, `data-swatch-variant-name`, `data-swatch-image`, `data-swatch-count`, `data-grid-swatch-fieldset`
  - Event handlers: `mouseenter`, `mouseleave` for variant image switching
  - Class manipulation: `.is-visible` for showing/hiding swatches
  - Product fetching and variant image display logic

### Core Snippet Files

#### 2. `src/snippets/swatch-input.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Renders individual swatch input elements for product variant selection
- **Critical Elements:**
  - Swatch value detection logic (lines 32-47)
  - Swatch style generation (lines 49-56)
  - CSS class structure: `swatch__button`, `swatch__button--{{ settings.swatch_style }}`, `swatch-{{ value | handle }}`, `swatch__button--sale`
  - CSS custom property: `--swatch` (line 52, 54)
  - Input structure with `form` attribute (line 82)
  - Tooltip component wrapper (line 64)

#### 3. `src/snippets/swatch-color-list.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Generates CSS custom properties for swatch colors from settings and metaobjects
- **Critical Elements:**
  - CSS variable generation: `--{{ swatch_class }}: {{ swatch_style }};` (line 23)
  - Metaobject integration: `metaobjects[settings.theme_color].values` (line 28)
  - Image URL handling for swatch images (lines 12-20)
  - CSS output: `.swatches { {{ swatches }} }` (lines 57-60)

#### 4. `src/snippets/product-card-siblings-and-swatches.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Conditional rendering logic for swatches vs siblings on product cards
- **Critical Elements:**
  - Swatch detection: `settings.enable_swatches and settings.show_grid_swatches` (line 19)
  - Translation key: `'general.swatches.color' | t` (line 22)
  - Custom element: `<grid-swatch>` (line 60)
  - Data attributes: `data-swatch-handle`, `data-swatch-label`, `data-swatch-values` (lines 63-65)
  - Swatch button structure with `data-swatch-button` (line 99)
  - Part system: `part: 'html'`, `part: 'check-swatches'` (lines 178, 204)
  - Swatch count: `data-swatch-count` (lines 190, 197)

#### 5. `src/snippets/product-variant-options.liquid`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Renders variant option inputs (swatches, buttons, or dropdowns)
- **Critical Elements:**
  - Swatch input render: `render 'swatch-input'` (line 74)
  - Parameters passed: `is_theme_swatch_option`, `is_native_swatch_option`, `is_bundle` (lines 79-80, 86)
  - Input ID format: `{{ section.id }}-{{ option.position }}-{{ forloop.index0 }}-{{ product.id }}` (line 50)
  - Input name format: `{{ option.name }}-{{ option.position }}` (line 54)

### Core CSS Files

#### 6. `src/css/modules/product-variants.scss`
**Status:** ⚠️ **CRITICAL - DO NOT MODIFY**
- **Purpose:** Styles for swatch buttons and variant pickers
- **Critical Elements:**
  - `.swatch__button` class and all its variants
  - `.swatch__button--circle` and `.swatch__button--square` style classes
  - `.swatch__button--sale` for sale indicators
  - `.radio__fieldset--swatches` for swatch container
  - `.radio__fieldset--swatches.is-visible` for visibility state
  - CSS custom property: `--swatch` usage throughout
  - Animation classes: `fadeIn` animation with `--animation-delay`
  - State classes: `.swatch__button input:checked`, `.swatch__button input:disabled`, `.swatch__button input.sold-out`

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
- **Line 414:** Must preserve variant image data attributes for swatch hover:
  ```liquid
  {%- if settings.enable_swatches and current_variant -%}
    data-variant-title="{{ variant.title }}"
  {%- endif -%}
  ```

### Product Page Integration

#### 9. `src/snippets/product-variant-picker.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 88-120:** Must preserve swatch detection and meta_swatches building:
  ```liquid
  {%- if settings.enable_swatches -%}
    {%- for value in option.values -%}
      {%- if value.swatch -%}
        <!-- Swatch value extraction -->
      {%- endif -%}
    {%- endfor -%}
  {%- endif -%}
  ```
- **Lines 324-348:** Must preserve swatch option detection logic:
  ```liquid
  assign is_native_swatch_option = false
  assign is_theme_swatch_option = false
  if settings.enable_swatches
    if value.swatch
      assign is_native_swatch_option = true
    endif
  endif
  ```
- **Line 357:** Must preserve swatch picker type assignment:
  ```liquid
  if is_native_swatch_option or is_theme_swatch_option
    assign picker_type = 'swatch'
  endif
  ```
- **Lines 384-385:** Must pass swatch flags to variant options:
  ```liquid
  is_theme_swatch_option: is_theme_swatch_option,
  is_native_swatch_option: is_native_swatch_option,
  ```

#### 10. `src/snippets/product.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- Must preserve the variant picker render that includes swatch support

### Filter Integration

#### 11. `src/snippets/filters.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 6-10:** Must preserve swatch style detection:
  ```liquid
  case settings.swatch_style
    when 'square'
      echo 'swatch__button--square'
    when 'circle'
      echo 'swatch__button--circle'
  endcase
  ```
- **Lines 165-191:** Must preserve swatch filter rendering with correct classes

### Upsell Integration

#### 12. `src/snippets/upsell-product.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 107-136:** Must preserve swatch option detection
- **Lines 352-394:** Must preserve swatch button structure with data attributes
- **Lines 411-412:** Must preserve `data-swatch` attribute on labels

### Configuration Files

#### 13. `src/config/settings_schema.json`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 1140-1188:** Must preserve the "Swatches" settings section:
  - `theme_color` setting ID (line 1148)
  - `enable_swatches` setting ID (line 1155)
  - `variant_on_sale` setting ID (line 1161)
  - `swatch_size` setting ID (line 1168)
  - `swatch_style` setting ID (line 1178)
  - `collection_swatch_style` setting ID (line 1189)
- **Line 1040:** Must preserve `show_grid_swatches` setting ID

#### 14. `src/snippets/head.liquid`
**Status:** 🟡 **MODIFY WITH CAUTION**
- **Lines 147-155:** Must preserve swatch size calculations:
  ```liquid
  case settings.swatch_size
    when 'regular'
      assign swatch_size_filters = '1.15'
      assign swatch_size_product = '2.2'
      assign swatch_size_upsell = '1'
    when 'large'
      assign swatch_size_filters = '1.5'
      assign swatch_size_product = '3.0'
      assign swatch_size_upsell = '1.32'
  endcase
  ```
- **Lines 754-756:** Must preserve CSS custom properties:
  ```liquid
  --swatch-size-filters: {{ swatch_size_filters }}rem;
  --swatch-size-product: {{ swatch_size_product }}rem;
  --swatch-size-upsell: {{ swatch_size_upsell }}rem;
  ```
- **Line 850:** Must preserve swatch stylesheet condition:
  ```liquid
  {%- if settings.show_siblings or settings.enable_swatches -%}
    {%- render 'swatch-color-list' -%}
  {%- endif -%}
  ```
- **Line 924:** Must preserve collection swatch style in JavaScript:
  ```liquid
  collectionSwatchStyle: {{ settings.collection_swatch_style | json }},
  ```

---

## 🔵 CRITICAL DATA ATTRIBUTES

These data attributes are used by JavaScript and **MUST NOT** be changed or removed:

### Product Card Swatches

- `data-swatch-handle` - Product handle for fetching product data (value: product.handle)
- `data-swatch-label` - Option label/name for swatch detection (value: option name)
- `data-swatch-values` - Serialized swatch values (value: "Value: swatch_value, ...")
- `data-swatch-button` - Individual swatch button identifier
- `data-swatch-variant` - Variant ID for the swatch (value: variant.id)
- `data-swatch-variant-name` - Variant title for image matching (value: variant.title)
- `data-swatch-image` - Variant image URL (value: variant.featured_media.preview_image.src)
- `data-swatch-count` - Display element for swatch count
- `data-grid-swatch-fieldset` - Container for swatch fieldset
- `data-variant` - Variant ID (alternative to data-swatch-variant)
- `data-swatch` - Swatch value on label (used in filters and upsells)

### Product Page Swatches

- `data-variant-buttons` - Container for variant option buttons/swatches
- `data-product-url` - Product URL for variant (on input)
- `data-option-value-id` - Option value ID (on input)

---

## 🟢 CRITICAL CSS CLASSES

These CSS classes are used by JavaScript and styles, and **MUST NOT** be changed:

### Core Swatch Classes

- `.swatches` - Base class for all swatch containers (generates CSS variables)
- `.swatch__button` - Individual swatch button container
- `.swatch__button--circle` - Circle swatch style
- `.swatch__button--square` - Square swatch style
- `.swatch__button--sale` - Sale indicator on swatch
- `.swatch__button--empty` - Empty swatch state
- `.swatch-input__input` - Swatch input element
- `.swatch-input__label` - Swatch label element
- `.swatch__link` - Swatch link (on product cards)

### Container Classes

- `.product-card__swatches__holder` - Main swatch container on product cards
- `.product-card__swatches__holder--circle` - Circle style modifier
- `.product-card__swatches__holder--square` - Square style modifier
- `.product-card__swatches__holder--{{ collection_swatch_style }}` - Collection style modifier
- `.product-card__swatches__count` - Swatch count display container
- `.radio__fieldset--swatches` - Swatch fieldset container
- `.radio__fieldset--pgi` - Product grid item fieldset
- `.radio__buttons--swatches` - Swatch buttons container

### State Classes

- `.is-visible` - Shows swatch fieldset (used by JavaScript)
- `.swatch-{{ value | handle }}` - Individual swatch color class (e.g., `.swatch-black`, `.swatch-white`)
- `.swatch-white` - White swatch special handling
- `.swatch-clear` - Clear/transparent swatch special handling

### Variant State Classes

- `.swatch__button input:checked` - Selected swatch state
- `.swatch__button input:disabled` - Disabled swatch state
- `.swatch__button input.sold-out` - Sold out swatch state
- `.swatch__button input.unavailable` - Unavailable swatch state
- `.swatch__button input.visually-disabled` - Visually disabled state

### Animation Classes

- `.fadeIn` - Fade in animation (used with `--animation-delay`)

---

## 🟣 CRITICAL HTML STRUCTURE

### Product Card Swatches Structure

```liquid
<div class="product-card__swatches__holder product-card__swatches__holder--{{ settings.swatch_style }} product-card__swatches__holder--{{ settings.collection_swatch_style }}">
  <native-scrollbar class="radio__fieldset radio__fieldset--swatches radio__fieldset--pgi" data-grid-swatch-fieldset>
    <grid-swatch
      class="selector-wrapper__scrollbar"
      data-scrollbar
      data-swatch-handle="{{ product.handle }}"
      data-swatch-label="{{ label }}"
      data-swatch-values="{{ swatch_values | escape }}">

      <tooltip-component
        class="swatches swatch__button swatch__button--{{ settings.swatch_style }} swatch-{{ option_value.name | handleize }}"
        data-swatch-button
        data-tooltip="{{ option_value }}"
        data-swatch-variant="{{ option_value.variant.id }}"
        data-swatch-variant-name="{{ option_value.variant.title }}"
        data-swatch-image="{{ option_value.variant.featured_media.preview_image.src }}"
        style="--swatch: {{ swatch }}; --animation-delay: {{ delay }}s;">
        <a class="swatch__link" href="{{ product.url }}?variant={{ option_value.variant.id }}">
          <span class="visually-hidden">{{ option_value }}</span>
        </a>
      </tooltip-component>
      <!-- More swatches -->
    </grid-swatch>
  </native-scrollbar>

  <span class="product-card__swatches__count">
    <span data-swatch-count>{{ swatch_count }}</span>
  </span>
</div>
```

### Product Page Swatches Structure

```liquid
<div class="radio__fieldset radio__fieldset--swatches">
  <legend class="radio__legend">
    <span class="radio__legend__label">
      <span class="radio__legend__option-name">{{ option.name }}</span>
    </span>
  </legend>

  <div class="radio__buttons" data-variant-buttons>
    <tooltip-component
      class="swatch__button swatch__button--{{ settings.swatch_style }} swatch-{{ value | handle }}"
      style="--swatch: {{ swatch_value }};">
      <input
        type="radio"
        id="{{ input_id }}"
        name="{{ input_name }}"
        value="{{ value }}"
        form="{{ product_form_id }}"
        class="swatch-input__input">
      <label for="{{ input_id }}" class="swatch-input__label">
        <span class="visually-hidden">{{ value }}</span>
      </label>
    </tooltip-component>
    <!-- More swatches -->
  </div>
</div>
```

### Swatch Color CSS Variables Structure

```css
.swatches {
  --black: #000000;
  --white: #ffffff;
  --red: #ff0000;
  /* More color variables from settings.swatch_color_list */
  /* And from metaobjects[settings.theme_color].values */
}
```

---

## ⚠️ IMPORTANT NOTES

1. **Metafield Dependencies:**
   - Native swatches: Configured via Shopify category metafields (`value.swatch.image` or `value.swatch.color`)
   - Theme swatches: Configured via metaobjects (`metaobjects[settings.theme_color].values`) with `hex_code` or `image` properties

2. **Custom Element:** `<grid-swatch>` is a custom web component. Do not change the element name or its structure.

3. **CSS Custom Properties:** Swatch colors are defined as CSS custom properties (variables) in the format `--{{ color_handle }}: {{ color_value }};`. These are generated by `swatch-color-list.liquid` and applied to `.swatches` class.

4. **Swatch Value Detection:** The system checks for swatches in this order:
   - Native Shopify swatch (`value.swatch.image` or `value.swatch.color`)
   - Theme swatch (CSS variable: `var(--{{ value | handle }})`)
   - Fallback to handle-based variable

5. **Translation Key:** The color option name is detected using `'general.swatches.color' | t` translation. This can be a comma-separated list of option names.

6. **Swatch Styles:** Two styles are supported:
   - `circle` - Circular swatches
   - `square` - Square swatches
   Controlled by `settings.swatch_style`

7. **Collection Swatch Styles:** Multiple display styles for collection pages:
   - `text` - Text only with count
   - `text-slider` - Text with slider
   - `slider` - Image swatches with slider
   - `grid` - Grid layout
   - `limited` - Limited display (5 swatches max)

8. **Variant Image Switching:** On product cards, hovering over swatches changes the product image to show the selected variant's image. This uses `data-variant-title` matching.

9. **Sale Indicators:** Swatches can show a red dot indicator when `settings.variant_on_sale` is enabled and the variant is on sale.

10. **Animation:** Swatches use CSS animations with `--animation-delay` custom property for staggered fade-in effects.

11. **Swatch Size:** Swatch sizes are controlled by `settings.swatch_size`:
    - `regular` - Smaller swatches
    - `large` - Larger swatches
    Different sizes are used for filters, product pages, and upsells.

---

## ✅ SAFE TO MODIFY

You can safely modify:
- Visual styling (colors, sizes, spacing) in `product-variants.scss` as long as you preserve class names
- Translation text values (not keys) in locale files
- Settings labels and descriptions in `settings_schema.json` (not IDs)
- Additional CSS classes for styling purposes (as long as core classes remain)
- Swatch color values in `settings.swatch_color_list` (format: `color-name: color-value`)

---

## 🧪 Testing Checklist

After any customization, verify:

### Product Cards
- [ ] Swatches appear on product cards when enabled
- [ ] Hovering over swatches changes product image to variant image
- [ ] Clicking swatches navigates to correct variant URL
- [ ] Swatch count displays correctly
- [ ] Limited style shows "+X" indicator when more than 5 swatches
- [ ] Slider arrows work for text-slider and slider styles
- [ ] Swatches are hidden/shown correctly based on settings

### Product Pages
- [ ] Swatches appear in variant picker when option has swatches
- [ ] Selecting swatches updates variant selection
- [ ] Sale indicators appear on swatches for variants on sale
- [ ] Disabled/sold-out swatches are visually distinct
- [ ] Swatch styles (circle/square) apply correctly
- [ ] Swatch sizes (regular/large) apply correctly

### Filters
- [ ] Swatches appear in filter sidebar when enabled
- [ ] Filter swatches are clickable and filter products
- [ ] Swatch styles match theme settings

### Upsells
- [ ] Swatches appear in upsell products when enabled
- [ ] Upsell swatches are functional

### General
- [ ] CSS custom properties are generated correctly from settings
- [ ] Metaobject colors are included in CSS variables
- [ ] Swatch colors match configured values
- [ ] Swatch images display correctly
- [ ] Tooltips show correct variant names

---

**Last Updated:** Generated automatically
**Feature Version:** Based on current codebase structure

