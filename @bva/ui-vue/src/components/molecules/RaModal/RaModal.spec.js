import { shallowMount } from '@vue/test-utils';
import RaModal from './RaModal.vue';

describe('RaModal.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaModal, {
      propsData: {
        visible: true,
      },
    });

    expect(component.find('.ra-modal').exists()).toBe(true);
  });
});
