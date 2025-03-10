import { shallowMount } from '@vue/test-utils';
import RaPagination from './RaPagination.vue';

describe('RaPagination.vue', () => {
  it('renders a pagination', () => {
    const component = shallowMount(RaPagination);
    expect(component.classes('ra-pagination')).toBe(true);
  });
});
