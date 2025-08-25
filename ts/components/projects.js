(() => {
  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/components/projects_filter.ts
  var ProjectsFilter = class {
    constructor() {
      this.typeFilter = document.getElementById(
        "type-filter"
      );
      this.categoryFilter = document.getElementById(
        "category-filter"
      );
      this.techFilter = document.getElementById(
        "tech-filter"
      );
      this.complexityFilter = document.getElementById(
        "complexity-filter"
      );
      this.projectCards = document.querySelectorAll(
        ".project-card, .test-project-card"
      );
      this.visibleCountElement = document.getElementById("visible-count");
      this.totalCountElement = document.getElementById("total-count");
      this.totalProjects = this.projectCards.length;
      this.init();
    }
    init() {
      this.setInitialTotalCount();
      this.addEventListeners();
      this.filterProjects();
    }
    setInitialTotalCount() {
      if (this.totalCountElement) {
        this.totalCountElement.textContent = this.totalProjects.toString();
      }
    }
    addEventListeners() {
      const clearFiltersBtn = document.getElementById("clear-filters-btn");
      if (this.typeFilter && this.categoryFilter && this.techFilter && this.complexityFilter && clearFiltersBtn) {
        this.typeFilter.addEventListener("change", () => this.filterProjects());
        this.categoryFilter.addEventListener(
          "change",
          () => this.filterProjects()
        );
        this.techFilter.addEventListener("change", () => this.filterProjects());
        this.complexityFilter.addEventListener(
          "change",
          () => this.filterProjects()
        );
        clearFiltersBtn.addEventListener("click", () => this.clearFilters());
      }
    }
    clearFilters() {
      this.typeFilter.value = "all";
      this.categoryFilter.value = "all";
      this.techFilter.value = "all";
      this.complexityFilter.value = "all";
      this.filterProjects();
    }
    filterProjects() {
      const selectedType = this.typeFilter.value;
      const selectedCategory = this.categoryFilter.value;
      const selectedTech = this.techFilter.value;
      const selectedComplexity = this.complexityFilter.value;
      let visibleCount = 0;
      this.projectCards.forEach((card) => {
        const cardType = card.dataset.type;
        const cardCategory = card.dataset.category;
        const cardTechs = JSON.parse(card.dataset.techs || "[]");
        const cardComplexity = card.dataset.complexity;
        const typeMatch = selectedType === "all" || cardType === selectedType;
        const categoryMatch = selectedCategory === "all" || cardCategory === selectedCategory;
        const techMatch = selectedTech === "all" || cardTechs.includes(selectedTech);
        const complexityMatch = selectedComplexity === "all" || cardComplexity === selectedComplexity;
        if (typeMatch && categoryMatch && techMatch && complexityMatch) {
          if (card instanceof HTMLElement) {
            card.style.display = "grid";
            visibleCount++;
          }
        } else if (card instanceof HTMLElement) {
          card.style.display = "none";
        }
      });
      this.updateCounter(visibleCount);
      console.log(
        `Filtered: ${visibleCount}/${this.totalProjects} projects visible (Type: ${selectedType}, Category: ${selectedCategory}, Tech: ${selectedTech}, Complexity: ${selectedComplexity})`
      );
    }
    updateCounter(visibleCount) {
      if (this.visibleCountElement) {
        this.visibleCountElement.textContent = visibleCount.toString();
      }
    }
    getProjectCards() {
      return this.projectCards;
    }
  };

  // ns-hugo-imp:/home/runner/work/home-page_mirror/home-page_mirror/assets/ts/components/project_modal.ts
  var ProjectModal = class {
    constructor() {
      this.modalTriggers = document.querySelectorAll(".project-btn[data-modal-target]");
      this.modals = document.querySelectorAll(".modal");
      this.closeButtons = document.querySelectorAll(".close-button");
      this.init();
    }
    init() {
      console.log(`Found ${this.modalTriggers.length} modal triggers and ${this.modals.length} modals`);
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
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeAllModals();
        }
      });
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
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeModalElement(modal);
          }
        });
      });
    }
    openModal(trigger) {
      console.log("Modal trigger clicked");
      const targetId = trigger.getAttribute("data-modal-target");
      console.log("Target modal ID:", targetId);
      if (targetId) {
        const modal = this.findModal(targetId);
        if (modal) {
          console.log("Opening modal:", targetId);
          this.showModal(modal);
        } else {
          console.error("Modal not found:", targetId);
          console.log("Available modals:", Array.from(this.modals).map((m) => m.id));
        }
      }
    }
    findModal(targetId) {
      let modal = document.querySelector(targetId);
      if (!modal && targetId.startsWith("#")) {
        const escapedId = `#${this.escapeSelector(targetId)}`;
        console.log("Trying escaped selector:", escapedId);
        modal = document.querySelector(escapedId);
      }
      if (!modal) {
        const id = targetId.replace("#", "");
        console.log("Trying getElementById:", id);
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
      console.log("Close button clicked");
      const modal = button.closest(".modal");
      if (modal) {
        this.closeModalElement(modal);
      }
    }
    closeModalElement(modal) {
      console.log("Closing modal");
      modal.style.display = "none";
      modal.style.opacity = "0";
    }
    closeAllModals() {
      console.log("Escape key pressed, closing all modals");
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
      console.log("Projects component loaded with modular architecture");
      try {
        this.filter = new ProjectsFilter();
        this.modal = new ProjectModal();
        this.fullscreen = new FullscreenModal();
        console.log("All project components initialized successfully");
      } catch (error) {
        console.error("Error initializing project components:", error);
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
