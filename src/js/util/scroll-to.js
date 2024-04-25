import {readHeights} from '../globals/height';

const scrollTo = (elementTop) => {
  const {stickyHeaderHeight} = readHeights();

  window.scrollTo({
    top: elementTop + Math.round(window.scrollY) - stickyHeaderHeight,
    left: 0,
    behavior: 'smooth',
  });
};

export default scrollTo;
