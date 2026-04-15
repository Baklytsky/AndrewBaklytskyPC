if (!customElements.get('header-search-popdown')) {
  const DEFAULT_EASING = 'cubic-bezier(0.2, 0, 0, 1)';
  const DEFAULT_DURATION = 400;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getDurations(distance, config) {
    const base = config.duration;
    const perPixel = 0.35;
    const max = base + 300;
    const flip = Math.round(Math.max(base, Math.min(base + distance * perPixel, max)));
    const container = Math.round(flip * 0.9);
    return {flip, container};
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
        this.submitButton = this.popdown.querySelector('.search-popdown__submit');
        this.destIcon = this.submitButton?.querySelector('.icon-search');
        this.detailsToggleCallback = this.detailsToggleCallback.bind(this);
        this.mobileMenu = this.closest('mobile-menu');
        this.a11y = window.theme.a11y;
        this.flipAnimation = null;
        this.containerAnimation = null;
        this.closeButtonAnimation = null;
        this.config = {
          easing: this.dataset.easing || DEFAULT_EASING,
          duration: parseInt(this.dataset.duration, 10) || DEFAULT_DURATION,
        };
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

      cancelRunningAnimations() {
        if (this.flipAnimation) {
          this.flipAnimation.cancel();
          this.flipAnimation = null;
        }
        if (this.containerAnimation) {
          this.containerAnimation.cancel();
          this.containerAnimation = null;
        }
        if (this.closeButtonAnimation) {
          this.closeButtonAnimation.cancel();
          this.closeButtonAnimation = null;
        }
        this.cleanup();
      }

      cleanup() {
        document.querySelectorAll('.flip-clone, .flip-clone-wrapper').forEach((el) => el.remove());
        this.submitButton?.classList.remove('search-popdown__submit--flip-hidden');
        this.classList.remove('is-animating');
        this.popdown.style.clipPath = '';
        this.popdown.style.opacity = '';
        if (this.triggerIcon) this.triggerIcon.style.opacity = '';
        if (this.popdownClose) this.popdownClose.style.opacity = '';
      }

      getContainerInset(triggerRect, popdownRect) {
        return {
          top: Math.max(0, triggerRect.top - popdownRect.top),
          right: Math.max(0, popdownRect.right - triggerRect.right),
          bottom: Math.max(0, popdownRect.bottom - triggerRect.bottom),
          left: Math.max(0, triggerRect.left - popdownRect.left),
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
        const headerEl = this.closest('[data-header-height]');
        const clipRect = headerEl ? headerEl.getBoundingClientRect() : this.popdown.getBoundingClientRect();

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

      onBodyClick(event) {
        if (!this.contains(event.target) || event.target.hasAttribute('data-popdown-underlay')) this.close();
      }

      open() {
        this.cancelRunningAnimations();
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
        document.body.addEventListener('click', this.onBodyClickEvent);

        if (!document.documentElement.hasAttribute('data-scroll-locked')) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        if (prefersReducedMotion() || !this.triggerIcon || !this.destIcon) {
          this.classList.add('is-open');
          this.a11y.trapFocus(this.popdown, {
            elementToFocus: this.popdown.querySelector('input:not([type="hidden"])'),
          });
          return;
        }

        // FIRST: measure trigger positions before layout change
        const triggerRect = this.summary.getBoundingClientRect();
        const firstIconRect = this.triggerIcon.getBoundingClientRect();

        // Force popdown visible to measure destination layout
        this.classList.add('is-animating');
        this.classList.add('is-open');
        // eslint-disable-next-line no-unused-expressions
        this.popdown.offsetHeight;

        // LAST: measure expanded popdown and destination icon
        const popdownRect = this.popdown.getBoundingClientRect();
        const lastIconRect = this.destIcon.getBoundingClientRect();

        // Calculate travel distance for adaptive timing
        const dx = lastIconRect.left + (lastIconRect.width - firstIconRect.width) / 2 - firstIconRect.left;
        const dy = lastIconRect.top + (lastIconRect.height - firstIconRect.height) / 2 - firstIconRect.top;
        const distance = Math.hypot(dx, dy);
        const timing = getDurations(distance, this.config);

        // --- Icon FLIP (32px trigger -> 24px destination) ---
        const clone = this.createClone(this.triggerIcon, firstIconRect);
        this.triggerIcon.style.opacity = '0';
        this.submitButton.classList.add('search-popdown__submit--flip-hidden');

        const scale = lastIconRect.width / firstIconRect.width;

        this.flipAnimation = clone.animate([{transform: 'translate(0, 0) scale(1)'}, {transform: `translate(${dx}px, ${dy}px) scale(${scale})`}], {
          duration: timing.flip,
          easing: this.config.easing,
          fill: 'forwards',
        });

        // --- Container expansion via clip-path (X-axis only) ---
        const inset = this.getContainerInset(triggerRect, popdownRect);
        const startClip = `inset(0px ${inset.right}px 0px ${inset.left}px round 6px)`;
        const endClip = 'inset(0px 0px 0px 0px round 0px)';

        this.containerAnimation = this.popdown.animate(
          [
            {clipPath: startClip, opacity: 1},
            {clipPath: endClip, opacity: 1},
          ],
          {duration: timing.container, easing: this.config.easing, fill: 'forwards'}
        );

        // Cleanup after both animations settle
        const allDone = Promise.all([this.flipAnimation.finished, this.containerAnimation.finished]);

        allDone
          .then(() => {
            if (!this.classList.contains('is-open')) return;
            clone.remove();
            this.submitButton.classList.remove('search-popdown__submit--flip-hidden');

            this.flipAnimation?.cancel();
            this.containerAnimation?.cancel();
            this.flipAnimation = null;
            this.containerAnimation = null;

            this.popdown.style.clipPath = '';
            this.popdown.style.opacity = '';
            this.classList.remove('is-animating');
            this.a11y.trapFocus(this.popdown, {
              elementToFocus: this.popdown.querySelector('input:not([type="hidden"])'),
            });
          })
          .catch(() => {});
      }

      unlockScroll() {
        if (!this.mobileMenu) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      close() {
        if (!this.classList.contains('is-open')) return;

        this.cancelRunningAnimations();
        document.body.removeEventListener('click', this.onBodyClickEvent);

        if (prefersReducedMotion() || !this.triggerIcon || !this.destIcon) {
          this.classList.remove('is-open');
          this.popdownContainer.removeAttribute('open');
          this.a11y.removeTrapFocus();
          this.unlockScroll();
          return;
        }

        // Measure current state while popdown is still visible
        const popdownRect = this.popdown.getBoundingClientRect();
        const firstIconRect = this.destIcon.getBoundingClientRect();
        const triggerRect = this.summary.getBoundingClientRect();
        const lastIconRect = this.triggerIcon.getBoundingClientRect();

        // Fade out close button immediately so it doesn't snap
        this.closeButtonAnimation = this.popdownClose.animate([{opacity: 1}, {opacity: 1}], {duration: 120, easing: 'ease-out', fill: 'forwards'});

        // Keep popdown visible during the close animation
        this.classList.add('is-animating');
        this.classList.remove('is-open');

        // Calculate travel distance for adaptive timing
        const dx = lastIconRect.left + (lastIconRect.width - firstIconRect.width) / 2 - firstIconRect.left;
        const dy = lastIconRect.top + (lastIconRect.height - firstIconRect.height) / 2 - firstIconRect.top;
        const distance = Math.hypot(dx, dy);
        const timing = getDurations(distance, this.config);
        const closeDuration = Math.round(timing.flip * 0.8);

        // --- Reverse icon FLIP (24px dest -> 32px trigger) ---
        // Clone inside a wrapper clipped to the header bounds
        const clone = this.createClippedClone(this.destIcon, firstIconRect);
        this.submitButton.classList.add('search-popdown__submit--flip-hidden');
        this.triggerIcon.style.opacity = '0';

        const scale = lastIconRect.width / firstIconRect.width;

        this.flipAnimation = clone.animate([{transform: 'translate(0, 0) scale(1)'}, {transform: `translate(${dx}px, ${dy}px) scale(${scale})`}], {
          duration: closeDuration,
          easing: this.config.easing,
          fill: 'forwards',
        });

        // --- Container contraction via clip-path (X-axis only, matching open) ---
        const inset = this.getContainerInset(triggerRect, popdownRect);
        const headerEl = this.closest('[data-header-height]');
        const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;
        const bottomClip = headerRect ? Math.max(0, popdownRect.bottom - headerRect.bottom) : 0;
        const startClip = `inset(0px 0px ${bottomClip}px 0px round 0px)`;
        const endClip = `inset(0px ${inset.right}px ${bottomClip}px ${inset.left}px round 6px)`;

        this.containerAnimation = this.popdown.animate(
          [
            {clipPath: startClip, opacity: 1},
            {clipPath: endClip, opacity: 0},
          ],
          {duration: closeDuration, easing: this.config.easing, fill: 'forwards'}
        );

        const allDone = Promise.all([this.flipAnimation.finished, this.containerAnimation.finished, this.closeButtonAnimation.finished]);

        allDone
          .then(() => {
            this.flipAnimation?.cancel();
            this.containerAnimation?.cancel();
            this.closeButtonAnimation?.cancel();
            this.flipAnimation = null;
            this.containerAnimation = null;
            this.closeButtonAnimation = null;

            document.querySelectorAll('.flip-clone, .flip-clone-wrapper').forEach((el) => el.remove());
            this.submitButton.classList.remove('search-popdown__submit--flip-hidden');
            this.triggerIcon.style.opacity = '';
            this.popdownClose.style.opacity = '';
            this.popdown.style.clipPath = '';
            this.popdown.style.opacity = '';
            this.classList.remove('is-animating');
            this.popdownContainer.removeAttribute('open');
            this.a11y.removeTrapFocus();
            this.unlockScroll();
          })
          .catch(() => {});
      }
    }
  );
}
