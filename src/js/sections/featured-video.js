import {videoPlay} from '../features/video-play';
import videoBackground from '../features/video-background';
import {register} from '../vendor/theme-scripts/theme-sections';

register('featured-video', [videoPlay, videoBackground]);
