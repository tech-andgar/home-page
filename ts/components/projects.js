(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Projects Test component loaded");
    const categoryFilter = document.getElementById("category-filter");
    const techFilter = document.getElementById("tech-filter");
    const projectCards = document.querySelectorAll(".project-card, .test-project-card");
    const visibleCountElement = document.getElementById("visible-count");
    const totalCountElement = document.getElementById("total-count");
    const totalProjects = projectCards.length;
    if (totalCountElement) {
      totalCountElement.textContent = totalProjects.toString();
    }
    function filterProjects() {
      const selectedCategory = categoryFilter.value;
      const selectedTech = techFilter.value;
      let visibleCount = 0;
      projectCards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const cardTechs = JSON.parse(card.dataset.techs || "[]");
        const categoryMatch = selectedCategory === "all" || cardCategory === selectedCategory;
        const techMatch = selectedTech === "all" || cardTechs.includes(selectedTech);
        if (categoryMatch && techMatch) {
          if (card instanceof HTMLElement) {
            card.style.display = "grid";
            visibleCount++;
          }
        } else if (card instanceof HTMLElement) {
          card.style.display = "none";
        }
      });
      if (visibleCountElement) {
        visibleCountElement.textContent = visibleCount.toString();
      }
      console.log(`Filtered: ${visibleCount}/${totalProjects} projects visible`);
    }
    if (categoryFilter && techFilter) {
      categoryFilter.addEventListener("change", filterProjects);
      techFilter.addEventListener("change", filterProjects);
    }
    if (projectCards.length > 0) {
      filterProjects();
    }
    const modalTriggers = document.querySelectorAll(".project-btn[data-modal-target]");
    const modals = document.querySelectorAll(".modal");
    const closeButtons = document.querySelectorAll(".close-button");
    console.log(`Found ${modalTriggers.length} modal triggers and ${modals.length} modals`);
    function escapeSelector(id) {
      return id.replace("#", "").replace(/["!#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, "\\$&");
    }
    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Modal trigger clicked");
        const targetId = trigger.getAttribute("data-modal-target");
        console.log("Target modal ID:", targetId);
        if (targetId) {
          let modal = document.querySelector(targetId);
          if (!modal && targetId.startsWith("#")) {
            const escapedId = "#" + escapeSelector(targetId);
            console.log("Trying escaped selector:", escapedId);
            modal = document.querySelector(escapedId);
          }
          if (!modal) {
            const id = targetId.replace("#", "");
            console.log("Trying getElementById:", id);
            modal = document.getElementById(id);
          }
          if (modal) {
            console.log("Opening modal:", targetId);
            modal.style.display = "block";
            modal.style.opacity = "0";
            setTimeout(() => {
              modal.style.opacity = "1";
            }, 10);
          } else {
            console.error("Modal not found:", targetId);
            console.log("Available modals:", Array.from(modals).map((m) => m.id));
          }
        }
      });
    });
    closeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Close button clicked");
        const modal = button.closest(".modal");
        if (modal) {
          console.log("Closing modal");
          modal.style.display = "none";
          modal.style.opacity = "0";
        }
      });
    });
    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          console.log("Clicked outside modal, closing");
          modal.style.display = "none";
          modal.style.opacity = "0";
        }
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        console.log("Escape key pressed, closing all modals");
        modals.forEach((modal) => {
          modal.style.display = "none";
          modal.style.opacity = "0";
        });
      }
    });
    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger.click();
        }
      });
    });
    const fullscreenModal = document.getElementById("fullscreen-modal");
    const fullscreenImage = document.getElementById("fullscreen-image");
    const fullscreenCaption = document.getElementById("fullscreen-caption");
    const fullscreenClose = document.querySelector(".fullscreen-close");
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("modal-preview-img")) {
        e.preventDefault();
        const imageSrc = target.getAttribute("data-fullscreen-src") || target.getAttribute("src");
        const projectName = target.getAttribute("data-project-name") || "Project Preview";
        if (imageSrc && fullscreenModal && fullscreenImage && fullscreenCaption) {
          fullscreenImage.src = imageSrc;
          fullscreenImage.alt = `Full preview of ${projectName}`;
          fullscreenCaption.textContent = projectName;
          fullscreenModal.style.display = "block";
          fullscreenModal.style.opacity = "0";
          setTimeout(() => {
            fullscreenModal.style.opacity = "1";
          }, 10);
          console.log(`Opening fullscreen image for: ${projectName}`);
        }
      }
    });
    if (fullscreenClose) {
      fullscreenClose.addEventListener("click", (e) => {
        e.preventDefault();
        if (fullscreenModal) {
          fullscreenModal.style.display = "none";
          fullscreenModal.style.opacity = "0";
          console.log("Closing fullscreen image");
        }
      });
    }
    if (fullscreenModal) {
      fullscreenModal.addEventListener("click", (e) => {
        if (e.target === fullscreenModal || e.target === document.querySelector(".fullscreen-overlay")) {
          fullscreenModal.style.display = "none";
          fullscreenModal.style.opacity = "0";
          console.log("Closing fullscreen image (clicked outside)");
        }
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && fullscreenModal && fullscreenModal.style.display === "block") {
        fullscreenModal.style.display = "none";
        fullscreenModal.style.opacity = "0";
        console.log("Closing fullscreen image (Escape key)");
      }
    });
    if (fullscreenClose) {
      fullscreenClose.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fullscreenClose.click();
        }
      });
    }
  });
})();
