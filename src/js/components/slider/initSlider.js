import Slider from "./slider";

export function initSlider() {
  const slider = new Slider({
    mode: "fade",
    btnPrevContent: `<i class="icon-arrow-left"></i>`,
    btnNextContent: `<i class="icon-arrow-right"></i>`,
    dots: true,
    infinite: true,
    autoplay: true,
    destroyAbove: 1024,
  });

  slider.init();
}
