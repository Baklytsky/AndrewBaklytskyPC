import { shallowMount } from '@vue/test-utils';
import RaQuantitySelector from './RaQuantitySelector.vue';
describe('RaQuantitySelector.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaQuantitySelector);
    expect(component.classes('ra-quantity-selector')).toBe(true);
  });
});
