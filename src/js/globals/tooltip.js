if (!customElements.get('tooltip-component')) {
  customElements.define(
    'tooltip-component',
    class Tooltip extends HTMLElement {
      constructor() {
        super();

        this.label = this.hasAttribute('data-tooltip') ? this.getAttribute('data-tooltip') : '';
        this.transitionSpeed = 200;
        this.hideTransitionTimeout = 0;
        this.addPinEvent = () => this.addPin();
        this.addPinMouseEvent = () => this.addPin(true);
        this.removePinEvent = (event) => window.theme.throttle(this.removePin(event), 50);
        this.removePinMouseEvent = (event) => this.removePin(event, true, true);
      }

      connectedCallback() {
        if (!document.querySelector('.tooltip-default')) {
          const tooltipTemplate = '<div class="tooltip-default__arrow"></div><div class="tooltip-default__inner"><div class="tooltip-default__text"></div></div>';
          const tooltipElement = document.createElement('div');
          tooltipElement.className = 'tooltip-default';
          tooltipElement.innerHTML = tooltipTemplate;
          document.body.appendChild(tooltipElement);
        }

        this.addEventListener('mouseenter', this.addPinMouseEvent);
        this.addEventListener('mouseleave', this.removePinMouseEvent);
        this.addEventListener('pointerleave', this.removePinMouseEvent);
        this.addEventListener('theme:tooltip:init', this.addPinEvent);
        document.addEventListener('theme:tooltip:close', this.removePinEvent);
        this.onVariantChangeUnsubscriber = subscribe(theme.PUB_SUB_EVENTS.optionValueSelectionChange, this.removePin.bind(this, true, false));
      }

      addPin(stopMouseEnter = false) {
        const tooltipTarget = document.querySelector('.tooltip-default');

        const section = this.closest('[data-section-id]');
        const colorSchemeClass = Array.from(section.classList).find((cls) => cls.startsWith('color-scheme-'));
        tooltipTarget?.classList.add(colorSchemeClass); // add the section's color scheme class to the tooltip

        if (this.label && tooltipTarget && ((stopMouseEnter && !this.hasAttribute('data-tooltip-stop-mouseenter')) || !stopMouseEnter)) {
          const tooltipTargetArrow = tooltipTarget.querySelector('.tooltip-default__arrow');
          const tooltipTargetInner = tooltipTarget.querySelector('.tooltip-default__inner');
          const tooltipTargetText = tooltipTarget.querySelector('.tooltip-default__text');
          tooltipTargetText.innerHTML = this.label;

          const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
          const tooltipRect = this.getBoundingClientRect();
          const tooltipTop = tooltipRect.top;
          const tooltipWidth = tooltipRect.width;
          const tooltipHeight = tooltipRect.height;
          const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
          let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
          const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
          const sideOffset = 24;
          const tooltipTargetWindowDifference = tooltipLeftWithWidth - window.theme.getWindowWidth() + sideOffset;

          if (tooltipTargetWindowDifference > 0) {
            tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
          }

          if (tooltipTargetPositionLeft < 0) {
            tooltipTargetPositionLeft = 0;
          }

          tooltipTargetArrow.style.left = `${tooltipRect.left + tooltipWidth / 2}px`;
          tooltipTarget.style.setProperty('--tooltip-top', `${tooltipTargetPositionTop}px`);

          tooltipTargetInner.style.transform = `translateX(${tooltipTargetPositionLeft}px)`;
          tooltipTarget.classList.remove('is-hiding');
          tooltipTarget.classList.add('is-visible');

          document.addEventListener('theme:scroll', this.removePinEvent);
        }
      }

      removePin(event, stopMouseEnter = false, hideTransition = false) {
        const tooltipTarget = document.querySelector('.tooltip-default');
        const tooltipVisible = tooltipTarget.classList.contains('is-visible');

        if (tooltipTarget && ((stopMouseEnter && !this.hasAttribute('data-tooltip-stop-mouseenter')) || !stopMouseEnter)) {
          if (tooltipVisible && (hideTransition || (event && event.detail && event.detail.hideTransition))) {
            tooltipTarget.classList.add('is-hiding');

            if (this.hideTransitionTimeout) {
              clearTimeout(this.hideTransitionTimeout);
            }

            this.hideTransitionTimeout = setTimeout(() => {
              tooltipTarget.classList.remove('is-hiding');
            }, this.transitionSpeed);
          }

          tooltipTarget.classList.remove('is-visible');

          document.removeEventListener('theme:scroll', this.removePinEvent);
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        document.removeEventListener('theme:tooltip:close', this.removePinEvent);
        document.removeEventListener('theme:scroll', this.removePinEvent);
      }
    }
  );
}
