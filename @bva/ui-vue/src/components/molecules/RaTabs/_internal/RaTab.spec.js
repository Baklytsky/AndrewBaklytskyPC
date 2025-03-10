import { shallowMount } from '@vue/test-utils';
import RaTab from './RaTab.vue';
describe('RaTab.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTab, {
      provide: {
        scopedState: {
          count: 0,
          activeList: [],
          activeLast: null,
          multiple: false,
        },
      },
    });
    expect(component.exists('ra-tab')).toBe(true);
  });
});
