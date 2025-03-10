import { mount, shallowMount } from '@vue/test-utils';
import RaTabs from './RaTabs.vue';
import RaTab from './_internal/RaTab.vue';

describe('RaTabs.vue', () => {
  it('renders a tabs', () => {
    const component = shallowMount(RaTabs);
    expect(component.classes('ra-tabs')).toBe(true);
  });
  it('checks if Tab slot is passed correctly', () => {
    const component = shallowMount(RaTabs, {
      slots: {
        default: `<p class="test-class">test-content</p>`,
      },
    });
    expect(component.find('.test-class').text()).toMatch('test-content');
  });
  it('check if navigation contains title passed in tab', () => {
    const tabsHtml = "<RaTab title='Tab1' /><RaTab title='Tab2' />";
    const component = mount(RaTabs, {
      components: {
        RaTab,
      },
      slots: {
        default: tabsHtml,
      },
    });
    expect(component.findAll('.ra-tab__toggle').length).toBe(2);
  });
});
