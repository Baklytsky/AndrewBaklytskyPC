import { shallowMount } from '@vue/test-utils';
import RaSpatialTagging from './RaSpatialTagging.vue';

describe('RaSpatialTagging.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSpatialTagging);
    expect(component.classes('ra-spatial-tagging')).toBe(true);
  });
});
