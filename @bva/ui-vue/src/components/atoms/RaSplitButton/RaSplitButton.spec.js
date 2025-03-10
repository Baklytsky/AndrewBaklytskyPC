import { shallowMount } from '@vue/test-utils';
import RaSplitButton from './RaSplitButton.vue';

describe('RaSplitButton.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSplitButton);
    expect(component.classes('ra-split-button')).toBe(true);
  });
});
