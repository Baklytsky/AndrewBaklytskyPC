import { shallowMount } from '@vue/test-utils';
import RaIconTile from './RaIconTile.vue';

describe('RaIconTile.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaIconTile);
    expect(component.classes('ra-icon-tile')).toBe(true);
  });
});
