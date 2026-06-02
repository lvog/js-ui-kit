/**
 * Popup configuration options
 * @typedef {Object} PopupOptions
 * @property {string} [popupHolderSelector] - Root element selector
 * @property {string} [popupSelector] - Popup element selector
 * @property {string} [openBtnSelector] - Selector for the open button
 * @property {string} [closeBtnSelector] - Selector for the close button
 * @property {string} [popupActiveClass] - Class added to popup holder when open
 * @property {boolean} [lockScroll] - Lock body scroll when popup is open
 * @property {boolean} [closeOnClickOutside] - Close popup on outside click
 * @property {boolean} [closeOnEsc] - Close popup on Escape key
 * @property {boolean} [accessibility] - Enable aria attributes
 * @property {Function|null} [onOpen] - Callback on popup open
 * @property {Function|null} [onClose] - Callback on popup close
 * @property {number|null} [destroyAbove] - Disable popup above this width (px)
 * @property {number|null} [destroyBelow] - Disable popup below this width (px)
 */

export default class Popup {
  constructor(options = {}) {
    // User options
    this.popupHolderSelector = options.popupHolderSelector || ".popup-holder";
    this.popupSelector = options.popupSelector || ".popup";
    this.openBtnSelector = options.openBtnSelector || ".popup-open";
    this.closeBtnSelector = options.closeBtnSelector || ".popup-close";
    this.popupActiveClass = options.popupActiveClass || "popup-active";
    this.lockScroll = options.lockScroll ?? false;
    this.closeOnClickOutside = options.closeOnClickOutside ?? true;
    this.closeOnEsc = options.closeOnEsc ?? true;
    this.accessibility = options.accessibility ?? true;
    this.onOpen = options.onOpen || null;
    this.onClose = options.onClose || null;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    // DOM elements
    this.popupHolder = document.querySelector(this.popupHolderSelector);
    this.popup = null;
    this.openBtn = null;

    // Flag
    this.isInitialized = false;
  }

  // Initialization

  init() {
    if (!this.popupHolder) {
      console.error(
        `There is no such element with class - ${this.popupHolderSelector}`,
      );
      return;
    }

    if (this.destroyAbove || this.destroyBelow) {
      this.bindBreakpoint();
      return;
    }

    this.initPopup();
  }

  initPopup() {
    this.findElements();
    this.initAria();
    this.bindEvents();
    this.isInitialized = true;
  }

  // Setup

  findElements() {
    this.popup = this.popupHolder.querySelector(this.popupSelector);
    this.openBtn = this.popupHolder.querySelector(this.openBtnSelector);
  }

  initAria() {
    if (!this.accessibility) return;

    this.openBtn.setAttribute("aria-expanded", "false");
    this.openBtn.setAttribute("aria-controls", this.popup.id);
    this.popup.setAttribute("role", "dialog");
    this.popup.setAttribute("aria-modal", "true");
    this.popup.setAttribute("tabindex", "-1");
  }

  // Core Logic
  // Main popup behavior (open/close/toggle)

  togglePopup() {
    const isActive = this.popupHolder.classList.contains(this.popupActiveClass);

    isActive ? this.closePopup() : this.openPopup();
  }

  openPopup() {
    if (this.lockScroll) {
      document.body.style.overflow = "hidden";
    }

    if (this.accessibility) {
      this.openBtn.setAttribute("aria-expanded", "true");
      this.popup.focus();
    }

    this.popupHolder.classList.add(this.popupActiveClass);

    this.onOpen?.();
  }

  closePopup() {
    if (this.lockScroll) {
      document.body.style.removeProperty("overflow");
    }

    if (this.accessibility) {
      this.openBtn.setAttribute("aria-expanded", "false");
      this.openBtn.focus();
    }

    this.popupHolder.classList.remove(this.popupActiveClass);

    this.onClose?.();
  }

  // Events
  // All event listeners (user interaction)

  bindEvents() {
    this.handleClick = (e) => {
      const isOpenBtn = e.target.closest(this.openBtnSelector);
      const isActive = this.popupHolder.classList.contains(
        this.popupActiveClass,
      );
      const isCloseBtn = e.target.closest(this.closeBtnSelector);
      const isPopup = e.target.closest(this.popupSelector);

      if (isOpenBtn && this.popupHolder.contains(isOpenBtn)) {
        this.togglePopup();
        return;
      }

      if (!isActive) return;

      if (
        (this.closeOnClickOutside && !isPopup) ||
        (isCloseBtn && this.popupHolder.contains(isCloseBtn))
      ) {
        this.closePopup();
      }
    };

    this.handleKeyDown = (e) => {
      const isActive = this.popupHolder.classList.contains(
        this.popupActiveClass,
      );

      if (!isActive) return;

      if (e.key === "Escape" && this.closeOnEsc) {
        this.closePopup();
      }
    };

    document.addEventListener("click", this.handleClick);
    document.addEventListener("keydown", this.handleKeyDown);
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
      this.initPopup();
    }
  }

  // Destroy
  // Cleanup and reset

  destroy() {
    if (this.lockScroll) {
      document.body.style.removeProperty("overflow");
    }

    this.popupHolder.classList.remove(this.popupActiveClass);

    if (this.accessibility) {
      this.openBtn.removeAttribute("aria-expanded");
      this.openBtn.removeAttribute("aria-controls");
      this.popup.removeAttribute("role");
      this.popup.removeAttribute("aria-modal");
      this.popup.removeAttribute("tabindex");
    }

    document.removeEventListener("click", this.handleClick);
    document.removeEventListener("keydown", this.handleKeyDown);

    this.isInitialized = false;
  }
}
