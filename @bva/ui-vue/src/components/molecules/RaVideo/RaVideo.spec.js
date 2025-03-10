import { shallowMount } from '@vue/test-utils';
import RaVideo from './RaVideo.vue';

describe('RaVideo.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaVideo);
    expect(component.classes('ra-video')).toBe(true);
  });
});
