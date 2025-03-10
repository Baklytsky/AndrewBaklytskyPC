import { shallowMount } from '@vue/test-utils';
import RaComponentAnchorOverlay from './RaComponentAnchorOverlay.vue';

describe('RaComponentAnchorOverlay.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaComponentAnchorOverlay);
    expect(component.classes('ra-component-anchor-overlay')).toBe(true);
  });
});
