import { shallowMount } from '@vue/test-utils';
import RaCarouselItem from './RaCarouselItem.vue';
describe('RaCarouselItem.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaCarouselItem);
    expect(component.classes('ra-carousel-item')).toBe(true);
  });
});
