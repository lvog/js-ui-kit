export default class CustomSelect {
  constructor(options = {}) {
    this.holderSelector = options.holderSelector || ".js-select";

    this.openerClass = "js-select-opener";
    this.dropClass = "js-select-drop";
    this.optionsListClass = "js-select-options-list";
    this.optionClass = "js-select-option";
    this.activeClass = "js-drop-active";
    this.hiddenClass = "js-hidden";

    this.holders = document.querySelectorAll(this.holderSelector);

    this.instances = [];
  }

  init() {
    if (this.holders.length === 0) {
      console.error(`No elements found with selector: ${this.holderSelector}`);
      return;
    }

    this.buildSelects();
    this.bindEvents();
  }

  buildSelects() {
    this.holders.forEach((holder) => {
      const select = holder.querySelector("select");

      if (!select) {
        console.error("CustomSelect: select element not found");
        return;
      }

      this.hideNativeSelect(select);

      const opener = this.buildOpener();
      const drop = this.buildDropDown();

      holder.append(opener, drop);

      this.buildOptionsList(select, opener, drop);

      this.instances.push({
        holder,
        select,
        opener,
        drop,
      });
    });
  }

  buildOpener() {
    const opener = document.createElement("button");

    opener.type = "button";
    opener.classList.add(this.openerClass);

    return opener;
  }

  buildDropDown() {
    const drop = document.createElement("div");

    drop.classList.add(this.dropClass);

    return drop;
  }

  buildOptionsList(select, opener, drop) {
    const options = select.options;

    opener.textContent = options[0].textContent;

    const list = document.createElement("ul");
    list.classList.add(this.optionsListClass);

    drop.appendChild(list);

    Array.from(options)
      .slice(1)
      .forEach((item, index) => {
        const option = document.createElement("li");

        option.classList.add(this.optionClass);
        option.textContent = item.textContent;
        option.dataset.value = item.value;

        list.appendChild(option);
      });
  }

  bindEvents() {
    this.handleClick = (e) => {
      const opener = e.target.closest(`.${this.openerClass}`);
      const drop = e.target.closest(`.${this.dropClass}`);

      if (opener) {
        const holder = opener.closest(this.holderSelector);

        holder.classList.toggle(this.activeClass);
        return;
      }

      if (!drop) {
        this.holders.forEach((holder) => {
          holder.classList.remove(this.activeClass);
        });
      }
    };

    document.addEventListener("click", this.handleClick);
  }

  hideNativeSelect(select) {
    select.classList.add(this.hiddenClass);
  }
}
