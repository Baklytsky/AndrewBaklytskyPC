// ------------------------------------------
// Rellax.js
// Buttery smooth parallax library
// Copyright (c) 2016 Moe Amaya (@moeamaya)
// MIT license
//
// Thanks to Paraxify.js and Jaime Cabllero
// for parallax concepts
// ------------------------------------------

var Rellax = function (el, options) {
  var self = Object.create(Rellax.prototype);

  var posY = 0;
  var screenY = 0;
  var posX = 0;
  var screenX = 0;
  var blocks = [];
  var pause = true;

  // check what requestAnimationFrame to use, and if
  // it's not supported, use the onscroll event
  var loop =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (callback) {
      return setTimeout(callback, 1000 / 60);
    };

  // store the id for later use
  var loopId = null;

  // Test via a getter in the options object to see if the passive property is accessed
  var supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
      },
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}

  // check what cancelAnimation method to use
  var clearLoop = window.cancelAnimationFrame || window.mozCancelAnimationFrame || clearTimeout;

  // check which transform property to use
  var transformProp =
    window.transformProp ||
    (function () {
      var testEl = document.createElement('div');
      if (testEl.style.transform === null) {
        var vendors = ['Webkit', 'Moz', 'ms'];
        for (var vendor in vendors) {
          if (testEl.style[vendors[vendor] + 'Transform'] !== undefined) {
            return vendors[vendor] + 'Transform';
          }
        }
      }
      return 'transform';
    })();

  // Default Settings
  self.options = {
    speed: -2,
    center: false,
    wrapper: null,
    relativeToWrapper: false,
    round: true,
    vertical: true,
    frame: null,
    horizontal: false,
    callback: function () {},
  };

  // User defined options (might have more in the future)
  if (options) {
    Object.keys(options).forEach(function (key) {
      self.options[key] = options[key];
    });
  }

  // By default, rellax class
  if (!el) {
    el = '.rellax';
  }

  // check if el is a className or a node
  var elements = typeof el === 'string' ? document.querySelectorAll(el) : [el];

  // Now query selector
  if (elements.length > 0) {
    self.elems = elements;
  }

  // The elements don't exist
  else {
    console.warn("Rellax: The elements you're trying to select don't exist.");
    return;
  }

  // Has a wrapper and it exists
  if (self.options.wrapper) {
    if (!self.options.wrapper.nodeType) {
      var wrapper = document.querySelector(self.options.wrapper);

      if (wrapper) {
        self.options.wrapper = wrapper;
      } else {
        console.warn("Rellax: The wrapper you're trying to use doesn't exist.");
        return;
      }
    }
  }

  // Has a frame and it exists
  if (self.options.frame) {
    if (!self.options.frame.nodeType) {
      var frame = document.querySelector(self.options.frame);

      if (frame) {
        self.options.frame = frame;
      } else {
        console.warn("Rellax: The frame you're trying to use doesn't exist.");
        return;
      }
    }
  }

  // === OPTIMIZED SECTION FOR PERFORMANCE ===

  // Utility: Debounce for resize handler
  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  // Store all layout reads in a pass, then all writes
  function batchLayoutAndStyle(fn) {
    // Could wrap in two phases if needed
    fn();
  }

  // Slightly refactored cacheBlocks for batching reads
  var cacheBlocks = function () {
    // Phase 1: Read all bounding rects & store data
    let blockData = [];
    for (var i = 0; i < self.elems.length; i++) {
      let el = self.elems[i];
      let data = {};
      data.el = el;
      data.dataPercentage = el.getAttribute('data-rellax-percentage');
      data.dataSpeed = el.getAttribute('data-rellax-speed');
      data.dataZindex = el.getAttribute('data-rellax-zindex') || 0;
      data.dataMin = el.getAttribute('data-rellax-min');
      data.dataMax = el.getAttribute('data-rellax-max');
      data.style = el.style.cssText;
      data.bounds = el.getBoundingClientRect(); // single forced reflow per element
      data.blockHeight = el.clientHeight || el.offsetHeight || el.scrollHeight;
      data.blockWidth = el.clientWidth || el.offsetWidth || el.scrollWidth;
      blockData.push(data);
    }
    // Phase 2: Compute values and create blocks
    for (var i = 0; i < blockData.length; i++) {
      let d = blockData[i];
      var wrapperPosY = self.options.wrapper ? self.options.wrapper.scrollTop : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      if (self.options.relativeToWrapper) {
        var scrollPosY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        wrapperPosY = scrollPosY - self.options.wrapper.offsetTop;
      }
      var posY = self.options.vertical ? (d.dataPercentage || self.options.center ? wrapperPosY : 0) : 0;
      var posX = self.options.horizontal
        ? d.dataPercentage || self.options.center
          ? self.options.wrapper
            ? self.options.wrapper.scrollLeft
            : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
          : 0
        : 0;
      var blockTop = posY + d.bounds.top;
      var blockLeft = posX + d.bounds.left;
      var percentageY = d.dataPercentage ? d.dataPercentage : (posY - blockTop + screenY) / (d.blockHeight + screenY);
      var percentageX = d.dataPercentage ? d.dataPercentage : (posX - blockLeft + screenX) / (d.blockWidth + screenX);
      if (self.options.center) {
        percentageX = 0.5;
        percentageY = 0.5;
      }
      var speed = d.dataSpeed ? d.dataSpeed : self.options.speed;
      var bases = updatePosition(percentageX, percentageY, speed);
      // Inline transforms
      var transform = '';
      var style = d.style;
      var searchResult = /transform\s*:/i.exec(style);
      if (searchResult) {
        var index = searchResult.index;
        var trimmedStyle = style.slice(index);
        var delimiter = trimmedStyle.indexOf(';');
        if (delimiter) {
          transform = ' ' + trimmedStyle.slice(11, delimiter).replace(/\s/g, '');
        } else {
          transform = ' ' + trimmedStyle.slice(11).replace(/\s/g, '');
        }
      }
      blocks[i] = {
        baseX: bases.x,
        baseY: bases.y,
        top: blockTop,
        left: blockLeft,
        height: d.blockHeight,
        width: d.blockWidth,
        speed: speed,
        style: d.style,
        transform: transform,
        zindex: d.dataZindex,
        min: d.dataMin,
        max: d.dataMax,
      };
    }
  };

  // Replace init with deferred/heavy work using requestIdleCallback or rAF
  var init = function () {
    // Batch DOM writes: write all previous styles
    for (var i = 0; i < blocks.length; i++) {
      self.elems[i].style.cssText = blocks[i] && blocks[i].style;
    }
    blocks = [];
    screenY = window.innerHeight;
    screenX = window.innerWidth;
    setPosition();
    var cacheFn = function () {
      cacheBlocks();
      animate();
      if (pause) {
        window.addEventListener('resize', debouncedInit);
        pause = false;
        update();
      }
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cacheFn);
    } else {
      requestAnimationFrame(cacheFn);
    }
  };

  // Debounce init on resize
  var debouncedInit = debounce(init, 150);

  // Let's kick this script off
  // Build array for cached element values
  var init = function () {
    for (var i = 0; i < blocks.length; i++) {
      self.elems[i].style.cssText = blocks[i].style;
    }

    blocks = [];

    screenY = window.innerHeight;
    screenX = window.innerWidth;
    setPosition();

    cacheBlocks();

    animate();

    // If paused, unpause and set listener for window resizing events
    if (pause) {
      window.addEventListener('resize', init);
      pause = false;
      // Start the loop
      update();
    }
  };

  // We want to cache the parallax blocks'
  // values: base, top, height, speed
  // el: is dom object, return: el cache values
  var createBlock = function (el) {
    var dataPercentage = el.getAttribute('data-rellax-percentage');
    var dataSpeed = el.getAttribute('data-rellax-speed');
    var dataZindex = el.getAttribute('data-rellax-zindex') || 0;
    var dataMin = el.getAttribute('data-rellax-min');
    var dataMax = el.getAttribute('data-rellax-max');

    // initializing at scrollY = 0 (top of browser), scrollX = 0 (left of browser)
    // ensures elements are positioned based on HTML layout.
    //
    // If the element has the percentage attribute, the posY and posX needs to be
    // the current scroll position's value, so that the elements are still positioned based on HTML layout
    var wrapperPosY = self.options.wrapper ? self.options.wrapper.scrollTop : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    // If the option relativeToWrapper is true, use the wrappers offset to top, subtracted from the current page scroll.
    if (self.options.relativeToWrapper) {
      var scrollPosY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      wrapperPosY = scrollPosY - self.options.wrapper.offsetTop;
    }
    var posY = self.options.vertical ? (dataPercentage || self.options.center ? wrapperPosY : 0) : 0;
    var posX = self.options.horizontal
      ? dataPercentage || self.options.center
        ? self.options.wrapper
          ? self.options.wrapper.scrollLeft
          : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
        : 0
      : 0;

    var blockTop = posY + el.getBoundingClientRect().top;
    var blockHeight = el.clientHeight || el.offsetHeight || el.scrollHeight;

    var blockLeft = posX + el.getBoundingClientRect().left;
    var blockWidth = el.clientWidth || el.offsetWidth || el.scrollWidth;

    // apparently parallax equation everyone uses
    var percentageY = dataPercentage ? dataPercentage : (posY - blockTop + screenY) / (blockHeight + screenY);
    var percentageX = dataPercentage ? dataPercentage : (posX - blockLeft + screenX) / (blockWidth + screenX);
    if (self.options.center) {
      percentageX = 0.5;
      percentageY = 0.5;
    }

    // Optional individual block speed as data attr, otherwise global speed
    var speed = dataSpeed ? dataSpeed : self.options.speed;

    if (self.options.frame) {
      var frame = self.options.frame;
      var frameHeight = frame.clientHeight || frame.offsetHeight || frame.scrollHeight;
      var overlap = blockHeight - frameHeight;
      var backwards = blockHeight / (frameHeight - blockHeight);
      speed = (overlap / 100) * -1;
      dataMin = (overlap / 2) * -1;
      dataMax = overlap / 2;
    }

    var bases = updatePosition(percentageX, percentageY, speed);

    // ~~Store non-translate3d transforms~~
    // Store inline styles and extract transforms
    var style = el.style.cssText;
    var transform = '';

    // Check if there's an inline styled transform
    var searchResult = /transform\s*:/i.exec(style);
    if (searchResult) {
      // Get the index of the transform
      var index = searchResult.index;

      // Trim the style to the transform point and get the following semi-colon index
      var trimmedStyle = style.slice(index);
      var delimiter = trimmedStyle.indexOf(';');

      // Remove "transform" string and save the attribute
      if (delimiter) {
        transform = ' ' + trimmedStyle.slice(11, delimiter).replace(/\s/g, '');
      } else {
        transform = ' ' + trimmedStyle.slice(11).replace(/\s/g, '');
      }
    }

    return {
      baseX: bases.x,
      baseY: bases.y,
      top: blockTop,
      left: blockLeft,
      height: blockHeight,
      width: blockWidth,
      speed: speed,
      style: style,
      transform: transform,
      zindex: dataZindex,
      min: dataMin,
      max: dataMax,
    };
  };

  // set scroll position (posY, posX)
  // side effect method is not ideal, but okay for now
  // returns true if the scroll changed, false if nothing happened
  var setPosition = function () {
    var oldY = posY;
    var oldX = posX;

    posY = self.options.wrapper ? self.options.wrapper.scrollTop : (document.documentElement || document.body.parentNode || document.body).scrollTop || window.pageYOffset;
    posX = self.options.wrapper ? self.options.wrapper.scrollLeft : (document.documentElement || document.body.parentNode || document.body).scrollLeft || window.pageXOffset;
    // If option relativeToWrapper is true, use relative wrapper value instead.
    if (self.options.relativeToWrapper) {
      var scrollPosY = (document.documentElement || document.body.parentNode || document.body).scrollTop || window.pageYOffset;
      posY = scrollPosY - self.options.wrapper.offsetTop;
    }

    if (oldY != posY && self.options.vertical) {
      // scroll changed, return true
      return true;
    }

    if (oldX != posX && self.options.horizontal) {
      // scroll changed, return true
      return true;
    }

    // scroll did not change
    return false;
  };

  // Ahh a pure function, gets new transform value
  // based on scrollPosition and speed
  // Allow for decimal pixel values
  var updatePosition = function (percentageX, percentageY, speed) {
    var result = {};
    var valueX = speed * (100 * (1 - percentageX));
    var valueY = speed * (100 * (1 - percentageY));

    result.x = self.options.round ? Math.round(valueX) : Math.round(valueX * 100) / 100;
    result.y = self.options.round ? Math.round(valueY) : Math.round(valueY * 100) / 100;

    return result;
  };

  // Remove event listeners and loop again
  var deferredUpdate = function () {
    window.removeEventListener('resize', deferredUpdate);
    window.removeEventListener('orientationchange', deferredUpdate);
    (self.options.wrapper ? self.options.wrapper : window).removeEventListener('scroll', deferredUpdate);
    (self.options.wrapper ? self.options.wrapper : document).removeEventListener('touchmove', deferredUpdate);

    // loop again
    loopId = loop(update);
  };

  // Loop
  var update = function () {
    if (setPosition() && pause === false) {
      animate();

      // loop again
      loopId = loop(update);
    } else {
      loopId = null;

      // Don't animate until we get a position updating event
      window.addEventListener('resize', deferredUpdate);
      window.addEventListener('orientationchange', deferredUpdate);
      (self.options.wrapper ? self.options.wrapper : window).addEventListener('scroll', deferredUpdate, supportsPassive ? {passive: true} : false);
      (self.options.wrapper ? self.options.wrapper : document).addEventListener('touchmove', deferredUpdate, supportsPassive ? {passive: true} : false);
    }
  };

  // Transform3d on parallax element
  var animate = function () {
    // Phase 1: Calculate values for all elements
    var outPositions = new Array(self.elems.length);
    for (var i = 0; i < self.elems.length; i++) {
      var percentageY = (posY - blocks[i].top + screenY) / (blocks[i].height + screenY);
      var percentageX = (posX - blocks[i].left + screenX) / (blocks[i].width + screenX);
      var positions = updatePosition(percentageX, percentageY, blocks[i].speed);
      var positionY = positions.y - blocks[i].baseY;
      var positionX = positions.x - blocks[i].baseX;
      // Min/Max constraints
      if (blocks[i].min !== null) {
        if (self.options.vertical && !self.options.horizontal) {
          positionY = positionY <= blocks[i].min ? blocks[i].min : positionY;
        }
        if (self.options.horizontal && !self.options.vertical) {
          positionX = positionX <= blocks[i].min ? blocks[i].min : positionX;
        }
      }
      if (blocks[i].max !== null) {
        if (self.options.vertical && !self.options.horizontal) {
          positionY = positionY >= blocks[i].max ? blocks[i].max : positionY;
        }
        if (self.options.horizontal && !self.options.vertical) {
          positionX = positionX >= blocks[i].max ? blocks[i].max : positionX;
        }
      }
      outPositions[i] = {positionX, positionY, zindex: blocks[i].zindex, i};
    }
    // Phase 2: Write all transforms
    for (var i = 0; i < self.elems.length; i++) {
      var o = outPositions[i];
      var translate = 'translate3d(' + (self.options.horizontal ? o.positionX : '0') + 'px,' + (self.options.vertical ? o.positionY : '0') + 'px,' + o.zindex + 'px) ' + blocks[o.i].transform;
      self.elems[o.i].style[transformProp] = translate;
    }
    self.options.callback(outPositions);
  };

  // Debounce init on resize
  self.destroy = function () {
    for (var i = 0; i < self.elems.length; i++) {
      self.elems[i].style.cssText = blocks[i] && blocks[i].style;
    }

    // Remove resize event listener if not pause, and pause
    if (!pause) {
      window.removeEventListener('resize', debouncedInit);
      pause = true;
    }

    // Clear the animation loop to prevent possible memory leak
    clearLoop(loopId);
    loopId = null;
  };

  // Patch init reference
  self.refresh = init;

  // Main run
  init();

  return self;
};

export {Rellax};
