import { shallowMount } from '@vue/test-utils';
import RaProductLineItem from './RaProductLineItem.vue';
describe('RaProductLineItem.vue', () => {
  it('renders a component', () => {
    const title = 'Product';
    const component = shallowMount(RaProductLineItem, {
      propsData: {
        title,
      },
    });
    expect(component.classes('ra-product-line-item')).toBe(true);
  });
});
