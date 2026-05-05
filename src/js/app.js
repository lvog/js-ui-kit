import "../styles/style.scss";
import { initSlider } from "@js/components/slider/initSlider";
import { initAccordion } from "@js/components/accordion/initAccordion";
import { initTabs } from "@js/components/tabs/initTabs";
import { initFormValidation } from "@js/components/formValidation/initFormValidation";

document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  initAccordion();
  initTabs();
  initFormValidation();
});
