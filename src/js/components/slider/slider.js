/**
 * Slider configuration options
 * @typedef {Object} SliderOptions
 * @property {string} [sliderSelector] - Root element selector
 * @property {"slide" | "fade"} [mode] - Animation mode
 * @property {boolean} [arrows] - Enable navigation arrows
 * @property {string} [btnPrevContent="Prev"] - Content for the previous button (text, HTML, icon)
 * @property {string} [btnNextContent="Next"] - Content for the next button (text, HTML, icon)
 * @property {boolean} [dots] - Enable pagination dots
 * @property {number} [swipeThreshold] - Minimum swipe distance (px)
 * @property {boolean} [infinite] - Enable infinite loop
 * @property {boolean} [autoplay] - Enable autoplay
 * @property {number} [autoplayDelay] - Autoplay interval (ms)
 * @property {number|null} [destroyAbove] - Disable slider above this width
 * @property {number|null} [destroyBelow] - Disable slider below this width
 */

export default class Slider {
  constructor(options = {}) {
    // User options
    this.sliderSelector = options.sliderSelector || ".slider";
    this.mode = options.mode || "slide";
    this.arrows = options.arrows ?? true;
    this.btnPrevContent = options.btnPrevContent || "Prev";
    this.btnNextContent = options.btnNextContent || "Next";
    this.dots = options.dots ?? false;
    this.swipeThreshold = options.swipeThreshold || 50;
    this.infinite = options.infinite ?? true;
    this.autoplay = options.autoplay ?? false;
    this.autoplayDelay = options.autoplayDelay || 5000;
    this.destroyAbove = options.destroyAbove || null;
    this.destroyBelow = options.destroyBelow || null;

    // Internal selectors
    this.trackSelector = ".slider-track";
    this.slideSelector = ".slider-slide";
    this.btnPrevSelector = ".slider-btn-prev";
    this.btnNextSelector = ".slider-btn-next";
    this.dotsSelector = ".slider-dots";
    this.dotBtnSelector = ".slider-dot-btn";
    this.activeClass = "slide-active";

    // DOM elements
    this.slider = document.querySelector(this.sliderSelector);
    this.track = null;
    this.slides = [];
    this.arrowBtns = [];
    this.dotBtns = [];

    // State
    this.slideWidth = 0;
    this.transform = 0;
    this.prevIndex = 0;
    this.currentIndex = 0;
    this.total = 0;

    // Flags
    this.isJumping = false;
    this.isInitialized = false;
  }

  // Initialization

  init() {
    if (!this.slider) {
      console.error(
        `There is no such element with class - ${this.sliderSelector}`,
      );
      return;
    }

    if (this.destroyAbove || this.destroyBelow) {
      this.bindBreakpoint();
      return;
    }

    this.initSlider();
  }

  initSlider() {
    this.resetIndex();
    this.addMode();
    this.findElements();

    if (!this.track) {
      console.error("Slider: track element not found");
      return;
    }

    if (this.slides.length <= 1) {
      console.error("There must be at least 2 slides for the slider to work.");
      return;
    }

    this.initState();
    if (this.infinite && this.mode === "slide") {
      this.cloneSlides();
    }

    this.updateLayout();
    this.createArrows();
    this.createDots();
    this.bindEvents();
    this.bindSwipe();
    this.bindResize();

    if (this.autoplay) {
      this.startAutoplay();
      this.bindAutoplay();
    }

    if (this.infinite && this.mode === "slide") {
      this.bindTransitionEnd();
    }

    this.isInitialized = true;
  }

  // Setup
  // Internal preparation before rendering

  findElements() {
    this.track = this.slider.querySelector(this.trackSelector);
    this.slides = this.slider.querySelectorAll(this.slideSelector);
  }

  resetIndex() {
    this.currentIndex = 0;
    this.prevIndex = 0;
  }

  initState() {
    this.total = this.slides.length;
    this.slides[0].classList.add(this.activeClass);
  }

  addMode() {
    this.slider.classList.add(this.mode);
  }

  // Layout
  // Responsible for dimensions and positioning

  updateLayout() {
    this.slideWidth = this.slider.offsetWidth;

    const totalSlides =
      this.infinite && this.mode === "slide" ? this.total + 2 : this.total;

    this.track.style.width = `${this.slideWidth * totalSlides}px`;

    const allSlides = this.track.querySelectorAll(this.slideSelector);

    allSlides.forEach((slide, index) => {
      slide.style.width = `${this.slideWidth}px`;

      if (this.mode === "fade") {
        slide.style.left = `-${index * this.slideWidth}px`;
      }
    });

    if (this.mode === "slide") {
      this.moveTrack();
    }
  }

  moveTrack() {
    const offset = this.infinite && this.mode === "slide" ? 1 : 0;
    this.transform = (this.currentIndex + offset) * this.slideWidth;
    this.track.style.transform = `translateX(-${this.transform}px)`;
  }

  // UI Creation
  // Creates DOM elements (controls)

