# The Component Library and Vue Mixins

Mixins allow to easily share Vue Options across multiple components.

There's very valid debate regarding migrating away from Vue Mixins and [this article](https://css-tricks.com/how-the-vue-composition-api-replaces-vue-mixins/) summarizes why it's a good idea to move to the Composition API instead of Options API (Mixins).

However, as of right now, there isn't a way to share reusable properties with the composables approach. For that matter, and in order to maintain a singular structure, we will be sticking with Mixins for props, computed, and other Vue Options until a better solution is available.

An important part of this component library is Storybook, which heavily relies on component props to generate [Dock Blocks](https://storybook.js.org/docs/vue/writing-docs/doc-blocks) and Controls straight out of a component Vue file, which do not yet work with composables.

## Guidelines

**IMPORTANT**: Mixins should only be used in the context of modules (organisms such as Heroes, Split Sections, Product Cards, Content Tiles, etc.) and not in smaller units (atoms/moleculues like a button, icons, arrows, add to cart, etc.). 

The reason for this is because modules, particularly modules that are hydrated from a CMS, have a structure that can be easily standardized and replicated. Smaller units do not benefit from such a structure much, since their contents and usage are generally unique and may vary greatly between components of their size.

Likewise, avoid using mixins in the context of larger sections of a site, i.e. a Product Page, Category Landing, etc., or a component that includes multiple organisms, because then the likelihood to face naming conflicts is larger and mixins do not deal with those very well.

### Location
All Vue Mixins files should be located within this directory (the `/mixins` directory):

```
src
│
└───mixins
│   │   README.md
│   │   <mixin-name-1>.js
│   │   <mixin-name-2>.js
│   │   <mixin-name-3>.js
│   │   ...
│   
└───   ...
```

### Syntax
All mixins should have a standard structure as established in the framework. Use the below template as a guide:

```
/**
 * Hosts component properties (props) for: <classification, types, etc.>.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Description and/or example usage of this prop.
     */
    aPropName: {
      type: String,
      default: "",
    },
    //...
  },
};
```
We value abundant comments, so the more the merrier.
**Note:** Particularly with Vue props, they should **ALWAYS** contain comments. These comments are picked up by Storybook using the vue-docgen-api and are extremely valuable for everyone in the team.

### Usage
Mixins can be used either individually or by bundling them into a single export for ease of use.

For example, if you had the mixins "module-columns.js" and a "module-styles.js", you may create a third file "module-common.js" which should in turn export a group of mixins.

We use this approach with the common mixins:
```
/**
 * Aggregates all common properties for components into a single export.
 */
import Text from "@bva/ui-vue/src/mixins/common-text";
import Links from "@bva/ui-vue/src/mixins/common-links";
import Media from "@bva/ui-vue/src/mixins/common-media";
import Layout from "@bva/ui-vue/src/mixins/common-layout";
//...

export default {
  mixins: [Text, Links, Media, Layout],
};
```

In your vue component file, you can then import the mixins as so:

```
<template>
    //Template logic...
</template>

<script>
    //other imports...
    import CommonMixins from "@bva/ui-vue/src/mixins/common";

    export default {
      name: "ComponentName",
      mixins: [CommonMixins],
    };
</script>
```

Alternatively you can pick-and-choose specific mixins if your component will not be leveraging the default common list:
```
<script>
    import CommonText from "@bva/ui-vue/src/mixins/props/common-text";
    import CommonLinks from "@bva/ui-vue/src/mixins/props/common-links";

    export default {
      //...
      mixins: [CommonText, CommonLinks],
      //...
    };
</script>
```