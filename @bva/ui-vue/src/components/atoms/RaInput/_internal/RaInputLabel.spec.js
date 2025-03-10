import { shallowMount } from '@vue/test-utils';
import RaInputLabel from './RaInputLabel.vue';

describe('RaInputLabel.vue', () => {
  it('renders label text when passed', () => {
    const label = 'HelloWorld';
    const component = shallowMount(RaInputLabel, {
      propsData: {
        label,
      },
    });
    expect(component.find('.ra-input__label').text()).toBe(label);
  });
});
