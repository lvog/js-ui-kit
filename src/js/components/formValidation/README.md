# Form Validation

A lightweight, dependency-free JavaScript form validation component with support for multiple field types, custom error messages, file uploads and async form submission.

## Features

- Validation for multiple field types
- Real-time validation after interaction
- Required and optional field validation
- Custom RegExp validation
- Min/max validation for text and number fields
- Password confirmation validation
- Skip specific fields from validation
- Accessible error messages (WAI-ARIA support)
- Custom validation messages
- Async form submission via fetch
- No dependencies

## Options

| Option              | Type               | Default         | Description                                                     |
| ------------------- | ------------------ | --------------- | --------------------------------------------------------------- | --- |
| formSelector        | `string`           | `.form`         | Root element selector                                           |
| successClass        | `string \| null`   | `null`          | Class added to the field's parent element when field is valid   |
| errorClass          | `string`           | `input-error`   | Class added to the field's parent element when field is invalid |
| errorParentSelector | `string`           | `.form-group`   | Parent element selector for error class and message             |
| skipFields          | `string \| null`   | `null`          | Selector for fields to skip during validation                   |
| addClassToForm      | `string \| null`   | `null`          | Class added to form on submit if invalid                        |
| addErrorMessage     | `boolean`          | `true`          | Enable/disable error messages                                   |
| errorMessageClass   | `string`           | `error-message` | Class for error message element                                 |
| sendUrl             | `string \| null`   | `null`          | URL to send form data                                           |
| onSuccess           | `Function \| null` | `null`          | Callback after successful form submission                       |
| onError             | `Function \| null` | `null`          | Callback after failed request submission                        |
| messages            | `Object`           | {}              | Custom validation messages                                      |     |

## Usage

### JavaScript

#### Basic validation

```
import FormValidation from "./formValidation";
const formValidation = new FormValidation();
formValidation.init();
```

#### Add success class

```
const formValidation = new FormValidation({
  successClass: "input-success",
});
```

#### Skip fields

```
const formValidation = new FormValidation({
  skipFields: ".skip-field",
});
```

#### Custom messages

```
const formValidation = new FormValidation({
  messages: {
    email: "Enter a valid email address",
    numberMin: (min) => `Age must be at least ${min}`,
    numberMax: (max) => `Age must not be greater than ${max}`,
  },
});
```

#### Form submit

```
const formValidation = new FormValidation({
  sendUrl: "/api/contact",
  async onSuccess(response, form) {
    console.log("Form submitted successfully");
    formValidation.resetFieldStates();
    form.reset();
  },
  onError(error) {
    console.error(error);
  },
});
```

### HTML Structure

#### Validation Data Attributes

| Attribute       | Description                                                         |
| --------------- | ------------------------------------------------------------------- |
| `data-required` | Marks field as required                                             |
| `data-type`     | Validation type: `"text"` `"email"` `"tel"` `"password"` `"number"` |
| `data-pattern`  | Custom RegExp pattern                                               |
| `data-min`      | Minimum value or text length                                        |
| `data-max`      | Maximum value or text length                                        |
| `data-confirm`  | Selector for confirm field validation                               |

#### Text field

```
<div class="form-group">
  <label for="name">Name *</label>
  <input
    id="name"
    type="text"
    name="name"
    placeholder="Name"
    autocomplete="name"
    data-type="text"
    data-min="2"
    data-pattern="^[a-zA-Z\'\- ]+$"
    data-required="true"
  />
</div>
```

> This field is required, must contain at least 2 characters and is validated against a custom pattern that allows only English letters, spaces, apostrophes and hyphens.

#### Checkboxes

```
<div class="form-group">
  <span class="label">Interests * (choose at least one)</span>
  <div class="form-control">
    <label class="custom-checkbox">
      <input
        type="checkbox"
        name="interests"
        value="design"
        data-required="true"
      /><span class="checkmark"></span>Design
    </label>
  </div>
  <div class="form-control">
    <label class="custom-checkbox">
      <input
        type="checkbox"
        name="interests"
        value="development"
        data-required="true"
      /><span class="checkmark"></span>Development
    </label>
  </div>
  <div class="form-control">
    <label class="custom-checkbox">
      <input
        type="checkbox"
        name="interests"
        value="marketing"
        data-required="true"
      /><span class="checkmark"></span>Marketing
    </label>
  </div>
</div>
```

> All checkbox inputs in a group must have `data-required="true"` and the same `name` attribute for correct validation. Radio buttons should follow the same structure. In this example you need to choose at least one.

#### Password confirmation

```
<div class="form-group">
  <label for="password">Password *</label>
  <input
    id="password"
    type="password"
    name="password"
    placeholder="Min 8 chars, upper, lower, digit, symbol"
    autocomplete="off"
    data-type="password"
    data-required="true"
  />
</div>
<div class="form-group">
  <label for="confirm-password">Confirm password *</label>
  <input
    id="confirm-password"
    type="password"
    name="confirm-password"
    placeholder="Repeat password"
    autocomplete="off"
    data-type="text"
    data-confirm="#password"
    data-required="true"
  />
</div>
```

> The password field is required and validated using the internal password pattern. The confirm password field is also required and must match the value of the original password field using the `data-confirm` selector.

#### Skip field

```
<div class="form-group">
  <label for="promo">Promo code</label>
  <input
    class="skip-field"
    id="promo"
    type="text"
    name="promo"
    placeholder="Optional"
    autocomplete="off"
    data-type="text"
    data-required="true"
  />
</div>
```

> This field is excluded from validation using the skipFields option. Even though it contains validation attributes, they are ignored because the field matches the `.skip-field` selector.

> **Note:** For more examples, see `index.html`.

### Base SCSS styles

Base form styles are located at:

```
src/styles/components/_form.scss
```

and are imported into the main stylesheet:

```
style.scss
```

> The file uses SCSS mixins and CSS variables.

## Accessibility

- Error messages use `aria-live="polite"`
- Invalid fields receive `aria-invalid="true"`
- Error messages are connected through `aria-describedby`

## Requirements

- Form structure must match the required HTML markup
- Each validated field must have at least one `data-` validation attribute
- Each field must be wrapped in a parent element matching `errorParentSelector`
- SCSS styles must be included

## Limitations

- `sendUrl` is required for form submission, without it only `onSuccess` callback is fired
- File inputs without validation `data-` attributes are sent but not validated
- Multi-step form validation is not supported out of the box, use `skipFields` to exclude inactive steps
