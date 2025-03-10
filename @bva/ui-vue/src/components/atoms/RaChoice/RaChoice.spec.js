import { shallowMount } from '@vue/test-utils';
import RaChoice from './RaChoice.vue';

describe('RaChoice.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaChoice);
    expect(component.classes('ra-choice')).toBe(true);
  });
});
