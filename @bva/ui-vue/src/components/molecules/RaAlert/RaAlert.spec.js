import { shallowMount } from '@vue/test-utils';
import RaAlert from './RaAlert.vue';
describe('RaAlert.vue', () => {
  it('renders an alert', () => {
    const component = shallowMount(RaAlert);
    expect(component.classes('ra-alert')).toBe(true);
  });
  it('renders an alert with css modifier', () => {
    const component = shallowMount(RaAlert, {
      propsData: {
        variant: 'warning',
      },
    });
    expect(component.find('.ra-alert--warning').exists()).toBe(true);
  });
  it('renders an alert message when passed via props', () => {
    const message = 'Hello World';
    const component = shallowMount(RaAlert, {
      propsData: {
        message,
      },
    });
    expect(component.find('.ra-alert__message').exists()).toBe(true);
    expect(component.find('.ra-alert__message').text()).toMatch(message);
  });
  it('renders an alert icon when passed via slot', () => {
    const component = shallowMount(RaAlert, {
      slots: {
        icon: "<img class='slotImg' src='/assets/img.jpg' />",
      },
    });
    expect(component.find('.slotImg').exists()).toBe(true);
  });
  it('renders an alert message when passed via slot', () => {
    const component = shallowMount(RaAlert, {
      slots: {
        message: "<p class='slotMessage'>text</p>",
      },
    });
    expect(component.find('.slotMessage').exists()).toBe(true);
  });
});
