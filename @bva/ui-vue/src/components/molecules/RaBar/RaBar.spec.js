import { shallowMount } from '@vue/test-utils';
import RaBar from '@/components/molecules/RaBar/RaBar.vue';
describe('RaBar.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaBar);
    expect(component.classes('ra-bar')).toBe(true);
  });
});
