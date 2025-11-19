window.theme.windowWidth = getWindowWidth();
window.theme.windowHeight = getWindowHeight();
window.theme.isMobile = isMobile();

let lastScale = window.visualViewport ? window.visualViewport.scale : 1;

function dispatch() {
  // Update isMobile state before dispatching event
  const currentMediaQuery = isMobile();
  if (window.theme.isMobile !== currentMediaQuery) {
    window.theme.isMobile = currentMediaQuery;
  }

  const currentWidth = getWindowWidth();
  const currentHeight = getWindowHeight();

  if (window.theme.windowWidth !== currentWidth) {
    document.dispatchEvent(new CustomEvent('theme:resize:width', {bubbles: true}));
    window.theme.windowWidth = currentWidth;
  }

  if (window.theme.windowHeight !== currentHeight) {
    document.dispatchEvent(new CustomEvent('theme:resize:height', {bubbles: true}));
    window.theme.windowHeight = currentHeight;
  }

  document.dispatchEvent(new CustomEvent('theme:resize', {bubbles: true}));
}

function resizeListener() {
  window.addEventListener(
    'resize',
    window.theme.debounce(function () {
      // Check if viewport is zoomed (scaled)
      const currentScale = window.visualViewport ? window.visualViewport.scale : 1;
      const zooming = Math.abs(currentScale - lastScale) > 0.05;

      if (zooming) {
        // Zoom detected — ignore resize
        lastScale = currentScale;
        return;
      }

      lastScale = currentScale;

      dispatch();
    }, 50)
  );
}

function getWindowWidth() {
  return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
}

function getWindowHeight() {
  return document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
}

function isMobile() {
  return window.innerWidth < theme.sizes.small;
}

export default resizeListener;
