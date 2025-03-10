import { shallowMount } from '@vue/test-utils';
import RaContainer from './RaContainer.vue';

describe('RaContainer.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaContainer);
    expect(component.classes('ra-container')).toBe(true);
  });
});
