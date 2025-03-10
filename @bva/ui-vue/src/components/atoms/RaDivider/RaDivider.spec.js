import { shallowMount } from '@vue/test-utils';
import RaDivider from './RaDivider.vue';
describe('RaDivider.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaDivider);
    expect(component.classes('ra-divider')).toBe(true);
  });
});
