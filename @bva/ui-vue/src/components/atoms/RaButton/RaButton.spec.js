import { shallowMount } from '@vue/test-utils';
import RaButton from './RaButton.vue';
describe('RaButton.vue', () => {
  it('renders a button', () => {
    const component = shallowMount(RaButton);
    expect(component.classes('ra-button')).toBe(true);
  });
  it('renders default prop text when passed', () => {
    const msg = 'HelloWorld';
    const component = shallowMount(RaButton, {
      slots: {
        default: msg,
      },
    });
    expect(component.find('.ra-button').text()).toMatch(msg);
  });
});
