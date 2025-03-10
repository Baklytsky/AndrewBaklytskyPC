import { shallowMount } from '@vue/test-utils';
import RaFooterColumn from './RaFooterColumn.vue';
import RaFooter from '../RaFooter.vue';

describe('RaFooterColumn.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaFooterColumn, {
      parentComponent: RaFooter,
    });
    expect(component.classes('ra-footer-column')).toBe(true);
  });
});
