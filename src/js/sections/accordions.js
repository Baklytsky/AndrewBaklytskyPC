import {collapsible} from '../features/collapsible';
import {register} from '../vendor/theme-scripts/theme-sections';

const selectors = {
  trigger: '[data-collapsible-trigger]',
};

const classes = {
  isExpanded: 'is-expanded',
};

const accordionSection = {
  onBlockSelect(e) {
    const trigger = e.target.querySelector(selectors.trigger);
    requestAnimationFrame(() => {
      if (!trigger.classList.contains(classes.isExpanded)) {
        trigger.dispatchEvent(new Event('click'));
      }
    });
  },
};

register('accordions', [accordionSection, collapsible]);
