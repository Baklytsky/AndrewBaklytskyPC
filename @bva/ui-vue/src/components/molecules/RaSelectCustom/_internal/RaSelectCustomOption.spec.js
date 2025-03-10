import { shallowMount } from '@vue/test-utils';
import RaSelectCustomOption from './RaSelectCustomOption.vue';
describe('RaSelectCustomOption.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSelectCustomOption, {
      provide: {
        scopedState: {
          options: [],
          index: 0,
          focusIndex: 0,
          value: null,
        },
      },
    });
    expect(component.classes('ra-select-custom-option')).toBe(true);
  });
});
