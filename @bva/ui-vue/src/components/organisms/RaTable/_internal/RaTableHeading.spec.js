import { shallowMount } from '@vue/test-utils';
import RaTableHeading from './RaTableHeading.vue';
describe('RaTableHeading.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTableHeading, {
      provide: {
        table: () => {},
      },
    });
    expect(component.exists()).toBe(true);
  });
});
