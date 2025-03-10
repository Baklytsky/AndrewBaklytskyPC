import { shallowMount } from '@vue/test-utils';
import RaContentTile from './RaContentTile.vue';

describe('RaContentTile.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaContentTile);
    expect(component.classes('ra-content-tile')).toBe(true);
  });
});
