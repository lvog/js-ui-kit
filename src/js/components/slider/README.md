# Slider

A lightweight, dependency-free JavaScript slider with support for swipe, autoplay, infinite loop and responsive behavior.

## Features

- Slide and fade modes
- Touch/swipe support (Pointer Events)
- Infinite loop
- Customizable arrow controls
- Autoplay with pause on hover
- Responsive destroy (breakpoints)
- No dependencies

## Options

| Option         | Type                | Default   | Description                                                         |
| -------------- | ------------------- | --------- | ------------------------------------------------------------------- |
| sliderSelector | `string`            | `.slider` | Root element selector                                               |
| mode           | `"slide" \| "fade"` | `"slide"` | Animation mode                                                      |
| arrows         | `boolean`           | `true`    | Enable navigation arrows                                            |
| btnPrevContent | `string`            | `"Prev"`  | Content for the previous button (text, HTML, icon, cannot be empty) |
| btnNextContent | `string`            | `"Next"`  | Content for the next button (text, HTML, icon, cannot be empty)     |
| dots           | `boolean`           | `false`   | Enable pagination dots                                              |
| swipeThreshold | `number`            | `50`      | Minimum swipe distance (px)                                         |
| infinite       | `boolean`           | `true`    | Enable infinite loop                                                |
| autoplay       | `boolean`           | `false`   | Enable autoplay                                                     |
| autoplayDelay  | `number`            | `5000`    | Autoplay delay (ms)                                                 |
| destroyAbove   | `number \| null`    | `null`    | Disable slider above this width                                     |
| destroyBelow   | `number \| null`    | `null`    | Disable slider below this width                                     |

## Usage

### JavaScript

#### Basic slider

```
import Slider from "./slider";
const slider = new Slider();
slider.init();
```

#### Fade mode with dots

```
const slider = new Slider({
    mode: "fade",
    dots: true,
});
```

#### Custom arrows

```
const slider = new Slider({
    btnPrevContent: '<i class="icon-arrow-left"></i>',
    btnNextContent: '<i class="icon-arrow-right"></i>',
});
```

#### Autoplay

```
const slider = new Slider({
    autoplay: true,
    autoplayDelay: 3000,
});
```

#### Disable slider on desktop

```
const slider = new Slider({
    destroyAbove: 1024,
});
```

### HTML Structure

```
<div class="slider">
  <div class="slider-track">
    <div class="slider-slide">Slide 1</div>
    <div class="slider-slide">Slide 2</div>
    <div class="slider-slide">Slide 3</div>
  </div>
</div>
```

### Base SCSS styles

Base slider styles are located at:

```
src/styles/components/_slider.scss
```

and are imported into the main stylesheet:

```
style.scss
```

> The file uses SCSS mixins and CSS variables.

## Requirements

- At least 2 slides are required
- Slider structure must match the required HTML markup
- SCSS styles must be included
