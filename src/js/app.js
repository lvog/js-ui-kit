import "../styles/style.scss";
import { initDropDownMenu } from "@js/components/dropDownMenu/initDropDownMenu";
import { initSlider } from "@js/components/slider/initSlider";
import { initAccordion } from "@js/components/accordion/initAccordion";
import { initTabs } from "@js/components/tabs/initTabs";
import { initFormValidation } from "@js/components/formValidation/initFormValidation";
import { initPopup } from "@js/components/popup/initPopup";
import { initInViewport } from "@js/components/inViewport/initInViewport";
import { initCustomSelect } from "@js/components/customSelect/initCustomSelect";

document.addEventListener("DOMContentLoaded", () => {
  initDropDownMenu();
  initSlider();
  initAccordion();
  initTabs();
  initFormValidation();
  initPopup();
  initCustomSelect();
  initInViewport();
});
