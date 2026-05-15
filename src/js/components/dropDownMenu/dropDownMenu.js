export default class DropDownMenu {
  constructor(options = {}) {
    this.menuOpener = options.menuOpener || ".nav-opener";
    this.menuDrop = options.menuDrop || ".drop";
    this.menuActiveClass = options.menuActiveClass || "nav-active";
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.handleClick = (e) => {
      const opener = e.target.closest(this.menuOpener);
      const isDrop = e.target.closest(this.menuDrop);

      if (opener) {
        e.preventDefault();
        this.toggleClass();
        return;
      }

      if (!isDrop) {
        this.closeMenu();
      }
    };

    document.body.addEventListener("click", this.handleClick);
  }

  toggleClass() {
    document.body.classList.toggle(this.menuActiveClass);
  }

  closeMenu() {
    document.body.classList.remove(this.menuActiveClass);
  }
}
