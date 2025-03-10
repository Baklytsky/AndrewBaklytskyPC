import { shallowMount } from '@vue/test-utils';
import RaIconButton from './RaIconButton.vue';
describe.only('RaIconButton.vue', () => {
  it('renders a button', () => {
    const component = shallowMount(RaIconButton);
    expect(component.classes('ra-icon-button')).toBe(true);
  });
});
