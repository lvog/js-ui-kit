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
| openFirst         | `boolean`        | `false`      | Open first item on init                                    |
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

#### First active item

```
const accordion = new Accordion({
  openFirst: true,
});
```

#### Collapsible accordion

```
const accordion = new Accordion({
  collapsible: true,
});
```

> Can also be used as a simple open/close toggle with slide animation by using a single item.

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
    <button class="accordion-opener" type="button">
      Accordion Item #1
    </button>
    <div class="accordion-slide">
      <div class="text-block">
        Content 1
      </div>
    </div>
  </li>
  <li class="accordion-item">
    <button class="accordion-opener" type="button">
      Accordion Item #2
    </button>
    <div class="accordion-slide">
      <div class="text-block">
        Content 2
      </div>
    </div>
  </li>
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

## Limitations

- Multi-level accordion not supported
