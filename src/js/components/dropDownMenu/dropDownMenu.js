/**
 * DropDownMenu configuration options
 * @typedef {Object} DropDownMenuOptions
 * @property {string} [menuSelector] - Root element selector
 * @property {string} [menuOpenerSelector] - Selector for the mobile menu toggle button
 * @property {string} [menuDropSelector] - Selector for the menu drop container
 * @property {string} [menuActiveClass] - Class added to body when menu is open
 * @property {string} [activeItemClass] - Class added to active dropdown item
 * @property {boolean} [hideOnClickOutside] - Close menu on outside click
 * @property {boolean} [animateSubmenu] - Enable submenu height animation
 * @property {number} [animateBelow] - Enable animation only below this width (px)
 * @property {number} [animSpeed] - Animation duration (ms)
 * @property {boolean} [accessibility] - Enable aria-expanded on triggers
 * @property {number|null} [destroyAbove] - Disable dropdown above this width (px)
 * @property {number|null} [destroyBelow] - Disable dropdown below this width (px)
 */

export default class DropDownMenu {
  constructor(options = {}) {
    // User options
    this.menuSelector = options.menuSelector || ".menu";
    this.menuOpenerSelector = options.menuOpenerSelector || ".nav-opener";
    this.menuDropSelector = options.menuDropSelector || ".drop";
    this.menuActiveClass = options.menuActiveClass || "nav-active";
    this.activeItemClass = options.activeItemClass || "active";
    this.hideOnClickOutside = options.hideOnClickOutside ?? true;
    this.animateSubmenu = options.animateSubmenu ?? true;
    this.animateBelow = options.animateBelow || 768;
    this.animSpeed = options.animSpeed || 500;
    this.accessibility = options.accessibility ?? true;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    // Internal selectors
    this.dropDownClass = "has-dropdown";

    // DOM elements
    this.menu = document.querySelector(this.menuSelector);
    this.menuItems = [];

    // Flag
    this.isInitialized = false;
  }

  // Initialization

  init() {
    if (!this.menu) {
      console.error(
        `There is no such element with class - ${this.menuSelector}`,
      );
      return;
    }

    if (this.destroyAbove || this.destroyBelow) {
      this.bindBreakpoint();
      return;
    }

    this.initDropDownMenu();
  }

  initDropDownMenu() {
    this.findElements();
    this.addDropDownClass();
    this.initAria();
    this.bindEvents();

    this.isInitialized = true;
  }

  // Setup

  findElements() {
    this.menuItems = this.menu.querySelectorAll("li");
  }

  addDropDownClass() {
    this.menuItems.forEach((item) => {
      const submenu = item.querySelector(":scope > ul");

      if (submenu) {
        item.classList.add(this.dropDownClass);
      }
    });
  }

  initAria() {
    if (!this.accessibility) return;

    this.menuItems.forEach((item) => {
      const submenu = this.getSubmenu(item);
      if (!submenu) return;

      const trigger = item.querySelector(":scope > a");
      if (!trigger) return;

      trigger.setAttribute("aria-expanded", "false");
    });
  }

  // Core Logic
  // Main menu and dropdown behavior (open/close)

  toggleMenu() {
    document.body.classList.toggle(this.menuActiveClass);
  }

  closeMenu() {
    document.body.classList.remove(this.menuActiveClass);
  }

  openItem(item) {
    item.classList.add(this.activeItemClass);

    if (this.accessibility) {
      this.setAria(item, true);
    }

    if (this.animateSubmenu && this.shouldAnimate()) {
      const submenu = this.getSubmenu(item);
      if (!submenu) return;

      const height = submenu.scrollHeight;

      submenu.style.height = "0px";
      submenu.style.transition = `height ${this.animSpeed}ms`;
      submenu.getBoundingClientRect();
      submenu.style.height = `${height}px`;

      submenu.addEventListener(
        "transitionend",
        () => {
          submenu.removeAttribute("style");
        },
        { once: true },
      );
    }
  }

  closeItem(item) {
    if (this.animateSubmenu && this.shouldAnimate()) {
      const submenu = this.getSubmenu(item);
      if (!submenu) return;

      submenu.style.display = "block";

      const height = submenu.scrollHeight;

      submenu.style.height = `${height}px`;
      submenu.getBoundingClientRect();
      submenu.style.transition = `height ${this.animSpeed}ms`;
      submenu.style.height = "0px";

      submenu.addEventListener(
        "transitionend",
        () => {
          submenu.removeAttribute("style");
        },
        { once: true },
      );
    }

    item.classList.remove(this.activeItemClass);

    if (this.accessibility) {
      this.setAria(item, false);
    }
  }

