import {collapsible} from '../features/collapsible';
import {shopPayLink} from '../features/shop-pay-link';
import {popoutSection} from '../features/popout';
import {newsletterSection} from '../globals/newsletter';
import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  trigger: '[data-collapsible-trigger-mobile]',
};

const classes = {
  isExpanded: 'is-expanded',
};

const footerAccordionSection = {
  onBlockSelect(e) {
    const trigger = e.target.querySelector(selectors.trigger);
    requestAnimationFrame(() => {
      if (trigger && !trigger.classList.contains(classes.isExpanded)) {
        trigger.dispatchEvent(new Event('click'));
      }
    });
  },
  onBlockDeselect(e) {
    const trigger = e.target.querySelector(selectors.trigger);
    requestAnimationFrame(() => {
      if (trigger && trigger.classList.contains(classes.isExpanded)) {
        trigger.dispatchEvent(new Event('click'));
      }
    });
  },
};

register('footer', [popoutSection, newsletterSection, collapsible, footerAccordionSection, shopPayLink]);
