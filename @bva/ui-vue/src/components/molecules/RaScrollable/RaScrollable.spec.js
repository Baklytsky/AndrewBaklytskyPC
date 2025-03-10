import { shallowMount } from '@vue/test-utils';
import RaScrollable from './RaScrollable.vue';
describe('RaScrollable.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaScrollable);
    expect(component.classes('ra-scrollable')).toBe(true);
  });
});
