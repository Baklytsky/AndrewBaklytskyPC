import { shallowMount } from '@vue/test-utils';
import RaAddToCart from './RaAddToCart.vue';
describe('RaAddToCart.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaAddToCart);
    expect(component.classes('ra-add-to-cart')).toBe(true);
  });
});
