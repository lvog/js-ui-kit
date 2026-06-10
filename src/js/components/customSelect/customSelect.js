export default class CustomSelect {
  constructor(options = {}) {
    this.holderSelector = options.holderSelector || "js-select";
    this.maxVisibleItems = options.maxVisibleItems || 5;
    this.scrollbarOffset = options.scrollbarOffset || 5;
    this.dropInBody = options.dropInBody ?? false;
    this.nativeSelectOnMobile = options.nativeSelectOnMobile ?? true;

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
    this.hiddenOptionClass = "hideme";
    this.activeScrollbar = "js-scroll-active";
    this.nativeSelectClass = "js-select-native";

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

      this.updateSelectMode(select);

      const opener = this.buildOpener(select);
      holder.append(opener);

      const drop = this.buildDropDown();

      if (this.dropInBody) {
        document.body.appendChild(drop);
      } else {
        holder.appendChild(drop);
      }

      const content = this.buildContentHolder();
      drop.appendChild(content);

      const list = this.buildOptionsList(select);
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
      this.bindNativeSelect(select, opener);
    });
  }

  buildOpener(select) {
    const opener = document.createElement("button");

    opener.type = "button";
    opener.classList.add(this.openerClass);

    const selectedOption = this.findSelectedOption(select);

    opener.textContent = selectedOption.textContent;

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

  buildOptionsList(select) {
    const options = select.options;
    const selectedIndex = select.selectedIndex;

    const list = document.createElement("ul");
    list.classList.add(this.optionsListClass);

    Array.from(options).forEach((item, index) => {
      const option = document.createElement("li");

      if (index === selectedIndex) {
        option.classList.add(this.selectedClass);
      }

      if (item.classList.contains(this.hiddenOptionClass)) {
        option.classList.add(`${this.optionClass}-${this.hiddenOptionClass}`);
      }

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
        const select = holder.querySelector("select");
        const isActive = holder.classList.contains(this.activeClass);

        this.updateSelectMode(select);
        this.closeAll();

        if (!isActive) {
          const instance = this.instances.find((i) => i.holder === holder);

          if (!instance) return;

          if (this.nativeSelectOnMobile && this.isTouchDevice()) {
            if (typeof instance.select.showPicker === "function") {
              instance.select.showPicker();
            } else {
              instance.select.focus();
              instance.select.click();
            }

            return;
          }

          this.updateDropPosition(instance);

          holder.classList.add(this.activeClass);
          instance.drop.classList.add(this.activeClass);

          instance.refreshScrollbar?.();
        }

        return;
      }

      if (option) {
        this.selectOption(option);
        this.closeAll();

        return;
      }

      if (!drop) {
        this.closeAll();
      }
    };

    document.addEventListener("click", this.handleClick);
  }

  bindNativeSelect(select, opener) {
    select.addEventListener("change", () => {
      opener.textContent = select.options[select.selectedIndex].textContent;
    });
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

  updateSelectMode(select) {
    if (this.nativeSelectOnMobile && this.isTouchDevice()) {
      select.classList.remove(this.hiddenClass);
      select.classList.add(this.nativeSelectClass);
      return;
    }
    select.classList.remove(this.nativeSelectClass);
    select.classList.add(this.hiddenClass);
  }

  selectOption(option) {
    const drop = option.closest(`.${this.dropClass}`);
    const instance = this.instances.find((i) => i.drop === drop);

    if (!instance) return;

    const { select } = instance;

    select.value = option.dataset.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));

    const currentSelected = drop.querySelector(
      `.${this.optionClass}.${this.selectedClass}`,
    );

    currentSelected?.classList.remove(this.selectedClass);

    option.classList.add(this.selectedClass);
  }

  closeAll() {
    this.instances.forEach((instance) => {
      instance.holder.classList.remove(this.activeClass);
      instance.drop.classList.remove(this.activeClass);
    });
  }

  updateDropPosition(instance) {
    const { holder, opener, drop } = instance;

    const dropRect = drop.getBoundingClientRect();
    const openerRect = opener.getBoundingClientRect();
    const spaceBelow = window.innerHeight - openerRect.bottom;
    const needsFlip = dropRect.height > spaceBelow;

    if (this.dropInBody) {
      drop.style.left = `${openerRect.left + window.scrollX}px`;
      drop.style.width = `${openerRect.width}px`;

      if (needsFlip) {
        drop.style.top = `${openerRect.top + window.scrollY - dropRect.height}px`;
      } else {
        drop.style.top = `${openerRect.bottom + window.scrollY}px`;
      }

      drop.style.bottom = "auto";
    }

    holder.classList.toggle(this.flippedClass, needsFlip);
    drop.classList.toggle(this.flippedClass, needsFlip);
  }

  updateDropHeight(content) {
    const options = content.querySelectorAll(`.${this.optionClass}`);

    const visibleOptions = [...options].filter(
      (option) =>
        !option.classList.contains(
          `${this.optionClass}-${this.hiddenOptionClass}`,
        ),
    );

    if (visibleOptions.length <= this.maxVisibleItems) {
      return false;
    }

    const optionHeight = visibleOptions[0].offsetHeight;

    content.style.maxHeight = `${optionHeight * this.maxVisibleItems}px`;

    return true;
  }

  findSelectedOption(select) {
    return select.options[select.selectedIndex] || select.options[0];
  }

  isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  destroy() {
    document.removeEventListener("click", this.handleClick);

    this.instances.forEach(({ holder, select, opener, drop }) => {
      opener.remove();
      drop.remove();
      select.classList.remove(this.hiddenClass, this.nativeSelectClass);
      holder.classList.remove(this.activeClass, this.flippedClass);
    });

    this.instances = [];
  }
}
