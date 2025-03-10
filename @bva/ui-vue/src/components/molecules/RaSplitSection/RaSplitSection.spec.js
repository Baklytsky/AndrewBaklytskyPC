import { shallowMount } from '@vue/test-utils';
import RaSplitSection from './RaSplitSection.vue';

describe('RaSplitSection.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSplitSection);
    expect(component.classes('ra-split-section')).toBe(true);
  });
});
