# Headlands Theme Customization Guidelines

## Overview
This document outlines what can and cannot be modified when customizing the Headlands theme to ensure theme stability, consistency, and maintainability.

## 🚫 **CRITICAL: Do NOT Modify**

### 1. CSS Variables in head.liquid

The following CSS variables defined in `src/snippets/head.liquid` are **CRITICAL** and should **NEVER** be modified as they are used throughout the entire theme:

#### Color System Variables
```css
/* Color scheme variables - DO NOT MODIFY */
--COLOR-TEXT, --COLOR-TEXT-HOVER, --COLOR-TEXT-LIGHT, --COLOR-TEXT-DARK
--COLOR-TEXT-A5, --COLOR-TEXT-A35, --COLOR-TEXT-A50, --COLOR-TEXT-A80
--COLOR-ACCENT, --COLOR-ACCENT-HOVER, --COLOR-ACCENT-FADE, --COLOR-ACCENT-LIGHT
--COLOR-BG, --COLOR-BG-RGB, --COLOR-BG-GRADIENT
--COLOR-BG-ACCENT, --COLOR-BG-ACCENT-OPPOSITE, --COLOR-BG-ACCENT-LIGHTEN
--COLOR-BORDER, --COLOR-BORDER-LIGHT, --COLOR-BORDER-DARK, --COLOR-BORDER-HAIRLINE
--COLOR-LINK, --COLOR-LINK-HOVER, --COLOR-LINK-OPPOSITE

/* Button variables - DO NOT MODIFY */
--BTN-PRIMARY-BG, --BTN-PRIMARY-TEXT, --BTN-PRIMARY-BORDER, --BTN-PRIMARY-BG-BRIGHTER
--BTN-SECONDARY-BG, --BTN-SECONDARY-TEXT, --BTN-SECONDARY-BORDER, --BTN-SECONDARY-BG-BRIGHTER

/* Badge variables - DO NOT MODIFY */
--COLOR-BADGE-BG, --COLOR-BADGE-TEXT
--COLOR-SALE-BG, --COLOR-SALE-TEXT
--COLOR-NEW-BADGE-BG, --COLOR-NEW-BADGE-TEXT
--COLOR-SOLD-BG, --COLOR-SOLD-TEXT
--COLOR-PREORDER-BG, --COLOR-PREORDER-TEXT
--COLOR-QUICK-ADD-BG, --COLOR-QUICK-ADD-TEXT
```

#### Layout & Spacing Variables
```css
/* Layout variables - DO NOT MODIFY */
--LAYOUT-OUTER, --LAYOUT-OUTER-MEDIUM, --LAYOUT-OUTER-SMALL
--LAYOUT-INNER, --LAYOUT-INNER-MEDIUM, --LAYOUT-INNER-SMALL
--LAYOUT-GAP, --LAYOUT-GAP-MEDIUM, --LAYOUT-GAP-SMALL
--GRID-OUTER, --GRID-OUTER-MEDIUM, --GRID-OUTER-SMALL
--GRID-GAP, --GRID-GAP-MEDIUM, --GRID-GAP-SMALL
--GRID-GAP-VERTICAL, --GRID-GAP-VERTICAL-MEDIUM, --GRID-GAP-VERTICAL-SMALL
--GRID-INNER, --GRID-INNER-MEDIUM, --GRID-INNER-SMALL

/* Width variables - DO NOT MODIFY */
--WIDTH-FULL-PADDED, --WIDTH-NORMAL, --WIDTH-NARROW
--WIDTH-FULL-PADDED-MOBILE, --WIDTH-NORMAL-MOBILE, --WIDTH-NARROW-MOBILE

/* Spacing variables - DO NOT MODIFY */
--SPACING-MICRO, --SPACING-TINY, --SPACING-SMALL, --SPACING-MEDIUM, --SPACING-LARGE

/* Grid columns - DO NOT MODIFY */
--COLUMNS, --COLUMNS-MEDIUM, --COLUMNS-SMALL, --COLUMNS-MOBILE
```

