import { shallowMount } from '@vue/test-utils';
import RaFilter from './RaFilter.vue';
describe('RaFilter.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaFilter);
    expect(component.classes('ra-filter')).toBe(true);
  });
});
