const cards = document.querySelectorAll(".card");
const cardsHeader = document.querySelectorAll(".heading-icon");

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");

    const header = cardsHeader[index];
    header.classList.toggle("heading-icon-is-flipped");
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-scroll-target");
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });
});
