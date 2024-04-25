import debounce from '../util/debounce';

window.lastWindowWidth = window.innerWidth;

function dispatchResizeEvent() {
  document.dispatchEvent(
    new CustomEvent('theme:resize', {
      bubbles: true,
    })
  );

  if (window.lastWindowWidth !== window.innerWidth) {
    document.dispatchEvent(
      new CustomEvent('theme:resize:width', {
        bubbles: true,
      })
    );

    window.lastWindowWidth = window.innerWidth;
  }
}

function resizeListener() {
  window.addEventListener('resize', debounce(dispatchResizeEvent, 50));
}

export default resizeListener;
