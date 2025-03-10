import { shallowMount } from '@vue/test-utils';
import RaHeading from './RaHeading.vue';
describe('RaHeading.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaHeading);
    expect(component.classes('ra-heading')).toBe(true);
  });
});
