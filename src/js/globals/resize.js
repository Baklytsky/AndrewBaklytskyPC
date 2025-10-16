let lastWindowWidth = window.theme.getWindowWidth();
let lastWindowHeight = window.theme.getWindowHeight();

let lastScale = window.visualViewport ? window.visualViewport.scale : 1;

function dispatch() {
  document.dispatchEvent(new CustomEvent('theme:resize', {bubbles: true}));

  const currentWidth = window.theme.getWindowWidth();
  const currentHeight = window.theme.getWindowHeight();

  if (lastWindowWidth !== currentWidth) {
    document.dispatchEvent(new CustomEvent('theme:resize:width', {bubbles: true}));
    lastWindowWidth = currentWidth;
  }

  if (lastWindowHeight !== currentHeight) {
    document.dispatchEvent(new CustomEvent('theme:resize:height', {bubbles: true}));
    lastWindowHeight = currentHeight;
  }
}

function resizeListener() {
  window.addEventListener(
    'resize',
    window.theme.debounce(function () {
      // Check if viewport is zoomed (scaled)
      console.log(window.visualViewport);
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

export default resizeListener;
