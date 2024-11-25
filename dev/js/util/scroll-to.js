import {readHeights} from '../globals/height';

const scrollTo = (elementTop) => {
  /* Sticky header check */
  let {stickyHeaderHeight} = readHeights();

  window.scrollTo({
    top: elementTop + window.scrollY - stickyHeaderHeight,
    left: 0,
    behavior: 'smooth',
  });
};

export default scrollTo;
