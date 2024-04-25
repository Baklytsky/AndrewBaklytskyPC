import throttle from '../util/throttle';

const selectors = {
  scrollToTop: '[data-scroll-top-button]',
};
const classes = {
  isVisible: 'is-visible',
};

// Scroll to top button
const scrollTopButton = document.querySelector(selectors.scrollToTop);
if (scrollTopButton) {
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
  document.addEventListener(
    'scroll',
    throttle(() => {
      scrollTopButton.classList.toggle(classes.isVisible, window.pageYOffset > window.innerHeight);
    }, 150)
  );
}
