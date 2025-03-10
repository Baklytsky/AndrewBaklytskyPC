import { shallowMount } from '@vue/test-utils';
import RaTooltip from './RaTooltip.vue';

describe('RaTooltip.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTooltip);
    expect(component.classes('ra-tooltip-container')).toBe(true);
  });
});
