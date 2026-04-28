export default class Accordion {
  constructor(options = {}) {
    this.accordionSelector = options.accordionSelector || ".accordion";
    this.animSpeed = options.animSpeed || 500;
    this.collapsible = options.collapsible || false;
    this.scrollToActive = options.scrollToActive || false;
    this.scrollOffset = options.scrollOffset || 0;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    this.openerSelector = ".accordion-opener";
    this.accordionItemSelector = ".accordion-item";
    this.slideSelector = ".accordion-slide";
    this.activeClass = "active";

    this.accordion = document.querySelector(this.accordionSelector);
    this.accordionItems = [];
    this.prevAccordionItem = null;

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
    this.findActiveElement();
    this.bindEvents();

    this.isInitialized = true;
  }

  findActiveElement() {
    const activeElement = this.accordion.querySelector(
      `${this.accordionItemSelector}.${this.activeClass}`,
    );

    if (!activeElement) return;

    this.prevAccordionItem = activeElement;
  }

  findElements() {
    this.accordionItems = this.accordion.querySelectorAll(
      this.accordionItemSelector,
    );
  }

  bindEvents() {
    this.handleClick = (e) => {
      const opener = e.target.closest(this.openerSelector);

      if (!opener) return;

      const holder = opener.closest(this.accordionItemSelector);
      const slide = holder.querySelector(this.slideSelector);

      const isActive = holder.classList.contains(this.activeClass);

      if (isActive) {
        if (this.collapsible) {
          this.close(slide, holder);
          this.prevAccordionItem = null;
        }
        return;
      }

      if (this.prevAccordionItem) {
        const prevItem = this.prevAccordionItem;
        const prevSlide = prevItem.querySelector(this.slideSelector);
        this.close(prevSlide, prevItem);
      }

      this.open(slide, holder);

      this.prevAccordionItem = holder;
    };

    this.accordion.addEventListener("click", this.handleClick);
  }

  bindBreakpoint() {
    this.checkBreakpoint();
    this.handleBreakpointResize = () => this.checkBreakpoint();
    window.addEventListener("resize", this.handleBreakpointResize);
  }

  open(slide, holder) {
    if (slide._timer) {
      clearTimeout(slide._timer);
    }

    holder.classList.add(this.activeClass);
    holder
      .querySelector(this.openerSelector)
      .setAttribute("aria-expanded", "true");

    const height = slide.scrollHeight;

    slide.style.height = "0px";
    slide.style.transition = `height ${this.animSpeed}ms`;
    slide.getBoundingClientRect();
    slide.style.height = `${height}px`;

    slide._timer = setTimeout(() => {
      slide.removeAttribute("style");

      if (this.scrollToActive) {
        this.scrollToItem(holder);
      }
    }, this.animSpeed);
  }

  close(slide, holder) {
    if (slide._timer) {
      clearTimeout(slide._timer);
    }

    slide.style.display = "block";
    slide.style.height = `${slide.scrollHeight}px`;
    slide.style.transition = `height ${this.animSpeed}ms`;
    slide.getBoundingClientRect();
    slide.style.height = "0px";
    holder.classList.remove(this.activeClass);
    holder
      .querySelector(this.openerSelector)
      .setAttribute("aria-expanded", "false");

    slide._timer = setTimeout(() => {
      slide.removeAttribute("style");
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

  scrollToItem(holder) {
    const itemTop = holder.getBoundingClientRect().top + window.scrollY;

    if (itemTop < window.scrollY) {
      this.smoothScroll(itemTop - this.scrollOffset);
    }
  }

  smoothScroll(targetY) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = this.animSpeed;
    let startTime = null;

    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timePassed = currentTime - startTime;
      const progress = Math.min(timePassed / duration, 1);

      window.scrollTo(0, startY + distance * easeInOut(progress));

      if (timePassed < duration) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  destroy() {
    this.accordion.removeEventListener("click", this.handleClick);

    this.accordionItems.forEach((holder) => {
      holder.classList.remove(this.activeClass);

      const opener = holder.querySelector(this.openerSelector);
      opener.removeAttribute("aria-expanded");
      opener.removeAttribute("aria-controls");

      const slide = holder.querySelector(this.slideSelector);
      slide.removeAttribute("style");
    });

    this.isInitialized = false;
  }
}
