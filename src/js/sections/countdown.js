import {register} from '../vendor/theme-scripts/theme-sections';
import {videoPlay} from '../features/video-play';
import {zoomAnimation} from '../features/zoom-animation';
import {CountdownTimer} from '../features/countdown-timer';

register('countdown', [zoomAnimation, videoPlay]);

if (!customElements.get('countdown-timer')) {
  customElements.define('countdown-timer', CountdownTimer);
}
