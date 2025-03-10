import { shallowMount } from '@vue/test-utils';
import RaBreadcrumbs from './RaBreadcrumbs.vue';
const propsData = {
  breadcrumbs: [{ text: 'HelloWorld' }],
};
describe('RaBreadcrumbs.vue', () => {
  it('renders a nav', () => {
    const component = shallowMount(RaBreadcrumbs, { propsData });
    expect(component.classes('ra-breadcrumbs')).toBe(true);
  });
});
