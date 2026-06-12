export default class CustomSelect {
  constructor(options = {}) {
    this.holderSelector = options.holderSelector || ".js-select";
    this.maxVisibleItems = options.maxVisibleItems || 5;
    this.scrollbarOffset = options.scrollbarOffset || 5;
    this.dropInBody = options.dropInBody ?? false;
    this.nativeSelectOnMobile = options.nativeSelectOnMobile ?? true;
    this.keyboardNavigation = options.keyboardNavigation ?? false;
    this.accessibility = options.accessibility ?? true;

    this.prefix = this.holderSelector.slice(1);

    this.openerClass = `${this.prefix}-opener`;
    this.dropClass = `${this.prefix}-drop`;
    this.contentClass = `${this.prefix}-content`;
    this.scrollbarClass = `${this.prefix}-scrollbar`;
    this.optionsListClass = `${this.prefix}-options-list`;
    this.optionClass = `${this.prefix}-option`;
    this.activeClass = "js-drop-active";
    this.selectedClass = "js-option-selected";
    this.focusedClass = "js-option-focused";
    this.flippedClass = "js-drop-flipped";
    this.hiddenSelectClass = "js-hidden";
    this.hiddenOptionClass = "hideme";
    this.activeScrollbar = "js-scroll-active";
    this.nativeSelectClass = "js-select-native";
    this.disabledSelectClass = "js-select-disabled";
    this.disabledOptionClass = "js-option-disabled";

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

      this.updateSelectMode(select);

      const opener = this.buildOpener(select);
      holder.append(opener);

      this.instances.push({ holder, select, opener });
      this.bindNativeSelect(select, opener);
      this.disabledSelect(holder, select);
      this.addOpenerAria(opener);
    });
  }

  buildCustomDrop(instance) {
    const { holder, select } = instance;
    const drop = this.buildDropDown();

    if (this.dropInBody) {
      document.body.appendChild(drop);
    } else {
      holder.appendChild(drop);
    }

    instance.drop = drop;

    const content = this.buildContentHolder();
    drop.appendChild(content);

    const list = this.buildOptionsList(select);
    content.appendChild(list);

    this.addDropAria(instance, list);

    const hasScrollbar = this.updateDropHeight(content);

    if (hasScrollbar) {
      const scrollbar = this.buildScrollbar();
      drop.appendChild(scrollbar);

      drop.classList.add(this.activeScrollbar);

      const { refreshScrollbar, destroyScrollbar } = this.initScrollbar(
        content,
        scrollbar,
      );
      instance.refreshScrollbar = refreshScrollbar;
      instance.destroyScrollbar = destroyScrollbar;
    }
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

      if (item.disabled) {
        option.classList.add(this.disabledOptionClass);
      }

      option.classList.add(this.optionClass);
      option.textContent = item.textContent;
      option.dataset.value = item.value;

      list.appendChild(option);

      this.addOptionAria(option, index, selectedIndex);
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
        const holder = opener.closest(this.holderSelector);
        const select = holder.querySelector("select");
        const isActive = holder.classList.contains(this.activeClass);

        if (holder.classList.contains(this.disabledSelectClass)) return;

        this.closeAll();

        if (isActive) return;

        this.updateSelectMode(select);

        const instance = this.instances.find((i) => i.holder === holder);
        const nativeDrop = this.nativeSelectOnMobile && this.isTouchDevice();

        if (!instance) return;

        if (nativeDrop) {
          if (typeof instance.select.showPicker === "function") {
            instance.select.showPicker();
          } else {
            instance.select.focus();
            instance.select.click();
          }
          return;
        }

        this.buildCustomDrop(instance);
        this.updateDropPosition(instance);

        holder.classList.add(this.activeClass);
        instance.drop.classList.add(this.activeClass);
        instance.refreshScrollbar?.();

        const options = instance.drop.querySelectorAll(`.${this.optionClass}`);
        instance.focusedIndex = this.getFocusableIndex(
          options,
          instance.select.selectedIndex,
        );

        this.highlightOption(options, instance.focusedIndex);

        return;
      }

      if (option) {
        if (option.classList.contains(this.disabledOptionClass)) {
          return;
        }

        this.selectOption(option);
        this.closeAll();

        return;
      }

      if (!drop) {
        this.closeAll();
      }
    };

    this.handleKeyDown = (e) => {
      if (!this.keyboardNavigation) return;

      const instance = this.instances.find((instance) =>
        instance.holder.classList.contains(this.activeClass),
      );

      if (!instance) return;

      const drop = instance.drop;
      const options = drop.querySelectorAll(`.${this.optionClass}`);
      const option = options[instance.focusedIndex];

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          instance.focusedIndex = this.getNextIndex(
            options,
            instance.focusedIndex,
            1,
          );
          this.highlightOption(options, instance.focusedIndex);
          break;
        case "ArrowUp":
          e.preventDefault();
          instance.focusedIndex = this.getNextIndex(
            options,
            instance.focusedIndex,
            -1,
          );
          this.highlightOption(options, instance.focusedIndex);
          break;
        case "Escape":
          this.closeAll();
          break;
        case "Enter":
          e.preventDefault();
          this.selectOption(option);
          this.closeAll();
          break;
      }
    };

    this.handleResize = () => {
      this.closeAll();
    };

    document.addEventListener("click", this.handleClick);
    document.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.handleResize);
  }

  bindNativeSelect(select, opener) {
    select.addEventListener("change", () => {
      opener.textContent = select.options[select.selectedIndex].textContent;
    });
  }

  addOpenerAria(opener) {
    if (!this.accessibility) return;

    opener.setAttribute("role", "combobox");
    opener.setAttribute("aria-haspopup", "listbox");
    opener.setAttribute("aria-expanded", "false");
  }

  addDropAria(instance, list) {
    if (!this.accessibility) return;

    const listId = `${this.prefix}-list-${this.instances.indexOf(instance)}`;

    list.setAttribute("role", "listbox");
    list.setAttribute("id", listId);
    instance.opener.setAttribute("aria-controls", listId);
    instance.opener.setAttribute("aria-expanded", "true");
  }

  addOptionAria(option, index, selectedIndex) {
    if (!this.accessibility) return;

    option.setAttribute("role", "option");
    option.setAttribute(
      "aria-selected",
      index === selectedIndex ? "true" : "false",
    );

    if (option.classList.contains(this.disabledOptionClass)) {
      option.setAttribute("aria-disabled", "true");
    }
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

    const destroyScrollbar = () => {
      scrollbar.removeEventListener("pointerdown", handlePointerDown);
      scrollbar.removeEventListener("pointermove", handlePointerMove);
      scrollbar.removeEventListener("pointerup", handlePointerEnd);
      scrollbar.removeEventListener("pointercancel", handlePointerEnd);
      scrollbar.removeEventListener("lostpointercapture", handlePointerEnd);
      content.removeEventListener("scroll", refreshScrollbar);
    };

    scrollbar.addEventListener("pointerdown", handlePointerDown);
    scrollbar.addEventListener("pointermove", handlePointerMove);
    scrollbar.addEventListener("pointerup", handlePointerEnd);
    scrollbar.addEventListener("pointercancel", handlePointerEnd);
    scrollbar.addEventListener("lostpointercapture", handlePointerEnd);
    content.addEventListener("scroll", refreshScrollbar);

    return { refreshScrollbar, destroyScrollbar };
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
      select.classList.remove(this.hiddenSelectClass);
      select.classList.add(this.nativeSelectClass);
      return;
    }
    select.classList.remove(this.nativeSelectClass);
    select.classList.add(this.hiddenSelectClass);
  }

  disabledSelect(holder, select) {
    if (select.disabled) {
      holder.classList.add(this.disabledSelectClass);
    }
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

    if (this.accessibility) {
      currentSelected?.setAttribute("aria-selected", "false");
      option.setAttribute("aria-selected", "true");
    }
  }

  getFocusableIndex(options, selectedIndex) {
    const option = options[selectedIndex];

    const isDisabled = option?.classList.contains(this.disabledOptionClass);

    const isHidden = option?.classList.contains(
      `${this.optionClass}-${this.hiddenOptionClass}`,
    );

    if (!isDisabled && !isHidden) {
      return selectedIndex;
    }

    return this.getNextIndex(options, selectedIndex, 1);
  }

  getNextIndex(options, currentIndex, direction) {
    let index = currentIndex;
    const total = options.length;

    for (let i = 0; i < total; i++) {
      index += direction;
      if (index < 0 || index >= total) break;

      const option = options[index];
      const isDisabled = option.classList.contains(this.disabledOptionClass);
      const isHidden = option.classList.contains(
        `${this.optionClass}-${this.hiddenOptionClass}`,
      );

      if (!isDisabled && !isHidden) return index;
    }

    return currentIndex;
  }

  highlightOption(options, index) {
    options.forEach((option) => option.classList.remove(this.focusedClass));

    const activeOption = options[index];

    activeOption.classList.add(this.focusedClass);

    activeOption.scrollIntoView({
      block: "nearest",
    });
  }

  closeAll() {
    this.instances.forEach((instance) => {
      this.removeCustomDrop(instance);
    });
  }

  removeCustomDrop(instance) {
    if (this.accessibility) {
      instance.opener.setAttribute("aria-expanded", "false");
      instance.opener.removeAttribute("aria-controls");
    }

    if (!instance.drop) return;

    const drop = instance.drop;

    instance.destroyScrollbar?.();
    instance.destroyScrollbar = null;
    instance.drop = null;
    instance.refreshScrollbar = null;
    instance.holder.classList.remove(this.activeClass, this.flippedClass);
    drop.classList.remove(this.activeClass);

    const hasTransition = getComputedStyle(drop).transitionDuration !== "0s";

    if (hasTransition) {
      drop.addEventListener("transitionend", () => drop.remove(), {
        once: true,
      });
    } else {
      drop.remove();
    }
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
    document.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);

    this.closeAll();

    this.instances.forEach(({ holder, select, opener }) => {
      opener.remove();
      select.classList.remove(this.hiddenSelectClass, this.nativeSelectClass);
      holder.classList.remove(
        this.activeClass,
        this.flippedClass,
        this.disabledSelectClass,
      );
    });

    this.instances = [];
  }
}
