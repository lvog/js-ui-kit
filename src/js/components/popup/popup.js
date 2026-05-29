export default class Popup {
  constructor(options = {}) {
    this.popupHolderSelector = options.popupHolderSelector || ".popup-holder";
    this.popupSelector = options.popupSelector || ".popup";
    this.popupActiveClass = options.popupActiveClass || "popup-active";
    this.openBtnSelector = options.openBtnSelector || ".popup-open";
    this.closeBtnSelector = options.closeBtnSelector || ".popup-close";
    this.addClassToBody = options.addClassToBody ?? false;

    this.popupHolder = document.querySelector(this.popupHolderSelector);
  }

  init() {
    if (!this.popupHolder) {
      console.error(
        `There is no such element with class - ${this.popupHolderSelector}`,
      );
      return;
    }

    this.findElements();
    this.bindEvents();
  }

  findElements() {
    this.openBtn = document.querySelector(this.openBtnSelector);
    this.closeBtn = this.popupHolder.querySelector(this.closeBtnSelector);
  }

  bindEvents() {
    this.handleOpenBtnClick = (e) => {
      e.preventDefault();
      this.openPopup();
    };

    this.handleCloseBtnClick = (e) => {
      e.preventDefault();
      this.closePopup();
    };

    this.openBtn.addEventListener("click", this.handleOpenBtnClick);
    this.closeBtn.addEventListener("click", this.handleCloseBtnClick);
  }

  openPopup() {
    if (this.addClassToBody) {
      document.body.classList.add(this.popupActiveClass);
      return;
    }
    this.popupHolder.classList.add(this.popupActiveClass);
  }

  closePopup() {
    if (this.addClassToBody) {
      document.body.classList.remove(this.popupActiveClass);
      return;
    }
    this.popupHolder.classList.remove(this.popupActiveClass);
  }

  destroy() {
    if (this.addClassToBody) {
      document.body.classList.remove(this.popupActiveClass);
    } else {
      this.popupHolder.classList.remove(this.popupActiveClass);
    }
    this.openBtn.removeEventListener("click", this.handleOpenBtnClick);
    this.closeBtn.removeEventListener("click", this.handleCloseBtnClick);
  }
}
