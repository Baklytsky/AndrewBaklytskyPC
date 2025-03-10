import { shallowMount } from '@vue/test-utils';
import RaFooter from '@/components/organisms/RaFooter/RaFooter.vue';

describe('RaFooter.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaFooter);
    expect(component.classes('ra-footer')).toBe(true);
  });
});
