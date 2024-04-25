import {productGrid} from '../features/product-grid';
import {gridSlider} from '../features/grid-slider';
import {register} from '../vendor/theme-scripts/theme-sections';
import {tooltip} from '../features/tooltip';

register('featured-collection', [productGrid, tooltip, gridSlider]);
