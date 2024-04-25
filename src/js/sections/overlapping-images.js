import {videoPlay} from '../features/video-play';
import parallaxSection from '../features/scrollable-parallax';
import {register} from '../vendor/theme-scripts/theme-sections';

register('overlapping-images', [videoPlay, parallaxSection]);
