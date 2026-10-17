const form = document.querySelector("#search-form");
const destinationInput = document.querySelector("#destination");
const checkInInput = document.querySelector("#check-in");
const checkOutInput = document.querySelector("#check-out");
const hotelCards = [...document.querySelectorAll(".hotel-card")];
const filterButtons = [...document.querySelectorAll(".filter-chip")];
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const toast = document.querySelector("#toast");
let activeCategory = "all";
let toastTimer;

const today = new Date();
const toDateValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(today.getDate() + 2);
checkInInput.min = toDateValue(today);
checkInInput.value = toDateValue(tomorrow);
checkOutInput.min = toDateValue(dayAfter);
checkOutInput.value = toDateValue(dayAfter);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

function updateResults() {
  const query = destinationInput.value.trim().toLowerCase();
  let visibleCount = 0;

  hotelCards.forEach((card) => {
    const matchesCategory = activeCategory === "all" || card.dataset.category.split(" ").includes(activeCategory);
    const matchesQuery = !query || card.dataset.search.includes(query);
    const visible = matchesCategory && matchesQuery;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  resultsCount.textContent = query
    ? `Showing ${visibleCount} ${visibleCount === 1 ? "stay" : "stays"} for “${destinationInput.value.trim()}”`
    : `Showing ${visibleCount} considered stays`;
  emptyState.hidden = visibleCount > 0;
  document.querySelector(".hotel-grid").hidden = visibleCount === 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;
    filterButtons.forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("selected", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    updateResults();
  });
});

destinationInput.addEventListener("input", updateResults);

checkInInput.addEventListener("change", () => {
  if (!checkInInput.value) return;
  const earliestCheckOut = new Date(`${checkInInput.value}T00:00:00`);
  earliestCheckOut.setDate(earliestCheckOut.getDate() + 1);
  checkOutInput.min = toDateValue(earliestCheckOut);
  if (checkOutInput.value < checkOutInput.min) checkOutInput.value = checkOutInput.min;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (checkInInput.value && checkOutInput.value && checkOutInput.value <= checkInInput.value) {
    showToast("Check-out must be after check-in.");
    checkOutInput.focus();
    return;
  }
  updateResults();
  document.querySelector("#stays").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#reset-search").addEventListener("click", () => {
  destinationInput.value = "";
  activeCategory = "all";
  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === "all";
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  updateResults();
});

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(saved));
    button.querySelector("span").textContent = saved ? "♥" : "♡";
    const hotelName = button.closest(".hotel-card").querySelector("h3").textContent;
    showToast(saved ? `${hotelName} added to your favorites` : `${hotelName} removed from your favorites`);
  });
});

document.querySelector("#sign-in").addEventListener("click", () => {
  showToast("Sign-in is coming soon. Thanks for stopping by!");
});

const menuButton = document.querySelector(".menu-button");
menuButton.addEventListener("click", () => {
  const navigation = document.querySelector(".main-nav");
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});
