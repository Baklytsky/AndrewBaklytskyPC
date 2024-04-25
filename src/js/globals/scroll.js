import {disablePageScroll, enablePageScroll, clearQueueScrollLocks} from 'scroll-lock';

let prev = window.pageYOffset;
let up = null;
let down = null;
let wasUp = null;
let wasDown = null;
let scrollLockTimer = 0;

const classes = {
  quickViewVisible: 'js-quick-view-visible',
  cartDrawerOpen: 'js-drawer-open-cart',
};

function dispatchScrollEvent() {
  const position = window.pageYOffset;
  if (position > prev) {
    down = true;
    up = false;
  } else if (position < prev) {
    down = false;
    up = true;
  } else {
    up = null;
    down = null;
  }
  prev = position;
  document.dispatchEvent(
    new CustomEvent('theme:scroll', {
      detail: {
        up,
        down,
        position,
      },
      bubbles: false,
    })
  );
  if (up && !wasUp) {
    document.dispatchEvent(
      new CustomEvent('theme:scroll:up', {
        detail: {position},
        bubbles: false,
      })
    );
  }
  if (down && !wasDown) {
    document.dispatchEvent(
      new CustomEvent('theme:scroll:down', {
        detail: {position},
        bubbles: false,
      })
    );
  }
  wasDown = down;
  wasUp = up;
}

function lock(e) {
  // Prevent body scroll lock race conditions
  setTimeout(() => {
    if (scrollLockTimer) {
      clearTimeout(scrollLockTimer);
    }

    disablePageScroll(e.detail, {
      allowTouchMove: (el) => el.tagName === 'TEXTAREA',
    });

    document.documentElement.setAttribute('data-scroll-locked', '');
  });
}

function unlock(e) {
  const timeout = e.detail;

  if (timeout) {
    scrollLockTimer = setTimeout(removeScrollLock, timeout);
  } else {
    removeScrollLock();
  }
}

function removeScrollLock() {
  const isPopupVisible = document.body.classList.contains(classes.quickViewVisible) || document.body.classList.contains(classes.cartDrawerOpen);

  if (!isPopupVisible) {
    clearQueueScrollLocks();
    enablePageScroll();
    document.documentElement.removeAttribute('data-scroll-locked');
  }
}

function scrollListener() {
  let timeout;
  window.addEventListener(
    'scroll',
    function () {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(function () {
        dispatchScrollEvent();
      });
    },
    {passive: true}
  );

  window.addEventListener('theme:scroll:lock', lock);
  window.addEventListener('theme:scroll:unlock', unlock);
}

export default scrollListener;
