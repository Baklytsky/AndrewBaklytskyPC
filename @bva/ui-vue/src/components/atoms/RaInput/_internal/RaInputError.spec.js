import { shallowMount } from '@vue/test-utils';
import RaInputError from './RaInputError.vue';

describe('RaInputError.vue', () => {
  it('renders errorMessage contents with valid -> false when passed', () => {
    const errorMessage = 'This field is required';
    const component = shallowMount(RaInputError, {
      slots: {
        default: errorMessage,
      },
      propsData: {
        visible: true,
      },
    });
    expect(component.find('.ra-input__error-message').text()).toMatch(
      errorMessage
    );
  });
});
