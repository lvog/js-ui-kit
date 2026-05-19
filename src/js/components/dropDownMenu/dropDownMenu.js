export default class DropDownMenu {
  constructor(options = {}) {
    this.menuSelector = options.menuSelector || ".menu";
    this.menuOpener = options.menuOpener || ".nav-opener";
    this.menuDrop = options.menuDrop || ".drop";
    this.menuActiveClass = options.menuActiveClass || "nav-active";
    this.activeItemClass = options.activeItemClass || "active";
    this.hideOnClickOutside = options.hideOnClickOutside ?? false;

    this.menu = document.querySelector(this.menuSelector);
    this.menuItems = [];
  }

  init() {
    if (!this.menu) {
      console.error(
        `There is no such element with class - ${this.menuSelector}`,
      );
      return;
    }

    this.findElements();
    this.addDropdownClass();
    this.bindEvents();
  }

  findElements() {
    this.menuItems = this.menu.querySelectorAll("li");
  }

  addDropdownClass() {
    this.menuItems.forEach((item) => {
      const submenu = item.querySelector(":scope > ul");

      if (submenu) {
        item.classList.add("has-dropdown");
      }
    });
  }

  bindEvents() {
    this.handleMenuOpen = (e) => {
      const opener = e.target.closest(this.menuOpener);
      const isDrop = e.target.closest(this.menuDrop);

      if (opener) {
        e.preventDefault();
        this.toggleMenu();
        return;
      }

      if (this.hideOnClickOutside && !isDrop) {
        this.closeMenu();
        return;
      }
    };

    this.handleItemClick = (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const item = link.closest("li");
      if (!item.classList.contains("has-dropdown")) return;

      const trigger = item.querySelector(":scope > a");
      if (link !== trigger) return;

      e.preventDefault();

      if (item.classList.contains(this.activeItemClass)) {
        this.closeItem(item);
      } else {
        this.closeSibling(item);
        this.openItem(item);
      }
    };

    document.body.addEventListener("click", this.handleMenuOpen);
    this.menu.addEventListener("click", this.handleItemClick);
  }

  toggleMenu() {
    document.body.classList.toggle(this.menuActiveClass);
  }

  closeMenu() {
    document.body.classList.remove(this.menuActiveClass);
  }

  openItem(item) {
    item.classList.add(this.activeItemClass);
  }

  closeItem(item) {
    const nestedItems = item.querySelectorAll(".has-dropdown");

    nestedItems.forEach((item) => {
      item.classList.remove(this.activeItemClass);
    });

    item.classList.remove(this.activeItemClass);
  }

  closeSibling(item) {
    const parent = item.parentElement;
    if (!parent) return;

    parent.querySelectorAll(":scope > li.has-dropdown").forEach((sibling) => {
      if (
        sibling !== item &&
        sibling.classList.contains(this.activeItemClass)
      ) {
        this.closeItem(sibling);
      }
    });
  }

  destroy() {
    document.body.removeEventListener("click", this.handleMenuOpen);
    this.menu.removeEventListener("click", this.handleItemClick);

    this.menuItems.forEach((item) => {
      item.classList.remove("has-dropdown", this.activeItemClass);
    });

    document.body.classList.remove(this.menuActiveClass);
  }
}
