if (!customElements.get('header-search-popdown')) {
  const defaultEasing = 'cubic-bezier(0.2, 0, 0, 1)';
  const defaultDuration = 400;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  /*
   *  Animation timeline: includes all durations, delays
   *  and easings. Each entry is `{duration, delay, easing}` and can be
   *  spread directly into `element.animate()` options.
   *
   *  Open sequence           ──┬── swap ─────────── swap + flight ──▶
   *    [0 → swap]              │   triggerSwap    (text scales down, clone scales up in place)
   *    [swap → swap+flight]    │   flight         (clone translates to the popdown icon)
   *    [swap → swap+container] │   container      (clip-path + opacity expansion)
   *    [swap+inputWait → …]    │   inputReveal    (search placeholder fades in)
   *
   *  Close sequence          ──┬── closeFlight ──── closeFlight + swap ──▶
   *    [0 → closeFlight]       │   flight, container, inputHide  (run in parallel)
   *    [closeFlight → +swap]   │   triggerSwap    (clone scales down, text scales up)
   *
   *  `swap` is non-zero only when the trigger is text (show_icons = false).
   *  For icon triggers it collapses to 0, reducing each sequence to a single
   *  phase identical to the original icon-only animation.
   */
  function buildTimeline({distance, config, isTextMode}) {
    const base = config.duration;
    const longFlight = distance > 400;

    // Flight duration scales with travel distance, clamped to a sane range.
    const flight = Math.round(clamp(base + distance * 0.35, base, base + 300));
    // Close is a touch snappier than open.
    const closeFlight = Math.round(flight * 0.8);
    // Container lags slightly behind the flight for a natural arrival.
    const container = Math.round(flight * 0.9);
    // Text ↔ icon morph phase; only present when trigger is text.
    const swap = isTextMode ? 200 : 0;
    // Search placeholder timing.
    const inputReveal = 250;
    const inputHide = longFlight ? 0 : 100;
    // Placeholder starts revealing later on long flights (icon close to destination).
    const inputWait = Math.round(longFlight ? flight * 0.7 : flight * 0.4);

    return {
      open: {
        triggerSwap: {duration: swap, delay: 0, easing: 'ease-in'},
        flight: {duration: flight, delay: swap, easing: config.easing},
        container: {duration: container, delay: swap, easing: config.easing},
        inputReveal: {duration: inputReveal, delay: swap + inputWait, easing: 'ease-out'},
      },
      close: {
        flight: {duration: closeFlight, delay: 0, easing: config.easing},
        container: {duration: closeFlight, delay: 0, easing: config.easing},
        inputHide: {duration: inputHide, delay: 0, easing: 'ease-in'},
        triggerSwap: {duration: swap, delay: closeFlight, easing: 'ease-out'},
      },
    };
  }

  class SearchPopdownAnimator {
    constructor(host) {
      this.host = host;
      // All running WAAPI animations live on this object. Makes cancel /
      // waitForAnimations trivial and keeps related state together.
      this.animations = {flip: null, container: null, inputReveal: null, triggerSwap: null};
    }

    cancel() {
      Object.keys(this.animations).forEach((key) => {
        this.animations[key]?.cancel();
        this.animations[key] = null;
      });
      this.cleanup();
    }

    waitForAnimations() {
      const pending = Object.values(this.animations)
        .filter(Boolean)
        .map((a) => a.finished);
      return Promise.all(pending);
    }

    cleanup() {
      const el = this.host;
      document.querySelectorAll('.flip-clone, .flip-clone-wrapper').forEach((node) => node.remove());
      el.submitButton?.classList.remove('search-popdown__submit--flip-hidden');
      el.classList.remove('is-animating');
      el.popdown.style.clipPath = '';
      el.popdown.style.opacity = '';
      if (el.triggerIcon) el.triggerIcon.style.opacity = '';
      if (el.triggerText) {
        el.triggerText.style.opacity = '';
        el.triggerText.style.transform = '';
      }
      if (el.inputHolder) el.inputHolder.style.opacity = '';
    }

    getContainerInset(triggerRect, popdownRect) {
      return {
        top: Math.max(0, triggerRect.top - popdownRect.top),
        right: Math.max(0, popdownRect.right - triggerRect.right),
        bottom: Math.max(0, popdownRect.bottom - triggerRect.bottom),
        left: Math.max(0, triggerRect.left - popdownRect.left),
      };
    }

    // Where the clone sits at the trigger-side end of the flight.
    // Always centered on the visible trigger (icon or text).
    getFlightAnchor(trigger) {
      const rect = trigger.rect;
      return {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
    }

    createClone(iconEl, rect) {
      const clone = iconEl.cloneNode(true);
      clone.classList.add('flip-clone');
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.top = `${rect.top}px`;
      clone.style.left = `${rect.left}px`;
      document.body.appendChild(clone);
      return clone;
    }

    createClippedClone(iconEl, iconRect) {
      const el = this.host;
      const headerEl = el.closest('[data-header-height]');
      const clipRect = headerEl ? headerEl.getBoundingClientRect() : el.popdown.getBoundingClientRect();

      const wrapper = document.createElement('div');
      wrapper.classList.add('flip-clone-wrapper');
      wrapper.style.cssText = `position:fixed;top:${clipRect.top}px;left:${clipRect.left}px;width:${clipRect.width}px;height:${clipRect.height}px;overflow:hidden;z-index:6003;pointer-events:none;`;

      const clone = iconEl.cloneNode(true);
      clone.classList.add('flip-clone');
      clone.style.position = 'absolute';
      clone.style.width = `${iconRect.width}px`;
      clone.style.height = `${iconRect.height}px`;
      clone.style.top = `${iconRect.top - clipRect.top}px`;
      clone.style.left = `${iconRect.left - clipRect.left}px`;

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      return clone;
    }

    open() {
      const el = this.host;

      // First: measure visible trigger (icon or text) before layout change
      const trigger = el.getVisibleTrigger();
      const isTextMode = trigger.mode !== 'icon';
      const triggerRect = el.summary.getBoundingClientRect();
      const firstRect = trigger.rect;

      // Hide input text before popdown becomes visible
      if (el.inputHolder) el.inputHolder.style.opacity = '0';
      el.classList.add('is-animating');
      el.classList.add('is-open');

      // Last: measure expanded popdown and destination icon
      const popdownRect = el.popdown.getBoundingClientRect();
      const lastIconRect = el.destIcon.getBoundingClientRect();

      // Flight endpoints: calculate the destination center point for the icon
      const destCX = lastIconRect.left + lastIconRect.width / 2;
      const destCY = lastIconRect.top + lastIconRect.height / 2;
      const anchor = this.getFlightAnchor(trigger);
      const dx = destCX - anchor.cx;
      const dy = destCY - anchor.cy;
      const distance = Math.hypot(dx, dy);
      const {open: t} = buildTimeline({distance, config: el.config, isTextMode});

      // Create the clone of the destination icon
      const clone = this.createClone(el.destIcon, {
        width: lastIconRect.width,
        height: lastIconRect.height,
        top: anchor.cy - lastIconRect.height / 2,
        left: anchor.cx - lastIconRect.width / 2,
      });
      el.submitButton.classList.add('search-popdown__submit--flip-hidden');

      // Clone flight:
      // icon mode: single translate + scale
      // text mode: scale-up in place during `swap`, then translate during `flight`.
      if (!isTextMode) {
        el.triggerIcon.style.opacity = '0';
        const startScale = firstRect.width / lastIconRect.width;
        this.animations.flip = clone.animate(
          [
            {
              transform: `translate(0, 0) scale(${startScale})`,
            },
            {
              transform: `translate(${dx}px, ${dy}px) scale(1)`,
            },
          ],
          {
            ...t.flight,
            fill: 'forwards',
          }
        );
      } else {
        const total = t.triggerSwap.duration + t.flight.duration;
        const swapEnd = t.triggerSwap.duration / total;
        this.animations.flip = clone.animate(
          [
            {
              transform: 'translate(0, 0) scale(0)',
              offset: 0,
              easing: t.triggerSwap.easing,
            },
            {
              transform: 'translate(0, 0) scale(1)',
              offset: swapEnd,
              easing: t.flight.easing,
            },
            {
              transform: `translate(${dx}px, ${dy}px) scale(1)`,
              offset: 1,
            },
          ],
          {
            duration: total,
            fill: 'forwards',
          }
        );
        // Trigger text: scales down during the swap phase.
        this.animations.triggerSwap = trigger.el.animate(
          [
            {
              transform: 'scale(1)',
            },
            {
              transform: 'scale(0)',
            },
          ],
          {
            ...t.triggerSwap,
            fill: 'forwards',
          }
        );
      }

      // Container:
      // clip-path + opacity expansion. Held invisible during the
      // swap phase so it only appears strictly after the morph completes.
      const inset = this.getContainerInset(triggerRect, popdownRect);
      const startClip = `inset(0px ${inset.right}px 0px ${inset.left}px round 6px)`;
      const endClip = 'inset(0px 0px 0px 0px round 0px)';
      this.animations.container = el.popdown.animate(
        [
          {
            clipPath: startClip,
            opacity: isTextMode ? 0 : 0.8,
          },
          {
            clipPath: endClip,
            opacity: 1,
          },
        ],
        {
          ...t.container,
          fill: isTextMode ? 'both' : 'forwards',
        }
      );

      // Input placeholder: fades in as the icon nears the destination.
      if (el.inputHolder) {
        this.animations.inputReveal = el.inputHolder.animate(
          [
            {
              opacity: 0,
              transform: 'translateX(-8px)',
            },
            {
              opacity: 1,
              transform: 'translateX(0)',
            },
          ],
          {
            ...t.inputReveal,
            fill: 'forwards',
          }
        );
      }

      return this.waitForAnimations()
        .then(() => {
          if (!el.classList.contains('is-open')) return;
          this.cancel();
        })
        .catch(() => {});
    }

    close() {
      const el = this.host;

      const trigger = el.getVisibleTrigger();
      const isTextMode = trigger.mode !== 'icon';
      const popdownRect = el.popdown.getBoundingClientRect();
      const firstIconRect = el.destIcon.getBoundingClientRect();
      const triggerRect = el.summary.getBoundingClientRect();

      el.classList.add('is-animating');
      el.classList.remove('is-open');

      const destCX = firstIconRect.left + firstIconRect.width / 2;
      const destCY = firstIconRect.top + firstIconRect.height / 2;
      const anchor = this.getFlightAnchor(trigger);
      const dx = anchor.cx - destCX;
      const dy = anchor.cy - destCY;
      const distance = Math.hypot(dx, dy);
      const {close: t} = buildTimeline({distance, config: el.config, isTextMode});

      // Input placeholder: hide immediately (reverse of open reveal).
      if (el.inputHolder) {
        this.animations.inputReveal = el.inputHolder.animate(
          [
            {
              opacity: 1,
              transform: 'translateX(0)',
            },
            {
              opacity: 0,
              transform: 'translateX(-8px)',
            },
          ],
          {
            ...t.inputHide,
            fill: 'forwards',
          }
        );
      }

      const clone = this.createClippedClone(el.destIcon, firstIconRect);
      el.submitButton.classList.add('search-popdown__submit--flip-hidden');

      // Clone flight:
      // icon mode: single translate+scale; text mode: flight
      // during `flight`, then shrink during `triggerSwap`.
      if (!isTextMode) {
        el.triggerIcon.style.opacity = '0';
        const endScale = trigger.rect.width / firstIconRect.width;
        this.animations.flip = clone.animate(
          [
            {
              transform: 'translate(0, 0) scale(1)',
            },
            {
              transform: `translate(${dx}px, ${dy}px) scale(${endScale})`,
            },
          ],
          {
            ...t.flight,
            fill: 'forwards',
          }
        );
      } else {
        const total = t.flight.duration + t.triggerSwap.duration;
        const flightEnd = t.flight.duration / total;
        this.animations.flip = clone.animate(
          [
            {
              transform: 'translate(0, 0) scale(1)',
              offset: 0,
              easing: t.flight.easing,
            },
            {
              transform: `translate(${dx}px, ${dy}px) scale(1)`,
              offset: flightEnd,
              easing: t.triggerSwap.easing,
            },
            {
              transform: `translate(${dx}px, ${dy}px) scale(0)`,
              offset: 1,
            },
          ],
          {
            duration: total,
            fill: 'forwards',
          }
        );
        // Trigger text: hidden during flight, scales back to 1 during swap.
        trigger.el.style.transform = 'scale(0)';
        this.animations.triggerSwap = trigger.el.animate(
          [
            {
              transform: 'scale(0)',
            },
            {
              transform: 'scale(1)',
            },
          ],
          {
            ...t.triggerSwap,
            fill: 'forwards',
          }
        );
      }

      // Container:
      // clip-path contraction matching the open expansion.
      const inset = this.getContainerInset(triggerRect, popdownRect);
      const headerEl = el.closest('[data-header-height]');
      const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;
      const bottomClip = headerRect ? Math.max(0, popdownRect.bottom - headerRect.bottom) : 0;
      const startClip = `inset(0px 0px ${bottomClip}px 0px round 0px)`;
      const endClip = `inset(0px ${inset.right}px ${bottomClip}px ${inset.left}px round 6px)`;
      this.animations.container = el.popdown.animate(
        [
          {
            clipPath: startClip,
            opacity: 1,
          },
          {
            clipPath: endClip,
            opacity: 0.4,
          },
        ],
        {
          ...t.container,
          fill: 'forwards',
        }
      );

      return this.waitForAnimations()
        .then(() => this.cancel())
        .catch(() => {});
    }
  }

  customElements.define(
    'header-search-popdown',

    class SearchPopdown extends HTMLElement {
      constructor() {
        super();
        this.popdown = this.querySelector('[data-popdown]');
        this.popdownContainer = this.querySelector('details');
        this.popdownClose = this.querySelector('[data-popdown-close]');
        this.summary = this.querySelector('summary');
        this.triggerIcon = this.querySelector('summary .icon-magnifying-glass, summary .icon-search');
        this.triggerText = this.querySelector('summary .navtext');
        this.submitButton = this.popdown.querySelector('.search-popdown__submit');
        this.destIcon = this.submitButton?.querySelector('.icon-magnifying-glass, .icon-search');
        this.inputHolder = this.popdown.querySelector('.input-holder');
        this.detailsToggleCallback = this.detailsToggleCallback.bind(this);
        this.mobileMenu = this.closest('mobile-menu');
        this.a11y = window.theme.a11y;
        this.config = {
          easing: this.dataset.easing || defaultEasing,
          duration: parseInt(this.dataset.duration, 10) || defaultDuration,
        };
        this.animator = new SearchPopdownAnimator(this);
      }

      connectedCallback() {
        this.popdownContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
        this.popdownContainer.addEventListener('toggle', this.detailsToggleCallback);
        this.popdownClose.addEventListener('click', this.close.bind(this));
      }

      detailsToggleCallback(event) {
        if (event.target.hasAttribute('open')) {
          this.open();
        }
      }

      getVisibleTrigger() {
        const iconRect = this.triggerIcon?.getBoundingClientRect();
        if (iconRect && iconRect.width > 0 && iconRect.height > 0) {
          return {el: this.triggerIcon, rect: iconRect, mode: 'icon'};
        }
        const textRect = this.triggerText?.getBoundingClientRect();
        if (this.triggerText && textRect.width > 0 && textRect.height > 0) {
          return {el: this.triggerText, rect: textRect, mode: 'text'};
        }
        return {el: this.summary, rect: this.summary.getBoundingClientRect(), mode: 'summary'};
      }

      onBodyClick(event) {
        if (!this.contains(event.target) || event.target.hasAttribute('data-popdown-underlay')) this.close();
      }

      open() {
        this.animator.cancel();
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
        document.body.addEventListener('click', this.onBodyClickEvent);

        if (!document.documentElement.hasAttribute('data-scroll-locked')) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        if (prefersReducedMotion() || !this.destIcon || this.getVisibleTrigger().mode === 'summary') {
          this.classList.add('is-open');
          this.a11y.trapFocus(this.popdown, {
            elementToFocus: this.popdown.querySelector('input:not([type="hidden"])'),
          });
          return;
        }

        this.animator.open().then(() => {
          this.a11y.trapFocus(this.popdown, {
            elementToFocus: this.popdown.querySelector('input:not([type="hidden"])'),
          });
        });
      }

      unlockScroll() {
        if (!this.mobileMenu) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      close() {
        if (!this.classList.contains('is-open')) return;

        this.animator.cancel();
        document.body.removeEventListener('click', this.onBodyClickEvent);

        if (prefersReducedMotion() || !this.destIcon || this.getVisibleTrigger().mode === 'summary') {
          this.classList.remove('is-open');
          this.popdownContainer.removeAttribute('open');
          this.a11y.removeTrapFocus();
          this.unlockScroll();
          return;
        }

        this.animator.close().then(() => {
          this.popdownContainer.removeAttribute('open');
          this.a11y.removeTrapFocus();
          this.unlockScroll();
        });
      }
    }
  );
}
