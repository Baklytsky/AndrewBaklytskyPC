//Common static properties shared across the plugin.
const PROPERTIES = {
  direction: {
    up: 'up',
    down: 'down'
  }
};
const EVENT_NAMES = {
  init: 'init',
  active: 'active',
  inactive: 'inactive',
  frozen: 'frozen',
  docked: 'docked',
  undocked: 'undocked',
  stuck: 'stuckBottom',
  unstuck: 'unstuckBottom',
  directionChange: 'scrollDirectionUpdate',
};
const DEFAULTS = {
  enabled: true,
  classScope: 'stickie',
  eventScope: 'stickie',
  contained: false,
  autoWidth: true,
  offset: 0,
  offsetEl: null,
  applyOffset: true,
  waitUntilScrolled: true,
  heightThereshold: 25,
  enableDirectionUpdates: false,
  //Milliseconds to wait after the last scroll happened.
  scrollDirectionResetWait: 20,
  //Minimum distance to scroll within the "wait" period.
  scrollPositionThereshold: 80,
  fromViewportBottom: false,
  reversePlaceholderBehavior: false,
  camelCaseEvents: false,
};
const INSTANCES = new Map();

export default class Stickie {
  /**
   * Return a single matching instance of the plugin.
   */
  static get(el) {
    return INSTANCES.get(el);
  }

  /**
   * Return all the current instances of the plugin.
   */
  static getAll() {
    return INSTANCES;
  }

  /**
   * Returns an array of the allowed option list.
   * Any option not in this array can be considered unsuported.
   */
  static getOptionList() {
    return Object.keys(DEFAULTS);
  }

  /**
   * Returns an array of the supported events names.
   * Set `transform` to true to format the event names to the preferred output.
   */
  static getEventList(transform) {
    return Object.keys(EVENT_NAMES).map(eventName => {
      return transform ? Stickie.toCamelCase(EVENT_NAMES[eventName]) : EVENT_NAMES[eventName];
    });
  }

  static toCamelCase(name) {
    return `${name[0].toUpperCase()}${name.substring(1)}`;
  }

  constructor(el, options = {}) {
    this.options = { ...DEFAULTS, ...options };

    this.stickyEl = this.getEl(el) || null;

    if (!this.stickyEl) {
      console.warn('No element or seletor provided for Stickie. One must be provided as the first argument.');

      return false;
    }

    //Store these methods as "bound" properties so that they can be easily detached later in the plugin's lifecycle.
    this._boundUpdateSticky = this.updateSticky.bind(this, false);
    this._boundEnableSticky = this.enableSticky.bind(this);

    if (typeof this.options.enabled === 'string') {
      this.mediaQueryListener = window.matchMedia(this.options.enabled);

      this.mediaQueryListener.addEventListener('change', this._boundEnableSticky);

      this.enableSticky(this.mediaQueryListener);
    } else {
      this.enableSticky({
        matches: !!this.options.enabled,
      });
    }

    INSTANCES.set(this.stickyEl, this);
  }

  /**
   * Fired on a per-viewport basis if a media query is provided, or automatically if `this.options.enabled` is set to `true`.
   */
  enableSticky(evt) {
    if (!this.isEnabled && evt.matches) {
      this.isEnabled = true;

      if (!this.initialized) {
        this.initialize();
      }

      this.setOffsetValue();

      window.addEventListener('scroll', this._boundUpdateSticky, { passive: true });

      this._stickyElResizeObserver ? this._stickyElResizeObserver.observe(this.stickyEl) : '';
      this._placeholderElResizeObserver ? this._placeholderElResizeObserver.observe(this.placeholderEl) : '';

      this.updateSticky();
    } else if (this.isEnabled && !evt.matches) {
      this.isEnabled = false;

      this.setInactive();

      window.removeEventListener('scroll', this._boundUpdateSticky, { passive: true });

      this._stickyElResizeObserver ? this._stickyElResizeObserver.unobserve(this.stickyEl) : '';
      this._placeholderElResizeObserver ? this._placeholderElResizeObserver.unobserve(this.placeholderEl) : '';
    }
  }

