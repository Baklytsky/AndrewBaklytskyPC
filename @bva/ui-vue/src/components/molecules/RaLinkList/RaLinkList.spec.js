import { shallowMount } from '@vue/test-utils';
import RaLinkList from './RaLinkList.vue';

describe('RaLinkList.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaLinkList, {
      propsData: {
        linkList: {
          label: 'HelloWorld',
        },
      },
    });

    expect(component.classes('ra-link-list')).toBe(true);
  });
});
