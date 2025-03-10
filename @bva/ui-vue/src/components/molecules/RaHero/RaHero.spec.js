import { shallowMount } from '@vue/test-utils';
import RaHero from './RaHero.vue';

describe('RaHero.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaHero);
    expect(component.classes('ra-hero')).toBe(true);
  });
});
