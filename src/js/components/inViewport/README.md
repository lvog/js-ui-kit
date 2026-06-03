# InViewport

A lightweight, dependency-free JavaScript component for detecting elements in the viewport using the native IntersectionObserver API.

## Features

- Detect when elements enter or leave the viewport
- Configurable threshold and root margin
- Optional one-time or repeated triggering
- Callbacks on enter and leave
- Responsive destroy (breakpoints)
- No dependencies

## Options

| Option       | Type             | Default       | Description                                       |
| ------------ | ---------------- | ------------- | ------------------------------------------------- |
| selector     | `string`         | `.viewport`   | Elements selector                                 |
| activeClass  | `string`         | `in-viewport` | Class added to element when in viewport           |
| threshold    | `number`         | `0.1`         | Percentage of element visibility to trigger (0-1) |
| rootMargin   | `string`         | `0px`         | Margin around the viewport (CSS syntax)           |
| once         | `boolean`        | `true`        | Trigger only once per element                     |
| onEnter      | `Function\|null` | `null`        | Callback when element enters viewport             |
| onLeave      | `Function\|null` | `null`        | Callback when element leaves viewport             |
| destroyAbove | `number\|null`   | `null`        | Disable above this width (px)                     |
| destroyBelow | `number\|null`   | `null`        | Disable below this width (px)                     |

## Usage

### JavaScript

#### Basic

```
import InViewport from "./inViewport";

const inViewport = new InViewport();
inViewport.init();
```

#### Repeat on every enter/leave

```
const inViewport = new InViewport({
  once: false,
});
```

#### Custom threshold and root margin

```
const inViewport = new InViewport({
  threshold: 0.5,
  rootMargin: "0px 0px -100px 0px",
});
```

#### With callbacks

```
const inViewport = new InViewport({
  onEnter(el) {
    console.log("entered", el);
  },
  onLeave(el) {
    console.log("left", el);
  },
});
```

#### Disable on mobile

```
const inViewport = new InViewport({
  destroyBelow: 768,
});
```

### HTML Structure

```
<section class="section viewport">
  <div class="container">
    <h2 class="fade-effect">Title</h2>
    <div class="move-effect">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
  </div>
</section>
```

> Any element can be used as a viewport target. The `activeClass` is added when the element enters the viewport.
>
> Use `.fade-effect` for fade-in animation and `.move-effect` for fade-in with upward movement. Both classes can be applied to the viewport element or its children.

### Base SCSS styles

Base styles for animation are located at:

```
src/styles/components/_viewport.scss
```

and are imported into the main stylesheet:

```
style.scss
```

> The file uses SCSS mixins and CSS variables.

## Requirements

- Browser must support IntersectionObserver
- Elements must use the default `.viewport` class or a custom selector to be observed
- Include SCSS styles to enable fade and move animations

## Limitations

- Only window viewport is supported as `root` - custom scroll containers are not supported
