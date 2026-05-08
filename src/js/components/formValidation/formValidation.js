export default class FormValidation {
  constructor(options = {}) {
    this.formSelector = options.formSelector || ".form";
    this.errorClass = options.errorClass || "input-error";
    this.parentSelector = options.errorParentSelector || ".form-group";
    this.addClassToForm = options.addClassToForm || null;
    this.addErrors = options.addErrors ?? true;
    this.errorMessageClass = options.errorMessageClass || "error-message";

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
    this.handleInput = (e) => {
      const field = e.target;
      if (!this.fields.includes(field)) return;

      const type = this.getType(field);

      if ((type === "radio" || type === "checkbox") && e.type === "blur") {
        return;
      }

      this.validateField(field);
      this.validateConfirmFields(field.id);
      this.checkErrors();
    };

    this.handleSubmit = (e) => {
      e.preventDefault();

      let flag = true;

      this.fields.forEach((field) => {
        const result = this.validateField(field);
        if (!result.isValid) flag = false;
      });

      if (this.addClassToForm) {
        this.form.classList.toggle(this.addClassToForm, !flag);
      }

      if (flag) {
        this.form.reset();
      }
    };

    this.form.addEventListener("submit", this.handleSubmit);
    this.form.addEventListener("input", this.handleInput);
    this.form.addEventListener("change", this.handleInput);
    this.form.addEventListener("blur", this.handleInput, true);
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

    let result = {
      isValid: true,
      errorMessage: "",
    };

    if (!value || !value.length) {
      result.isValid = false;
      result.errorMessage = this.messages.required;
    }

    if (result.isValid) {
      switch (type) {
        case "email":
        case "tel":
        case "password":
          result = this.validateFormat(type, value, pattern);
          break;
        case "number":
          result = this.validateNumber(value, pattern, min, max);
          break;
        case "text":
          result = this.validateText(value, pattern, min, max);
          break;
        case "select":
          result = {
            isValid: value !== "",
            errorMessage: value !== "" ? "" : this.messages.required,
          };
          break;
      }
    }

    if (result.isValid && field.dataset.confirm) {
      result = this.validateConfirm(field.dataset.confirm, value);
    }

    const fieldGroup = this.getFieldGroup(field, type);
    this.toggleError(fieldGroup, result);

    return result;
  }

  validateNumber(value, pattern, min, max) {
    const regexp = pattern ? new RegExp(pattern) : this.pattern.number;

    if (!regexp.test(value)) {
      return {
        isValid: false,
        errorMessage: this.messages.number,
      };
    }

    const num = parseFloat(value);

    if (min !== null && num < min) {
      return {
        isValid: false,
        errorMessage: this.messages.min(min),
      };
    }

    if (max !== null && num > max) {
      return {
        isValid: false,
        errorMessage: this.messages.max(max),
      };
    }

    return {
      isValid: true,
      errorMessage: "",
    };
  }

  validateText(value, pattern, min, max) {
    const regexp = pattern ? new RegExp(pattern) : null;

    if (regexp && !regexp.test(value)) {
      return {
        isValid: false,
        errorMessage: this.messages.pattern,
      };
    }

    if (min !== null && value.length < min) {
      return {
        isValid: false,
        errorMessage: this.messages.min(min),
      };
    }

    if (max !== null && value.length > max) {
      return {
        isValid: false,
        errorMessage: this.messages.max(max),
      };
    }

    return {
      isValid: true,
      errorMessage: "",
    };
  }

  validateFormat(type, value, pattern) {
    const regexp = pattern ? new RegExp(pattern) : this.pattern[type];
    const result = regexp.test(value);

    if (!result) {
      return {
        isValid: false,
        errorMessage: this.messages[type] || this.messages.pattern,
      };
    }

    return {
      isValid: true,
      errorMessage: "",
    };
  }

  validateConfirmFields(id) {
    if (!id) return;

    const confirmField = this.form.querySelector(`[data-confirm="#${id}"]`);

    if (!confirmField) return;

    this.validateField(confirmField);
  }

  validateConfirm(selector, value) {
    const confirmField = this.form.querySelector(selector);

    if (!confirmField) return;

    const result = confirmField.value.trim() === value;

    if (!result) {
      return {
        isValid: false,
        errorMessage: this.messages.confirm,
      };
    }

    return {
      isValid: true,
      errorMessage: "",
    };
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

  toggleError(fields, result) {
    let formGroup = fields[0].closest(this.parentSelector);
    const { isValid, errorMessage } = result;

    if (!formGroup) {
      console.error(
        `FormValidation: no parent "${this.parentSelector}" found for`,
        fields,
      );
      return;
    }

    if (this.addErrors) {
      if (!isValid) {
        this.addError(formGroup, errorMessage);
      } else {
        this.removeError(formGroup);
      }
    }

    formGroup.classList.toggle(this.errorClass, !isValid);
  }

  removeError(holder) {
    const errorBlock = holder.querySelector(`.${this.errorMessageClass}`);
    if (!errorBlock) return;
    errorBlock.remove();
  }

  addError(holder, message) {
    let errorBlock = holder.querySelector(`.${this.errorMessageClass}`);
    if (errorBlock) {
      errorBlock.textContent = message;
    } else {
      errorBlock = document.createElement("span");
      errorBlock.classList.add(this.errorMessageClass);
      errorBlock.textContent = message;
      holder.append(errorBlock);
    }
  }

  destroy() {
    this.form.removeEventListener("submit", this.handleSubmit);
    this.form.removeEventListener("input", this.handleInput);
    this.form.removeEventListener("change", this.handleInput);
    this.form.removeEventListener("blur", this.handleInput, true);

    if (this.addClassToForm) {
      this.form.classList.remove(this.addClassToForm);
    }

    this.form
      .querySelectorAll(`.${this.errorClass}`)
      .forEach((el) => el.classList.remove(this.errorClass));

    const errorMessages = this.form.querySelectorAll(
      `.${this.errorMessageClass}`,
    );
    if (errorMessages) {
      errorMessages.forEach((el) => el.remove());
    }

    this.form.removeAttribute("novalidate");

    this.fields = [];
  }
}