  /**
   * Initial setup. Should only run once to avoid attaching repeated event handlers.
   */
  initialize() {
    this.initialized = true;
    this.renderPlaceholder();

    if (this.options.offsetEl) {
      this.offsetElements = this.getOffsetElements();
    }

    this.containerEl = this.options.contained ? (this.getEl(this.options.contained) || this.stickyEl.parentNode) : null;
    this.autoWidthEl = this.options.autoWidth ? (this.getEl(this.options.autoWidth) || this.placeholderEl) : null;

    if (this.containerEl) {
      this.containerEl.style.position = 'relative';
    }

    if (typeof window.ResizeObserver === 'function') {
      this._stickyElResizeObserver = new ResizeObserver(this.debounce((entries) => {
        this.updateSticky();

        if (this.isActive || this.isFrozen) {
          this.setPlaceholderProps(!this.options.reversePlaceholderBehavior);
        }
      }));

      if (this.autoWidthEl) {
        this._placeholderElResizeObserver = new ResizeObserver(this.debounce(this.syncStickyElWidth.bind(this)));
      }
    }

    this.scrollPosition = 0;

    if (this.options.enableDirectionUpdates) {
      this._debouncedDirectionReset = this.debounce(() => {
        this._prevScrollPosition = this._placeholderElRect.top;
      }, this.options.scrollDirectionResetWait);
    }

    this.publishEvent(EVENT_NAMES.init);

    this.stickyEl.addEventListener('sticky:syncWidth', this.syncStickyElWidth.bind(this));
    this.stickyEl.addEventListener('sticky:updateScrollDirection', function(evt) {
      this.updateScrollDirection(evt.detail.scrollDirection);
    }.bind(this));
  }

  /**
   * Sets all flags to off, removes all CSS classes, styles, event listeners, and elements created by the plugin.
   * Removes instance from the map.
   */
  destroy() {
    if (this.initialized) {
      this.initialized = false;
      this.isEnabled = false;

      this.setInactive();

      if (this.containerEl) {
        this.containerEl.style.position = '';
      }

      window.removeEventListener('scroll', this._boundUpdateSticky, { passive: true });

      this._stickyElResizeObserver ? this._stickyElResizeObserver.unobserve(this.stickyEl) : '';
      this._placeholderElResizeObserver ? this._placeholderElResizeObserver.unobserve(this.placeholderEl) : '';

      this.removePlaceholder();
    }

    //This event is attached even if the plugin is not initialized, since there might be per-viewport checks.
    if (this.mediaQueryListener) {
      this.mediaQueryListener.removeEventListener('change', this._boundEnableSticky);
    }

    //Instances are pushed before initialization so that the plugin can be always accessible, if needed.
    INSTANCES.delete(this.stickyEl);
  }

  /**
   * Returns an HTMLElement instance or null.
   * If the provided `elOrSelector` is a String, attempts to find it in the DOM.
   */
  getEl(elOrSelector) {
    if (typeof elOrSelector === 'string') {
      return document.querySelector(elOrSelector);
    } else if (elOrSelector instanceof HTMLElement) {
      return elOrSelector;
    }

    return null;
  }

  /**
   * Attempts to get the reference offset element's height, otherwise returns the current offset value or zero.
   */
  setOffsetValue() {
    let resultSum = 0;

    if (this.offsetElements instanceof NodeList) {
      [].forEach.call(this.offsetElements, function(currentEl) {
        resultSum += Math.round(currentEl.getBoundingClientRect().height);
      });
    }

    resultSum += this.options.offset

    return this.offset = resultSum;
  }

  getOffsetElements() {
    return typeof this.options.offsetEl === 'string' ? document.querySelectorAll(this.options.offsetEl) : this.options.offsetEl;
  }

  /**
   * Updates the status of the sticky object according to where it is on the current scroll.
   */
  updateSticky() {
    //Kill updates early if the plugin is not initialized.
    if (!this.initialized) {
      return false;
    }

    this.setRectangles();

    //Set a property for the directional start location depending on whether or not `fromViewportBottom` is set to TRUE.
    this._scrollListeningStart = this.options.fromViewportBottom ? (this._placeholderElRect.top + this._stickyElRect.height - Math.max(window.innerHeight, document.documentElement.clientHeight)) : this._placeholderElRect.top;

    //The first portion of the following conditional checks if the target is smaller than its parent.
    //Then it makes sure that the entirety of the target element is visible on screen before applying the fixed status.

    if ((!this.containerEl || (this._stickyElRect.height < this._containerElRect.height)) && this._scrollListeningStart < this.offset) {
      this.getScrollDirection();

      this.toggletFullyScrolled(this._placeholderElRect.top + this._stickyElRect.height < this.offset);

      //Only request to change the direction if this flag is on.
      //This prevents potentially taxing calculations.
      if (this.options.enableDirectionUpdates) {
        this.requestScrollDirectionUpdate(this.currentScrollDirection);
      }

      if (this.checkIfTallerThanViewport() && this.options.waitUntilScrolled) {
        this.setIsTall();

        if (this.currentScrollDirection === PROPERTIES.direction.down) {
          if (Math.round(this._stickyElRect.bottom) <= Math.max(window.innerHeight, document.documentElement.clientHeight)) {
            this.setActive(true);
          } else if (this.isActive && !this.isDocked && !this.shouldDock()) {
            this.setFrozen();
          }
        } else {
          if (Math.round(this._stickyElRect.top) >= this.offset) {
            this.setActive();
          } else if (this.isActive && !this.isDocked && !this.shouldDock()) {
            this.setFrozen();
          }
        }
      } else {
        this.unsetIsTall();

        this.setActive();
      }

      this.constrainScroll();
    } else if(this.isActive) {
      this.setInactive();
    }
  }

