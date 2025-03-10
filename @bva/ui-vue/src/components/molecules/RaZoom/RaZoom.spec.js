import { shallowMount } from '@vue/test-utils';
import RaZoom from './RaZoom.vue';

describe('RaZoom.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaZoom);
    expect(component.classes('ra-zoom')).toBe(true);
  });
});
