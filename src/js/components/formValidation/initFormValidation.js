import FormValidation from "./formValidation";

export function initFormValidation() {
  const formValidation = new FormValidation({
    formSelector: ".form-validation",
    addClassToForm: "form-error",
    onSuccess(data, response, form) {
      formValidation.resetFieldStates();
      form.reset();
    },
  });
  formValidation.init();
}