  closeOthers(target) {
    if (this.animateSubmenu && this.shouldAnimate()) {
      this.menuItems.forEach((item) => {
        if (!item.classList.contains(this.activeItemClass)) {
          return;
        }

        // skip current dropdown and its children
        if (item.contains(target)) {
          return;
        }

        // close only top-level active items
        const parentDropDown = item.parentElement?.closest(
          `.${this.dropDownClass}`,
        );

        if (!parentDropDown) {
          this.closeItem(item);
        }
      });

      return;
    }

    const currentDropDown = target.closest(`.${this.dropDownClass}`);

    this.menuItems.forEach((item) => {
      if (
        item.classList.contains(this.activeItemClass) &&
        item !== currentDropDown &&
        !item.contains(target)
      ) {
        this.closeItem(item);
      }
    });
  }

  closeSiblings(item) {
    const parent = item.parentElement;
    if (!parent) return;

    parent
      .querySelectorAll(`:scope > li.${this.dropDownClass}`)
      .forEach((sibling) => {
        if (
          sibling !== item &&
          sibling.classList.contains(this.activeItemClass)
        ) {
          this.closeItem(sibling);
        }
      });
  }

  closeAll() {
    this.menuItems.forEach((item) => {
      if (!item.classList.contains(this.activeItemClass)) return;
      this.closeItem(item);
    });
  }

  // UI helpers
  // UI-related helpers (aria, animation)

  setAria(item, state) {
    const trigger = item.querySelector(":scope > a");

    if (!trigger) return;

    trigger.setAttribute("aria-expanded", state);
  }

  getSubmenu(item) {
    return item.querySelector(":scope > ul");
  }

  shouldAnimate() {
    return window.innerWidth < this.animateBelow;
  }

  // Events
  // All event listeners (user interaction)

  bindEvents() {
    this.handleMenuOpen = (e) => {
      const opener = e.target.closest(this.menuOpenerSelector);
      const isDrop = e.target.closest(this.menuDropSelector);

      if (opener) {
        e.preventDefault();
        this.toggleMenu();
        return;
      }

      if (this.hideOnClickOutside && !isDrop) {
        this.closeMenu();
        return;
      }
    };

    this.handleItemClick = (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const item = link.closest(`.${this.dropDownClass}`);
      if (!item) return;

      const trigger = item.querySelector(":scope > a");
      if (link !== trigger) return;

      e.preventDefault();

      if (item.classList.contains(this.activeItemClass)) {
        this.closeItem(item);
      } else {
        this.closeSiblings(item);
        this.openItem(item);
      }
    };

    this.handleClickOutsideMenu = (e) => {
      const opener = e.target.closest(this.menuOpenerSelector);

      if (opener) return;

      this.closeOthers(e.target);
    };

    this.handleKeyDown = (e) => {
      if (!this.accessibility) return;

      if (e.key === "Escape") {
        this.closeAll();
      }
    };

    document.body.addEventListener("click", this.handleMenuOpen);
    document.body.addEventListener("click", this.handleClickOutsideMenu);
    document.body.addEventListener("keydown", this.handleKeyDown);
    this.menu.addEventListener("click", this.handleItemClick);
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
      this.initDropDownMenu();
    }
  }

  // Destroy
  // Cleanup and reset

  destroy() {
    document.body.removeEventListener("keydown", this.handleKeyDown);
    document.body.removeEventListener("click", this.handleMenuOpen);
    document.body.removeEventListener("click", this.handleClickOutsideMenu);
    this.menu.removeEventListener("click", this.handleItemClick);

    this.menuItems.forEach((item) => {
      const submenu = this.getSubmenu(item);
      const trigger = item.querySelector(":scope > a");

      if (submenu) {
        submenu.removeAttribute("style");
      }

      if (trigger && this.accessibility) {
        trigger.removeAttribute("aria-expanded");
      }

      item.classList.remove(this.dropDownClass, this.activeItemClass);
    });

    document.body.classList.remove(this.menuActiveClass);

    this.isInitialized = false;
  }
}
