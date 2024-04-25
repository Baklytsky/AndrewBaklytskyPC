import throttle from '../util/throttle';

const selectors = {
  tooltip: '[data-tooltip]',
  tooltipContainer: '[data-tooltip-container]',
  tooltipArrow: '[data-tooltip-arrow]',
  aos: '[data-aos]',
};

const classes = {
  root: 'tooltip-default',
  isAnimating: 'is-animating',
  visible: 'is-visible',
  hiding: 'is-hiding',
};

const attributes = {
  aos: 'data-aos',
  tooltip: 'data-tooltip',
  tooltipContainer: 'data-tooltip-container',
  tooltipStopMouseEnter: 'data-tooltip-stop-mouseenter',
};

const sections = {};

class Tooltip {
  constructor(el) {
    this.tooltip = el;
    if (!this.tooltip.hasAttribute(attributes.tooltip)) {
      return;
    }

    this.rootClass = classes.root;
    this.isAnimatingClass = classes.isAnimating;
    this.label = this.tooltip.getAttribute(attributes.tooltip);
    this.transitionSpeed = 200;
    this.hideTransitionTimeout = 0;
    this.animatedContainer = this.tooltip.closest(selectors.aos);
    this.addPinEvent = () => this.addPin();
    this.addPinMouseEvent = () => this.addPin(true);
    this.removePinEvent = (event) => throttle(this.removePin(event), 50);
    this.removePinMouseEvent = (event) => this.removePin(event, true, true);
    this.init();
  }

  init() {
    if (!document.querySelector(selectors.tooltipContainer)) {
      const tooltipTemplate = `<div class="${this.rootClass}__inner"><div class="${this.rootClass}__arrow" data-tooltip-arrow></div><div class="${this.rootClass}__text label-typography"></div></div>`;
      const tooltipElement = document.createElement('div');
      tooltipElement.className = `${this.rootClass} ${this.isAnimatingClass}`;
      tooltipElement.setAttribute(attributes.tooltipContainer, '');
      tooltipElement.innerHTML = tooltipTemplate;
      document.body.appendChild(tooltipElement);
    }

    this.tooltip.addEventListener('mouseenter', this.addPinMouseEvent);
    this.tooltip.addEventListener('mouseleave', this.removePinMouseEvent);
    this.tooltip.addEventListener('theme:tooltip:init', this.addPinEvent);
    document.addEventListener('theme:tooltip:close', this.removePinEvent);

    const tooltipTarget = document.querySelector(selectors.tooltipContainer);

    if (theme.settings.animations && this.animatedContainer) {
      if (this.animatedContainer.getAttribute(attributes.aos) === 'hero') {
        // Used for PDP and Featured product section
        this.animatedContainer.addEventListener('animationend', () => {
          tooltipTarget.classList.remove(classes.isAnimating);
        });
      } else {
        this.animatedContainer.addEventListener('transitionend', (event) => {
          // This will fire the event when the last transition end
          if (event.propertyName === 'transform') {
            tooltipTarget.classList.remove(classes.isAnimating);
          }
        });
      }
    }
  }

  addPin(stopMouseEnter = false) {
    const tooltipTarget = document.querySelector(selectors.tooltipContainer);
    const tooltipTargetArrow = tooltipTarget.querySelector(selectors.tooltipArrow);

    if (tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(attributes.tooltipStopMouseEnter)) || !stopMouseEnter)) {
      const tooltipTargetInner = tooltipTarget.querySelector(`.${this.rootClass}__inner`);
      const tooltipTargetText = tooltipTarget.querySelector(`.${this.rootClass}__text`);
      tooltipTargetText.textContent = this.label;

      const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
      const tooltipRect = this.tooltip.getBoundingClientRect();
      const tooltipTop = tooltipRect.top;
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;
      const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
      let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
      let tooltipArrowPositionLeft = '50%';
      const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
      const tooltipTargetWindowDifference = tooltipLeftWithWidth - window.innerWidth;

      if (tooltipTargetWindowDifference > 0) {
        tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
      }

      if (tooltipTargetPositionLeft < 0) {
        tooltipArrowPositionLeft = `calc(50% + ${tooltipTargetPositionLeft}px)`;
        tooltipTargetPositionLeft = 0;
      }

      tooltipTargetArrow.style.left = tooltipArrowPositionLeft;
      tooltipTarget.style.transform = `translate(${tooltipTargetPositionLeft}px, ${tooltipTargetPositionTop}px)`;

      tooltipTarget.classList.remove(classes.hiding);
      const onTooltipHiding = (event) => {
        if (event.target !== tooltipTargetInner) return;
        if (event.propertyName === 'transform' || event.propertyName === 'opacity') {
          requestAnimationFrame(() => (tooltipTarget.style.transform = 'translate(0, -100%)'));
        }
        tooltipTarget.removeEventListener('transitionend', onTooltipHiding);
      };
      tooltipTarget.addEventListener('transitionend', onTooltipHiding);

      tooltipTarget.classList.add(classes.visible);

      document.addEventListener('theme:scroll', this.removePinEvent);
    }
  }

  removePin(event, stopMouseEnter = false, hideTransition = false) {
    const tooltipTarget = document.querySelector(selectors.tooltipContainer);
    const tooltipVisible = tooltipTarget.classList.contains(classes.visible);

    if (tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(attributes.tooltipStopMouseEnter)) || !stopMouseEnter)) {
      if (tooltipVisible && (hideTransition || event.detail.hideTransition)) {
        tooltipTarget.classList.add(classes.hiding);

        if (this.hideTransitionTimeout) {
          clearTimeout(this.hideTransitionTimeout);
        }

        this.hideTransitionTimeout = setTimeout(() => {
          tooltipTarget.classList.remove(classes.hiding);
        }, this.transitionSpeed);
      }

      tooltipTarget.classList.remove(classes.visible);

      document.removeEventListener('theme:scroll', this.removePinEvent);
    }
  }

  unload() {
    this.tooltip.removeEventListener('mouseenter', this.addPinMouseEvent);
    this.tooltip.removeEventListener('mouseleave', this.removePinMouseEvent);
    this.tooltip.removeEventListener('theme:tooltip:init', this.addPinEvent);
    document.removeEventListener('theme:tooltip:close', this.removePinEvent);
    document.removeEventListener('theme:scroll', this.removePinEvent);
  }
}

const tooltip = {
  onLoad() {
    sections[this.id] = [];
    const tooltips = this.container.querySelectorAll(selectors.tooltip);
    tooltips.forEach((tooltip) => {
      sections[this.id].push(new Tooltip(tooltip));
    });
  },
  onUnload() {
    sections[this.id].forEach((tooltip) => {
      if (typeof tooltip.unload === 'function') {
        tooltip.unload();
      }
    });
  },
};

export {tooltip, Tooltip};
