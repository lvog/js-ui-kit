import FormValidation from "./formValidation";

export function initFormValidation() {
  const formValidation = new FormValidation({
    formSelector: ".form-validation",
    addClassToForm: "form-error",
  });
  formValidation.init();
}
