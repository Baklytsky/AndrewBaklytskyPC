import { shallowMount } from '@vue/test-utils';
import RaList from './RaList.vue';
describe('RaList.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaList);
    expect(component.classes('ra-list')).toBe(true);
  });
  // todo: test defautl slot, test if RaListItem is rendered
});
