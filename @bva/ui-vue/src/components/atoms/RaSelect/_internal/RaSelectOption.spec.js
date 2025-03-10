import { shallowMount } from '@vue/test-utils';
import RaSelectOption from './RaSelectOption.vue';

describe('RaSelectOption.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSelectOption);
    expect(component.classes('ra-select__option')).toBe(true);
  });
});
