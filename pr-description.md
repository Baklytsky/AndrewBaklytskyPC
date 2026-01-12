# Fix SASS warnings in console

## The Problem

SASS compiler was generating warnings about using `end` instead of `flex-end` for the `align-items` property. Additionally, the responsive image size logic in cart drawer was using a desktop-first approach that could be improved to mobile-first.

## The Solution

Fixed SASS warnings by replacing `align-items: end;` with `align-items: flex-end;` in two locations:
- `src/css/components/cart-drawer.scss` (line 296)
- `src/css/modules/cart.scss` (line 644)

Refactored responsive image size logic in `cart-drawer.scss` to use mobile-first approach:
- Changed default `--image-size` from `80px` to `60px`
- Moved media query override from `$small` (mobile) to `$medium-up` (desktop) to set `80px` on larger screens

> [!NOTE]
> TLDR: Fixed SASS warnings by replacing `align-items: end` with `align-items: flex-end` in cart styles, and refactored cart item image sizing to mobile-first approach

## Review instructions

**Files to focus on:**
- `src/css/components/cart-drawer.scss` - Verify image sizing works correctly on mobile and desktop
- `src/css/modules/cart.scss` - Verify alignment still works as expected

**Functionality to test:**
- Cart drawer displays correctly on mobile (60px images) and desktop (80px images)
- Cart item actions align properly to the right
- Cart total discount section aligns properly to the right

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if applicable)
- [ ] No new warnings generated
- [ ] Changes tested on mobile and desktop viewports
