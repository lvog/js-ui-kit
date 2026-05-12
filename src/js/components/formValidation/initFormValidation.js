import FormValidation from "./formValidation";

export function initFormValidation() {
  const formValidation = new FormValidation({
    addClassToForm: "form-error",
    skipFields: ".skip-field",
    messages: {
      email: "Enter a valid email address",
      numberMin: (min) => `Age must be at least ${min}`,
      numberMax: (max) => `Age must not be greater than ${max}`,
    },
    onSuccess(response, form) {
      formValidation.resetFieldStates();
      form.reset();
    },
  });
  formValidation.init();
}
