import { shallowMount } from '@vue/test-utils';
import RaSidebar from './RaSidebar.vue';

jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
  return {};
});

describe('RaSidebar.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSidebar, {
      propsData: {
        visible: true,
      },
    });

    expect(component.find('.ra-sidebar').exists()).toBe(true);
  });
});
