# Tabs

A lightweight, dependency-free JavaScript tabs component with smooth fade animation, optional height transition and responsive behavior.

## Features

- Smooth fade animation between tabs
- Single active tab (tab behavior)
- Optional container height animation
- Accessible (WAI-ARIA support)
- Responsive destroy (breakpoints)
- No dependencies

## Options

| Option        | Type             | Default | Description                          |
| ------------- | ---------------- | ------- | ------------------------------------ |
| tabsSelector  | `string`         | `.tabs` | Root element selector                |
| animate       | `boolean`        | `true`  | Enable/disable animations            |
| animSpeed     | `number`         | `500`   | Animation duration (ms)              |
| animateHeight | `boolean`        | `false` | Animate tab content container height |
| destroyAbove  | `number \| null` | `null`  | Disable tabs above this width        |
| destroyBelow  | `number \| null` | `null`  | Disable tabs below this width        |

## Usage

### JavaScript

#### Basic tabs

```
import Tabs from "./tabs";
const tabs = new Tabs();
tabs.init();
```

#### Disable animation

```
const tabs = new Tabs({
  animate: false,
});
```

#### Enable tab content height animation

```
const tabs = new Tabs({
  animateHeight: true,
});
```

#### Disable tabs on desktop

```
const tabs = new Tabs({
  destroyAbove: 1024,
});
```

### HTML Structure

```
<div class="tabs">
  <ul class="tabset">
    <li class="tab-item">
      <button class="tab-opener" type="button">Tab #1</button>
    </li>
    <li class="tab-item">
      <button class="tab-opener" type="button">Tab #2</button>
    </li>
  </ul>
  <div class="tab-content">
    <div class="tab-panel">
      Content 1
    </div>
    <div class="tab-panel">
      Content 2
    </div>
  </div>
</div>
```

### Base SCSS styles

Base tabs styles are located at:

```
src/styles/components/_tabs.scss
```

and are imported into the main stylesheet:

```
style.scss
```

> The file uses SCSS mixins and CSS variables.

## Requirements

- Tabs structure must match the required HTML markup
- The number of `.tab-opener` elements must match `.tab-panel`
- SCSS styles must be included
