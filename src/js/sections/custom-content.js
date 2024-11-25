import {register} from '../vendor/theme-scripts/theme-sections';
import {slider} from '../features/slider';
import {newsletterCheckForResultSection} from '../globals/newsletter';

register('custom-content', [slider, newsletterCheckForResultSection]);
