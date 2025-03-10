import { shallowMount } from '@vue/test-utils';
import RaTable from './RaTable.vue';
describe('RaTable.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTable);
    expect(component.classes('ra-table')).toBe(true);
  });
});
