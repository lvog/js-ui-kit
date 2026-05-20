export default class DropDownMenu {
  constructor(options = {}) {
    this.menuSelector = options.menuSelector || ".menu";
    this.menuOpener = options.menuOpener || ".nav-opener";
    this.menuDrop = options.menuDrop || ".drop";
    this.menuActiveClass = options.menuActiveClass || "nav-active";
    this.activeItemClass = options.activeItemClass || "active";
    this.hideOnClickOutside = options.hideOnClickOutside ?? true;
    this.animateSubmenu = options.animateSubmenu ?? true;
    this.animateBelow = options.animateBelow || 768;

    this.dropdownClass = "has-dropdown";
    this.animSpeed = 300;

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
        item.classList.add(this.dropdownClass);
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

      const item = link.closest(`.${this.dropdownClass}`);
      if (!item) return;

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

    this.handleClickOutsideMenu = (e) => {
      this.closeOthers(e.target);
    };

    document.body.addEventListener("click", this.handleMenuOpen);
    document.body.addEventListener("click", this.handleClickOutsideMenu);
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

    if (this.animateSubmenu && this.allowAnimation()) {
      const submenu = this.getSubmenu(item);
      if (!submenu) return;

      const height = submenu.scrollHeight;

      submenu.style.height = "0px";
      submenu.style.transition = `height ${this.animSpeed}ms`;
      submenu.getBoundingClientRect();
      submenu.style.height = `${height}px`;

      submenu.addEventListener(
        "transitionend",
        () => {
          submenu.removeAttribute("style");
        },
        { once: true },
      );
    }
  }

  closeItem(item) {
    const nestedItems = item.querySelectorAll(`.${this.dropdownClass}`);

    if (this.animateSubmenu && this.allowAnimation()) {
      const submenu = this.getSubmenu(item);
      if (!submenu) return;

      submenu.style.display = "block";

      const height = submenu.scrollHeight;

      submenu.style.height = `${height}px`;
      submenu.getBoundingClientRect();
      submenu.style.transition = `height ${this.animSpeed}ms`;
      submenu.style.height = "0px";

      submenu.addEventListener(
        "transitionend",
        () => {
          submenu.removeAttribute("style");
        },
        { once: true },
      );
    }

    nestedItems.forEach((item) => {
      item.classList.remove(this.activeItemClass);
    });

    item.classList.remove(this.activeItemClass);
  }

  closeOthers(target) {
    const currentDropdown = target.closest(`.${this.dropdownClass}`);

    this.menuItems.forEach((item) => {
      if (
        item.classList.contains(this.activeItemClass) &&
        item !== currentDropdown &&
        !item.contains(target)
      ) {
        this.closeItem(item);
      }
    });
  }

  closeSibling(item) {
    const parent = item.parentElement;
    if (!parent) return;

    parent
      .querySelectorAll(`:scope > li.${this.dropdownClass}`)
      .forEach((sibling) => {
        if (
          sibling !== item &&
          sibling.classList.contains(this.activeItemClass)
        ) {
          this.closeItem(sibling);
        }
      });
  }

  getSubmenu(item) {
    return item.querySelector(":scope > ul");
  }

  allowAnimation() {
    return window.innerWidth < this.animateBelow;
  }

  destroy() {
    document.body.removeEventListener("click", this.handleMenuOpen);
    document.body.removeEventListener("click", this.handleClickOutsideMenu);
    this.menu.removeEventListener("click", this.handleItemClick);

    this.menuItems.forEach((item) => {
      const submenu = this.getSubmenu(item);
      if (submenu) {
        submenu.removeAttribute("style");
      }

      item.classList.remove(this.dropdownClass, this.activeItemClass);
    });

    document.body.classList.remove(this.menuActiveClass);
  }
}
