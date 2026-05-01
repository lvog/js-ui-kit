import Tabs from "./tabs";

export function initTabs() {
  const tabs = new Tabs({
    destroyAbove: 1024,
    // animate: false,
    animateHeight: true,
  });
  tabs.init();
}
