const cards = document.querySelectorAll(".card");
const cardsHeader = document.querySelectorAll(".heading-icon");
const projectNavLinks = document.querySelectorAll(".project-nav-item");
const projectNavToggle = document.querySelector(".project-nav-toggle");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const isMobileViewport = window.matchMedia("(max-width: 768px)");

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");

    const header = cardsHeader[index];
    header.classList.toggle("heading-icon-is-flipped");
  });
});

const addRevealDelay = (elements, baseDelay = 0, step = 90) => {
  elements.forEach((element, index) => {
    element.classList.add("reveal-item");
    element.style.setProperty("--reveal-delay", `${baseDelay + index * step}ms`);
  });
};

addRevealDelay([document.querySelector(".card-heading-content")].filter(Boolean), 0, 0);
addRevealDelay([document.querySelector(".card-front-container")].filter(Boolean), 120, 0);

document.querySelectorAll(".design-project-wrapper").forEach((section) => {
  const info = section.querySelector(".projects-main-info");
  const projectCards = section.querySelectorAll(".projects-card");

  addRevealDelay([info].filter(Boolean), 0, 0);
  addRevealDelay(projectCards, 120, 100);
});

addRevealDelay([document.querySelector(".about-content")].filter(Boolean), 0, 0);
addRevealDelay([document.querySelector(".contact-content")].filter(Boolean), 140, 0);

const revealTargets = document.querySelectorAll(".reveal-item");

