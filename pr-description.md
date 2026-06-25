## The Problem

The theme needed a global rounded-corners option and follow-up fixes for layout stability issues around floating headers, scroll lock, Swiper initialization, full-screen height calculations, product grid alignment, and recently updated social video poster image sizing.

## The Solution

> [!NOTE]
> TLDR: Adds a global `enable_rounded_corners` setting, applies `--RADIUS` across shared media/header/card surfaces, and tightens layout stability around header/search/Swiper/height behavior.

- Added `settings.enable_rounded_corners` in `src/config/settings_schema.json` and exposed `--RADIUS` from `src/snippets/head.liquid`.
- Applied the rounded radius to shared image wrappers, product cards, collection cards, drawers, footer wrappers, timeline images, tabs, and floating header surfaces.
- Refactored floating header border/radius variables into `src/snippets/header.liquid` and `src/css/modules/header.scss` so floating header cards, dropdowns, search popdowns, and predictive search can share the same inset border and radius.
- Updated `src/js/globals/height.js` to cache root CSS variable writes, use `visualViewport` when available, throttle height updates with `requestAnimationFrame`, and expose `window.theme.readHeights`.
- Added pre-initialization Swiper layout styles in `src/css/global/swiper.scss` to reduce CLS before Swiper is initialized.
- Fixed product card alignment variables by separating text alignment from flex justification through `--PRODUCT-CARD-ALIGNMENT` and `--PRODUCT-CARD-JUSTIFY`.
- Updated hotspot icon color plumbing from `--accent` to `--icons` in look/clickable-detail sections and `src/css/global/links-buttons.scss`.
- Set explicit responsive `sizes` values for social video carousel and modal poster images in `src/sections/section-social-videos.liquid`.

---

### Notable behavior changes

| Area | Before | After |
| --- | --- | --- |
| Rounded corners | Hardcoded or absent radii across theme surfaces | Controlled by global `--RADIUS` |
| Product card alignment | `text-align` value reused for flex `justify-content` | Dedicated alignment and justify CSS variables |
| Height variables | Direct root writes on every update | Cached writes through `requestAnimationFrame` |
| Swiper before init | Slides could stack or shift before initialization | `swiper-container:not(.is-initialized)` lays out slides horizontally |
| Social video posters | Poster image used default `100vw` sizing | Carousel/modal poster sizes match rendered layout |

## Review instructions

- Review rounded-corner coverage and edge cases in `src/css/global/images.scss`, `src/css/modules/header.scss`, `src/css/modules/index.scss`, `src/css/modules/product-grid.scss`, and footer/drawer/card styles.
- Test floating and non-floating header variants with separator lines, announcement bar, toolbar, dropdown menus, search popdown, and predictive search.
- Test scroll lock interactions by opening cart drawer, search popdown, mobile menu, and modals; watch for header/announcement/search horizontal shift.
- Check Swiper sections before and after initialization, especially slideshow and social videos, for CLS and horizontal overflow.
- Verify image overlay color behavior on sections/blocks that still set either `--overlay-bg` or `--OVERLAY-BG`.
- Confirm product cards with centered settings align prices, tags, swatches, and sibling controls correctly.
- Confirm social video poster image quality in carousel and modal across mobile, tablet, and desktop.

## Checklist
- [ ] Code is adequately commented (if applicable)
- [ ] Self-review completed (code cleanliness, accessibility, glaring bugs, commented out code, `it.only`, etc)
- [ ] Screenshots added to the ticket (if applicable)
- [ ] Comments added to the PR (if applicable)
