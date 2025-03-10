import { shallowMount } from '@vue/test-utils';
import RaOptionPicker from './RaOptionPicker.vue';

describe('RaOptionPicker.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaOptionPicker);
    expect(component.classes('ra-option-picker')).toBe(true);
  });
});
