import { shallowMount } from '@vue/test-utils';
import RaTableData from './RaTableData.vue';
describe('RaTableData.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTableData);
    expect(component.classes('ra-table__data')).toBe(true);
  });
});