  /**
   * Updates the commonly-used rectangles for this plugin.
   */
  setRectangles() {
    this._stickyElRect = this.stickyEl.getBoundingClientRect();
    this._placeholderElRect = this.placeholderEl.getBoundingClientRect();
    this._containerElRect = this.containerEl ? this.containerEl.getBoundingClientRect() : {};
  }

  /**
   * Constrains the target element's scroll to the inside of a defined parent [container] element.
   */
  constrainScroll() {
    if (this.containerEl && this.isActive) {
      //Update the rectangles before deciding whether to dock or not.
      //This prevents the target from jumping around outside its container.
      this.setRectangles();

      //Make sure bottom of parent is visible, then ensure the target and the parent's bottom are at the same level, then confirm the window's offset is not over the target
      if (this.shouldDock()) {
        this.setDocked();
      } else if(this.isDocked && this._stickyElRect.top >= this.offset) {
        this.unsetDocked();
      }
    }
  }

  shouldDock() {
    return this._containerElRect.bottom <= document.documentElement.clientHeight && this._stickyElRect.bottom >= this._containerElRect.bottom && (this.isStuckBottom || this._stickyElRect.top <= this.offset);
  }

  /**
   * Sets the target's 'top' style property to the offset value.
   */
  applyOffset() {
    if (this.options.applyOffset) {
      this.stickyEl.style.top = `${this.offset}px`;
    }
  }

  /**
   * Adapts target's width according to the `this.autoWidthEl` width.
   * Necessary since `position: fixed` elements typically respond to the window.
   */
  syncStickyElWidth() {
    if (this.isActive || this.isFrozen) {
      const autoWidthComputed = window.getComputedStyle(this.autoWidthEl);
      const autoWidthValue = this.autoWidthEl.getBoundingClientRect().width - parseFloat(autoWidthComputed['padding-left']) - parseFloat(autoWidthComputed['padding-right']);

      this.stickyEl.style.width = `${autoWidthValue}px`;
    }
  }

  /**
   * If 'stickToBottom' is set to true, the fixed element is attached to the bottom of its container.
   */
  setActive(stickToBottom) {
    //Avoid unnecessary recalculations if setting the isActive state again.
    if (!this.isActive) {
      this.isActive = true;

      this.unsetFrozen();

      //If `reversePlaceholderBehavior` is set to TRUE, set placeholder's dimensions to 0, otherwise calculate and set its dimensions;
      this.setPlaceholderProps(!this.options.reversePlaceholderBehavior);
      this.stickyEl.classList.add(`${this.options.classScope}--active`);

      this.setStickyStyles();

      if (stickToBottom) {
        this.setStuckBottom();
      }

      if (this.autoWidthEl) {
        this.syncStickyElWidth();
      } else {
        this.stickyEl.style.width = '100%';
      }

      this.publishEvent(EVENT_NAMES.active);
    }
  }

  //Removes all statuses/settings from the sticky object
  setInactive() {
    this.isActive = false;

    this.unsetStuckBottom();
    this.unsetIsTall();

    //If `reversePlaceholderBehavior` is set to TRUE, calculate and set the placeholder's dimensions, otherwise reset to 0;
    this.setPlaceholderProps(this.options.reversePlaceholderBehavior && this.isEnabled);

    this.stickyEl.classList.remove(`${this.options.classScope}--active`);
    this.stickyEl.classList.remove(`${this.options.classScope}--docked`);
    this.stickyEl.classList.remove(`${this.options.classScope}--frozen`);
    this.stickyEl.classList.remove(`${this.options.classScope}--scrolled`);

    this.removeDirectionUpdates();

    this.scrollPosition = 0;

    this.removeStickyElStyles();

    this.publishEvent(EVENT_NAMES.inactive);
  }

