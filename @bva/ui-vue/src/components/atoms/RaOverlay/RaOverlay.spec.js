import { shallowMount } from '@vue/test-utils';
import RaOverlay from './RaOverlay.vue';
describe('RaOverlay.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaOverlay, {
      propsData: {
        visible: true,
      },
    });
    expect(component.find('.ra-overlay').exists()).toBe(true);
  });
});