  createArrows() {
    if (!this.arrows) return;

    const btnPrev = this.createArrowBtn("prev", "Previous");
    const btnNext = this.createArrowBtn("next", "Next");

    this.slider.append(btnPrev, btnNext);
    this.arrowBtns = this.slider.querySelectorAll(".slider-btn");

    this.updateArrowsState();
  }

  createArrowBtn(direction, label) {
    const btn = document.createElement("button");

    btn.type = "button";
    btn.setAttribute("aria-label", label);
    btn.classList.add("slider-btn", `slider-btn-${direction}`);

    btn.innerHTML =
      direction === "prev" ? this.btnPrevContent : this.btnNextContent;

    return btn;
  }

  createDots() {
    if (!this.dots) return;

    this.dotsHolder = document.createElement("div");
    this.dotsHolder.classList.add(this.dotsSelector.substring(1));

    for (let i = 0; i < this.total; i++) {
      const dot = this.createDotBtn(i);

      if (i === 0) {
        dot.classList.add(this.activeClass);
      }

      this.dotsHolder.appendChild(dot);
    }

    this.slider.append(this.dotsHolder);
    this.dotBtns = this.slider.querySelectorAll(this.dotBtnSelector);
  }

  createDotBtn(index) {
    const btn = document.createElement("button");

    btn.classList.add(this.dotBtnSelector.substring(1));
    btn.type = "button";
    btn.setAttribute("aria-label", `Slide ${index + 1}`);
    btn.dataset.slide = index;

    return btn;
  }

  // UI State
  // Updates visual state (active slide and dot, disabled buttons)

  updateActive() {
    this.slides[this.prevIndex]?.classList.remove(this.activeClass);
    this.dotBtns[this.prevIndex]?.classList.remove(this.activeClass);

    this.slides[this.currentIndex]?.classList.add(this.activeClass);
    this.dotBtns[this.currentIndex]?.classList.add(this.activeClass);

    this.prevIndex = this.currentIndex;
  }

  updateArrowsState() {
    if (this.infinite || !this.arrows) return;

    const btnPrev = this.slider.querySelector(this.btnPrevSelector);
    const btnNext = this.slider.querySelector(this.btnNextSelector);

    if (!btnPrev || !btnNext) return;

    btnPrev.classList.toggle("disabled", this.currentIndex === 0);
    btnNext.classList.toggle("disabled", this.currentIndex === this.total - 1);
  }

  // Core Navigation
  // Main navigation logic

  moveToSlide(index) {
    if (this.infinite && this.mode === "slide") {
      if (index < 0) {
        this.isJumping = true;
        this.currentIndex = this.total - 1;
        this.updateActive();
        this.track.style.transform = `translateX(0px)`;
        return;
      }

      if (index >= this.total) {
        this.isJumping = true;
        this.currentIndex = 0;
        this.updateActive();
        this.track.style.transform = `translateX(-${(this.total + 1) * this.slideWidth}px)`;
        return;
      }
    }

    if (this.infinite && this.mode === "fade") {
      if (index < 0) index = this.total - 1;
      if (index >= this.total) index = 0;
    } else {
      if (index < 0 || index >= this.total) {
        this.stopAutoplay();
        return;
      }
    }

    this.currentIndex = index;
    this.updateActive();

    if (this.mode === "slide") {
      this.moveTrack();
    }

    this.updateArrowsState();
  }

  // Events
  // All event listeners (user interaction)

  bindEvents() {
    this.handleClick = (e) => {
      const btnPrev = e.target.closest(this.btnPrevSelector);
      const btnNext = e.target.closest(this.btnNextSelector);
      const dotBtn = e.target.closest(this.dotBtnSelector);

      if (!btnNext && !btnPrev && !dotBtn) return;

      if (this.isJumping) return;

      if (btnNext) {
        if (this.infinite || this.currentIndex < this.total - 1) {
          this.moveToSlide(this.currentIndex + 1);
        }
      }

      if (btnPrev) {
        if (this.infinite || this.currentIndex > 0) {
          this.moveToSlide(this.currentIndex - 1);
        }
      }

      if (dotBtn) {
        this.moveToSlide(Number(dotBtn.dataset.slide));
      }
    };

    this.slider.addEventListener("click", this.handleClick);
  }

