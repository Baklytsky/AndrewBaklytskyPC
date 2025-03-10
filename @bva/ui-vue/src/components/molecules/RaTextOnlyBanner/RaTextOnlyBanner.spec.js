import { shallowMount } from '@vue/test-utils';
import RaTextOnlyBanner from './RaTextOnlyBanner.vue';

describe('RaTextOnlyBanner.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTextOnlyBanner);
    expect(component.classes('ra-text-only-banner')).toBe(true);
  });
});
