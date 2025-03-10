import { shallowMount } from '@vue/test-utils';
import RaQuickAdd from './RaQuickAdd.vue';

describe('RaQuickAdd.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaQuickAdd, {
      propsData: {
        visible: true,
      },
    });
    expect(component.find('.ra-quick-add').exists()).toBe(true);
  });
});
