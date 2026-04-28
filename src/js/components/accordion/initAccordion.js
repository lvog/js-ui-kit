import Accordion from "./accordion";

export function initAccordion() {
  const accordion = new Accordion({
    collapsible: true,
    scrollToActive: true,
  });

  accordion.init();
}
