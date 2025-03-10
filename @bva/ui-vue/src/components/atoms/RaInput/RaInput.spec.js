import { shallowMount } from '@vue/test-utils';
import RaInput from './RaInput.vue';
describe('RaInput.vue', () => {
  it('renders a input', () => {
    const component = shallowMount(RaInput);
    expect(component.classes('ra-input')).toBe(true);
  });
});
