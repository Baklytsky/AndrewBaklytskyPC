import { shallowMount } from '@vue/test-utils';
import RaBullets from './RaBullets.vue';
describe('RaBullets.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaBullets, {
      propsData: {
        total: 3,
      },
    });
    expect(component.classes('ra-bullets')).toBe(true);
  });
});
