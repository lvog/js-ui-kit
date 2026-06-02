# Popup

A lightweight, dependency-free JavaScript popup component with overlay, scroll lock, keyboard support and responsive behavior.

## Features

- Toggle popup on button click
- Close on outside click
- Close on Escape key
- Optional body scroll lock
- Accessible (WAI-ARIA support)
- Responsive destroy (breakpoints)
- Open/close callbacks
- No dependencies

## Options

| Option              | Type             | Default         | Description                           |
| ------------------- | ---------------- | --------------- | ------------------------------------- |
| popupHolderSelector | `string`         | `.popup-holder` | Root element selector                 |
| popupSelector       | `string`         | `.popup`        | Popup element selector                |
| openBtnSelector     | `string`         | `.popup-open`   | Selector for the open button          |
| closeBtnSelector    | `string`         | `.popup-close`  | Selector for the close button         |
| popupActiveClass    | `string`         | `popup-active`  | Class added to popup holder when open |
| lockScroll          | `boolean`        | `false`         | Lock body scroll when popup is open   |
| closeOnClickOutside | `boolean`        | `true`          | Close popup on outside click          |
| closeOnEsc          | `boolean`        | `true`          | Close popup on Escape key             |
| accessibility       | `boolean`        | `true`          | Enable WAI-ARIA support               |
| onOpen              | `Function\|null` | `null`          | Callback on popup open                |
| onClose             | `Function\|null` | `null`          | Callback on popup close               |
| destroyAbove        | `number\|null`   | `null`          | Disable popup above this width (px)   |
| destroyBelow        | `number\|null`   | `null`          | Disable popup below this width (px)   |

## Usage

### JavaScript

#### Basic popup

```
import Popup from "./popup";
const popup = new Popup();
popup.init();
```

#### With scroll lock

```
const popup = new Popup({
  lockScroll: true,
});
```

#### Disable close on outside click

```
const popup = new Popup({
  closeOnClickOutside: false,
});
```

#### With callbacks

```
const popup = new Popup({
  onOpen() {
    console.log("Popup opened");
  },
  onClose() {
    console.log("Popup closed");
  },
});
```

#### Multiple popups

```
const popup1 = new Popup({
  popupHolderSelector: ".popup-holder-1",
});

const popup2 = new Popup({
  popupHolderSelector: ".popup-holder-2",
});

popup1.init();
popup2.init();
```

#### Disable popup on mobile

```
const popup = new Popup({
  destroyBelow: 768,
});
```

### HTML Structure

```
<div class="popup-holder">
  <div class="btn-holder text-center">
    <button class="btn popup-open" type="button">Open Popup</button>
  </div>
  <div class="popup" id="popup">
    <button
      class="popup-close"
      type="button"
      aria-label="Close popup"
    ></button>
    <h3>Popup Title</h3>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
      do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </div>
</div>
```

### Base SCSS styles

Base popup styles are located at:

```
src/styles/components/_popup.scss
```

and are imported into the main stylesheet:

```
style.scss
```

> The file uses SCSS mixins and CSS variables.

## Requirements

- Popup structure must match the required HTML markup
- The `.popup` element must have a unique `id` when accessibility is enabled
- SCSS styles must be included

## Accessibility

When `accessibility` is enabled, the component automatically adds the following attributes:

**Open button** `(.popup-open)`

```
aria-expanded="true|false"
aria-controls="popup-id"
```

- `aria-expanded` indicates whether the popup is open
- `aria-controls` references the popup element by its `id`

**Popup element** `(.popup)`

```
role="dialog"
aria-modal="true"
tabindex="-1"
```

- `role="dialog"` identifies the element as a dialog
- `aria-modal="true"` indicates that interaction is limited to the popup while it is open
- `tabindex="-1"` allows the popup to receive focus programmatically

The popup also receives focus when opened and returns focus to the opener button when closed.

## Limitations

- One popup per instance — use multiple instances for multiple popups
