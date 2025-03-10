import { shallowMount } from '@vue/test-utils';
import RaSearchBar from './RaSearchBar.vue';
describe.only('RaSearchBar.vue', () => {
  it('renders a search bar', () => {
    const component = shallowMount(RaSearchBar);
    expect(component.classes('ra-search-bar')).toBe(true);
  });
  it('renders slot with icon when passed', () => {
    const icon = "<svg class='ra-search-bar__icon'></svg>";
    const component = shallowMount(RaSearchBar, {
      slots: {
        'search-action': icon,
      },
    });
    expect(component.find('.ra-search-bar__icon').exists()).toBe(true);
  });
  it('renders slot with clear icon when passed', () => {
    const icon = "<span class='ra-search-bar__clear-icon'></span>";
    const component = shallowMount(RaSearchBar, {
      slots: {
        'search-action': icon,
      },
    });
    expect(component.find('.ra-search-bar__clear-icon').exists()).toBe(true);
  });
  it('renders placeholder props when passed', () => {
    const placeholder = 'Search for...';
    const component = shallowMount(RaSearchBar, {
      propsData: {
        placeholder: placeholder,
      },
    });
    expect(component.find('.ra-search-bar').attributes('placeholder')).toEqual(
      placeholder
    );
  });
});
