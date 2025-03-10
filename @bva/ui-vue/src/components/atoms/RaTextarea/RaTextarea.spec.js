import { shallowMount } from '@vue/test-utils';
import RaTextarea from './RaTextarea.vue';
describe('RaTextarea.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaTextarea);
    expect(component.classes('ra-textarea')).toBe(true);
  });
});
