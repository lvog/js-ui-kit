/**
 * Tabs configuration options
 * @typedef {Object} TabsOptions
 * @property {string} [tabsSelector] - Root element selector
 * @property {boolean} [animate] - Enable/disable animations
 * @property {number} [animSpeed] - Animation duration (ms)
 * @property {boolean} [animateHeight] - Animate tab content height
 * @property {number|null} [destroyAbove] - Disable tabs above this width (px)
 * @property {number|null} [destroyBelow] - Disable tabs below this width (px)
 */

export default class Tabs {
  constructor(options = {}) {
    // User options
    this.tabsSelector = options.tabsSelector || ".tabs";
    this.animate = options.animate ?? true;
    this.animSpeed = options.animSpeed || 500;
    this.animateHeight =
      options.animateHeight && this.animate ? options.animateHeight : false;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    // Internal selectors
    this.tabsetSelector = ".tabset";
    this.tabButtonSelector = ".tab-opener";
    this.tabContentSelector = ".tab-content";
    this.tabBlockSelector = ".tab-panel";

    this.activeClass = "active";
    this.disabledClass = "disabled";

    // DOM elements
    this.tabs = document.querySelector(this.tabsSelector);
    this.tabset = null;
    this.tabContent = null;
    this.tabButtons = [];
    this.tabBlocks = [];
    this.prevTabButton = null;
    this.prevTabBlock = null;

    this.isInitialized = false;
    this.isAnimating = false;
  }

  // Initialization
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

    if (this.tabButtons.length < 2 || this.tabBlocks.length < 2) {
      console.error(
        `Tabs: requires at least 2 tabs, but found ${this.tabButtons.length} buttons and ${this.tabBlocks.length} blocks`,
      );
      return;
    }

    if (this.tabButtons.length !== this.tabBlocks.length) {
      console.error(
        `Tabs: number of buttons (${this.tabButtons.length}) does not match number of tabs (${this.tabBlocks.length})`,
      );
      return;
    }

    this.setActiveElements();
    this.initAria();
    this.bindEvents();

    this.isInitialized = true;
  }

  // Setup

  findElements() {
    this.tabset = this.tabs.querySelector(this.tabsetSelector);
    this.tabContent = this.tabs.querySelector(this.tabContentSelector);
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
    if (!this.tabset) return;

    this.tabset.setAttribute("role", "tablist");

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

  // Events
  // All event listeners (user interaction)

  bindEvents() {
    this.handleTabClick = (e) => {
      const tabButton = e.target.closest(this.tabButtonSelector);
      if (!tabButton) return;
      if (this.animate && this.isAnimating) return;

      const tabId = tabButton.getAttribute("aria-controls");
      const nextTab = this.tabs.querySelector(`#${tabId}`);

      if (nextTab === this.prevTabBlock) return;

      if (this.animate) {
        this.isAnimating = true;
        this.tabButtons.forEach((btn) => btn.classList.add(this.disabledClass));
      }

      const tabsHolder = this.tabContent;
      const prevTab = this.prevTabBlock;

      // Without animation - just switch active classes
      if (!this.animate) {
        prevTab.classList.remove(this.activeClass);
        nextTab.classList.add(this.activeClass);

        this.prevTabButton.classList.remove(this.activeClass);
        this.prevTabButton.setAttribute("aria-selected", "false");
        tabButton.classList.add(this.activeClass);
        tabButton.setAttribute("aria-selected", "true");

        this.prevTabButton = tabButton;
        this.prevTabBlock = nextTab;
        return;
      }

      if (this.animateHeight) {
        // Measure the height of the new tab for tab content holder
        nextTab.classList.add(this.activeClass);
        const endHeight = nextTab.offsetHeight;
        nextTab.classList.remove(this.activeClass);

        // Animate the height of the tab content holder
        tabsHolder.style.height = `${tabsHolder.offsetHeight}px`;
        // Reflow
        tabsHolder.offsetHeight;
        tabsHolder.style.transition = `height ${this.animSpeed}ms`;
        tabsHolder.style.height = `${endHeight}px`;
      }

      // Hide the previous tab
      prevTab.style.opacity = 1;
      // Reflow
      prevTab.offsetHeight;
      prevTab.style.transition = `opacity ${this.animSpeed / 2}ms`;
      prevTab.style.opacity = 0;

      // After the previous tab disappears — show the new one
      setTimeout(() => {
        prevTab.classList.remove(this.activeClass);
        prevTab.removeAttribute("style");

        // Show the new tab with animation
        nextTab.classList.add(this.activeClass);
        nextTab.style.opacity = 0;
        // Reflow
        nextTab.offsetHeight;
        nextTab.style.transition = `opacity ${this.animSpeed}ms`;
        nextTab.style.opacity = 1;

        nextTab.addEventListener(
          "transitionend",
          () => {
            nextTab.removeAttribute("style");
            this.isAnimating = false;
            this.tabButtons.forEach((btn) =>
              btn.classList.remove(this.disabledClass),
            );

            if (this.animateHeight) {
              tabsHolder.removeAttribute("style");
            }
          },
          { once: true },
        );
      }, this.animSpeed / 2);

      this.prevTabButton.classList.remove(this.activeClass);
      this.prevTabButton.setAttribute("aria-selected", "false");
      tabButton.classList.add(this.activeClass);
      tabButton.setAttribute("aria-selected", "true");

      this.prevTabButton = tabButton;
      this.prevTabBlock = nextTab;
    };

    this.tabs.addEventListener("click", this.handleTabClick);
  }

  bindBreakpoint() {
    this.checkBreakpoint();
    this.handleBreakpointResize = () => this.checkBreakpoint();
    window.addEventListener("resize", this.handleBreakpointResize);
  }

  // Responsive
  // Handles breakpoint-based behavior

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

  // Destroy
  // Cleanup and reset

  destroy() {
    this.tabs.removeEventListener("click", this.handleTabClick);

    this.tabset.removeAttribute("role");

    this.tabButtons.forEach((button) => {
      button.classList.remove(this.activeClass, this.disabledClass);
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
    this.isAnimating = false;
  }
}
