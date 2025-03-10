import { shallowMount } from '@vue/test-utils';
import RaPrice from './RaPrice.vue';
describe('RaPrice.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaPrice);
    expect(component.classes('ra-price')).toBe(true);
  });
  it('renders regular and special price props passed as String', () => {
    const regPrice = '$3,99';
    const spPrice = '$3,59';
    const component = shallowMount(RaPrice, {
      propsData: {
        regular: regPrice,
        special: spPrice,
      },
    });
    expect(
      component.find('.ra-price__old').exists() &&
        component.find('.ra-price__special').exists()
    ).toBe(true);
  });
  it('renders regular and special price props passed as Number', () => {
    const regPrice = 3.99;
    const spPrice = 3.59;
    const component = shallowMount(RaPrice, {
      propsData: {
        regular: regPrice,
        special: spPrice,
      },
    });
    expect(
      component.find('.ra-price__old').exists() &&
        component.find('.ra-price__special').exists()
    ).toBe(true);
  });
  it('renders an old price via slot', () => {
    const component = shallowMount(RaPrice, {
      slots: {
        old: "<del class='old'>text</del>",
      },
    });
    expect(component.find('.old').exists()).toBe(true);
  });
  it('renders a special price via slot', () => {
    const component = shallowMount(RaPrice, {
      slots: {
        special: "<ins class='special'>text</ins>",
      },
    });
    expect(component.find('.ra-price__special').exists()).toBe(false);
    expect(component.find('.special').exists()).toBe(true);
  });
});
