Makes any Vue component or element sticky – scrolls at a fixed position in the viewport. Specially useful for main navigation headers, sidebars, and more.

## Features

- Single dependency: `@bva/stickie` (which in turn is dependency free).
- Tiny footprint after minification and gzip.
- Multiple callbacks to hook into the plugin’s lifecycle.
- Scroll direction detection.
- Option to wait until tall elements are fully scrolled before making them sticky.
- Configurable state classes to adapt the look and feel to your needs.
- Support for enabling and disabling on a per viewport or media query basis.
- Smooth transition between sticky and static positions.
- High performant by using modern browser APIs such as `ResizeObserver` and `matchMedia` to detect changes to the interface, caching calculated properties, etc.
- ... and more!

## Installation

From your favorite CLI using yarn:

```
yarn add @bva/vue-sticky-directive
```

Or npm:

```
npm install @bva/vue-sticky-directive
```

### Register globally

```jsx
import Sticky from '@bva/vue-sticky-directive';

Vue.use(VueStickyDirective);
```

### Register locally

```jsx
import Sticky from '@bva/vue-sticky-directive';

export default {
	name: 'componentName',
	directives: {
		Sticky
	},
};
```

## Usage

Usage is as simple setting the `v-sticky` directive:

```jsx
<template>
	<div v-sticky>
		A sticky element
	</div>
</template>

<script>
	...
</script>
```

You can also pass options if needed. Directly in the directive:

```jsx
<template>
	<div v-sticky="{ contained: true, offset: 20 }">
		A sticky element
	</div>
</template>

<script>
	...
</script>
```

Or from a Vue object:

```jsx
<template>
	<div v-sticky="stickyOptions">
		A sticky element
	</div>
</template>

<script>
	export default {
		...,
		data() {
			return {
				stickyOptions: {
					contained: true,
					offset: 20,
				},
			};
		},
		...,
	};
</script>
```

## Options

All options available in `@bva/stickie` are also available to this directive. Head over its documentation to learn more: [https://www.npmjs.com/package/@bva/stickie#options](https://www.npmjs.com/package/@bva/stickie#options)

## Events

All events fired by `@bva/stickie` [https://www.npmjs.com/package/@bva/stickie#events](https://www.npmjs.com/package/@bva/stickie#events) can be handled through this directive.

You can use Vue’s standard `@` notation as well as `v-on`:

```jsx
<template>
	<div v-sticky @sticky:active="onStickyActive">
		A sticky element
	</div>
</template>

<script>
	export default {
		...,
		methods: {
			onStickyActive() {
				console.log('Sticky is now active!');
			},
		},
		...,
	};
</script>
```

Accessing event data can be done through the event’s `details` object on the listener binding:

```jsx
<template>
	<div v-sticky @sticky:active="(evt) => onStickyActive(evt.detail)">
		A sticky element
	</div>
</template>

<script>
	export default {
		...,
		methods: {
			onStickyActive(data) {
				console.log('Sticky is now active!');

				console.log('Event data:', data);
			},
		},
		...,
	};
</script>
```

Or simply access it directly on the handler:

```jsx
<template>
	<div v-sticky @sticky:active="onStickyActive">
		A sticky element
	</div>
</template>

<script>
	export default {
		...,
		methods: {
			onStickyActive({ details }) {
				console.log('Sticky is now active!');

				console.log('Event data:', details);
			},
		},
		...,
	};
</script>
```