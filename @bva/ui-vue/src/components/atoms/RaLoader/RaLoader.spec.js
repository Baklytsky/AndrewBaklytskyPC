import { shallowMount } from '@vue/test-utils';
import RaLoader from './RaLoader.vue';
describe('RaLoader.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaLoader);
    expect(component.classes('ra-loader')).toBe(true);
  });
});
