export default class Tabs {
  constructor(options = {}) {
    this.tabsSelector = options.tabsSelector || ".tabs";
    this.animSpeed = options.animSpeed || 300;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    this.tabsetSelector = ".tabset";
    this.tabButtonSelector = ".tab-opener";
    this.tabBlockSelector = ".tab-panel";
    this.activeClass = "active";

    this.tabs = document.querySelector(this.tabsSelector);
    this.tabset = null;
    this.tabButtons = [];
    this.tabBlocks = [];
    this.prevTabButton = null;
    this.prevTabBlock = null;

    this.isInitialized = false;
  }

  init() {
    if (!this.tabs) {
      console.error(
        `There is no such element with class - ${this.tabsSelector}`,
      );
      return;
    }

    if (this.destroyAbove || this.destroyBelow) {
      this.bindBreakpoint();
      return;
    }

    this.initTabs();
  }

  initTabs() {
    this.findElements();
    this.setActiveElements();
    this.initAria();
    this.bindEvents();

    this.isInitialized = true;
  }

  findElements() {
    this.tabset = this.tabs.querySelector(this.tabsetSelector);
    this.tabButtons = this.tabs.querySelectorAll(this.tabButtonSelector);
    this.tabBlocks = this.tabs.querySelectorAll(this.tabBlockSelector);
  }

  setActiveElements() {
    const firstTabButton = this.tabButtons[0];
    const firstTabBlock = this.tabBlocks[0];

    firstTabButton.classList.add(this.activeClass);
    firstTabBlock.classList.add(this.activeClass);

    this.prevTabButton = firstTabButton;
    this.prevTabBlock = firstTabBlock;
  }

  initAria() {
    this.tabset.setAttribute("role", "tablist");

    if (this.tabButtons.length !== this.tabBlocks.length) return;

    this.tabButtons.forEach((button, index) => {
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", `tab-block-${index + 1}`);
      button.setAttribute(
        "aria-selected",
        button.classList.contains(this.activeClass),
      );
    });

    this.tabBlocks.forEach((block, index) => {
      block.setAttribute("role", "tabpanel");
      block.setAttribute("id", `tab-block-${index + 1}`);
    });
  }

  open(tabButton, tabBlock) {
    if (!tabBlock || !tabButton) return;

    if (tabBlock._timer) {
      clearTimeout(tabBlock._timer);
    }

    tabButton.classList.add(this.activeClass);
    tabButton.setAttribute("aria-selected", "true");

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
    if (!tabBlock || !tabButton) return;

    if (tabBlock._timer) {
      clearTimeout(tabBlock._timer);
    }

    tabButton.classList.remove(this.activeClass);
    tabButton.setAttribute("aria-selected", "false");

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

      const isActive = tabButton.classList.contains(this.activeClass);

      if (isActive) return;

      this.close(this.prevTabButton, this.prevTabBlock);
      this.open(tabButton, tabBlock);

      this.prevTabButton = tabButton;
      this.prevTabBlock = tabBlock;
    };

    this.tabs.addEventListener("click", this.handleTabClick);
  }

  bindBreakpoint() {
    this.checkBreakpoint();
    this.handleBreakpointResize = () => this.checkBreakpoint();
    window.addEventListener("resize", this.handleBreakpointResize);
  }

  checkBreakpoint() {
    const width = window.innerWidth;

    const shouldDestroy =
      (this.destroyAbove !== null && width >= this.destroyAbove) ||
      (this.destroyBelow !== null && width <= this.destroyBelow);

    if (shouldDestroy && this.isInitialized) {
      this.destroy();
      return;
    }

    if (!shouldDestroy && !this.isInitialized) {
      this.initTabs();
    }
  }

  destroy() {
    this.tabs.removeEventListener("click", this.handleTabClick);

    this.tabset.removeAttribute("role");

    this.tabButtons.forEach((button) => {
      button.classList.remove(this.activeClass);
      button.removeAttribute("role");
      button.removeAttribute("aria-selected");
      button.removeAttribute("aria-controls");
    });

    this.tabBlocks.forEach((block) => {
      block.classList.remove(this.activeClass);
      block.removeAttribute("role");
      block.removeAttribute("id");
    });

    this.prevTabButton = null;
    this.prevTabBlock = null;

    this.isInitialized = false;
  }
}
