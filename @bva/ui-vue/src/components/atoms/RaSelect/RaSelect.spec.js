import { shallowMount } from '@vue/test-utils';
import RaSelect from './RaSelect.vue';

describe('RaSelect.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaSelect);
    expect(component.classes('ra-select')).toBe(true);
  });
});
