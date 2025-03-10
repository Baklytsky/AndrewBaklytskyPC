import { shallowMount } from '@vue/test-utils';
import RaSelectCustom from './RaSelectCustom.vue';

describe('RaSelectCustom.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSelectCustom);
    expect(component.classes('ra-select-custom')).toBe(true);
  });
});
