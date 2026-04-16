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
    const resultsReveal = textReveal;
    return {flip, container, close, textReveal, textRevealOut, resultsReveal};
  }

  class SearchPopdownAnimator {
    constructor(host) {
      this.host = host;
      this.flipAnimation = null;
      this.containerAnimation = null;
      this.closeButtonAnimation = null;
      this.textRevealAnimation = null;
      this.resultsAnimation = null;
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
      if (this.closeButtonAnimation) {
        this.closeButtonAnimation.cancel();
        this.closeButtonAnimation = null;
      }
      if (this.textRevealAnimation) {
        this.textRevealAnimation.cancel();
        this.textRevealAnimation = null;
      }
      if (this.resultsAnimation) {
        this.resultsAnimation.cancel();
        this.resultsAnimation = null;
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
      if (el.popdownClose) el.popdownClose.style.opacity = '';
      if (el.inputHolder) el.inputHolder.style.opacity = '';
      if (el.predictiveSearchContainer) {
        el.predictiveSearchContainer.style.opacity = '';
        el.predictiveSearchContainer.style.visibility = '';
        el.predictiveSearchContainer.style.transition = '';
      }
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

      // FIRST: measure trigger positions before layout change
      const triggerRect = el.summary.getBoundingClientRect();
      const firstIconRect = el.triggerIcon.getBoundingClientRect();

      // Hide input text before popdown becomes visible
      if (el.inputHolder) el.inputHolder.style.opacity = '0';
      el.classList.add('is-animating');
      el.classList.add('is-open');

      // LAST: measure expanded popdown and destination icon
      const popdownRect = el.popdown.getBoundingClientRect();
      const lastIconRect = el.destIcon.getBoundingClientRect();

      // Calculate travel distance for adaptive timing
      const dx = lastIconRect.left + (lastIconRect.width - firstIconRect.width) / 2 - firstIconRect.left;
      const dy = lastIconRect.top + (lastIconRect.height - firstIconRect.height) / 2 - firstIconRect.top;
      const distance = Math.hypot(dx, dy);
      const timing = getDurations(distance, el.config);

      //  Icon FLIP (trigger icon size might be different than destination icon)
      const clone = this.createClone(el.triggerIcon, firstIconRect);
      el.triggerIcon.style.opacity = '0';
      el.submitButton.classList.add('search-popdown__submit--flip-hidden');

      const scale = lastIconRect.width / firstIconRect.width;

      this.flipAnimation = clone.animate([{transform: 'translate(0, 0) scale(1)'}, {transform: `translate(${dx}px, ${dy}px) scale(${scale})`}], {
        duration: timing.flip,
        easing: el.config.easing,
        fill: 'forwards',
      });

      //  Container expansion via clip-path (X-axis only)
      const inset = this.getContainerInset(triggerRect, popdownRect);
      const startClip = `inset(0px ${inset.right}px 0px ${inset.left}px round 6px)`;
      const endClip = 'inset(0px 0px 0px 0px round 0px)';

      this.containerAnimation = el.popdown.animate(
        [
          {clipPath: startClip, opacity: 0.8},
          {clipPath: endClip, opacity: 1},
        ],
        {duration: timing.container, easing: el.config.easing, fill: 'forwards'}
      );

      // Reveal input text once icon arrives (delayed to start after flip)
      if (el.inputHolder) {
        this.textRevealAnimation = el.inputHolder.animate(
          [
            {opacity: 0, transform: 'translateX(-8px)'},
            {opacity: 1, transform: 'translateX(0)'},
          ],
          {duration: 250, delay: timing.textReveal, easing: 'ease-out', fill: 'forwards'}
        );
      }

      // Check if results should be revealed after the FLIP completes
      const searchInput = el.popdown.querySelector('input[type="search"]');
      const hasSearchValue = searchInput && searchInput.value.trim().length > 0;
      const predictiveSearchEl = el.popdown.querySelector('predictive-search');

      // Wait for all animations to settle, then clean up
      const animations = [this.flipAnimation.finished, this.containerAnimation.finished];
      if (this.textRevealAnimation) animations.push(this.textRevealAnimation.finished);

      return Promise.all(animations)
        .then(() => {
          if (!el.classList.contains('is-open')) return;
          clone.remove();
          el.submitButton.classList.remove('search-popdown__submit--flip-hidden');
          this.flipAnimation?.cancel();
          this.containerAnimation?.cancel();
          this.textRevealAnimation?.cancel();
          this.flipAnimation = null;
          this.containerAnimation = null;
          this.textRevealAnimation = null;
          el.popdown.style.clipPath = '';
          el.popdown.style.opacity = '';
          if (el.inputHolder) el.inputHolder.style.opacity = '';
          el.classList.remove('is-animating');

          // Reveal results AFTER clip-path is removed (clip-path clips absolute children)
          if (hasSearchValue && el.predictiveSearchContainer && predictiveSearchEl) {
            el.predictiveSearchContainer.style.transition = 'none';
            el.predictiveSearchContainer.style.opacity = '0';
            el.predictiveSearchContainer.style.visibility = 'visible';
            predictiveSearchEl.setAttribute('open', 'true');
            this.resultsAnimation = el.predictiveSearchContainer.animate([{opacity: 0}, {opacity: 1}], {duration: timing.resultsReveal, easing: 'ease-out', fill: 'forwards'});
            this.resultsAnimation.finished
              .then(() => {
                this.resultsAnimation?.cancel();
                this.resultsAnimation = null;
                if (el.predictiveSearchContainer) {
                  el.predictiveSearchContainer.style.opacity = '';
                  el.predictiveSearchContainer.style.visibility = '';
                  el.predictiveSearchContainer.style.transition = '';
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    close() {
      const el = this.host;

      // Measure current state while popdown is still visible
      const popdownRect = el.popdown.getBoundingClientRect();
      const firstIconRect = el.destIcon.getBoundingClientRect();
      const triggerRect = el.summary.getBoundingClientRect();
      const lastIconRect = el.triggerIcon.getBoundingClientRect();

      // Fade out close button immediately so it doesn't snap
      this.closeButtonAnimation = el.popdownClose.animate([{opacity: 1}, {opacity: 0}], {duration: 120, easing: 'ease-out', fill: 'forwards'});

      // Keep popdown visible during the close animation
      el.classList.add('is-animating');
      el.classList.remove('is-open');

      // Calculate travel distance for adaptive timing
      const dx = lastIconRect.left + (lastIconRect.width - firstIconRect.width) / 2 - firstIconRect.left;
      const dy = lastIconRect.top + (lastIconRect.height - firstIconRect.height) / 2 - firstIconRect.top;
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

      //  Reverse icon FLIP
      const clone = this.createClippedClone(el.destIcon, firstIconRect);
      el.submitButton.classList.add('search-popdown__submit--flip-hidden');
      el.triggerIcon.style.opacity = '0';

      const scale = lastIconRect.width / firstIconRect.width;

      this.flipAnimation = clone.animate([{transform: 'translate(0, 0) scale(1)'}, {transform: `translate(${dx}px, ${dy}px) scale(${scale})`}], {
        duration: timing.close,
        easing: el.config.easing,
        fill: 'forwards',
      });

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

      return Promise.all([this.flipAnimation.finished, this.containerAnimation.finished, this.closeButtonAnimation.finished])
        .then(() => {
          this.flipAnimation?.cancel();
          this.containerAnimation?.cancel();
          this.closeButtonAnimation?.cancel();
          this.textRevealAnimation?.cancel();
          this.resultsAnimation?.cancel();
          this.flipAnimation = null;
          this.containerAnimation = null;
          this.closeButtonAnimation = null;
          this.textRevealAnimation = null;
          this.resultsAnimation = null;
          document.querySelectorAll('.flip-clone, .flip-clone-wrapper').forEach((node) => node.remove());
          el.submitButton.classList.remove('search-popdown__submit--flip-hidden');
          el.triggerIcon.style.opacity = '';
          el.popdownClose.style.opacity = '';
          if (el.inputHolder) el.inputHolder.style.opacity = '';
          if (el.predictiveSearchContainer) {
            el.predictiveSearchContainer.style.opacity = '';
            el.predictiveSearchContainer.style.visibility = '';
            el.predictiveSearchContainer.style.transition = '';
          }
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
        this.submitButton = this.popdown.querySelector('.search-popdown__submit');
        this.destIcon = this.submitButton?.querySelector('.icon-search');
        this.inputHolder = this.popdown.querySelector('.input-holder');
        this.predictiveSearchContainer = this.popdown.querySelector('.predictive-search');
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

        if (prefersReducedMotion() || !this.triggerIcon || !this.destIcon) {
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
        this.closePredictiveSearch();

        if (prefersReducedMotion() || !this.triggerIcon || !this.destIcon) {
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

      closePredictiveSearch() {
        const predictiveSearch = this.popdown.querySelector('predictive-search');
        if (!predictiveSearch) return;
        if (predictiveSearch.isOpen || predictiveSearch.hasAttribute('open')) {
          predictiveSearch.close();
        }
      }
    }
  );
}
