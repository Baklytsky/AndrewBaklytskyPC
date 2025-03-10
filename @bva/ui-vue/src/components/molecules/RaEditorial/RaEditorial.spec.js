import { shallowMount } from '@vue/test-utils';
import RaEditorial from './RaEditorial.vue';

describe('RaEditorial.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaEditorial);
    expect(component.classes('ra-editorial')).toBe(true);
  });
});
