import {productGrid} from '../features/product-grid';
import {gridSlider} from '../features/grid-slider';
import {tabs} from '../features/tabs';
import {register} from '../vendor/theme-scripts/theme-sections';

register('tab-collections', [productGrid, gridSlider, tabs]);
