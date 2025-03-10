import { shallowMount } from '@vue/test-utils';
import RaTableHeader from './RaTableHeader.vue';
describe('RaTableHeader.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTableHeader);
    expect(component.classes('ra-table__header')).toBe(true);
  });
});