  /**
   * Freezes the sticky element at its current position relative to its container (`this.options.contained` is `true`).
   * This applies when the sticky element is taller than the viewport and user must scroll to see the entirety of it (`this.options.waitUntilScrolled` is `true`).
   */
  setFrozen() {
    this.isActive = false;
    this.isFrozen = true;

    this.stickyEl.classList.remove(`${this.options.classScope}--active`);
    this.stickyEl.classList.add(`${this.options.classScope}--frozen`);

    this.unsetStuckBottom();

    this.stickyEl.style.position = 'absolute';
    this.stickyEl.style.top = `${Math.abs(this._containerElRect.top - this._stickyElRect.top)}px`;
    this.stickyEl.style.bottom = '';

    this.publishEvent(EVENT_NAMES.frozen);
  }

  unsetFrozen() {
    this.isFrozen = false;

    this.stickyEl.classList.remove(`${this.options.classScope}--frozen`);
  }

  /**
   * Signals that the sticky element has reached the bottom of its container (`this.options.contained` is `true`),
   * and must stop scrolling, thus "docked".
   */
  setDocked() {
    this.isDocked = true;
    this.stickyEl.classList.add(`${this.options.classScope}--docked`);

    this.unsetStuckBottom();

    this.stickyEl.style.position = 'absolute';
    this.stickyEl.style.top = '';
    this.stickyEl.style.bottom = 0;

    this.publishEvent(EVENT_NAMES.docked);
  }

  unsetDocked() {
    this.isDocked = false;
    this.stickyEl.classList.remove(`${this.options.classScope}--docked`);

    this.setStickyStyles();

    this.publishEvent(EVENT_NAMES.undocked);
  }

  /**
   * Called when the sticky element is fixed/stuck to the bottom of the viewport.
   * That is, scrolls with the user but from the bottom of the viewport instead than from the top.
   */
  setStuckBottom() {
    this.isStuckBottom = true;

    this.stickyEl.style.top = '';
    this.stickyEl.style.bottom = 0;

    this.stickyEl.classList.add(`${this.options.classScope}--stuck-bottom`);

    this.publishEvent(EVENT_NAMES.stuck);
  }

  unsetStuckBottom() {
    this.isStuckBottom = false;

    this.stickyEl.classList.remove(`${this.options.classScope}--stuck-bottom`);

    this.publishEvent(EVENT_NAMES.unstuck);
  }

  setIsTall() {
    this.isTall = true;

    this.stickyEl.classList.add(`${this.options.classScope}--is-tall`);
  }

  unsetIsTall() {
    this.isTall = false;

    this.stickyEl.classList.remove(`${this.options.classScope}--is-tall`);
  }

  setStickyStyles() {
    this.stickyEl.style.position = 'fixed';
    this.stickyEl.style.top = 0;
    this.stickyEl.style.bottom = '';

    this.applyOffset();
  }

  removeStickyElStyles() {
    this.stickyEl.style.position = '';
    this.stickyEl.style.top = '';
    this.stickyEl.style.bottom = '';
    this.stickyEl.style.width = '';
  }

  removeDirectionUpdates() {
    if (this.options.enableDirectionUpdates) {
      this.stickyEl.classList.remove(`${this.options.classScope}--scroll-${PROPERTIES.direction.up}`);
      this.stickyEl.classList.remove(`${this.options.classScope}--scroll-${PROPERTIES.direction.down}`);
      this.stickyEl.classList.remove(`${this.options.classScope}--scroll-direction-change`);

      delete this._prevScrollDirection;
    }
  }

  /**
   * Creates a "placeholder" element that will take the height (including padding) and margin properties of
   * the target element and is used to avoid a jump when scrolling down and activating the 'fixed' status
   */
  renderPlaceholder() {
    this.placeholderEl = document.createElement('div');

    this.placeholderEl.className = `${this.options.classScope}-placeholder`;

    this.stickyEl.parentNode.insertBefore(this.placeholderEl, this.stickyEl);
  }

  /*
  * Removes the placeholder element.
   */
  removePlaceholder() {
    this.placeholderEl.parentNode.removeChild(this.placeholderEl);

    this.placeholderEl = null;
  }

  /**
   * Updates placeholder properties
   * @param {[boolean]} sync [either sets or resets values]
   */
  setPlaceholderProps(sync) {
    if (this.placeholderEl) {
      if (sync) {
        this.placeholderEl.style.height = `${this._stickyElRect.height}px`;
        this.placeholderEl.style.margin = window.getComputedStyle(this.stickyEl).margin;
      } else {
        this.placeholderEl.style.height = '';
        this.placeholderEl.style.margin = '';
      }
    }
  }

