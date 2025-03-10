import { shallowMount } from '@vue/test-utils';
import RaRow from './RaRow.vue';

describe('RaRow.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaRow);
    expect(component.classes('ra-row')).toBe(true);
  });
});
