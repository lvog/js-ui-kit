/**
 * FormValidation configuration options
 * @typedef {Object} FormValidationOptions
 * @property {string} [formSelector] - Root element selector
 * @property {string|null} [successClass] - Class added to form group on valid field
 * @property {string} [errorClass] - Class added to form group on invalid field
 * @property {string} [errorParentSelector] - Parent element selector for error class and message
 * @property {string|null} [skipFields] - Selector for fields to skip during validation
 * @property {string|null} [addClassToForm] - Class added to form on submit if invalid
 * @property {boolean} [addErrorMessage] - Enable/disable error messages
 * @property {string} [errorMessageClass] - Class for error message element
 * @property {string|null} [sendUrl] - URL to send form data
 * @property {Function|null} [onSuccess] - Callback on successful form submission
 * @property {Function|null} [onError] - Callback on failed form submission
 * @property {Object} [messages] - Custom validation messages for localization
 */

export default class FormValidation {
  constructor(options = {}) {
    // User options
    this.formSelector = options.formSelector || ".form";
    this.successClass = options.successClass || null;
    this.errorClass = options.errorClass || "input-error";
    this.parentSelector = options.errorParentSelector || ".form-group";
    this.skipFields = options.skipFields || null;
    this.addClassToForm = options.addClassToForm || null;
    this.addErrorMessage = options.addErrorMessage ?? true;
    this.errorMessageClass = options.errorMessageClass || "error-message";
    this.sendUrl = options.sendUrl || null;
    this.onSuccess = options.onSuccess || null;
    this.onError = options.onError || null;

    // Validation
    // Patterns and messages used in field validation
    this.pattern = {
      email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      number: /^-?\d+(\.\d+)?$/,
      tel: /^\+?\d[\d\s\-()]{8,}\d$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };

    this.messages = {
      required: "This field is required.",
      email: "Please enter a valid email address.",
      tel: "Please enter a valid phone number.",
      password:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      number: "Please enter a valid number.",
      min: (min) => `Must be at least ${min} characters.`,
      max: (max) => `Must be no more than ${max} characters.`,
      confirm: "Passwords don't match.",
      pattern: "Please enter a valid value.",
      ...options.messages,
    };

    this.validationAttributes = [
      "required",
      "type",
      "pattern",
      "min",
      "max",
      "confirm",
    ];

    // DOM elements
    this.form = document.querySelector(this.formSelector);
    this.fields = [];

    // State
    this.touchedFields = new Set();
  }

  // Initialization

  init() {
    if (!this.form) {
      console.error(
        `There is no such element with class - ${this.formSelector}`,
      );
      return;
    }

    this.form.setAttribute("novalidate", "true");
    this.findElements();
    this.bindEvents();
  }

  // Setup

  findElements() {
    this.fields = [...this.form.elements].filter((field) => {
      if (this.skipFields && field.matches(this.skipFields)) {
        return false;
      }

      return this.validationAttributes.some(
        (attr) => field.dataset[attr] !== undefined,
      );
    });
  }

  // Events
  // All event listeners (user interaction)

  bindEvents() {
    this.handleBlur = (e) => {
      const data = this.getEventField(e);

      if (!data) return;

      const { field, type } = data;

      if (type === "radio" || type === "checkbox") return;

      this.touchedFields.add(field);

      this.validate(field);
    };

    this.handleInput = (e) => {
      const data = this.getEventField(e);

      if (!data) return;

      const { field, type } = data;

      if (type === "radio" || type === "checkbox") return;

      if (!this.touchedFields.has(field)) return;

      this.validate(field);
    };

    this.handleChange = (e) => {
      const data = this.getEventField(e);

      if (!data) return;

      const { field, type } = data;

      if (type === "radio" || type === "checkbox") {
        this.touchedFields.add(field);
      }

      if (!this.touchedFields.has(field)) return;

      this.validate(field);
    };

    this.handleSubmit = async (e) => {
      e.preventDefault();

      this.fields.forEach((field) => this.touchedFields.add(field));

      const isValid = this.validateForm();

      if (isValid) {
        let response = null;

        if (this.sendUrl) {
          response = await this.sendForm();
        }

        await this.onSuccess?.(response, this.form);
      }
    };

    this.form.addEventListener("blur", this.handleBlur, true);
    this.form.addEventListener("input", this.handleInput);
    this.form.addEventListener("change", this.handleChange);
    this.form.addEventListener("submit", this.handleSubmit);
  }

