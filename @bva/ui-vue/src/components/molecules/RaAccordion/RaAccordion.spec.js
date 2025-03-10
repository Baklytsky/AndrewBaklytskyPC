import { shallowMount } from '@vue/test-utils';
import RaAccordion from './RaAccordion.vue';
describe('RaAccordion.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaAccordion);
    expect(component.classes('ra-accordion')).toBe(true);
  });
});
