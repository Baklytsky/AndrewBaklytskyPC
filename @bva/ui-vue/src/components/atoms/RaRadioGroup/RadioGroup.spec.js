import { shallowMount } from '@vue/test-utils';
import RaRadioGroup from './RaRadioGroup.vue';

describe('RadioGroup.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaRadioGroup);
    expect(component.classes('ra-radio-group')).toBe(true);
  });
});
