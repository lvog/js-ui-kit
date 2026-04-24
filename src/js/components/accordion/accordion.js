export default class Accordion {
  constructor(options = {}) {
    this.accordionSelector = options.sliderSelector || ".accordion";
    this.animSpeed = options.animSpeed || 500;
    this.collapsible = options.collapsible || false;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    this.openerSelector = ".opener";
    this.slideHolderSelector = "li";
    this.slideSelector = ".slide";
    this.showClass = "show";
    this.hideClass = "hide";

    this.accordion = document.querySelector(this.accordionSelector);
    this.slideHolders = [];
    this.prevSlideHolder = null;

    this.isInitialized = false;
  }

  init() {
    if (!this.accordion) {
      console.error(
        `There is no such element with class - ${this.accordionSelector}`,
      );
      return;
    }

    if (this.destroyAbove || this.destroyBelow) {
      this.bindBreakpoint();
      return;
    }

    this.initAccordion();
  }

  initAccordion() {
    this.findElements();
    this.initState();
    this.bindEvents();

    this.isInitialized = true;
  }

  findElements() {
    this.slideHolders = document.querySelectorAll(
      `${this.accordionSelector} > ${this.slideHolderSelector}`,
    );
  }

  initState() {
    this.slideHolders.forEach((holder) => {
      holder.classList.add(this.hideClass);
    });
  }

  bindEvents() {
    this.handleClick = (e) => {
      const opener = e.target.closest(this.openerSelector);

      if (!opener) return;

      e.preventDefault();

      const holder = opener.closest("li");
      const slide = holder.querySelector(this.slideSelector);

      const isActive = holder.classList.contains(this.showClass);

      if (isActive) {
        if (this.collapsible) {
          this.hide(slide, holder);
          this.prevSlideHolder = null;
        }
        return;
      } else {
        this.show(slide, holder);
      }

      if (this.prevSlideHolder) {
        const prevHolder = this.prevSlideHolder;
        const prevSlide = prevHolder.querySelector(this.slideSelector);
        this.hide(prevSlide, prevHolder);
      }

      this.prevSlideHolder = holder;
    };

    this.accordion.addEventListener("click", this.handleClick);
  }

  bindBreakpoint() {
    this.checkBreakpoint();
    this.handleBreakpointResize = () => this.checkBreakpoint();
    window.addEventListener("resize", this.handleBreakpointResize);
  }

  show(slide, holder) {
    if (slide._timer) {
      clearTimeout(slide._timer);
    }

    holder.classList.remove(this.hideClass);
    holder.classList.add(this.showClass);

    const height = slide.scrollHeight;

    slide.style.height = "0px";
    slide.style.transition = `height ${this.animSpeed}ms`;
    slide.getBoundingClientRect();
    slide.style.height = `${height}px`;

    slide._timer = setTimeout(() => {
      slide.removeAttribute("style");
    }, this.animSpeed);
  }

  hide(slide, holder) {
    if (slide._timer) {
      clearTimeout(slide._timer);
    }

    slide.style.height = `${slide.scrollHeight}px`;
    slide.style.transition = `height ${this.animSpeed}ms`;
    slide.getBoundingClientRect();
    slide.style.height = "0px";
    holder.classList.remove(this.showClass);

    slide._timer = setTimeout(() => {
      slide.removeAttribute("style");
      holder.classList.add(this.hideClass);
    }, this.animSpeed);
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
      this.initAccordion();
    }
  }

  destroy() {
    this.accordion.removeEventListener("click", this.handleClick);

    this.slideHolders.forEach((holder) => {
      holder.classList.remove(this.showClass, this.hideClass);

      const slide = holder.querySelector(this.slideSelector);
      slide.removeAttribute("style");
    });

    this.isInitialized = false;
  }
}
