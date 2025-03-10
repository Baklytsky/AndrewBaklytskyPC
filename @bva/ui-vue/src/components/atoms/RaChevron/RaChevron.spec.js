import { shallowMount } from '@vue/test-utils';
import RaChevron from './RaChevron.vue';
describe.only('RaChevron.vue', () => {
  it('renders a chevron', () => {
    const component = shallowMount(RaChevron);
    expect(component.classes('ra-chevron')).toBe(true);
  });
  it('renders slot with other content', () => {
    const component = shallowMount(RaChevron, {
      slots: {
        default: "<div class='ra-chevron__chevron'>Some content</div>",
      },
    });
    expect(component.find('.ra-chevron__chevron').exists()).toBe(true);
  });
});
