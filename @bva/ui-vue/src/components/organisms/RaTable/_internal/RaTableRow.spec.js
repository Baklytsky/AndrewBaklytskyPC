import { shallowMount } from '@vue/test-utils';
import RaTableRow from './RaTableRow.vue';
describe('RaTableRow.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTableRow, {
      provide: {
        table: () => {},
      },
    });
    expect(component.exists()).toBe(true);
  });
});
