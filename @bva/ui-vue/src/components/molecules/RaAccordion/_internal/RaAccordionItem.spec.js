import { shallowMount } from '@vue/test-utils';
import RaAccordionItem from './RaAccordionItem.vue';
describe('RaAccordionItem.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaAccordionItem, {
      provide: {
        scopedState: {
          count: 0,
          activeList: [],
          activeLast: null,
          multiple: false,
        },
      },
    });

    expect(component.classes('ra-accordion-item')).toBe(true);
  });
});