#### Typography Variables
```css
/* Font stacks - DO NOT MODIFY */
--FONT-STACK-HEADING, --FONT-STACK-SUBHEADING, --FONT-STACK-BODY, --FONT-STACK-BTN, --FONT-STACK-NAV
--FONT-WEIGHT-HEADING, --FONT-WEIGHT-SUBHEADING, --FONT-WEIGHT-BODY, --FONT-WEIGHT-BTN, --FONT-WEIGHT-NAV

/* Font sizes - DO NOT MODIFY */
--FONT-SIZE-BASE, --FONT-SIZE-NAV
--FONT-BODY-X-SMALL through --FONT-BODY-X-LARGE (desktop and mobile versions)
--FONT-HEADING-MINI through --FONT-HEADING-X-LARGE (desktop and mobile versions)

/* Letter spacing - DO NOT MODIFY */
--LETTER-SPACING-BODY, --LETTER-SPACING-HEADING, --LETTER-SPACING-SUBHEADING, --LETTER-SPACING-NAV

/* Text transformations - DO NOT MODIFY */
--FONT-UPPERCASE-HEADING, --FONT-UPPERCASE-SUBHEADING
```

#### Component Variables
```css
/* Button variables - DO NOT MODIFY */
--BTN-FONT-SIZE, --BTN-MEDIUM-SIZE, --BTN-LARGE-SIZE, --BTN-SMALL-SIZE
--BTN-LETTER-SPACING, --BTN-UPPERCASE, --BTN-TEXT-ARROW-OFFSET
--RADIUS, --RADIUS-SELECT

/* Icon variables - DO NOT MODIFY */
--ICON-ZOOM-IN, --ICON-ZOOM-OUT, --ICON-BAG, --ICON-ARROW-LEFT, --ICON-ARROW-RIGHT, --ICON-SELECT

/* Drawer variables - DO NOT MODIFY */
--DRAWER-WIDTH, --DRAWER-WIDTH-MOBILE
--SIDEBAR-WIDTH, --SIDEBAR-WIDTH-MEDIUM

/* Product grid variables - DO NOT MODIFY */
--PRODUCT-GRID-ASPECT-RATIO
--swatch-size-filters, --swatch-size-product, --swatch-size-upsell
```

### 2. Critical Markup Patterns

#### Standard Product Card Structure
**DO NOT MODIFY** this markup structure in `src/snippets/product-card.liquid`:
```liquid
<product-card
  class="product-card grid-item"
  id="{{ unique_id }}"
  data-grid-item
  data-url="{{ product.url }}"
  data-swap-id="true"
>
  <!-- Content here -->
</product-card>
```

#### Button Component Structure
**DO NOT MODIFY** this markup structure in `src/snippets/button.liquid`:
```liquid
<a class="btn {{ size }} {{ style }} {{ type }}" href="{{ link }}">
  <span>{{ text | escape }}</span>
  {% if show_arrow %}
    {% render 'icon-nav-arrow-right' %}
  {% endif %}
</a>
```

#### Product Info Structure
**DO NOT MODIFY** this markup structure in `src/snippets/product.liquid`:
```liquid
<product-info
  id="MainProduct-{{ unique }}"
  class="index-product section-padding {{ color_scheme }}"
  data-section-id="{{ section.id }}"
  data-product-handle="{{ product.handle }}"
  data-product-id="{{ product.id }}"
>
  <!-- Product content -->
</product-info>
```

### 3. SCSS Import Structure

**DO NOT MODIFY** the import order or remove any imports in `src/css/theme.scss`:
```scss
@use 'globals' as *;
@use "./vendor/aos.scss" as *;
@use "./vendor/swiper.scss" as *;
@use "./vendor/photoswipe.scss" as *;
@use "./global/reset.scss" as *;
/* ... other critical imports */
```

### 4. Block Schema Structures

**DO NOT MODIFY** the core block schemas in `/blocks/` folder, especially:
- `_product-card.liquid` - Product card block structure
- `button.liquid` - Button block schema
- `heading.liquid` - Heading block schema

