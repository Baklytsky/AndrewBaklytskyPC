import { shallowMount } from '@vue/test-utils';
import RaBadge from './RaBadge.vue';
describe('RaBadge.vue', () => {
  it('renders a badge', () => {
    const component = shallowMount(RaBadge);
    expect(component.classes('ra-badge')).toBe(true);
  });
  it('renders a badge with css modifier', () => {
    const component = shallowMount({
      components: { RaBadge },
      template: `<RaBadge class="ra-badge--warning" />`,
    });
    expect(component.classes('ra-badge--warning')).toBe(true);
  });
  it('renders a badge content via default slot', () => {
    const content = 'sfbadge content';
    const component = shallowMount(RaBadge, {
      slots: {
        default: content,
      },
    });
    expect(component.find('.ra-badge').text()).toBe(content);
  });
});
