export default class InViewport {
  constructor(options = {}) {
    this.selector = options.selector || ".viewport";
    this.activeClass = options.activeClass || "in-viewport";
    this.threshold = options.threshold ?? 0.1;
    this.rootMargin = options.rootMargin || "0px";
    this.once = options.once ?? true;
    this.onEnter = options.onEnter || null;
    this.onLeave = options.onLeave || null;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    this.elements = Array.from(document.querySelectorAll(this.selector));
    this.observer = null;

    this.isInitialized = false;
  }

  init() {
    if (this.elements.length === 0) {
      console.error(`There are no elements with selector - ${this.selector}`);
      return;
    }

    if (this.destroyAbove || this.destroyBelow) {
      this.bindBreakpoint();
      return;
    }

    this.createObserver();
    this.isInitialized = true;
  }

  createObserver() {
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
      this.createObserver();
      this.isInitialized = true;
    }
  }

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
