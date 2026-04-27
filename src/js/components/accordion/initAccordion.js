import Accordion from "./accordion";

export function initAccordion() {
  const accordion = new Accordion({
    // collapsible: true,
    scrollToActive: true,
    scrollOffset: 0,
    // destroyAbove: 1024,
  });

  accordion.init();
}
