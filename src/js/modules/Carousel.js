class Carousel {
  constructor(options = {}) {
    this.carouselSelector = options.carouselSelector || ".carousel";
    this.trackSelector = options.trackSelector || ".carousel-track";
    this.slideSelector = options.slideSelector || ".carousel-slide";
    this.arrows = options.arrows ?? true;
    this.btnPrevSelector = options.btnPrevSelector || ".carousel-btn-prev";
    this.btnNextSelector = options.btnNextSelector || ".carousel-btn-next";
    this.dots = options.dots ?? true;
    this.dotsSelector = options.dotsSelector || ".carousel-dots";
    this.dotBtnSelector = options.dotBtnSelector || ".carousel-dot-btn";
    this.mode = options.mode || "slide";

    this.activeClass = "slide-active";

    this.carousel = document.querySelector(this.carouselSelector);
    this.track = null;
    this.slides = [];
    this.dotBtns = [];
    this.arrowBtns = [];

    this.slideWidth = 0;
    this.transform = 0;
    this.prevIndex = 0;
    this.currentIndex = 0;
    this.total = 0;
  }

  init() {
    if (!this.carousel) {
      console.error(
        `There is no such element with class - ${this.carouselSelector}`,
      );
      return;
    }

    this.addMode();
    this.findElements();

    if (!this.track) {
      console.error("Carousel: track element not found");
      return;
    }

    if (this.slides.length <= 1) {
      console.error(
        "There must be at least 2 slides for the carousel to work.",
      );
      return;
    }

    this.initState();
    this.updateLayout();
    this.createArrows();
    this.createDots();
    this.bindEvents();
    this.bindResize();
  }

  findElements() {
    this.track = this.carousel.querySelector(this.trackSelector);
    this.slides = this.carousel.querySelectorAll(this.slideSelector);
  }

  bindEvents() {
    this.handleClick = (e) => {
      const btnPrev = e.target.closest(this.btnPrevSelector);
      const btnNext = e.target.closest(this.btnNextSelector);
      const dotBtn = e.target.closest(this.dotBtnSelector);

      if (!btnNext && !btnPrev && !dotBtn) return;

      if (btnNext && this.currentIndex < this.total - 1) {
        this.moveToSlide(this.currentIndex + 1);
      }

      if (btnPrev && this.currentIndex > 0) {
        this.moveToSlide(this.currentIndex - 1);
      }

      if (dotBtn) {
        this.moveToSlide(Number(dotBtn.dataset.slide));
      }
    };

    this.carousel.addEventListener("click", this.handleClick);
  }

  bindResize() {
    this.handleResize = this.updateLayout.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  initState() {
    this.total = this.slides.length;
    this.slides[0].classList.add(this.activeClass);
  }

  addMode() {
    this.carousel.classList.add(this.mode);
  }

  updateLayout() {
    this.slideWidth = this.carousel.offsetWidth;
    this.track.style.width = `${this.slideWidth * this.total}px`;

    this.slides.forEach((slide, index) => {
      slide.style.width = `${this.slideWidth}px`;

      if (this.mode === "fade") {
        slide.style.left = `-${index * this.slideWidth}px`;
      }
    });

    if (this.mode === "slide") {
      this.moveTrack();
    }
  }

  createArrows() {
    if (!this.arrows) return;

    const btnPrev = this.createArrowBtn("prev", "Previous");
    const btnNext = this.createArrowBtn("next", "Next");

    this.carousel.append(btnPrev, btnNext);
    this.arrowBtns = this.carousel.querySelectorAll(".carousel-btn");
  }

  createArrowBtn(direction, label) {
    const btn = document.createElement("button");

    btn.type = "button";
    btn.setAttribute("aria-label", label);
    btn.classList.add("carousel-btn", `carousel-btn-${direction}`);

    const btnIcon = direction === "prev" ? "left" : "right";
    btn.innerHTML = `<i class="icon-arrow-${btnIcon}"></i>`;

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

    this.carousel.append(this.dotsHolder);
    this.dotBtns = this.carousel.querySelectorAll(this.dotBtnSelector);
  }

  createDotBtn(index) {
    const btn = document.createElement("button");

    btn.classList.add(this.dotBtnSelector.substring(1));
    btn.type = "button";
    btn.setAttribute("aria-label", `Slide ${index + 1}`);
    btn.dataset.slide = index;

    return btn;
  }

  updateActive() {
    this.slides[this.prevIndex]?.classList.remove(this.activeClass);
    this.dotBtns[this.prevIndex]?.classList.remove(this.activeClass);

    this.slides[this.currentIndex]?.classList.add(this.activeClass);
    this.dotBtns[this.currentIndex]?.classList.add(this.activeClass);

    this.prevIndex = this.currentIndex;
  }

  moveToSlide(index) {
    if (index < 0 || index >= this.total) return;

    this.currentIndex = index;
    this.updateActive();

    if (this.mode === "slide") {
      this.moveTrack();
    }
  }

  moveTrack() {
    this.transform = this.currentIndex * this.slideWidth;
    this.track.style.transform = `translateX(-${this.transform}px)`;
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.carousel.removeEventListener("click", this.handleClick);

    if (this.dots && this.dotsHolder) {
      this.dotsHolder.remove();
    }

    if (this.arrows && this.arrowBtns) {
      this.arrowBtns.forEach((btn) => {
        btn.remove();
      });
    }
  }
}

export const carousel = new Carousel({
  mode: "fade",
});
