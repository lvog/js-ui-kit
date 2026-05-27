# DropDownMenu

A lightweight, dependency-free JavaScript dropdown navigation component with mobile menu toggle, submenu animation and responsive behavior.

## Features

- Mobile menu toggle (burger)
- Multi-level dropdown support
- Smooth submenu height animation (mobile only by default)
- Close on outside click
- Accessible (WAI-ARIA support)
- Responsive destroy (breakpoints)
- No dependencies

## Options

| Option             | Type             | Default       | Description                                  |
| ------------------ | ---------------- | ------------- | -------------------------------------------- |
| menuSelector       | `string`         | `.menu`       | Root menu element selector                   |
| menuOpenerSelector | `string`         | `.nav-opener` | Selector for the mobile menu toggle button   |
| menuDropSelector   | `string`         | `.drop`       | Selector for the menu dropdown container     |
| menuActiveClass    | `string`         | `nav-active`  | Class added to body when mobile menu is open |
| activeItemClass    | `string`         | `active`      | Class added to active dropdown item          |
| hideOnClickOutside | `boolean`        | `true`        | Close menu when clicking outside             |
| animateSubmenu     | `boolean`        | `true`        | Enable submenu height animation              |
| animateBelow       | `number`         | `768`         | Enable animation only below this width (px)  |
| animSpeed          | `number`         | `500`         | Animation duration (ms)                      |
| accessibility      | `boolean`        | `true`        | Enable accessibility attributes              |
| destroyAbove       | `number \| null` | `null`        | Disable dropdown menu above this width       |
| destroyBelow       | `number \| null` | `null`        | Disable dropdown menu below this width       |

## Usage

### JavaScript

#### Basic dropdown menu

```
import DropDownMenu from "./dropDownMenu";
const dropDownMenu = new DropDownMenu();
dropDownMenu.init();
```

#### Disable submenu animation

```
const dropDownMenu = new DropDownMenu({
  animateSubmenu: false,
});
```

#### Disable close on outside click

```
const dropDownMenu = new DropDownMenu({
  hideOnClickOutside: false,
});
```

#### Custom selectors

```
const dropDownMenu = new DropDownMenu({
  menuSelector: ".nav",
  menuOpenerSelector: ".burger",
  menuDropSelector: ".nav-drop",
});
```

#### Disable dropdown menu on desktop

```
const dropDownMenu = new DropDownMenu({
  destroyAbove: 1024,
});
```

### HTML Structure

```
<button class="nav-opener" type="button" aria-label="Open menu"></button>
<div class="drop">
  <nav class="nav">
    <ul class="menu">
      <li>
        <a href="#">About</a>
        <ul class="submenu">
          <li><a href="#">Our History</a></li>
          <li><a href="#">Team</a></li>
          <li><a href="#">Careers</a></li>
        </ul>
      </li>
      <li>
        <a href="#">Services</a>
        <ul class="submenu">
          <li><a href="#">Web Design</a></li>
          <li>
            <a href="#">Development</a>
            <ul class="submenu">
              <li><a href="#">Markup</a></li>
              <li><a href="#">WordPress</a></li>
              <li><a href="#">React/Vue/Angular</a></li>
              <li><a href="#">Webflow</a></li>
            </ul>
          </li>
          <li><a href="#">Marketing</a></li>
        </ul>
      </li>
      <li>
        <a href="#">Portfolio</a>
      </li>
      <li>
        <a href="#">Blog</a>
      </li>
      <li>
        <a href="#">Contact</a>
      </li>
    </ul>
  </nav>
</div>
```

### Base SCSS styles

Base dropdown menu styles are located at:

```
src/styles/components/_menu.scss
```

and are imported into the main stylesheet:

```
style.scss
```

> The file uses SCSS mixins and CSS variables.

## Requirements

- Menu structure must match the required HTML markup
- Dropdown triggers must be `<a>` tags — direct children of `<li>` with a nested `<ul>`
- `.nav-opener` and `.drop` must be present in the DOM for mobile toggle to work
- SCSS styles must be included

## Limitations

- Hover mode not supported — dropdowns open on click only
- Dropdown trigger links are always prevented on click — use href="#" or a <span> for triggers without a destination page
- Keyboard arrow navigation is not supported, only `Escape`
- Submenu animation works only below animateBelow breakpoint
