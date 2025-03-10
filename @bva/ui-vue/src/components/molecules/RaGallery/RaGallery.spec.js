import { shallowMount } from '@vue/test-utils';
import RaGallery from './RaGallery.vue';

describe('RaGallery.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaGallery);

    expect(component.find('.ra-gallery-grid').exists()).toBe(false);
  });
});
