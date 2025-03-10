import { shallowMount } from '@vue/test-utils';
import RaProperty from './RaProperty.vue';
describe('RaProperty.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaProperty);
    expect(component.classes('ra-property')).toBe(true);
  });
  it('renders a div with correct class', () => {
    const component = shallowMount(RaProperty);
    expect(component.html()).toContain('ra-property');
  });
  it('renders correct row', () => {
    const nameText = 'Category';
    const valueText = 'Pants';
    const component = shallowMount(RaProperty, {
      propsData: {
        name: nameText,
        value: valueText,
      },
    });
    expect(component.find('.ra-property__name').text()).toMatch(nameText);
    expect(component.find('.ra-property__value').text()).toMatch(valueText);
  });
});
