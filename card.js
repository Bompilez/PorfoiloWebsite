const cards = document.querySelectorAll(".card");
const cardsHeader = document.querySelectorAll(".heading-icon");
const projectNavShell = document.querySelector(".project-nav-shell");
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

const centerElementInView = (element, updateHash = true) => {
  const rect = element.getBoundingClientRect();
  const targetScrollTop = isMobileViewport.matches
    ? window.scrollY + rect.top
    : window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
  const maxScrollTop =
    document.documentElement.scrollHeight - window.innerHeight;
  const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

  window.scrollTo({
    top: clampedScrollTop,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });

  if (updateHash) {
    history.pushState(null, "", `#${element.id}`);
  }
};

if (projectNavToggle) {
  const setProjectNavExpandedState = (isExpanded) => {
    document.body.classList.toggle("is-project-nav-expanded", isExpanded);
    projectNavToggle.setAttribute("aria-expanded", String(isExpanded));
    projectNavToggle.setAttribute(
      "aria-label",
      isExpanded ? "Lukk navigasjon" : "Åpne navigasjon"
    );
    projectNavToggle.textContent = isExpanded ? "x" : "<";
  };

  projectNavToggle.addEventListener("click", () => {
    const isExpanded = !document.body.classList.contains("is-project-nav-expanded");
    setProjectNavExpandedState(isExpanded);
  });

  setProjectNavExpandedState(false);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (!targetElement) {
      return;
    }

    event.preventDefault();
    centerElementInView(targetElement);

    if (anchor.classList.contains("project-nav-item") && isMobileViewport.matches) {
      document.body.classList.remove("is-project-nav-expanded");
      if (projectNavToggle) {
        projectNavToggle.setAttribute("aria-expanded", "false");
        projectNavToggle.setAttribute("aria-label", "Åpne navigasjon");
        projectNavToggle.textContent = "<";
      }
    }
  });
});

if (window.location.hash) {
  const hashTarget = document.querySelector(window.location.hash);

  if (hashTarget) {
    requestAnimationFrame(() => {
      centerElementInView(hashTarget, false);
    });
  }
}

if (projectNavShell) {
  const firstProjectSection = document.querySelector("#design-scroll");
  const projectTargets = [
    document.querySelector("#design-scroll"),
    document.querySelector("#developer-scroll"),
    document.querySelector("#animation-scroll"),
    document.querySelector("#about-contact"),
  ].filter(Boolean);

  if (firstProjectSection) {
    const toggleProjectNavVisibility = () => {
      const triggerPoint = firstProjectSection.getBoundingClientRect().top;
      const shouldShow = triggerPoint <= window.innerHeight * 0.45;
      document.body.classList.toggle("is-project-nav-visible", shouldShow);
    };

    toggleProjectNavVisibility();
    window.addEventListener("scroll", toggleProjectNavVisibility, { passive: true });
    window.addEventListener("resize", toggleProjectNavVisibility);
  }

  if (projectTargets.length > 0) {
    const navActiveObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = document.querySelector(`.project-nav-item[href="#${entry.target.id}"]`);
          if (!link) {
            return;
          }

          if (entry.isIntersecting) {
            projectNavLinks.forEach((navLink) => navLink.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      {
        threshold: 0.45,
      }
    );

    projectTargets.forEach((target) => navActiveObserver.observe(target));
  }
}
