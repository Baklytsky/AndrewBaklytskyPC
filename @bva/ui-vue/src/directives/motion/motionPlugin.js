import Vue from 'vue';
import { motion } from '@bva/ui-vue/src/directives';

const moduleOptions = JSON.parse('<%= JSON.stringify(options) %>');

export default (context, inject) => {
  Vue.directive('motion', moduleOptions.enabled ? motion : {});

  inject('motion', {
    ...moduleOptions,
  });
};
