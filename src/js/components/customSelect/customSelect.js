export default class CustomSelect {
  constructor(options = {}) {
    this.holderSelector = options.holderSelector || "js-select";
    this.maxVisibleItems = options.maxVisibleItems || 5;
    this.scrollbarOffset = options.scrollbarOffset || 5;

    this.openerClass = `${this.holderSelector}-opener`;
    this.dropClass = `${this.holderSelector}-drop`;
    this.contentClass = `${this.holderSelector}-content`;
    this.scrollbarClass = `${this.holderSelector}-scrollbar`;
    this.optionsListClass = `${this.holderSelector}-options-list`;
    this.optionClass = `${this.holderSelector}-option`;
    this.activeClass = "js-drop-active";
    this.selectedClass = "js-option-selected";
    this.flippedClass = "js-drop-flipped";
    this.hiddenClass = "js-hidden";
    this.activeScrollbar = "js-scroll-active";

    this.holders = document.querySelectorAll(`.${this.holderSelector}`);

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

      const content = this.buildContentHolder();
      drop.appendChild(content);

      const list = this.buildOptionsList(select, opener);
      content.appendChild(list);

      const hasScrollbar = this.updateDropHeight(content);
      let scrollbar;

      if (hasScrollbar) {
        scrollbar = this.buildScrollbar();
        drop.appendChild(scrollbar);

        drop.classList.add(this.activeScrollbar);

        const refreshScrollbar = this.initScrollbar(content, scrollbar);

        this.instances.push({
          holder,
          select,
          opener,
          drop,
          scrollbar,
          refreshScrollbar,
        });
      } else {
        this.instances.push({
          holder,
          select,
          opener,
          drop,
        });
      }
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

  buildContentHolder() {
    const content = document.createElement("div");

    content.classList.add(this.contentClass);

    return content;
  }

  buildOptionsList(select, opener) {
    const options = select.options;

    opener.textContent = options[0].textContent;

    const list = document.createElement("ul");
    list.classList.add(this.optionsListClass);

    Array.from(options)
      .slice(1)
      .forEach((item) => {
        const option = document.createElement("li");

        option.classList.add(this.optionClass);
        option.textContent = item.textContent;
        option.dataset.value = item.value;

        list.appendChild(option);
      });

    return list;
  }

  buildScrollbar() {
    const scrollbar = document.createElement("span");

    scrollbar.classList.add(this.scrollbarClass);

    return scrollbar;
  }

  bindEvents() {
    this.handleClick = (e) => {
      const opener = e.target.closest(`.${this.openerClass}`);
      const drop = e.target.closest(`.${this.dropClass}`);
      const option = e.target.closest(`.${this.optionClass}`);

      if (opener) {
        const holder = opener.closest(`.${this.holderSelector}`);
        const isActive = holder.classList.contains(this.activeClass);

        this.closeAll();

        if (!isActive) {
          this.updateDropPosition(holder);
          holder.classList.add(this.activeClass);

          const instance = this.instances.find((i) => i.holder === holder);

          if (!instance) return;

          instance.refreshScrollbar?.();
        }

        return;
      }

      if (option) {
        this.selectOption(option);

        return;
      }

      if (!drop) {
        this.closeAll();
      }
    };

    document.addEventListener("click", this.handleClick);
  }

  initScrollbar(content, scrollbar) {
    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;

    const refreshScrollbar = () => {
      const { thumbHeight, maxScroll, maxThumbMove } =
        this.getScrollbarMetrics(content);

      const top =
        this.scrollbarOffset + (content.scrollTop / maxScroll) * maxThumbMove;

      scrollbar.style.height = `${thumbHeight}px`;
      scrollbar.style.top = `${top}px`;
    };

    const handlePointerDown = (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = content.scrollTop;
      scrollbar.setPointerCapture(e.pointerId);
      e.preventDefault();
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;

      const delta = e.clientY - startY;
      const { scrollRatio } = this.getScrollbarMetrics(content);

      content.scrollTop = startScrollTop + delta * scrollRatio;
    };

    const handlePointerEnd = () => {
      isDragging = false;
    };

    scrollbar.addEventListener("pointerdown", handlePointerDown);
    scrollbar.addEventListener("pointermove", handlePointerMove);
    scrollbar.addEventListener("pointerup", handlePointerEnd);
    scrollbar.addEventListener("pointercancel", handlePointerEnd);
    scrollbar.addEventListener("lostpointercapture", handlePointerEnd);
    content.addEventListener("scroll", refreshScrollbar);

    return refreshScrollbar;
  }

  getScrollbarMetrics(content) {
    const ratio = content.clientHeight / content.scrollHeight;
    const thumbHeight = content.clientHeight * ratio;
    const maxScroll = content.scrollHeight - content.clientHeight;
    const maxThumbMove =
      content.clientHeight - thumbHeight - this.scrollbarOffset * 2;
    const scrollRatio = maxScroll / maxThumbMove;

    return {
      thumbHeight,
      maxScroll,
      maxThumbMove,
      scrollRatio,
    };
  }

  hideNativeSelect(select) {
    select.classList.add(this.hiddenClass);
  }

  selectOption(option) {
    const holder = option.closest(`.${this.holderSelector}`);
    const instance = this.instances.find((i) => i.holder === holder);

    if (!instance) return;

    const { opener, select } = instance;

    opener.textContent = option.textContent;
    select.value = option.dataset.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));

    const currentSelected = holder.querySelector(
      `.${this.optionClass}.${this.selectedClass}`,
    );

    currentSelected?.classList.remove(this.selectedClass);

    option.classList.add(this.selectedClass);
    holder.classList.remove(this.activeClass);
  }

  closeAll() {
    this.instances.forEach((instance) => {
      instance.holder.classList.remove(this.activeClass);
    });
  }

  updateDropPosition(holder) {
    const drop = holder.querySelector(`.${this.dropClass}`);
    const opener = holder.querySelector(`.${this.openerClass}`);

    if (!drop) return;

    const dropRect = drop.getBoundingClientRect();
    const openerRect = opener.getBoundingClientRect();

    const spaceBelow = window.innerHeight - openerRect.bottom;
    const needsFlip = dropRect.height > spaceBelow;

    holder.classList.toggle(this.flippedClass, needsFlip);
  }

  updateDropHeight(content) {
    const options = content.querySelectorAll(`.${this.optionClass}`);

    if (options.length <= this.maxVisibleItems) return false;

    const optionHeight = options[0].offsetHeight;

    content.style.maxHeight = `${optionHeight * this.maxVisibleItems}px`;

    return true;
  }
}
