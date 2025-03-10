# Stickie

Makes any element sticky – scrolls at a fixed position in the viewport. Specially useful for main navigation headers, sidebars, and more.

## Features

- Dependency free.
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

```jsx
yarn add @bva/stickie
```

Or npm:

```jsx
npm install @bva/stickie
```

## Usage

In its most basic form, Stickie can be initialized by passing just two arguments:

- `el`: The element you want to become sticky. This can either be an `HTMLElement` or a valid selector.
- `options`: configurations to update Stickie’s behavior.

```jsx
import Stickie from '@bva/stickie';

const stickieInstance = new Stickie(el, options);
```

```jsx
import Stickie from '@bva/stickie';

const myStickyEl = document.querySelector('.main-header');

const stickieInstance = new Stickie(myStickyEl, options);
```

Alternatively pass the selector directly:

```jsx
import Stickie from '@bva/stickie';

const stickieInstance = new Stickie('.main-header', options);
```

To configure options, simply pass them as an object in the second argument:

```jsx
import Stickie from '@bva/stickie';

const stickieInstance = new Stickie('.main-header', {
	contained: true,
	offset: 40,
	...
});
```

## Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| enabled | Boolean, Media Query | true | Signals the plugin when it should become enabled or not. Provide a valid media query to limit initialization to a specific viewport only. |
| classScope | String | "stickie" | Customize the scope for the class names. i.e. if set to "sticky-header" then stickie--active becomes sticky-header--active, etc. |
| eventScope | String | "stickie" | Customize the scope for the event names. i.e. if set to "sticky-header" then stickie:init becomes sticky-header:init, etc. |
| contained | Boolean, Query Selector, HTMLElement | false | Constraint the sticky scroll within its direct parent or a given HTML node. When set to true it will look for the closest parent to use as the containing element. Alternatively provide a query selector or HTMLElement to use as the reference container. |
| autoWidth | Boolean, Query Selector, HTMLElement | true | Automatically update the width of the sticky element. This is only applicable when contained is set to true. By default the plugin will match the placeholder’s width, however a query selector or HTMLElement may be provided to use as the reference width instead. |
| offset | Number (px) ** | 0 | Specify an offset from the top of your element for the plugin to detect how far away from the viewport’s top to set it as sticky. Use a negative value to wait until scrolling has passed the sticky element. |
| offsetEl | Query Selector | N/A | A query selector may be provided instead of or in combination with the offset option. This allows targeting a given HTML node to gather its height as the offset. Multiple elements may be provided through a single selector and the plugin will try to accumulate their heights. |
| applyOffset | Boolean | true | Sets the calculated offset value as a top style property into the sticky element. |
| waitUntilScrolled | Boolean | true | If the sticky element is taller than the viewport, the plugin waits until the sticky element has been fully scrolled before making sticky. Note that this takes into account any offset or heightThereshold values configured. |
| heightThereshold | Number (px) ** | 25 | In case the sticky element is taller than the viewport, specify how much taller than the viewport it should be before allowing it to become sticky. |
| enableDirectionUpdates | Boolean | false | Allows the plugin to determine user scroll direction calculations. Basic scroll direction detection is always enabled, however this setting adds advanced detection for more granular control, such as handling special state classes as well as scroll speed, length, etc. |
| scrollDirectionResetWait | Number (ms) | 20 | How long to wait after user finished scrolling to store the user’s last scroll position. This works with scrollPositionThereshold to keep track of how much has the user scrolled since the last movevement. |
| scrollPositionThereshold | Number (px) ** | 80 | The minimum amount of pixels the user must scroll before a directional update is fired. Uses scrollDirectionResetWait to determine how much distance has the user scrolled since their last position. |
| fromViewportBottom | Boolean | false | Changes Stickie’s default behavior so that instead the sticky element is tracked from and fixed to bottom of the viewport. In some instances you may also need to set reversePlaceholderBehavior to true for a smoother fx. |
| reversePlaceholderBehavior | Boolean | false | By default, the placeholder’s height is set to 0 before the element becomes sticky, and then copies the sticky element’s height once it becomes active. Setting this option to true reverts the behavior, so that the placeholder is initially set to match the sticky element’s height, and then resets to 0 once the sticky element is active. |
| camelCaseEvents | Boolean | false | Converts all of the plugin's DOM event names to camelCase. Default event names are separated by a colon, i.e. `<eventScope>:active`. This option transforms the names so that use the format: `<eventScope>Active`. Useful for better compatibility with certain frameworks, such as React. |

** = Set as unit-less value, i.e. `25` and not `25px`.

## Events

Events are fired using native browser mechanisms, that means you can listen to events by attaching classic event listeners to your sticky element:

```jsx
import Stickie from '@bva/stickie';

const myStickyEl = document.querySelector('.main-header');

const stickieInstance = new Stickie(myStickyEl, options);

myStickyEl.addEventListener('stickie:active', evtHandler);

myStickyEl.addEventListener('stickie:docked', evtHandler);
```

Data is passed to these events through the event’s `detail` object:

```jsx
myStickyEl.addEventListener('stickie:active', onActiveHandler);

function onActiveHandler(evt) {
	//Log the current plugin instance:
	console.log(evt.detail.Stickie);
}

myStickyEl.addEventListener('stickie:scrollDirectionUpdate', onDirChangeHandler);

function onDirChangeHandler(evt) {
	if (evt.detail.previousDirection !== evt.detail.newDirection) {
		console.log(`The new direction is ${evt.detail.newDirection}!`);
	}
}
```

### `stickie:init`

**Arguments:** `Stickie` (current plugin instance)

Fires only one time, when the plugin initializes.

### `stickie:active`

**Arguments:** `Stickie` (current plugin instance)

Fires every time the sticky element becomes active (i.e. ”sticky”). This happens when the element becomes sticky from the top or bottom of the viewport.

### `stickie:inactive`

**Arguments:** `Stickie` (current plugin instance)

Fires every time the sticky element becomes inactive. This can be after scrolling above the sticky element, when the plugin is destroyed, or when entering a media query that is disabled.

### `stickie:frozen`

**Arguments:** `Stickie` (current plugin instance)

Fires when the sticky element is too tall and the user is scrolling through it.

### `stickie:docked`

**Arguments:** `Stickie` (current plugin instance)

Only applicable if the `contained` option is enabled. Fires when the sticky element reaches the bottom of its containing parent.

### `stickie:undocked`

**Arguments:** `Stickie` (current plugin instance)

Only applicable if the `contained` option is enabled. Fires when the sticky element becomes detached from the bottom of its containing parent, i.e. the user is scrolling up.

### `stickie:stuckBottom`

**Arguments:** `Stickie` (current plugin instance)

Fires when the sticky element attaches itself to the bottom of the viewport. Similar to `stickie:active`.

### `stickie:unstuckBottom`

**Arguments:** `Stickie` (current plugin instance)

Fires when the sticky element detaches itself to the bottom of the viewport. Similar to `stickie:inactive`.

### `stickie:scrollDirectionUpdate`

**Arguments:** `Stickie` (current plugin instance), `previousDirection`, `newDirection`

Fires every time the scroll direction changes. Note that the `enableDirectionUpdates` option must be enabled for this event to fire.
