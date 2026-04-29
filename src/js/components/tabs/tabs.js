export default class Tabs {
  constructor(options = {}) {
    this.tabsSelector = options.tabsSelector || ".tabs";
    this.animSpeed = options.animSpeed || 300;

    this.tabButtonSelector = ".tab-opener";
    this.tabBlockSelector = ".tab-block";
    this.activeClass = "active";

    this.tabs = document.querySelector(this.tabsSelector);
    this.tabButtons = [];
    this.tabBlocks = [];
    this.prevTabButton = null;
    this.prevTabBlock = null;
  }

  init() {
    if (!this.tabs) {
      console.error(
        `There is no such element with class - ${this.tabsSelector}`,
      );
      return;
    }

    this.findElements();
    this.findActiveElements();
    this.bindEvents();
  }

  findElements() {
    this.tabButtons = this.tabs.querySelectorAll(this.tabButtonSelector);
    this.tabBlocks = this.tabs.querySelectorAll(this.tabBlockSelector);
  }

  findActiveElements() {
    const activeTabButton = this.tabs.querySelector(
      `${this.tabButtonSelector}.${this.activeClass}`,
    );
    const activeTabBlock = this.tabs.querySelector(
      `${this.tabBlockSelector}.${this.activeClass}`,
    );

    this.prevTabButton = activeTabButton;
    this.prevTabBlock = activeTabBlock;
  }

  open(tabButton, tabBlock) {
    if (tabBlock._timer) {
      clearTimeout(tabBlock._timer);
    }

    tabButton.classList.add(this.activeClass);
    tabButton.setAttribute("aria-expanded", "true");

    tabBlock.style.opacity = 0;
    tabBlock.style.transition = `opacity ${this.animSpeed}ms`;

    tabBlock.offsetHeight;
    tabBlock.style.opacity = 1;

    tabBlock._timer = setTimeout(() => {
      tabBlock.classList.add(this.activeClass);
      tabBlock.removeAttribute("style");
    }, this.animSpeed);
  }

  close(tabButton, tabBlock) {
    if (tabBlock._timer) {
      clearTimeout(tabBlock._timer);
    }

    tabButton.classList.remove(this.activeClass);
    tabButton.setAttribute("aria-expanded", "false");

    tabBlock.style.opacity = 1;
    tabBlock.style.transition = `opacity ${this.animSpeed}ms`;

    tabBlock.offsetHeight;
    tabBlock.style.opacity = 0;

    tabBlock._timer = setTimeout(() => {
      tabBlock.removeAttribute("style");
      tabBlock.classList.remove(this.activeClass);
    }, this.animSpeed);
  }

  bindEvents() {
    this.handleTabClick = (e) => {
      const tabButton = e.target.closest(this.tabButtonSelector);

      if (!tabButton) return;

      const tabId = tabButton.getAttribute("aria-controls");
      const tabBlock = this.tabs.querySelector(`#${tabId}`);

      const isActive = tabBlock.classList.contains(this.activeClass);

      if (isActive) return;

      this.close(this.prevTabButton, this.prevTabBlock);
      this.open(tabButton, tabBlock);

      this.prevTabButton = tabButton;
      this.prevTabBlock = tabBlock;
    };

    this.tabs.addEventListener("click", this.handleTabClick);
  }

  destroy() {
    this.tabs.removeEventListener("click", this.handleTabClick);

    this.tabButtons.forEach((button) => {
      button.classList.remove(this.activeClass);
      button.removeAttribute("aria-expanded");
      button.removeAttribute("aria-controls");
    });

    this.tabBlocks.forEach((block) => block.classList.remove(this.activeClass));

    this.prevTabButton = null;
    this.prevTabBlock = null;
  }
}
