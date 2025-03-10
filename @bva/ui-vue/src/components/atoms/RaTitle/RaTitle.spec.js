import { shallowMount } from '@vue/test-utils';
import RaTitle from './RaTitle.vue';

describe('RaTitle.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTitle);
    expect(component.classes('ra-title')).toBe(true);
  });
});
