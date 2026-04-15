# Code Review: update/timeline

**Date:** Wednesday Apr 15, 2026  
**Branch commits:** 3  
**Files changed:** 3  
**Lines changed:** +75/-10

---

## Summary

This branch improves the timeline section for small screens (in-flow images, spacing), fixes touch/desktop click interaction with autoplay pause, and adds theme editor block select/deselect handling plus `shopify_attributes` on rows. Overall the approach is coherent; a few merchant-facing and editor-lifecycle edge cases are worth validating before merge.

---

## Commits

```
021c429b fix tap events on mobile and add theme editor select events too
82c628d3 fix some spacings and events
467b3969 timeline updates
```

---

## Issues & concerns

### 🟡 Needs attention

- **Layout when “Show images” is off:** The new mobile image markup in `src/sections/section-timeline.liquid` is not gated by `show_images` (see around lines 162–167). Previously, turning images off removed image UI entirely; now mobile can still show the image stack (and the `image` snippet’s placeholder when `block.settings.image` is blank). Confirm this is intentional for the product; if not, wrap the block in `show_images` and/or `block.settings.image != blank`.

- **Design mode: duplicate document listeners:** The inline `request.design_mode` script (lines 225–258) registers `document.addEventListener` on every section render without removal. Shopify section re-renders / duplicate instances can stack handlers; handlers are mostly idempotent but multiply work and can make debugging harder. Consider a single delegated listener, `AbortController` tied to section unload, or moving logic into the deferred section script with teardown in `disconnectedCallback`.

---

## Key changes by file

### `src/sections/section-timeline.liquid`

**What changed:**

- `{{ block.shopify_attributes }}` on content rows; mobile-only image column inside row content; `desktop` class on the side image column; design mode listeners for block select/deselect.

**Concerns:**

- `show_images` / empty image behavior as above.
- Editor script assigns `timelineComponent.selectedIndex` directly (lines 244–246) while `pause()` has already stopped the interval; order is consistent with `selectRow` side effects but bypasses `selectRow` — acceptable here but fragile if `selectRow` gains more logic later.

### `src/js/components/section-timeline.js`

**What changed:**

- Row change clears paused state before `selectRow`; same-row click toggles pause/resume; `mouseleave` respects `data-editor-block-selected`.

**Concerns:**

- None beyond normal regression testing on hybrid pointer/coarse devices.

### `src/css/components/section-timeline.scss`

**What changed:**

- Responsive rules for `.timeline__image`; content and subheading spacing tweaks.

**Concerns:**

- None substantive; verify visual regression on existing timelines with `show_images` true and false.

---

## Testing required

- [ ] `show_images` false: mobile and desktop — confirm expected presence/absence of images and placeholders.
- [ ] `show_images` true: small viewport shows in-column image; medium+ shows desktop column; selection/z-index still correct.
- [ ] Touch: open row A, ensure tap row B starts autoplay from correct state; tap row A title twice for pause/resume.
- [ ] Theme editor: select/deselect blocks repeatedly and after section “Update” / duplicate — no double-advance or stuck pause.

---

## Risk assessment

**Overall risk:** Medium  

**Why:** Small diff but touches interaction, editor-only JS, and merchant-visible layout when image settings are off.

**Recommendation:** Fix issues first if `show_images` false must not show images; otherwise merge after targeted QA above.