  // Core Logic
  // Main validation behavior

  validate(field) {
    this.validateField(field);
    this.validateConfirmFields(field.id);
    this.checkErrors();
  }

  validateForm() {
    let isValid = true;

    this.fields.forEach((field) => {
      const result = this.validateField(field);
      if (!result.isValid) isValid = false;
    });

    if (this.addClassToForm) {
      this.form.classList.toggle(this.addClassToForm, !isValid);
    }

    return isValid;
  }

  validateField(field) {
    const type = this.getType(field);
    const value = this.getValue(field, type);
    const options = this.getValidationOptions(field);

    let result = this.validateRequired(field, value);

    if (result.isValid && value.length) {
      result = this.validateByType(type, value, options);
    }

    if (result.isValid && value.length && field.dataset.confirm) {
      result = this.validateConfirm(field.dataset.confirm, value);
    }

    const fieldGroup = this.getFieldGroup(field, type);
    this.updateFieldState(fieldGroup, result);

    return result;
  }

  validateRequired(field, value) {
    const isRequired = field.dataset.required === "true";

    if (!value || !value.length) {
      if (isRequired) {
        return this.createResult(false, this.messages.required);
      }
    }

    return this.createResult(true);
  }

  validateByType(type, value, options) {
    const { pattern, min, max } = options;

    switch (type) {
      case "email":
      case "tel":
      case "password":
        return this.validateFormat(type, value, pattern);
      case "number":
        return this.validateNumber(value, pattern, min, max);
      case "text":
        return this.validateText(value, pattern, min, max);
      case "select":
        return this.createResult(
          value !== "",
          value !== "" ? "" : this.messages.required,
        );
      default:
        return this.createResult(true);
    }
  }

  validateNumber(value, pattern, min, max) {
    const regexp = pattern ? new RegExp(pattern) : this.pattern.number;

    if (!regexp.test(value)) {
      return this.createResult(false, this.messages.number);
    }

    const num = parseFloat(value);

    if (min !== null && num < min) {
      return this.createResult(false, this.messages.min(min));
    }

    if (max !== null && num > max) {
      return this.createResult(false, this.messages.max(max));
    }

    return this.createResult(true);
  }

  validateText(value, pattern, min, max) {
    const regexp = pattern ? new RegExp(pattern) : null;

    if (regexp && !regexp.test(value)) {
      return this.createResult(false, this.messages.pattern);
    }

    if (min !== null && value.length < min) {
      return this.createResult(false, this.messages.min(min));
    }

    if (max !== null && value.length > max) {
      return this.createResult(false, this.messages.max(max));
    }

    return this.createResult(true);
  }

  validateFormat(type, value, pattern) {
    const regexp = pattern ? new RegExp(pattern) : this.pattern[type];
    const result = regexp.test(value);

    if (!result) {
      const errorMessage = this.messages[type] || this.messages.pattern;

      return this.createResult(false, errorMessage);
    }

    return this.createResult(true);
  }

  validateConfirmFields(id) {
    if (!id) return;

    const confirmField = this.form.querySelector(`[data-confirm="#${id}"]`);

    if (!confirmField) return;

    this.validateField(confirmField);
  }

  validateConfirm(selector, value) {
    const confirmField = this.form.querySelector(selector);

    if (!confirmField) {
      return this.createResult(true);
    }

    const result = confirmField.value.trim() === value;

    if (!result) {
      return this.createResult(false, this.messages.confirm);
    }

    return this.createResult(true);
  }

  // Helpers
  // Data retrieval and validation helpers

  getFieldGroup(field, type) {
    const parent = field.closest(this.parentSelector);

    if (type === "radio" || type === "checkbox") {
      const selector =
        type === "radio"
          ? `input[type="radio"][name="${field.name}"]`
          : `input[type="checkbox"][name="${field.name}"]`;

      return [...parent.querySelectorAll(selector)];
    }

    return [field];
  }

  getType(field) {
    return (
      field.dataset.type ||
      field.getAttribute("type") ||
      field.tagName.toLowerCase()
    );
  }

  getValue(field, type) {
    let value;

    if (type === "checkbox" || type === "radio") {
      value = this.getCheckedValue(field, type);
    } else {
      value = field.value.trim();
    }

    return value;
  }

