import { shallowMount } from '@vue/test-utils';
import RaListItem from './RaListItem.vue';
describe('RaListItem.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaListItem);
    expect(component.classes('ra-list__item')).toBe(true);
  });
});
