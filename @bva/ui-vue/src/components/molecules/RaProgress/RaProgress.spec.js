import { shallowMount } from '@vue/test-utils';
import RaProgress from './RaProgress.vue';

describe('RaProgress.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaProgress, {
      propsData: {
        progress: 1,
        target: 10,
      },
    });
    expect(component.classes('ra-progress')).toBe(true);
  });
});
