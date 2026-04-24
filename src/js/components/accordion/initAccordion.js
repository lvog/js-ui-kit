import Accordion from "./accordion";

export function initAccordion() {
  const accordion = new Accordion({
    collapsible: true,
    destroyAbove: 1024,
  });

  accordion.init();
}
