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
