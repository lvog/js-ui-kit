/**
 * InViewport configuration options
 * @typedef {Object} InViewportOptions
 * @property {string} [selector] - Elements selector
 * @property {string} [activeClass] - Class added to element when in viewport
 * @property {number} [threshold] - Percentage of element visibility to trigger (0-1)
 * @property {string} [rootMargin] - Margin around the viewport (CSS syntax)
 * @property {boolean} [once] - Trigger only once per element
 * @property {Function|null} [onEnter] - Callback when element enters viewport
 * @property {Function|null} [onLeave] - Callback when element leaves viewport
 * @property {number|null} [destroyAbove] - Disable above this width (px)
 * @property {number|null} [destroyBelow] - Disable below this width (px)
 */

export default class InViewport {
  constructor(options = {}) {
    // User options
    this.selector = options.selector || ".viewport";
    this.activeClass = options.activeClass || "in-viewport";
    this.threshold = options.threshold ?? 0.1;
    this.rootMargin = options.rootMargin || "0px";
    this.once = options.once ?? true;
    this.onEnter = options.onEnter || null;
    this.onLeave = options.onLeave || null;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    // DOM elements
    this.elements = [];
    this.observer = null;

    // Flag
    this.isInitialized = false;
  }

  // Initialization

  init() {
    if (this.destroyAbove || this.destroyBelow) {
      this.bindBreakpoint();
      return;
    }

    this.initInViewport();
  }

  initInViewport() {
    this.findElements();

    if (this.elements.length === 0) {
      console.error(`There are no elements with selector - ${this.selector}`);
      return;
    }

    this.initObserver();
    this.isInitialized = true;
  }

  // Setup

  findElements() {
    this.elements = Array.from(document.querySelectorAll(this.selector));
  }

  // Core
  // Creates and attaches IntersectionObserver to all elements

  initObserver() {
    const options = {
      threshold: this.threshold,
      rootMargin: this.rootMargin,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(this.activeClass);

          this.onEnter?.(entry.target);

          if (this.once) {
            this.observer.unobserve(entry.target);
          }

          return;
        }

        if (!this.once) {
          entry.target.classList.remove(this.activeClass);
          this.onLeave?.(entry.target);
        }
      });
    }, options);

    this.elements.forEach((el) => {
      this.observer.observe(el);
    });
  }

  // Events
  // Resize and breakpoint listeners

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
      this.initInViewport();
    }
  }

  // Destroy
  // Cleanup and reset

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.elements.forEach((el) => {
      el.classList.remove(this.activeClass);
    });

    this.isInitialized = false;
  }
}
