import { shallowMount } from '@vue/test-utils';
import RaNotification from './RaNotification.vue';
describe('RaNotification.vue', () => {
  it('renders the notification', () => {
    const component = shallowMount(RaNotification, {
      propsData: {
        visible: true,
      },
    });
    expect(component.find('.ra-notification').exists()).toBe(true);
  });
  it('renders the message when passed via props', () => {
    const message = 'Hello World';
    const component = shallowMount(RaNotification, {
      propsData: {
        visible: true,
        message,
      },
    });
    expect(component.find('.ra-notification__message').text()).toMatch(message);
  });
  it('renders the icon when passed via props', () => {
    const component = shallowMount(RaNotification, {
      propsData: {
        visible: true,
        icon: 'info',
      },
    });
    expect(component.find('.ra-notification__icon').exists()).toBe(true);
  });
  it('renders an alert icon when passed via slot', () => {
    const component = shallowMount(RaNotification, {
      propsData: {
        visible: true,
      },
      slots: {
        icon: "<img class='slotImg' src='/assets/img.jpg' />",
      },
    });
    expect(component.find('.slotImg').exists()).toBe(true);
  });
  it('renders an alert message when passed via slot', () => {
    const component = shallowMount(RaNotification, {
      propsData: {
        visible: true,
      },
      slots: {
        message: "<p class='slotMessage'>text</p>",
      },
    });
    expect(component.find('.slotMessage').exists()).toBe(true);
  });
});
