"use strict";
(() => {
  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/utils/utils.ts
  function isDev() {
    const hostname = globalThis.location?.hostname ?? "";
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local") || globalThis.location?.port === "1313";
  }
  function debug(...args) {
    if (isDev()) {
      console.log("[DEV]", ...args);
    }
  }
  function debugError(...args) {
    if (isDev()) {
      console.error("[DEV]", ...args);
    }
  }

  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/utils/analytics.ts
  function track(payload) {
    window.dataLayer?.push(payload);
  }

  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/components/projects_filter.ts
  var FILTER_DEFAULTS = {
    type: "all",
    category: "all",
    tech: "",
    complexity: "all",
    sort: "newest"
  };
  var ProjectsFilter = class {
    constructor() {
      this.filterHandler = () => this.apply(true);
      this.clearHandler = () => this.reset();
      this.typeFilter = document.getElementById("type-filter");
      this.categoryFilter = document.getElementById("category-filter");
      this.techFilter = document.getElementById("tech-filter");
      this.complexityFilter = document.getElementById("complexity-filter");
      this.sortOrder = document.getElementById("sort-order");
      this.grid = document.querySelector(".projects-grid");
      this.projectCards = document.querySelectorAll(".project-card, .test-project-card");
      this.visibleCountEl = document.getElementById("visible-count");
      this.totalCountEl = document.getElementById("total-count");
      this.totalProjects = this.projectCards.length;
      this.init();
    }
    init() {
      if (!this.typeFilter || !this.categoryFilter || !this.techFilter || !this.complexityFilter) return;
      if (this.totalCountEl) this.totalCountEl.textContent = String(this.totalProjects);
      this.addListeners();
      this.apply();
    }
    addListeners() {
      const clearBtn = document.getElementById("clear-filters-btn");
      if (!clearBtn) return;
      const filterEls = [
        this.typeFilter,
        this.categoryFilter,
        this.techFilter,
        this.complexityFilter,
        ...this.sortOrder ? [this.sortOrder] : []
      ];
      filterEls.forEach((el) => el.addEventListener("change", this.filterHandler));
      clearBtn.addEventListener("click", this.clearHandler);
    }
    removeListeners() {
      const clearBtn = document.getElementById("clear-filters-btn");
      const filterEls = [
        this.typeFilter,
        this.categoryFilter,
        this.techFilter,
        this.complexityFilter,
        ...this.sortOrder ? [this.sortOrder] : []
      ];
      filterEls.forEach((el) => el.removeEventListener("change", this.filterHandler));
      clearBtn?.removeEventListener("click", this.clearHandler);
    }
    reset() {
      this.typeFilter.value = FILTER_DEFAULTS.type;
      this.categoryFilter.value = FILTER_DEFAULTS.category;
      this.techFilter.value = FILTER_DEFAULTS.tech;
      this.complexityFilter.value = FILTER_DEFAULTS.complexity;
      if (this.sortOrder) this.sortOrder.value = FILTER_DEFAULTS.sort;
      this.apply();
      track({ event: "project_filter_cleared" });
    }
    getState() {
      return {
        type: this.typeFilter.value,
        category: this.categoryFilter.value,
        tech: this.techFilter.value.toLowerCase(),
        complexity: this.complexityFilter.value,
        sort: this.sortOrder?.value ?? FILTER_DEFAULTS.sort
      };
    }
    cardMatches(card, state) {
      const techs = JSON.parse(card.dataset.techs || "[]");
      return (state.type === "all" || card.dataset.type === state.type) && (state.category === "all" || card.dataset.category === state.category) && (state.complexity === "all" || card.dataset.complexity === state.complexity) && (state.tech === "" || techs.some((t) => t.toLowerCase().includes(state.tech)));
    }
    sortCards(cards, order) {
      const key = (card) => {
        if (order === "name-az" || order === "name-za")
          return (card.querySelector(".card-title")?.textContent ?? "").trim().toLowerCase();
        if (order === "category-az" || order === "category-za")
          return (card.querySelector(".project-type-text")?.textContent ?? "").trim().toLowerCase();
        return String(this.extractYear(card.dataset.date ?? ""));
      };
      return [...cards].sort((a, b) => {
        const [ka, kb] = [key(a), key(b)];
        if (order === "oldest") return Number(ka) - Number(kb);
        if (order === "newest") return Number(kb) - Number(ka);
        const cmp = ka.localeCompare(kb);
        return order === "name-za" || order === "category-za" ? -cmp : cmp;
      });
    }
    extractYear(dateStr) {
      const match = dateStr.match(/\d{4}/);
      return match ? parseInt(match[0], 10) : 0;
    }
    apply(trackChange = false) {
      const state = this.getState();
      const all = Array.from(this.projectCards);
      const exempt = all.filter((c) => c.dataset.filterExempt === "true");
      const sortable = all.filter((c) => c.dataset.filterExempt !== "true");
      const sorted = this.sortCards(sortable, state.sort);
      if (this.grid) {
        exempt.forEach((c) => this.grid.appendChild(c));
        sorted.forEach((c) => this.grid.appendChild(c));
      }
      let visibleCount = exempt.length;
      exempt.forEach((c) => {
        c.style.display = "grid";
      });
      sorted.forEach((card) => {
        const visible = this.cardMatches(card, state);
        card.style.display = visible ? "grid" : "none";
        if (visible) visibleCount++;
      });
      if (this.visibleCountEl) this.visibleCountEl.textContent = String(visibleCount);
      debug(`Filtered: ${visibleCount}/${this.totalProjects} projects visible (Type: ${state.type}, Category: ${state.category}, Tech: ${state.tech}, Complexity: ${state.complexity}, Sort: ${state.sort})`);
      if (trackChange) {
        track({ event: "project_filtered", ...state, tech: state.tech || "all", visible_count: String(visibleCount) });
      }
    }
    getProjectCards() {
      return this.projectCards;
    }
  };

  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/components/project_modal.ts
  var ProjectModal = class {
    constructor() {
      this.modalTriggers = document.querySelectorAll(".project-card[data-modal-target]");
      this.modals = document.querySelectorAll(".modal");
      this.closeButtons = document.querySelectorAll(".close-button");
      this.keydownHandler = (e) => {
        if (e.key === "Escape") this.closeAllModals();
      };
      this.init();
    }
    destroy() {
      document.removeEventListener("keydown", this.keydownHandler);
    }
    init() {
      debug(`Found ${this.modalTriggers.length} modal triggers and ${this.modals.length} modals`);
      this.addEventListeners();
    }
    addEventListeners() {
      this.addOpenModalListeners();
      this.addCloseModalListeners();
      this.addKeyboardListeners();
      this.addOutsideClickListeners();
    }
    addOpenModalListeners() {
      this.modalTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          e.preventDefault();
          this.openModal(trigger);
        });
      });
    }
    addCloseModalListeners() {
      this.closeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.closeModal(button);
        });
      });
    }
    addKeyboardListeners() {
      document.addEventListener("keydown", this.keydownHandler);
      this.modalTriggers.forEach((trigger) => {
        trigger.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            trigger.click();
          }
        });
      });
    }
    addOutsideClickListeners() {
      this.modals.forEach((modal) => {
        if (modal.dataset.preventOutsideClose === "true") {
          return;
        }
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeModalElement(modal);
          }
        });
      });
    }
    openModal(trigger) {
      debug("Modal trigger clicked");
      const targetId = trigger.dataset.modalTarget;
      debug("Target modal ID:", targetId);
      if (targetId) {
        const modal = this.findModal(targetId);
        if (modal) {
          debug("Opening modal:", targetId);
          this.showModal(modal);
          const name = modal.querySelector("h2")?.textContent?.trim() ?? targetId;
          track({ event: "project_opened", project_name: name });
        } else {
          debugError("Modal not found:", targetId);
          debug("Available modals:", Array.from(this.modals).map((m) => m.id));
        }
      }
    }
    findModal(targetId) {
      let modal = document.querySelector(targetId);
      if (!modal && targetId.startsWith("#")) {
        const escapedId = `#${this.escapeSelector(targetId)}`;
        debug("Trying escaped selector:", escapedId);
        modal = document.querySelector(escapedId);
      }
      if (!modal) {
        const id = targetId.replace("#", "");
        debug("Trying getElementById:", id);
        modal = document.getElementById(id);
      }
      return modal;
    }
    escapeSelector(id) {
      return id.replace("#", "").replace(/["!#$%&'()*+,./:;<=>?@[\\]^`{|}~]/g, "\\\\$&");
    }
    showModal(modal) {
      modal.style.display = "block";
      modal.style.opacity = "0";
      setTimeout(() => {
        modal.style.opacity = "1";
      }, 10);
    }
    closeModal(button) {
      debug("Close button clicked");
      const modal = button.closest(".modal");
      if (modal) {
        this.closeModalElement(modal);
      }
    }
    closeModalElement(modal) {
      debug("Closing modal");
      modal.style.display = "none";
      modal.style.opacity = "0";
    }
    closeAllModals() {
      debug("Escape key pressed, closing all modals");
      this.modals.forEach((modal) => {
        this.closeModalElement(modal);
      });
    }
  };

  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/components/fullscreen_modal.ts
  var FullscreenModal = class {
    constructor() {
      this.fullscreenModal = document.getElementById("fullscreen-modal");
      this.fullscreenImage = document.getElementById("fullscreen-image");
      this.fullscreenCaption = document.getElementById("fullscreen-caption");
      this.fullscreenClose = document.querySelector(".fullscreen-close");
      this.init();
    }
    init() {
      if (this.fullscreenModal) {
        this.addEventListeners();
      } else {
        console.warn("Fullscreen modal elements not found");
      }
    }
    addEventListeners() {
      this.addImageClickListeners();
      this.addCloseListeners();
      this.addKeyboardListeners();
      this.addOverlayClickListeners();
    }
    addImageClickListeners() {
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("modal-preview-img")) {
          this.openFullscreen(target);
        }
      });
    }
    addCloseListeners() {
      if (this.fullscreenClose) {
        this.fullscreenClose.addEventListener("click", (e) => {
          e.preventDefault();
          this.closeFullscreen();
        });
      }
    }
    addKeyboardListeners() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isFullscreenOpen()) {
          this.closeFullscreen("Escape key");
        }
      });
      if (this.fullscreenClose) {
        this.fullscreenClose.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.fullscreenClose.click();
          }
        });
      }
    }
    addOverlayClickListeners() {
      if (this.fullscreenModal) {
        this.fullscreenModal.addEventListener("click", (e) => {
          if (e.target === this.fullscreenModal || e.target === document.querySelector(".fullscreen-overlay")) {
            this.closeFullscreen("clicked outside");
          }
        });
      }
    }
    openFullscreen(imageElement) {
      const imageSrc = imageElement.getAttribute("data-fullscreen-src") || imageElement.getAttribute("src");
      const projectName = imageElement.getAttribute("data-project-name") || "Project Preview";
      if (imageSrc && this.fullscreenModal && this.fullscreenImage && this.fullscreenCaption) {
        this.fullscreenImage.src = imageSrc;
        this.fullscreenImage.alt = `Full preview of ${projectName}`;
        this.fullscreenCaption.textContent = projectName;
        this.showFullscreenModal();
        console.log(`Opening fullscreen image for: ${projectName}`);
      } else {
        console.warn("Could not open fullscreen: missing image source or elements");
      }
    }
    showFullscreenModal() {
      this.fullscreenModal.style.display = "block";
      this.fullscreenModal.style.opacity = "0";
      setTimeout(() => {
        this.fullscreenModal.style.opacity = "1";
      }, 10);
    }
    closeFullscreen(reason = "button click") {
      if (this.fullscreenModal) {
        this.fullscreenModal.style.display = "none";
        this.fullscreenModal.style.opacity = "0";
        console.log(`Closing fullscreen image (${reason})`);
      }
    }
    isFullscreenOpen() {
      return this.fullscreenModal && this.fullscreenModal.style.display === "block";
    }
    open(imageSrc, projectName) {
      if (this.fullscreenImage && this.fullscreenCaption) {
        this.fullscreenImage.src = imageSrc;
        this.fullscreenImage.alt = `Full preview of ${projectName}`;
        this.fullscreenCaption.textContent = projectName;
        this.showFullscreenModal();
      }
    }
    close() {
      this.closeFullscreen("programmatic close");
    }
  };

  // <stdin>
  var Projects = class {
    constructor() {
      this.init();
    }
    init() {
      debug("Projects component loaded with modular architecture");
      try {
        this.filter = new ProjectsFilter();
        this.modal = new ProjectModal();
        this.fullscreen = new FullscreenModal();
        debug("All project components initialized successfully");
      } catch (error) {
        debugError("Error initializing project components:", error);
      }
    }
    // Public API methods if needed
    getFilter() {
      return this.filter;
    }
    getModal() {
      return this.modal;
    }
    getFullscreen() {
      return this.fullscreen;
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    new Projects();
  });
})();
