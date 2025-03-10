import { shallowMount } from '@vue/test-utils';
import RaCarousel from './RaCarousel.vue';
describe('RaCarousel.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaCarousel);
    expect(component.classes('ra-carousel-outer')).toBe(true);
  });
});