  getValidationOptions(field) {
    return {
      pattern: field.dataset.pattern || null,
      min: field.hasAttribute("data-min") ? Number(field.dataset.min) : null,
      max: field.hasAttribute("data-max") ? Number(field.dataset.max) : null,
    };
  }

  getCheckedValue(field, type) {
    const parent = field.closest(this.parentSelector);
    const selector =
      type === "checkbox" ? "input[type='checkbox']" : "input[type='radio']";
    const inputs = parent.querySelectorAll(selector);

    if (type === "radio") {
      return [...inputs].find((el) => el.checked)?.value || null;
    }

    return [...inputs].filter((el) => el.checked).map((el) => el.value);
  }

  getEventField(e) {
    const field = e.target;

    if (!this.fields.includes(field)) return null;

    const type = this.getType(field);

    return {
      field,
      type,
    };
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        data[key] = Array.isArray(data[key])
          ? [...data[key], value]
          : [data[key], value];
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  createResult(isValid, errorMessage = "") {
    return {
      isValid,
      errorMessage,
    };
  }

  // Network
  // Form data sending

  buildRequest() {
    const hasFiles = [...this.form.querySelectorAll('input[type="file"]')].some(
      (input) => input.files.length,
    );

    if (hasFiles) {
      return {
        body: new FormData(this.form),
        headers: {},
      };
    }

    return {
      body: JSON.stringify(this.getFormData()),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  async sendForm() {
    const { body, headers } = this.buildRequest();

    try {
      const response = await fetch(this.sendUrl, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error("Form submit error:", error);

      this.onError?.(error);

      return null;
    }
  }

  // UI State
  // Updates visual state (classes and error messages)

  updateFieldState(fields, result) {
    const formGroup = fields[0].closest(this.parentSelector);
    const { isValid, errorMessage } = result;

    if (!formGroup) {
      console.error(
        `FormValidation: no parent "${this.parentSelector}" found for`,
        fields,
      );
      return;
    }

    if (this.addErrorMessage) {
      if (!isValid) {
        this.addError(formGroup, fields, errorMessage);
      } else {
        this.removeError(formGroup, fields);
      }
    }

    formGroup.classList.toggle(this.errorClass, !isValid);

    if (this.successClass) {
      formGroup.classList.toggle(this.successClass, isValid);
    }
  }

  addError(holder, fields, message) {
    let errorBlock = holder.querySelector(`.${this.errorMessageClass}`);

    if (errorBlock) {
      errorBlock.textContent = message;
    } else {
      errorBlock = document.createElement("span");
      errorBlock.classList.add(this.errorMessageClass);
      errorBlock.textContent = message;

      if (fields.length > 1) {
        errorBlock.id = `${fields[0].name}-error`;
      } else {
        errorBlock.id = `${fields[0].id}-error`;
      }

      errorBlock.setAttribute("aria-live", "polite");

      holder.append(errorBlock);

      fields.forEach((field) => {
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", errorBlock.id);
      });
    }
  }

  removeError(holder, fields) {
    const errorBlock = holder.querySelector(`.${this.errorMessageClass}`);
    if (!errorBlock) return;

    fields.forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    });
    errorBlock.remove();
  }

  checkErrors() {
    if (!this.addClassToForm) return;

    const errors = this.form.querySelectorAll(`.${this.errorClass}`);

    if (!errors.length) {
      this.form.classList.remove(this.addClassToForm);
    }
  }

  resetFieldStates() {
    this.form
      .querySelectorAll(`.${this.errorClass}`)
      .forEach((el) => el.classList.remove(this.errorClass));

    if (this.successClass) {
      this.form
        .querySelectorAll(`.${this.successClass}`)
        .forEach((el) => el.classList.remove(this.successClass));
    }
  }

  // Destroy
  // Cleanup and reset

  destroy() {
    this.form.removeEventListener("submit", this.handleSubmit);
    this.form.removeEventListener("input", this.handleInput);
    this.form.removeEventListener("change", this.handleChange);
    this.form.removeEventListener("blur", this.handleBlur, true);

    this.touchedFields.clear();

    if (this.addClassToForm) {
      this.form.classList.remove(this.addClassToForm);
    }

    this.fields.forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    });

    this.resetFieldStates();

    this.form
      .querySelectorAll(`.${this.errorMessageClass}`)
      .forEach((el) => el.remove());

    this.form.removeAttribute("novalidate");

    this.fields = [];
  }
}