### 5. Critical Data Attributes

**DO NOT MODIFY** or remove these data attributes as they are required for JavaScript functionality:

#### Product Cards
```html
data-grid-item
data-url="{{ product.url }}"
data-swap-id="true"
```

#### Product Info
```html
data-section-id="{{ section.id }}"
data-product-handle="{{ product.handle }}"
data-product-id="{{ product.id }}"
data-enable-history-state="{{ enable_history_state }}"
data-url="{{ product.url }}"
data-sticky-enabled="{{ product_sticky_enable }}"
data-variant-image-scroll="{{ section.settings.variant_image_scroll }}"
```

#### Form Elements
```html
data-form-wrapper
data-product-preorder
data-media-id="{{ section.id }}-{{ media.id }}"
```

### 6. JavaScript Theme Object

**DO NOT MODIFY** the `window.theme` object structure in `head.liquid`:
```javascript
window.theme = {
  routes: { /* ... */ },
  assets: { /* ... */ },
  strings: { /* ... */ },
  settings: { /* ... */ },
  sliderArrows: { /* ... */ },
  moneyFormat: /* ... */,
  info: {
    name: 'Headlands',
    version: '1.0.0'
  }
};
```

### 7. Font Face Declarations

**DO NOT MODIFY** the font-face declarations and font loading logic in `head.liquid` (lines 167-241).

### 8. Color Scheme Loop

**DO NOT MODIFY** the color scheme generation loop in `head.liquid` (lines 243-375) that creates CSS variables for each color scheme.

## ✅ **Safe to Modify**

### 1. Custom CSS
- Add custom styles **AFTER** line 60 in `src/css/theme.scss`
- Create new SCSS files in appropriate folders
- Override specific component styles (but maintain structure)

### 2. Block Content
- Modify text content in blocks
- Adjust block settings in schemas
- Add new block types (following existing patterns)

### 3. Template Customization
- Modify section templates (maintaining data attributes)
- Add custom sections
- Adjust liquid logic (without breaking data flow)

### 4. Settings Schema
- Add new theme settings in `settings_schema.json`
- Modify setting options and defaults

### 5. New Components
- Create new snippets following existing patterns
- Add new JavaScript modules
- Implement new features (following theme conventions)

## 📋 **Best Practices**

### 1. Color Customization
- Use the color scheme system instead of hardcoded colors
- Extend existing color variables rather than creating new ones
- Test all color schemes when making changes

### 2. Typography
- Use existing font size variables
- Maintain the typography scale
- Test responsive behavior

### 3. Layout
- Use existing spacing and layout variables
- Maintain grid system compatibility
- Test across all breakpoints

### 4. Component Development
- Follow existing naming conventions
- Use established data attribute patterns
- Maintain accessibility standards

### 5. JavaScript
- Extend existing modules rather than replacing them
- Use theme object for configuration
- Follow existing event patterns

## ⚠️ **Warning Signs**

Stop and reconsider if you're doing any of these:

1. Modifying variables that start with `--COLOR-`, `--FONT-`, `--LAYOUT-`, `--GRID-`
2. Changing data attributes on core elements
3. Altering the structure of product cards, buttons, or form elements
4. Removing or reordering SCSS imports
5. Modifying the `window.theme` object structure
6. Changing font-face declarations

## 🚨 **Emergency Recovery**

If you accidentally modify critical elements:

1. **CSS Variables**: Restore from the original `head.liquid` file
2. **Markup Structure**: Check the original snippet files in `/snippets/` and `/blocks/`
3. **SCSS**: Restore the import structure in `theme.scss`
4. **JavaScript**: Reset the theme object in `head.liquid`

## 📞 **Support**

When requesting support:
- Always mention which core elements you've modified
- Provide details about custom CSS additions
- Include information about any structural changes made
- Test with a clean theme version to isolate issues

---

**Remember**: The Headlands theme is built with a carefully designed system. Maintaining the integrity of core variables, markup patterns, and component structures ensures your customizations will continue to work properly and won't break during theme updates.
