/**
 * Aggregates all common component mixins into a single export.
 */
import Text from '@bva/ui-vue/src/mixins/common-text';
import Links from '@bva/ui-vue/src/mixins/common-links';
import Media from '@bva/ui-vue/src/mixins/common-media';
import Styles from '@bva/ui-vue/src/mixins/common-styles';
import Layout from '@bva/ui-vue/src/mixins/common-layout';
import CMS from '@bva/ui-vue/src/mixins/common-cms';

export default {
  mixins: [Text, Links, Media, Styles, Layout, CMS],
};
