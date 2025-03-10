import { shallowMount } from '@vue/test-utils';
import RaProductTile from './RaProductTile.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import '@testing-library/jest-dom';
const title = 'Product A';
const wishlistIconButtonClass = '.ra-product-tile__wishlist';
const clickEventName = 'click:wishlist';
describe('RaProductTile.vue', () => {
  it('renders Product Tile', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
      },
    });
    expect(component.exists()).toBe(true);
    expect(component.find('.ra-product-tile').exists()).toBe(true);
  });
});
describe('RaProductTile.vue: Wish list icon button', () => {
  it('renders Product Tile', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
      },
    });
    expect(component.exists()).toBe(true);
    expect(component.find('.ra-product-tile').exists()).toBe(true);
  });
  it('has correct CSS class for container', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
      },
    });
    expect(component.classes()).toContain('ra-product-tile');
  });
  it('has default slot content when no custom content for wish list icon is passed', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
        wishlist: true,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const wishlistIconButton = component.find(wishlistIconButtonClass);
    const iconForWishlist = wishlistIconButton.find('raiconbutton-stub');
    expect(iconForWishlist.exists()).toBe(true);
  });
  it('has default wish list icon when none is passed (isInWishlist=false)', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
        wishlist: true,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const defaultWishlistIcon = component.props().wishlistIcon[0];
    const wishlistIconButton = component.find(wishlistIconButtonClass);
    const iconForWishlist = wishlistIconButton.find('raiconbutton-stub');
    const iconInRaIconForWishlist = iconForWishlist.attributes().icon;
    expect(iconInRaIconForWishlist).toBe(defaultWishlistIcon);
  });
  it('has default wish list icon when none is passed (isInWishlist=true)', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
        wishlist: true,
        isInWishlist: true,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const defaultIsInWishlistIcon = component.props().wishlistIcon[1];
    const wishlistIconButton = component.find(wishlistIconButtonClass);
    const iconForWishlist = wishlistIconButton.find('raiconbutton-stub');
    const iconInRaIconForWishlist = iconForWishlist.attributes().icon;
    expect(iconInRaIconForWishlist).toBe(defaultIsInWishlistIcon);
  });
  it('has no wish list button when wishlist is false (isInWishlist=false)', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const wishlistIconButton = component.find(wishlistIconButtonClass);
    expect(wishlistIconButton.exists()).toBe(false);
  });
  it('has no wish list button when wishlist is false (isInWishlist=true)', () => {
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
        isInWishlist: true,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const wishlistIconButton = component.find(wishlistIconButtonClass);
    expect(wishlistIconButton.exists()).toBe(false);
  });
  it('has custom slot content when slot is used', () => {
    const customSlotContentText = 'Wish List';
    const customSlotContent = `<b class="ra-product-tile__wishlist">${customSlotContentText}</b>`;
    const component = shallowMount(RaProductTile, {
      propsData: {
        title,
        image: 'assets/storybook/RaGallery/productA.png',
      },
      slots: {
        wishlist: customSlotContent,
      },
    });
    const wishlistIconButton = component.find(wishlistIconButtonClass);
    const iconForWishlist = wishlistIconButton.find('raiconbutton-stub');
    expect(iconForWishlist.exists()).toBe(false);
    expect(wishlistIconButton.text()).toBe(customSlotContentText);
  });
  it('emits click:wishlist event on button click', () => {
    const component = shallowMount(RaProductTile, {
      stubs: {
        wishlistIconButtonClass: RaIconButton,
      },
      propsData: {
        title,
        wishlist: true,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const wishlistIconButton = component.find(wishlistIconButtonClass);

    wishlistIconButton.vm.$emit('click');

    expect(component.emitted(clickEventName).length).toBe(1);
  });
  it('emits click:wishlist event with payload=true on button click when isInWishlist=false', () => {
    const component = shallowMount(RaProductTile, {
      stubs: {
        wishlistIconButtonClass: RaIconButton,
      },
      propsData: {
        title,
        wishlist: true,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const wishlistIconButton = component.find(wishlistIconButtonClass);

    wishlistIconButton.vm.$emit('click');

    expect(component.emitted()[clickEventName][0][0]).toBe(true);
  });
  it('emits click:wishlist event with payload=false on button click when isInWishlist=true', () => {
    const component = shallowMount(RaProductTile, {
      stubs: {
        wishlistIconButtonClass: RaIconButton,
      },
      propsData: {
        title,
        wishlist: true,
        isInWishlist: true,
        image: 'assets/storybook/RaGallery/productA.png',
      },
    });
    const wishlistIconButton = component.find(wishlistIconButtonClass);

    wishlistIconButton.vm.$emit('click');

    expect(component.emitted()[clickEventName][0][0]).toBe(false);
  });
});
