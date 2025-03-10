(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@bva/stickie')) :
  typeof define === 'function' && define.amd ? define(['@bva/stickie'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.VueStickyDirective = factory(global.Stickie));
})(this, (function (Stickie) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Stickie__default = /*#__PURE__*/_interopDefaultLegacy(Stickie);

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var DEFAULTS = {
    contained: false,
    classScope: "sticky",
    eventScope: "sticky"
  };

  var Sticky = function Sticky() {
    return {
      inserted: function inserted(el, binding, vnode) {
        vnode.context.$nextTick(function () {
          new Stickie__default["default"](el, _objectSpread2(_objectSpread2({}, DEFAULTS), binding.value));
        });
      },
      unbind: function unbind(el, binding, vnode) {
        var sticky = Stickie__default["default"].get(el);

        if (sticky) {
          sticky.destroy();
        }
      },
      update: function update(el, binding, vnode) {
        if (binding.value === binding.oldValue) {
          return;
        }

        var sticky = Stickie__default["default"].get(el);

        if (sticky && sticky.initialized) {
          sticky.options = _objectSpread2(_objectSpread2({}, sticky.options), binding.value);
          sticky.updateSticky();
        }
      },
      componentUpdated: function componentUpdated(el, binding, vnode) {
        var sticky = Stickie__default["default"].get(el);

        if (sticky && sticky.initialized) {
          sticky.updateSticky();
        }
      }
    };
  };

  var StickyDirective = Sticky();

  var install = function install(Vue) {
    Vue.directive("StickyDirective", StickyDirective);
  };

  if (typeof window !== 'undefined' && window.Vue) {
    Vue.use(install);
  }

  StickyDirective.install = install;

  return StickyDirective;

}));
