import { shallowMount } from '@vue/test-utils';
import RaSwatch from './RaSwatch.vue';
describe('RaSwatch', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSwatch);
    expect(component.classes('ra-swatch')).toBe(true);
  });
});
