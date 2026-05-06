export default class FormValidation {
  constructor(options = {}) {
    this.formSelector = options.formSelector || ".form";
    this.errorClass = options.errorClass || "input-error";
    this.parentSelector = options.errorParentSelector || ".form-group";
    this.addClassToForm = options.addClassToForm || null;

    this.pattern = {
      email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      number: /^-?\d+(\.\d+)?$/,
      tel: /^\+?\d[\d\s\-()]{8,}\d$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    };

    this.requiredField = "[data-required='true']";

    this.form = document.querySelector(this.formSelector);
    this.fields = [];
  }

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

  findElements() {
    this.fields = [...this.form.querySelectorAll(this.requiredField)];
  }

  bindEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      const isValid = this.validateForm();

      if (isValid) {
        this.form.reset();
      }
    });

    this.form.addEventListener("input", (e) => this.handleValidation(e));
    this.form.addEventListener("change", (e) => this.handleValidation(e));
    this.form.addEventListener("blur", (e) => this.handleValidation(e), true);
  }

  handleValidation(e) {
    const field = e.target;
    if (!this.fields.includes(field)) return;

    this.validateField(field);
    this.validateConfirmFields(field.id);
    this.checkErrors();
  }

  validateForm() {
    let isValid = true;

    this.fields.forEach((field) => {
      const valid = this.validateField(field);
      if (!valid) isValid = false;
    });

    if (this.addClassToForm) {
      this.form.classList.toggle(this.addClassToForm, !isValid);
    }

    return isValid;
  }

  validateField(field) {
    const type = this.getType(field);
    const value = this.getValue(field, type);
    const pattern = field.dataset.pattern || null;
    const min = field.hasAttribute("data-min")
      ? Number(field.dataset.min)
      : null;

    const max = field.hasAttribute("data-max")
      ? Number(field.dataset.max)
      : null;

    let isValid = true;

    if (!value || !value.length) {
      isValid = false;
    }

    if (isValid) {
      switch (type) {
        case "email":
        case "tel":
        case "password":
          isValid = this.validateFormat(type, value, pattern);
          break;
        case "number":
          isValid = this.validateNumber(value, pattern, min, max);
          break;
        case "text":
          isValid = this.validateText(value, pattern, min, max);
          break;
        case "select":
          isValid = value !== "";
          break;
      }
    }

    if (isValid && field.dataset.confirm) {
      isValid = this.validateConfirm(field.dataset.confirm, value);
    }

    const fieldGroup = this.getFieldGroup(field, type);
    this.toggleError(fieldGroup, isValid);

    return isValid;
  }

  validateNumber(value, pattern, min, max) {
    const regexp = pattern ? new RegExp(pattern) : this.pattern.number;

    if (!regexp.test(value)) return false;

    const num = parseFloat(value);

    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;

    return true;
  }

  validateText(value, pattern, min, max) {
    const regexp = pattern ? new RegExp(pattern) : null;

    if (regexp && !regexp.test(value)) {
      return false;
    }

    if (min !== null && value.length < min) {
      return false;
    }

    if (max !== null && value.length > max) {
      return false;
    }

    return true;
  }

  validateFormat(type, value, pattern) {
    const regexp = pattern ? new RegExp(pattern) : this.pattern[type];
    return regexp.test(value);
  }

  validateConfirmFields(id) {
    if (!id) return;

    const confirmField = this.form.querySelector(`[data-confirm="#${id}"]`);

    if (!confirmField) return;

    this.validateField(confirmField);
  }

  validateConfirm(selector, value) {
    const confirmField = this.form.querySelector(selector);

    if (!confirmField) return false;

    return confirmField.value.trim() === value;
  }

  getFieldGroup(field, type) {
    const parent = field.closest(this.parentSelector);

    if (type === "radio" || type === "checkbox") {
      const selector =
        type === "radio"
          ? `input[type="radio"][name="${field.name}"]`
          : "input[type='checkbox']";

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

  checkErrors() {
    if (!this.addClassToForm) return;

    const errors = this.form.querySelectorAll(`.${this.errorClass}`);

    if (!errors.length) {
      this.form.classList.remove(this.addClassToForm);
    }
  }

  toggleError(fields, isValid) {
    let formGroup = fields[0].closest(this.parentSelector);

    if (!formGroup) {
      console.error(
        `FormValidation: no parent "${this.parentSelector}" found for`,
        field,
      );
      return;
    }

    formGroup.classList.toggle(this.errorClass, !isValid);
  }
}
