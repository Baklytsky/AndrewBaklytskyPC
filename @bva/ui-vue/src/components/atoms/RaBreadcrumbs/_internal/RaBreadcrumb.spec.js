import { shallowMount } from '@vue/test-utils';
import RaBreadcrumb from './RaBreadcrumb.vue';

describe('RaBreadcrumb.vue', () => {
  it('renders a nav', () => {
    const component = shallowMount(RaBreadcrumb, {
      propsData: {
        text: 'HelloWorld',
      },
    });
    expect(component.classes('ra-breadcrumbs__list-item')).toBe(true);
  });
});