  bindSwipe() {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isMoved = false;

    this.handleDragStart = (e) => e.preventDefault();

    this.handlePointerDown = (e) => {
      const isInteractive = e.target.closest(
        "a, button, input, select, textarea",
      );

      if (isInteractive || e.button !== 0) return;
      if (this.isJumping) return;
      if (this.autoplay) {
        this.stopAutoplay();
      }

      isDragging = true;
      isMoved = false;

      startX = e.clientX;
      startY = e.clientY;

      this.slider.setPointerCapture(e.pointerId);
    };

    this.handlePointerMove = (e) => {
      if (!isDragging) return;

      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;

      if (Math.abs(diffY) > Math.abs(diffX)) return;

      if (Math.abs(diffX) > 5) {
        isMoved = true;
      }

      if (this.mode !== "slide") return;

      if (!this.infinite) {
        const isFirst = this.currentIndex === 0;
        const isLast = this.currentIndex === this.total - 1;

        if ((isFirst && diffX > 0) || (isLast && diffX < 0)) return;
      }

      const offset = this.infinite ? 1 : 0;
      const base = (this.currentIndex + offset) * this.slideWidth;

      if (this.track.style.transition !== "none") {
        this.track.style.transition = "none";
      }

      this.track.style.transform = `translateX(-${base - diffX}px)`;
    };

    this.handlePointerEnd = (e) => {
      if (!isDragging) return;

      isDragging = false;

      const diffX = e.clientX - startX;

      if (this.slider.hasPointerCapture(e.pointerId)) {
        this.slider.releasePointerCapture(e.pointerId);
      }

      if (this.mode === "slide") {
        this.track.style.transition = "";
      }

      if (diffX >= this.swipeThreshold) {
        this.moveToSlide(this.currentIndex - 1);
      } else if (diffX <= -this.swipeThreshold) {
        this.moveToSlide(this.currentIndex + 1);
      } else {
        this.moveToSlide(this.currentIndex);
      }

      if (this.autoplay) {
        this.startAutoplay();
      }

      setTimeout(() => {
        isMoved = false;
      }, 0);
    };

    this.handleClickPrevent = (e) => {
      if (isMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    this.slider.addEventListener("dragstart", this.handleDragStart);
    this.slider.addEventListener("pointerdown", this.handlePointerDown);
    this.slider.addEventListener("pointermove", this.handlePointerMove);
    this.slider.addEventListener("pointerup", this.handlePointerEnd);
    this.slider.addEventListener("pointercancel", this.handlePointerEnd);
    this.slider.addEventListener("pointerleave", this.handlePointerEnd);
    this.slider.addEventListener("click", this.handleClickPrevent);
  }

  bindResize() {
    this.handleResize = this.updateLayout.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  bindTransitionEnd() {
    this.handleTransitionEnd = () => {
      if (!this.isJumping) return;

      this.track.style.transition = "none";

      this.moveTrack();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.track.style.transition = "";
          this.isJumping = false;
        });
      });
    };

    this.track.addEventListener("transitionend", this.handleTransitionEnd);
  }

  bindBreakpoint() {
    this.checkBreakpoint();
    this.handleBreakpointResize = () => this.checkBreakpoint();
    window.addEventListener("resize", this.handleBreakpointResize);
  }

  bindAutoplay() {
    this.handlePointerEnter = () => {
      this.stopAutoplay();
    };

    this.handlePointerLeave = (e) => {
      if (e.pointerType === "touch") return;
      this.startAutoplay();
    };

    this.slider.addEventListener("pointerenter", this.handlePointerEnter);
    this.slider.addEventListener("pointerleave", this.handlePointerLeave);
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
      this.initSlider();
    }
  }

  // Autoplay
  // Automatic slide switching

  startAutoplay() {
    this.stopAutoplay();
    this.intervalId = setInterval(() => {
      this.moveToSlide(this.currentIndex + 1);
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    clearInterval(this.intervalId);
  }

  // Infinite
  // Infinite loop preparation

  cloneSlides() {
    const firstClone = this.slides[0].cloneNode(true);
    const lastClone = this.slides[this.total - 1].cloneNode(true);

    firstClone.dataset.clone = "true";
    lastClone.dataset.clone = "true";

    firstClone.classList.remove(this.activeClass);
    lastClone.classList.remove(this.activeClass);

    this.track.prepend(lastClone);
    this.track.append(firstClone);
  }

  // Destroy
  // Cleanup and reset

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.slider.removeEventListener("click", this.handleClick);

    this.slider.removeEventListener("dragstart", this.handleDragStart);
    this.slider.removeEventListener("pointerdown", this.handlePointerDown);
    this.slider.removeEventListener("pointermove", this.handlePointerMove);
    this.slider.removeEventListener("pointerup", this.handlePointerEnd);
    this.slider.removeEventListener("pointercancel", this.handlePointerEnd);
    this.slider.removeEventListener("pointerleave", this.handlePointerEnd);
    this.slider.removeEventListener("click", this.handleClickPrevent);

    if (this.infinite && this.mode === "slide") {
      this.track.removeEventListener("transitionend", this.handleTransitionEnd);
    }

    if (this.dots && this.dotsHolder) {
      this.dotsHolder.remove();
      this.dotsHolder = null;
      this.dotBtns = [];
    }

    if (this.arrows && this.arrowBtns) {
      this.arrowBtns.forEach((btn) => {
        btn.remove();
      });
      this.arrowBtns = [];
    }

    if (this.infinite && this.mode === "slide") {
      this.track.querySelectorAll("[data-clone]").forEach((clone) => {
        clone.remove();
      });
    }

    if (this.autoplay) {
      this.stopAutoplay();
      this.slider.removeEventListener("pointerenter", this.handlePointerEnter);
      this.slider.removeEventListener("pointerleave", this.handlePointerLeave);
    }

    if (this.track) {
      this.track.removeAttribute("style");
    }

    this.slides.forEach((slide) => {
      slide.removeAttribute("style");
      slide.classList.remove(this.activeClass);
    });

    this.slider.classList.remove(this.mode);
    this.isInitialized = false;
  }
}
