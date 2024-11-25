import {register} from '../vendor/theme-scripts/theme-sections';
import scrollToElement from '../features/scroll-to-element';
import scrollSpy from '../features/scroll-spy';

register('sidebar', [scrollToElement, scrollSpy]);
