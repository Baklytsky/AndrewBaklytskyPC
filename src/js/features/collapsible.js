import throttle from '../util/throttle';

const selectors = {
  single: '[data-collapsible-single]', // Add this attribute when we want only one item expanded at the same time
  trigger: '[data-collapsible-trigger]',
  content: '[data-collapsible-content]',
};

const classes = {
  isExpanded: 'is-expanded',
};

const attributes = {
  expanded: 'aria-expanded',
  controls: 'aria-controls',
  triggerMobile: 'data-collapsible-trigger-mobile',
  transitionOverride: 'data-collapsible-transition-override',
};

const settings = {
  animationDelay: 500,
};

const sections = {};

class Collapsible {
  constructor(container) {
    this.container = container;
    this.single = this.container.querySelector(selectors.single);
    this.triggers = this.container.querySelectorAll(selectors.trigger);
    this.resetHeightTimer = 0;
    this.isTransitioning = false;
    this.transitionOverride = this.container.hasAttribute(attributes.transitionOverride);
    this.collapsibleToggleEvent = (event) => throttle(this.collapsibleToggle(event), 1250);

    this.init();
  }

  init() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', this.collapsibleToggleEvent);
      trigger.addEventListener('keyup', this.collapsibleToggleEvent);
    });
  }

  collapsibleToggle(e) {
    e.preventDefault();

    const trigger = e.target.matches(selectors.trigger) ? e.target : e.target.closest(selectors.trigger);
    const dropdownId = trigger.getAttribute(attributes.controls);
    const dropdown = document.getElementById(dropdownId);
    const triggerMobile = trigger.hasAttribute(attributes.triggerMobile);
    const isExpanded = trigger.classList.contains(classes.isExpanded);
    const isSpace = e.code === theme.keyboardKeys.SPACE;
    const isEscape = e.code === theme.keyboardKeys.ESCAPE;
    const isMobile = window.innerWidth < theme.sizes.small;

    // Do nothing if transitioning
    if (this.isTransitioning && !this.transitionOverride) {
      return;
    }

    // Do nothing if any different than ESC and Space key pressed
    if (e.code && !isSpace && !isEscape) {
      return;
    }

    // Do nothing if ESC key pressed and not expanded or mobile trigger clicked and screen not mobile
    if ((!isExpanded && isEscape) || (triggerMobile && !isMobile)) {
      return;
    }

    this.isTransitioning = true;
    trigger.disabled = true;

    // When we want only one item expanded at the same time
    if (this.single) {
      this.triggers.forEach((otherTrigger) => {
        const isExpanded = otherTrigger.classList.contains(classes.isExpanded);

        if (trigger == otherTrigger || !isExpanded) return;

        const dropdownId = otherTrigger.getAttribute(attributes.controls);
        const dropdown = document.getElementById(dropdownId);

        requestAnimationFrame(() => {
          this.closeItem(dropdown, otherTrigger);
        });
      });
    }

    // requestAnimationFrame fixes content jumping when item is sliding down
    if (isExpanded) {
      requestAnimationFrame(() => {
        this.closeItem(dropdown, trigger);
      });
    } else {
      requestAnimationFrame(() => {
        this.openItem(dropdown, trigger);
      });
    }
  }

  openItem(dropdown, trigger) {
    let dropdownHeight = dropdown.querySelector(selectors.content).offsetHeight;

    this.setDropdownHeight(dropdown, dropdownHeight, trigger, true);
    trigger.classList.add(classes.isExpanded);
    trigger.setAttribute(attributes.expanded, true);

    trigger.dispatchEvent(
      new CustomEvent('theme:form:sticky', {
        bubbles: true,
        detail: {
          element: 'accordion',
        },
      })
    );
  }

  closeItem(dropdown, trigger) {
    let dropdownHeight = dropdown.querySelector(selectors.content).offsetHeight;

    requestAnimationFrame(() => {
      dropdownHeight = 0;
      this.setDropdownHeight(dropdown, dropdownHeight, trigger, false);
      trigger.classList.remove(classes.isExpanded);
    });

    this.setDropdownHeight(dropdown, dropdownHeight, trigger, false);
    trigger.classList.remove(classes.isExpanded);
    trigger.setAttribute(attributes.expanded, false);
  }

  setDropdownHeight(dropdown, dropdownHeight, trigger, isExpanded) {
    dropdown.style.height = `${dropdownHeight}px`;
    dropdown.setAttribute(attributes.expanded, isExpanded);
    dropdown.classList.toggle(classes.isExpanded, isExpanded);

    if (this.resetHeightTimer) {
      clearTimeout(this.resetHeightTimer);
    }

    if (dropdownHeight == 0) {
      this.resetHeightTimer = setTimeout(() => {
        dropdown.style.height = '';
      }, settings.animationDelay);
    }

    if (isExpanded) {
      this.resetHeightTimer = setTimeout(() => {
        dropdown.style.height = 'auto';
        this.isTransitioning = false;
      }, settings.animationDelay);
    } else {
      this.isTransitioning = false;
    }

    // Always remove trigger disabled attribute after animation completes
    setTimeout(() => {
      trigger.disabled = false;
    }, settings.animationDelay);
  }

  onUnload() {
    this.triggers.forEach((trigger) => {
      trigger.removeEventListener('click', this.collapsibleToggleEvent);
      trigger.removeEventListener('keyup', this.collapsibleToggleEvent);
    });
  }
}

const collapsible = {
  onLoad() {
    sections[this.id] = new Collapsible(this.container);
  },
  onUnload() {
    sections[this.id].onUnload();
  },
};

export {collapsible, Collapsible};
