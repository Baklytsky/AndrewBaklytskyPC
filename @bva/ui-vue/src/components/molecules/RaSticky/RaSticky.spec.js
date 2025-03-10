import { shallowMount } from '@vue/test-utils';
import RaSticky from './RaSticky.vue';
describe('RaSticky.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSticky);
    expect(component.classes('ra-sticky')).toBe(true);
  });
});
