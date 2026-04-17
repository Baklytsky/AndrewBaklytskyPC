if (!customElements.get('header-search-popdown')) {
  const defaultEasing = 'cubic-bezier(0.2, 0, 0, 1)';
  const defaultDuration = 400;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getDurations(distance, config) {
    const base = config.duration;
    const perPixel = 0.35;
    const max = base + 300;
    const flip = Math.round(Math.max(base, Math.min(base + distance * perPixel, max)));
    const container = Math.round(flip * 0.9);
    const close = Math.round(flip * 0.8);
    const textReveal = Math.round(distance > 400 ? flip * 0.7 : flip * 0.4);
    const textRevealOut = Math.round(distance > 400 ? 0 : 100);
    return {flip, container, close, textReveal, textRevealOut};
  }

  class SearchPopdownAnimator {
    constructor(host) {
      this.host = host;
      this.flipAnimation = null;
      this.containerAnimation = null;
      this.textRevealAnimation = null;
      this.triggerFadeAnimation = null;
    }

    cancel() {
      if (this.flipAnimation) {
        this.flipAnimation.cancel();
        this.flipAnimation = null;
      }
      if (this.containerAnimation) {
        this.containerAnimation.cancel();
        this.containerAnimation = null;
      }
      if (this.textRevealAnimation) {
        this.textRevealAnimation.cancel();
        this.textRevealAnimation = null;
      }
      if (this.triggerFadeAnimation) {
        this.triggerFadeAnimation.cancel();
        this.triggerFadeAnimation = null;
      }
      this.cleanup();
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

      // FIRST: measure visible trigger (icon or text) before layout change
      const trigger = el.getVisibleTrigger();
      const triggerRect = el.summary.getBoundingClientRect();
      const firstRect = trigger.rect;

      // Hide input text before popdown becomes visible
      if (el.inputHolder) el.inputHolder.style.opacity = '0';
      el.classList.add('is-animating');
      el.classList.add('is-open');

      // LAST: measure expanded popdown and destination icon
      const popdownRect = el.popdown.getBoundingClientRect();
      const lastIconRect = el.destIcon.getBoundingClientRect();

      // Flight endpoints: clone is anchored next to the trigger (text) or on it (icon)
      const destCX = lastIconRect.left + lastIconRect.width / 2;
      const destCY = lastIconRect.top + lastIconRect.height / 2;
      const anchor = this.getFlightAnchor(trigger);
      const dx = destCX - anchor.cx;
      const dy = destCY - anchor.cy;
      const distance = Math.hypot(dx, dy);
      const timing = getDurations(distance, el.config);

      // Always clone the destination icon, placed at the flight anchor
      const clonePlacement = {
        width: lastIconRect.width,
        height: lastIconRect.height,
        top: anchor.cy - lastIconRect.height / 2,
        left: anchor.cx - lastIconRect.width / 2,
      };
      const clone = this.createClone(el.destIcon, clonePlacement);
      el.submitButton.classList.add('search-popdown__submit--flip-hidden');

      // Text mode: run a pre-flight swap (text shrinks, icon grows) before the flight.
      // Icon mode: the flight itself carries the scale.
      const isTextMode = trigger.mode !== 'icon';
      const swapPhase = isTextMode ? Math.min(150, Math.round(timing.flip * 0.25)) : 0;

      if (!isTextMode) {
        el.triggerIcon.style.opacity = '0';
        const startScale = firstRect.width / lastIconRect.width;
        this.flipAnimation = clone.animate([{transform: `translate(0, 0) scale(${startScale})`}, {transform: `translate(${dx}px, ${dy}px) scale(1)`}], {
          duration: timing.flip,
          easing: el.config.easing,
          fill: 'forwards',
        });
      } else {
        // Clone: scale 0 → 1 at origin during swap, then fly to destination
        const flipTotal = timing.flip + swapPhase;
        const swapEnd = swapPhase / flipTotal;
        this.flipAnimation = clone.animate(
          [
            {transform: 'translate(0, 0) scale(0)', offset: 0, easing: 'ease-out'},
            {transform: 'translate(0, 0) scale(1)', offset: swapEnd, easing: el.config.easing},
            {transform: `translate(${dx}px, ${dy}px) scale(1)`, offset: 1},
          ],
          {duration: flipTotal, fill: 'forwards'}
        );

        // Text: scale 1 → 0 during the swap phase
        this.triggerFadeAnimation = trigger.el.animate([{transform: 'scale(1)'}, {transform: 'scale(0)'}], {duration: swapPhase, easing: 'ease-in', fill: 'forwards'});
      }

      //  Container expansion via clip-path (X-axis only). In text mode the
      //  container is held invisible during the swap phase and only starts
      //  expanding (and fading in) strictly after the swap completes.
      const inset = this.getContainerInset(triggerRect, popdownRect);
      const startClip = `inset(0px ${inset.right}px 0px ${inset.left}px round 6px)`;
      const endClip = 'inset(0px 0px 0px 0px round 0px)';

      this.containerAnimation = el.popdown.animate(
        [
          {clipPath: startClip, opacity: isTextMode ? 0 : 0.8},
          {clipPath: endClip, opacity: 1},
        ],
        {duration: timing.container, delay: swapPhase, easing: el.config.easing, fill: isTextMode ? 'both' : 'forwards'}
      );

      // Reveal input text once icon arrives (delayed to start after flip).
      // In text mode, shift the delay to run relative to when the flight starts.
      if (el.inputHolder) {
        this.textRevealAnimation = el.inputHolder.animate(
          [
            {opacity: 0, transform: 'translateX(-8px)'},
            {opacity: 1, transform: 'translateX(0)'},
          ],
          {duration: 250, delay: swapPhase + timing.textReveal, easing: 'ease-out', fill: 'forwards'}
        );
      }

      // Wait for all animations to settle, then clean up
      const animations = [this.flipAnimation.finished, this.containerAnimation.finished];
      if (this.textRevealAnimation) animations.push(this.textRevealAnimation.finished);
      if (this.triggerFadeAnimation) animations.push(this.triggerFadeAnimation.finished);

      return Promise.all(animations)
        .then(() => {
          if (!el.classList.contains('is-open')) return;
          clone.remove();
          el.submitButton.classList.remove('search-popdown__submit--flip-hidden');
          this.flipAnimation?.cancel();
          this.containerAnimation?.cancel();
          this.textRevealAnimation?.cancel();
          this.triggerFadeAnimation?.cancel();
          this.flipAnimation = null;
          this.containerAnimation = null;
          this.textRevealAnimation = null;
          this.triggerFadeAnimation = null;
          el.popdown.style.clipPath = '';
          el.popdown.style.opacity = '';
          if (el.triggerIcon) el.triggerIcon.style.opacity = '';
          if (el.triggerText) {
            el.triggerText.style.opacity = '';
            el.triggerText.style.transform = '';
          }
          if (el.inputHolder) el.inputHolder.style.opacity = '';
          el.classList.remove('is-animating');
        })
        .catch(() => {});
    }

    close() {
      const el = this.host;

      // Measure current state while popdown is still visible
      const trigger = el.getVisibleTrigger();
      const popdownRect = el.popdown.getBoundingClientRect();
      const firstIconRect = el.destIcon.getBoundingClientRect();
      const triggerRect = el.summary.getBoundingClientRect();

      // Keep popdown visible during the close animation
      el.classList.add('is-animating');
      el.classList.remove('is-open');

      // Flight endpoints: clone lands next to the trigger (text) or on it (icon)
      const destCX = firstIconRect.left + firstIconRect.width / 2;
      const destCY = firstIconRect.top + firstIconRect.height / 2;
      const anchor = this.getFlightAnchor(trigger);
      const dx = anchor.cx - destCX;
      const dy = anchor.cy - destCY;
      const distance = Math.hypot(dx, dy);
      const timing = getDurations(distance, el.config);

      // Hide input text immediately (reverse of the open reveal)
      if (el.inputHolder) {
        this.textRevealAnimation = el.inputHolder.animate(
          [
            {opacity: 1, transform: 'translateX(0)'},
            {opacity: 0, transform: 'translateX(-8px)'},
          ],
          {duration: timing.textRevealOut, easing: 'ease-in', fill: 'forwards'}
        );
      }

      //  Reverse icon FLIP: clone dest icon at its current position
      const clone = this.createClippedClone(el.destIcon, firstIconRect);
      el.submitButton.classList.add('search-popdown__submit--flip-hidden');

      // Icon mode: fly with a linear scale.
      // Text mode: fly first, then run a swap (clone shrinks, text grows).
      if (trigger.mode === 'icon') {
        el.triggerIcon.style.opacity = '0';
        const endScale = trigger.rect.width / firstIconRect.width;
        this.flipAnimation = clone.animate([{transform: 'translate(0, 0) scale(1)'}, {transform: `translate(${dx}px, ${dy}px) scale(${endScale})`}], {
          duration: timing.close,
          easing: el.config.easing,
          fill: 'forwards',
        });
      } else {
        const swapPhase = Math.min(150, Math.round(timing.close * 0.25));
        const flipTotal = timing.close + swapPhase;
        const flightEnd = timing.close / flipTotal;
        this.flipAnimation = clone.animate(
          [
            {transform: 'translate(0, 0) scale(1)', offset: 0, easing: el.config.easing},
            {transform: `translate(${dx}px, ${dy}px) scale(1)`, offset: flightEnd, easing: 'ease-in'},
            {transform: `translate(${dx}px, ${dy}px) scale(0)`, offset: 1},
          ],
          {duration: flipTotal, fill: 'forwards'}
        );

        // Text: kept at scale 0 during the flight, scales back to 1 during the swap phase
        trigger.el.style.transform = 'scale(0)';
        this.triggerFadeAnimation = trigger.el.animate([{transform: 'scale(0)'}, {transform: 'scale(1)'}], {duration: swapPhase, delay: timing.close, easing: 'ease-out', fill: 'forwards'});
      }

      //  Container contraction via clip-path (X-axis only, matching open)
      const inset = this.getContainerInset(triggerRect, popdownRect);
      const headerEl = el.closest('[data-header-height]');
      const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;
      const bottomClip = headerRect ? Math.max(0, popdownRect.bottom - headerRect.bottom) : 0;
      const startClip = `inset(0px 0px ${bottomClip}px 0px round 0px)`;
      const endClip = `inset(0px ${inset.right}px ${bottomClip}px ${inset.left}px round 6px)`;

      this.containerAnimation = el.popdown.animate(
        [
          {clipPath: startClip, opacity: 1},
          {clipPath: endClip, opacity: 0.4},
        ],
        {duration: timing.close, easing: el.config.easing, fill: 'forwards'}
      );

      const animations = [this.flipAnimation.finished, this.containerAnimation.finished];
      if (this.triggerFadeAnimation) animations.push(this.triggerFadeAnimation.finished);

      return Promise.all(animations)
        .then(() => {
          this.flipAnimation?.cancel();
          this.containerAnimation?.cancel();
          this.textRevealAnimation?.cancel();
          this.triggerFadeAnimation?.cancel();
          this.flipAnimation = null;
          this.containerAnimation = null;
          this.textRevealAnimation = null;
          this.triggerFadeAnimation = null;
          document.querySelectorAll('.flip-clone, .flip-clone-wrapper').forEach((node) => node.remove());
          el.submitButton.classList.remove('search-popdown__submit--flip-hidden');
          if (el.triggerIcon) el.triggerIcon.style.opacity = '';
          if (el.triggerText) {
            el.triggerText.style.opacity = '';
            el.triggerText.style.transform = '';
          }
          if (el.inputHolder) el.inputHolder.style.opacity = '';
          el.popdown.style.clipPath = '';
          el.popdown.style.opacity = '';
          el.classList.remove('is-animating');
        })
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
        this.triggerIcon = this.querySelector('summary .icon-search');
        this.triggerText = this.querySelector('summary .navtext');
        this.submitButton = this.popdown.querySelector('.search-popdown__submit');
        this.destIcon = this.submitButton?.querySelector('.icon-search');
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
