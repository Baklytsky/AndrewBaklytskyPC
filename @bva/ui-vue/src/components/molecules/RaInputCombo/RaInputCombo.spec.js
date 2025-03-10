import { shallowMount } from '@vue/test-utils';
import RaInputCombo from './RaInputCombo.vue';

describe('RaInputCombo.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaInputCombo);
    expect(component.classes('ra-input-combo')).toBe(true);
  });
});