if (prefersReducedMotion) {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

const navSections = Array.from(document.querySelectorAll(".nav-section"));
const hashAnchors = Array.from(document.querySelectorAll('a[href^="#"]'));
let lightBackgroundTransitionTimer = null;

const setProjectNavExpandedState = (isExpanded) => {
  document.body.classList.toggle("is-project-nav-expanded", isExpanded);

  if (!projectNavToggle) {
    return;
  }

  projectNavToggle.setAttribute("aria-expanded", String(isExpanded));
  projectNavToggle.setAttribute(
    "aria-label",
    isExpanded ? "Lukk navigasjon" : "Åpne navigasjon"
  );
  projectNavToggle.textContent = isExpanded ? "x" : "<";
};

const getSectionFromHash = (hashValue) => {
  if (!hashValue || hashValue === "#") {
    return null;
  }

  const targetElement = document.querySelector(hashValue);
  if (!targetElement) {
    return null;
  }

  if (targetElement.classList.contains("nav-section")) {
    return targetElement;
  }

  return targetElement.closest(".nav-section");
};

const getSectionScrollContainer = (sectionElement) => {
  if (!sectionElement) {
    return null;
  }

  if (sectionElement.classList.contains("section")) {
    return sectionElement;
  }

  return sectionElement.querySelector(".section");
};

const revealActiveSection = (sectionElement) => {
  if (!sectionElement) {
    return;
  }

  sectionElement
    .querySelectorAll(".reveal-item")
    .forEach((target) => target.classList.add("is-visible"));
};

const updateActiveNavLink = (activeSection) => {
  projectNavLinks.forEach((link) => {
    const linkedSection = getSectionFromHash(link.getAttribute("href"));
    const isActive = linkedSection === activeSection;
    link.classList.toggle("is-active", isActive);
  });
};

const setActiveSection = (hashValue, options = {}) => {
  const { updateHash = true, resetScroll = true } = options;
  const targetSection = getSectionFromHash(hashValue);
  const nextSection = targetSection || navSections[0];
  const currentSection = navSections.find((section) =>
    section.classList.contains("is-active")
  );

  if (!nextSection) {
    return;
  }

  if (currentSection && currentSection !== nextSection) {
    const currentIndex = navSections.indexOf(currentSection);
    const nextIndex = navSections.indexOf(nextSection);
    const isForward = nextIndex > currentIndex;

    document.body.classList.toggle("is-nav-forward", isForward);
    document.body.classList.toggle("is-nav-backward", !isForward);
  } else {
    document.body.classList.remove("is-nav-forward", "is-nav-backward");
  }

  const homeSection = getSectionFromHash("#home");
  const aboutSection = getSectionFromHash("#about-contact");
  const isLightSection = (section) =>
    section === homeSection || section === aboutSection;
  const sourceIsLight = isLightSection(currentSection);
  const targetIsLight = isLightSection(nextSection);

  if (lightBackgroundTransitionTimer) {
    window.clearTimeout(lightBackgroundTransitionTimer);
    lightBackgroundTransitionTimer = null;
  }

  if (sourceIsLight && !targetIsLight) {
    document.body.classList.add("is-nav-light-bg");
    const transitionDuration = isMobileViewport.matches ? 520 : 620;
    lightBackgroundTransitionTimer = window.setTimeout(() => {
      document.body.classList.remove("is-nav-light-bg");
      lightBackgroundTransitionTimer = null;
    }, transitionDuration);
  } else {
    document.body.classList.toggle("is-nav-light-bg", targetIsLight);
  }

  navSections.forEach((section) => {
    section.classList.toggle("is-active", section === nextSection);
  });

  updateActiveNavLink(nextSection);
  revealActiveSection(nextSection);

  if (resetScroll && isMobileViewport.matches) {
    const scrollContainer = getSectionScrollContainer(nextSection);
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  }

  if (updateHash) {
    const targetId = nextSection.id || nextSection.querySelector("[id]")?.id;
    if (targetId) {
      history.pushState(null, "", `#${targetId}`);
    }
  }
};

const initializeSectionNavigation = () => {
  if (navSections.length === 0) {
    return;
  }

  document.body.classList.add("is-section-nav-mode", "is-project-nav-visible");

  const initialHash = window.location.hash && getSectionFromHash(window.location.hash)
    ? window.location.hash
    : "#home";

  setActiveSection(initialHash, { updateHash: false, resetScroll: false });

  hashAnchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetHash = anchor.getAttribute("href");
      const targetSection = getSectionFromHash(targetHash);

      if (!targetSection) {
        return;
      }

      event.preventDefault();
      setActiveSection(targetHash, { updateHash: true, resetScroll: true });

      if (anchor.classList.contains("project-nav-item") && isMobileViewport.matches) {
        setProjectNavExpandedState(false);
      }
    });
  });

  if (projectNavToggle) {
    projectNavToggle.addEventListener("click", () => {
      const isExpanded = !document.body.classList.contains("is-project-nav-expanded");
      setProjectNavExpandedState(isExpanded);
    });
  }

  isMobileViewport.addEventListener("change", (event) => {
    if (!event.matches) {
      setProjectNavExpandedState(false);
    }
  });

  window.addEventListener("hashchange", () => {
    setActiveSection(window.location.hash, { updateHash: false, resetScroll: false });
  });

  setProjectNavExpandedState(false);
};

initializeSectionNavigation();

const projectModal = document.querySelector("#project-modal");
const projectModalTitle = document.querySelector("#project-modal-title");
const projectModalDescription = document.querySelector("#project-modal-description");
const projectModalImageOne = document.querySelector("#project-modal-image-1");
const projectModalImageTwo = document.querySelector("#project-modal-image-2");
const projectModalVideoWrap = document.querySelector("#project-modal-video-wrap");
const projectModalVideo = document.querySelector("#project-modal-video");
const projectModalVideoSource = document.querySelector("#project-modal-video-source");
const projectModalVideoNote = document.querySelector("#project-modal-video-note");
const projectModalVideoLink = document.querySelector("#project-modal-video-link");
const projectReadMoreButtons = document.querySelectorAll(".project-read-more");
let previouslyFocusedElement = null;

