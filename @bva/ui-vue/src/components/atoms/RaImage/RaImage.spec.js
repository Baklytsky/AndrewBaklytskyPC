import { shallowMount } from '@vue/test-utils';
import RaImage from './RaImage.vue';
describe('RaImage.vue', () => {
  it('renders a component', () => {
    const component = shallowMount(RaImage, {
      propsData: {
        alt: 'test',
        src: 'test',
      },
    });
    expect(component.classes('ra-image')).toBe(true);
  });
});
