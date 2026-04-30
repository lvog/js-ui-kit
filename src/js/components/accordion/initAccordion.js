import Accordion from "./accordion";

export function initAccordion() {
  const accordion = new Accordion({
    collapsible: true,
    openFirst: true,
    scrollToActive: true,
    destroyAbove: 768,
  });

  accordion.init();
}
