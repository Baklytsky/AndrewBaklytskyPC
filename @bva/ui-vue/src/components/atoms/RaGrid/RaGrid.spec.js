import { shallowMount } from '@vue/test-utils';
import RaGrid from './RaGrid.vue';

describe('RaGrid.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaGrid);
    expect(component.classes('ra-grid')).toBe(true);
  });
});