const resolveVideoMimeType = (videoPath) => {
  const lowerPath = (videoPath || "").toLowerCase();

  if (lowerPath.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (lowerPath.endsWith(".webm")) {
    return "video/webm";
  }

  if (lowerPath.endsWith(".mov")) {
    return "video/quicktime";
  }

  return "video/mp4";
};

const closeProjectModal = () => {
  if (!projectModal || !projectModal.classList.contains("is-open")) {
    return;
  }

  projectModal.classList.remove("is-open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-modal-open");

  if (projectModalVideo && projectModalVideoSource) {
    projectModalVideo.pause();
    projectModalVideoSource.src = "";
    projectModalVideoSource.type = "video/mp4";
    projectModalVideo.load();
  }

  if (projectModalVideoWrap) {
    projectModalVideoWrap.classList.add("is-hidden");
  }

  if (projectModalVideoNote) {
    projectModalVideoNote.classList.add("is-hidden");
  }

  if (projectModalVideoLink) {
    projectModalVideoLink.setAttribute("href", "#");
  }

  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
  }
};

const openProjectModal = (buttonElement) => {
  if (
    !projectModal ||
    !projectModalTitle ||
    !projectModalDescription ||
    !projectModalImageOne ||
    !projectModalImageTwo
  ) {
    return;
  }

  const fallbackCard = buttonElement.closest(".projects-card");
  const fallbackTitle = fallbackCard?.querySelector(".projects-cards-text h4")?.textContent?.trim();
  const fallbackDescription = fallbackCard?.querySelector(".projects-cards-text p")?.textContent?.trim();
  const fallbackImage = fallbackCard?.querySelector(".projects-cards-image img")?.getAttribute("src");

  const title = buttonElement.dataset.modalTitle || fallbackTitle || "Prosjekt";
  const description =
    buttonElement.dataset.modalDescription ||
    fallbackDescription ||
    "Mer informasjon om prosjektet kommer snart.";
  const imageOne = buttonElement.dataset.modalImage1 || fallbackImage || "";
  const imageTwo = buttonElement.dataset.modalImage2 || fallbackImage || "";
  const videoFile = buttonElement.dataset.modalVideo || "";

  projectModalTitle.textContent = title;
  projectModalDescription.textContent = description;
  projectModalImageOne.src = imageOne;
  projectModalImageTwo.src = imageTwo;
  projectModalImageOne.alt = `${title} - bilde 1`;
  projectModalImageTwo.alt = `${title} - bilde 2`;

  if (projectModalVideoWrap && projectModalVideo && projectModalVideoSource) {
    if (videoFile) {
      const encodedVideoPath = encodeURI(videoFile);
      projectModalVideoSource.src = encodedVideoPath;
      projectModalVideoSource.type = resolveVideoMimeType(videoFile);
      projectModalVideo.muted = true;
      projectModalVideo.loop = true;
      projectModalVideo.autoplay = true;
      projectModalVideo.load();
      projectModalVideoWrap.classList.remove("is-hidden");

      if (projectModalVideoLink) {
        projectModalVideoLink.setAttribute("href", encodedVideoPath);
      }
    } else {
      projectModalVideo.pause();
      projectModalVideoSource.src = "";
      projectModalVideoSource.type = "video/mp4";
      projectModalVideo.load();
      projectModalVideoWrap.classList.add("is-hidden");
    }
  }

  previouslyFocusedElement = document.activeElement;
  projectModal.classList.add("is-open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-modal-open");

  const closeButton = projectModal.querySelector(".project-modal-close");
  closeButton?.focus();
};

projectReadMoreButtons.forEach((button) => {
  button.addEventListener("click", () => openProjectModal(button));
});

if (projectModal) {
  projectModal.addEventListener("click", (event) => {
    const targetElement = event.target;

    if (!(targetElement instanceof Element)) {
      return;
    }

    if (targetElement.closest("[data-close-modal]")) {
      closeProjectModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
  }
});

if (projectModalVideo) {
  projectModalVideo.addEventListener("error", () => {
    if (projectModalVideoNote) {
      projectModalVideoNote.classList.remove("is-hidden");
    }
  });

  projectModalVideo.addEventListener("loadeddata", () => {
    const playPromise = projectModalVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        if (projectModalVideoNote) {
          projectModalVideoNote.classList.remove("is-hidden");
        }
      });
    }

    if (projectModalVideoNote) {
      projectModalVideoNote.classList.add("is-hidden");
    }
  });
}
