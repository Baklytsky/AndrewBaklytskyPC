import { shallowMount } from '@vue/test-utils';
import RaPicker from './RaPicker.vue';

describe('RaPicker.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaPicker);
    expect(component.classes('ra-picker')).toBe(true);
  });
});
