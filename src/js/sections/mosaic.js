import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  grid: '[data-grid]',
};

const mosaicSection = {
  onBlockSelect(e) {
    const grid = e.target.closest(selectors.grid);
    const wrapperStyle = grid.currentStyle || window.getComputedStyle(grid);
    const wrapperPadding = parseInt(wrapperStyle.paddingLeft);
    const blockPositionLeft = e.target.offsetLeft - wrapperPadding;

    // Native scroll to item
    grid.scrollTo({
      top: 0,
      left: blockPositionLeft,
      behavior: 'smooth',
    });
  },
};

register('mosaic', mosaicSection);
