import { shallowMount } from '@vue/test-utils';
import RaReview from './RaReview.vue';
describe('RaReview.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaReview);
    expect(component.classes('ra-review')).toBe(true);
  });
});
