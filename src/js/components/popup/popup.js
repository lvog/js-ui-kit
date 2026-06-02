export default class Popup {
  constructor(options = {}) {
    this.popupHolderSelector = options.popupHolderSelector || ".popup-holder";
    this.popupSelector = options.popupSelector || ".popup";
    this.popupActiveClass = options.popupActiveClass || "popup-active";
    this.openBtnSelector = options.openBtnSelector || ".popup-open";
    this.closeBtnSelector = options.closeBtnSelector || ".popup-close";
    this.lockScroll = options.lockScroll ?? false;
    this.closeOnClickOutside = options.closeOnClickOutside ?? true;
    this.closeOnEsc = options.closeOnEsc ?? true;
    this.accessibility = options.accessibility ?? true;
    this.onOpen = options.onOpen || null;
    this.onClose = options.onClose || null;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    this.popupHolder = document.querySelector(this.popupHolderSelector);
    this.popup = null;
    this.openBtn = null;

    this.isInitialized = false;
  }

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
