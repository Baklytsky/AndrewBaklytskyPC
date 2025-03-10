import { shallowMount } from '@vue/test-utils';
import RaTopBar from './RaTopBar.vue';
describe('RaTopBar', () => {
  it('renders a container element', () => {
    const component = shallowMount(RaTopBar, {});
    expect(component.classes('ra-top-bar')).toBe(true);
  });
  // Left slot check
  it('renders left slot content when passed', () => {
    const leftContent = 'LEFT__CONTENT';
    const component = shallowMount(RaTopBar, {
      slots: {
        left: leftContent,
      },
    });
    expect(component.find('.ra-top-bar__left').text()).toMatch(leftContent);
  });
  // Right slot check
  it('renders right slot content when passed', () => {
    const rightContent = 'RIGHT__CONTENT';
    const component = shallowMount(RaTopBar, {
      slots: {
        right: rightContent,
      },
    });
    expect(component.find('.ra-top-bar__right').text()).toMatch(rightContent);
  });
});
