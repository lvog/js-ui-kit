import Tabs from "./tabs";

export function initTabs() {
  const tabs = new Tabs({
    destroyAbove: 1024,
  });
  tabs.init();
}
