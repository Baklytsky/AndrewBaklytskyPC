import { shallowMount } from '@vue/test-utils';
import RaRating from './RaRating.vue';
describe('RaRating.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaRating);
    expect(component.classes('ra-rating')).toBe(true);
  });
  it('render multiple stars when max is increased', () => {
    const score = 4;
    const max = 10;
    const component = shallowMount(RaRating, {
      propsData: {
        score,
        max,
      },
    });
    expect(component.findAll('.ra-rating__icon--negative').length).toBe(
      max - score
    );
  });
  it('renders with custom positive icon', () => {
    const score = 3;
    const max = 5;
    const component = shallowMount(RaRating, {
      propsData: {
        score,
        max,
      },
      slots: {
        'icon-positive': '<div class="ra-rating__icon-clock"></div>',
      },
    });
    expect(component.findAll('.ra-rating__icon-clock').length).toBe(score);
  });
  it('renders with custom negative icon', () => {
    const score = 2;
    const max = 5;
    const component = shallowMount(RaRating, {
      propsData: {
        score,
        max,
      },
      slots: {
        'icon-negative': '<div class="ra-rating__icon-close"></div>',
      },
    });
    expect(component.findAll('.ra-rating__icon-close').length).toBe(
      max - score
    );
  });
});
