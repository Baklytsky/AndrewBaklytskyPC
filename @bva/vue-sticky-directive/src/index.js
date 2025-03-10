import StickyDirective from "./sticky-directive";

const install = function (Vue) {
  Vue.directive("StickyDirective", StickyDirective);
};

if (typeof window !== 'undefined' && window.Vue) {
  Vue.use(install);
}

StickyDirective.install = install;

export default StickyDirective;
