# Code Review: artemis/rounded-corners

**Date:** May 18, 2026
**Branch commits:** 10
**Files changed:** 26
**Lines changed:** +286/-256

---

## Summary

This branch adds a global rounded-corners setting and applies it across shared images, product cards, collections, footer, drawer, tabs, and floating header surfaces. It also includes layout stability fixes for Swiper initialization, scroll lock/header behavior, social video poster image sizing, product card alignment, and viewport height variable updates.

---

## Commits

```text
9fec9b2e fix search & header shifting on scroll lock and update social videos image sizes
6eaa1c53 PGI and swiper instances bug fixes and CLS
1e19b947 fix swiper CLS
e8eae071 update product modal arrows style and fix rounded corners when header is not floating
7ba1cc96 fix announcement bar content shifting on scroll lock
b23f2219 add rounded corners everywhere
96d90754 full screen height bug fixes
7bf2711a optimize height js
2ada5949 use proper css variable for icons
5f2b07cb init
```

---

## Issues & Concerns

### 🟡 Needs Attention

- `src/css/modules/index.scss:50` changes `.image-overlay` to read `--overlay-bg`, but several existing overlay call sites still set `--OVERLAY-BG`, including `src/blocks/_header-image.liquid:49`, `src/snippets/brick-image.liquid:61`, and `src/snippets/collection-featured-image.liquid:65`. Those overlays can lose their configured background color unless the call sites are migrated or `.image-overlay` falls back to `var(--OVERLAY-BG)`.
- `src/snippets/header.liquid:191` creates `.toolbar::before` whenever the header separator setting is enabled, regardless of the toolbar block's own `show_border` setting. Conversely, `src/blocks/_header-toolbar.liquid:88` can still emit `toolbar has-border`, but the removed global `.toolbar.has-border::before` rule means the toolbar block's border setting no longer creates the pseudo-element when the header separator is off.

### ⚠️ Breaking Changes

- `src/blocks/_header-announcement.liquid:61` no longer applies `announcement__wrapper--borders`, and the `show_border` setting was removed from the block schema around `src/blocks/_header-announcement.liquid:202`. Existing header announcement block configurations that relied on their own border setting will silently stop rendering that border.

---

## Key Changes by File

### `src/config/settings_schema.json`

**What changed:**
- Adds the global `enable_rounded_corners` layout setting.

### `src/snippets/head.liquid`

**What changed:**
- Emits `--ROUNDED-CORNERS`, `--PRODUCT-CARD-ALIGNMENT`, and `--PRODUCT-CARD-JUSTIFY` root variables.

### `src/css/global/images.scss`

**What changed:**
- Applies rounded corners and overflow clipping to shared image wrappers and hero image frames.

### `src/css/modules/header.scss` and `src/snippets/header.liquid`

**What changed:**
- Moves floating header inset/radius variables into header markup.
- Reworks header separator rendering from class-driven borders to inline custom properties and pseudo-element styles.
- Applies shared inset border/radius to floating header card, toolbar, announcement wrapper, dropdown, search popdown, and predictive search.

**Concerns:**
- Toolbar border behavior is now coupled to the header separator setting instead of the toolbar block setting.

### `src/css/modules/index.scss`

**What changed:**
- Moves shared `.tabs` styling into a global module and replaces hardcoded tab radii with `--ROUNDED-CORNERS`.
- Changes `.image-overlay` background variable from `--OVERLAY-BG` to `--overlay-bg`.

**Concerns:**
- Some existing overlay producers still write `--OVERLAY-BG`.

### `src/js/globals/height.js`

**What changed:**
- Reworks viewport/header/filter height measurement to use `visualViewport` when available, cache CSS variable writes, and batch updates with `requestAnimationFrame`.

### `src/css/global/swiper.scss`

**What changed:**
- Adds a pre-initialization flex layout for `swiper-container:not(.is-initialized)` to reduce CLS.

### `src/sections/section-social-videos.liquid`

**What changed:**
- Splits poster rendering into carousel and modal variants with layout-specific responsive `sizes`.

---

## Testing Required

- [ ] Verify image overlays still render configured colors for header image blocks, brick image blocks, collection featured images, slideshows, split images, and tab collection overlays.
- [ ] Test header separator and toolbar border settings independently in floating and non-floating header modes.
- [ ] Confirm existing header announcement bars with border settings either migrate as intended or retain expected visual borders.
- [ ] Open/close search popdown, predictive search, cart drawer, mobile menu, and modals while checking for scroll-lock horizontal shifts.
- [ ] Verify Swiper sections do not stack or shift before initialization and do not introduce horizontal page overflow.
- [ ] Test rounded corners enabled/disabled across product cards, collection cards, drawers, footer, timeline images, tabs, and hero images.
- [ ] Check mobile viewport height behavior on iOS/Android browser chrome expand/collapse and orientation changes.
- [ ] Validate social video poster quality and modal sizing across mobile, tablet, and desktop.

---

## Risk Assessment

**Overall Risk:** Medium

**Why:** The changes are mostly visual/layout-focused but touch shared primitives used across many sections: header, image overlays, root CSS variables, Swiper layout, and viewport height calculations. The overlay variable mismatch and toolbar border coupling are likely visual regressions if not addressed before merge.

**Recommendation:** Fix issues first
