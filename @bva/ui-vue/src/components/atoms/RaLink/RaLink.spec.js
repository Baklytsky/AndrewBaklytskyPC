import { shallowMount } from '@vue/test-utils';
import RaLink from './RaLink.vue';

describe('RaLink.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaLink);
    expect(component.classes('ra-link')).toBe(true);
  });
});
