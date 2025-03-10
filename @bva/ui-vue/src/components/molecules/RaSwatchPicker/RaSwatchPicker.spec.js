import { shallowMount } from '@vue/test-utils';
import RaSwatchPicker from './RaSwatchPicker.vue';

describe('RaSwatchPicker.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSwatchPicker);
    expect(component.classes('ra-swatch-picker')).toBe(true);
  });
});
