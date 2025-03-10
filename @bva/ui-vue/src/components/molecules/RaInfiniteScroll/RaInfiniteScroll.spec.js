import { shallowMount } from '@vue/test-utils';
import RaInfiniteScroll from './RaInfiniteScroll.vue';

describe('RaInfiniteScroll.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaInfiniteScroll);
    expect(component.classes('ra-infinite-scroll')).toBe(true);
  });
});
