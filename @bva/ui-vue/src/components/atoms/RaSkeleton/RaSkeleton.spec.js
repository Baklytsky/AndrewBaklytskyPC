import { shallowMount } from '@vue/test-utils';
import RaSkeleton from './RaSkeleton.vue';
describe('RaSkeleton.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSkeleton);
    expect(component.classes('ra-skeleton')).toBe(true);
  });
});
