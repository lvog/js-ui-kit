# Accordion

A lightweight, dependency-free JavaScript accordion component with smooth height animation, optional scroll to active item and responsive behavior.

## Features

- Smooth height animation
- Single active item (accordion behavior)
- Optional collapsible mode
- Scroll to active item
- Accessible (WAI-ARIA support)
- Responsive destroy (breakpoints)
- No dependencies

## Options

| Option            | Type             | Default      | Description                                                |
| ----------------- | ---------------- | ------------ | ---------------------------------------------------------- |
| accordionSelector | `string`         | `.accordion` | Root element selector                                      |
| collapsible       | `boolean`        | `false`      | Allow closing active item                                  |
| scrollToActive    | `boolean`        | `false`      | Scroll to opened item                                      |
| scrollOffset      | `number`         | `0`          | Offset for scroll position, useful with fixed headers (px) |
| animSpeed         | `number`         | `500`        | Animation duration (ms)                                    |
| destroyAbove      | `number \| null` | `null`       | Disable accordion above this width                         |
| destroyBelow      | `number \| null` | `null`       | Disable accordion below this width                         |

## Usage

### JavaScript

#### Basic accordion

```
import Accordion from "./accordion";
const accordion = new Accordion();
accordion.init();
```

#### Collapsible accordion

```
const accordion = new Accordion({
  collapsible: true,
});
```

#### Scroll to active item

```
const accordion = new Accordion({
  scrollToActive: true,
});
```

#### Disable accordion on desktop

```
const accordion = new Accordion({
  destroyAbove: 1024,
});
```

### HTML Structure

```
<ul class="accordion">
  <li class="accordion-item">
    <button
      class="accordion-opener"
      type="button"
      aria-expanded="false"
      aria-controls="accordion-slide-1"
    >
      Accordion Item #1
    </button>
    <div
      id="accordion-slide-1"
      class="accordion-slide"
    >
      <div class="text-block">
        Content 1
      </div>
    </div>
  </li>
  <li class="accordion-item">
    <button
      class="accordion-opener"
      type="button"
      aria-expanded="false"
      aria-controls="accordion-slide-2"
    >
      Accordion Item #2
    </button>
    <div
      id="accordion-slide-2"
      class="accordion-slide"
    >
      <div class="text-block">
        Content 2
      </div>
    </div>
  </li>
</ul>
```

#### Default active item

Add `active` class to `accordion-item` and set `aria-expanded="true"` on `accordion-opener`:

```
<ul class="accordion">
  <li class="accordion-item active">
    <button
      class="accordion-opener"
      type="button"
      aria-expanded="true"
      aria-controls="accordion-slide-1"
    >
      Accordion Item #1
    </button>
    ...
</ul>
```

### Base SCSS styles

Base accordion styles are located at:

```
src/styles/components/_accordion.scss
```

and are imported into the main stylesheet:

```
style.scss
```

> The file uses SCSS mixins and CSS variables.

## Requirements

- Accordion structure must match the required HTML markup
- Each opener should have aria-controls linked to slide id
- SCSS styles must be included
