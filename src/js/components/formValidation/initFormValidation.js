import FormValidation from "./formValidation";

export function initFormValidation() {
  const formValidation = new FormValidation({
    formSelector: ".form-validation",
    addClassToForm: "form-error",
    skipFields: ".skip-field",
    messages: {
      email: "Enter a valid email address",
    },
    onSuccess(response, form) {
      formValidation.resetFieldStates();
      form.reset();
    },
  });
  formValidation.init();
}