  /**
   * Determines if the sticky element is currently taller than the viewport.
   * This takes into account any offsets, as well as height theresholds configured (if any).
   */
  checkIfTallerThanViewport() {
    return (this._stickyElRect.height + this.offset) > (document.documentElement.clientHeight + this.options.heightThereshold);
  }

  //This method needs revision:
  //Position is not properly reported on certain browsers when using window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  getScrollDirection() {
    //Do not set a direction if there is no difference between these two values.
    if (this.scrollPosition > this._placeholderElRect.top) {
      this.currentScrollDirection = PROPERTIES.direction.down;
    } else if (this.scrollPosition < this._placeholderElRect.top) {
      this.currentScrollDirection = PROPERTIES.direction.up;
    }

    this.scrollPosition = this._placeholderElRect.top;

    return this.currentScrollDirection;
  }

  /**
   * Attempts to update the scroll direction, but only if all the configured options are met.
   * @param  {String} newScrollDirection ["up" or "down"]
   */
  requestScrollDirectionUpdate(newScrollDirection) {
    this._updateScrollDirectionOnThreshold(newScrollDirection);

    //Set a timeout to ensure that the last position is stored after the user stops scrolling.
    this._debouncedDirectionReset();
  }

  /**
   * Internal function to ensure the scroll position difference between the last two locations is larger than the configured threshold.
   * @param  {String} newScrollDirection ["up" or "down"]
   */
  _updateScrollDirectionOnThreshold(newScrollDirection) {
    //Scroll position difference between the new location and the
    //location the Stickie target had the last time a "direction change" was succesfully executed.
    this._diffScrollPosition = Math.abs(this._placeholderElRect.top - (this._prevScrollPosition || 0));

    if (this._diffScrollPosition > this.options.scrollPositionThereshold) {
      this.updateScrollDirection(newScrollDirection);
    }
  }

  /**
   * Update the Stickie target state with the provided `newScrollDirection` value.
   * @param  {String} newScrollDirection ["up" or "down"]
   */
  updateScrollDirection(newScrollDirection) {
    this.publishEvent(EVENT_NAMES.directionChange, {
      previousDirection: this._prevScrollDirection,
      newDirection: newScrollDirection,
    });

    if (this._prevScrollDirection !== newScrollDirection) {
      this.stickyEl.classList.add(`${this.options.classScope}--scroll-${newScrollDirection}`);
      this.stickyEl.classList.remove(`${this.options.classScope}--scroll-${this._prevScrollDirection}`);

      //Attach a special class when the direction has changed at least once.
      //We know this happens whenever a `this._prevScrollDirection` is available.
      if (this._prevScrollDirection) {
        this.stickyEl.classList.add(`${this.options.classScope}--scroll-direction-change`);
      }

      this._prevScrollDirection = newScrollDirection;
      this._prevScrollPosition = this._placeholderElRect.top;
    }
  }

  /**
   * Sets a special state class after the sticky element has been fully scrolled past.
   */
  toggletFullyScrolled(isScrolled) {
    if (isScrolled) {
      this.stickyEl.classList.add(`${this.options.classScope}--scrolled`);
    } else {
      this.stickyEl.classList.remove(`${this.options.classScope}--scrolled`);
    }
  }

  /**
   * Publish a native custom event.
   * The subscribe method can be a standard `HTMLElement.addEventListener('sticky:eventName')` call.
   * @param {String} eventName (Optional) Name for the custom event.
   * @param {Object} detail (Optional) Data to pass with the event.
   */
  publishEvent(eventName = 'event', detail = {}) {
    let event;
    const params = { bubbles: true, cancelable: true, detail: { Stickie: this, ...detail } };
    const formattedName = this.options.camelCaseEvents ? Stickie.toCamelCase(eventName) : `:${eventName}`;
    const eventString = `${this.options.eventScope}${formattedName}`;

    // IE >= 9, CustomEvent() constructor does not exist
    if (typeof window.CustomEvent !== 'function') {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventString, params.bubbles, params.cancelable, null);
    } else {
      event = new CustomEvent(eventString, params);
    }

    this.stickyEl.dispatchEvent(event);
  }

  /**
   * Basic debouncer, necessasry for certain events that happen in this plugin.
   */
  debounce(callback, wait, immediate) {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        timeout = null;

        if (!immediate) {
          callback(...args);
        }
      }, wait);

      if (immediate && !timeout) {
        callback(...args);
      }
    };
  }
}
