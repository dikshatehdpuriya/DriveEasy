/* DriveEasy - script.js
   Works with index.html + style.css (keep all three in the same folder). */

// ---------- Car data ----------
// Tip: add your own image URLs in the "image" field. If it is empty or fails
// to load, a placeholder is shown automatically.
const cars = [
  { id: 1, name: "Maruti Swift", brand: "Maruti Suzuki", price: 1500, fuel: "Petrol", transmission: "Manual", seats: 5, type: "Hatchback", mileage: "22 km/l", available: true, image: "", features: ["Bluetooth", "Air conditioning", "Power steering", "Dual airbags"] },
  { id: 2, name: "Hyundai i20", brand: "Hyundai", price: 1800, fuel: "Petrol", transmission: "Manual", seats: 5, type: "Hatchback", mileage: "20 km/l", available: true, image: "", features: ["Touchscreen", "Rear camera", "Air conditioning", "ABS"] },
  { id: 3, name: "Tata Nexon EV", brand: "Tata", price: 3200, fuel: "Electric", transmission: "Automatic", seats: 5, type: "SUV", mileage: "300 km/charge", available: true, image: "", features: ["Fast charging", "Sunroof", "Touchscreen", "6 airbags"] },
  { id: 4, name: "Honda City", brand: "Honda", price: 2800, fuel: "Petrol", transmission: "Automatic", seats: 5, type: "Sedan", mileage: "18 km/l", available: true, image: "", features: ["Sunroof", "Cruise control", "Rear camera", "Leather seats"] },
  { id: 5, name: "Maruti Ertiga", brand: "Maruti Suzuki", price: 2500, fuel: "CNG", transmission: "Manual", seats: 7, type: "MPV", mileage: "26 km/kg", available: true, image: "", features: ["7 seats", "Large boot", "Air conditioning", "Touchscreen"] },
  { id: 6, name: "Hyundai Creta", brand: "Hyundai", price: 3400, fuel: "Diesel", transmission: "Automatic", seats: 5, type: "SUV", mileage: "19 km/l", available: false, image: "", features: ["Panoramic sunroof", "Ventilated seats", "Rear camera", "6 airbags"] },
  { id: 7, name: "Mahindra Thar", brand: "Mahindra", price: 4200, fuel: "Diesel", transmission: "Manual", seats: 4, type: "SUV", mileage: "15 km/l", available: true, image: "", features: ["4x4", "Convertible top", "Touchscreen", "Off-road ready"] },
  { id: 8, name: "Toyota Innova Crysta", brand: "Toyota", price: 4500, fuel: "Diesel", transmission: "Manual", seats: 7, type: "MPV", mileage: "14 km/l", available: true, image: "", features: ["7 seats", "Captain seats", "Rear AC", "7 airbags"] },
  { id: 9, name: "Toyota Fortuner", brand: "Toyota", price: 6500, fuel: "Diesel", transmission: "Automatic", seats: 7, type: "SUV", mileage: "11 km/l", available: true, image: "", features: ["4x4 option", "Leather seats", "Cruise control", "7 airbags"] },
  { id: 10, name: "Kia Seltos", brand: "Kia", price: 3300, fuel: "Petrol", transmission: "Automatic", seats: 5, type: "SUV", mileage: "16 km/l", available: true, image: "", features: ["Sunroof", "Bose audio", "Touchscreen", "Rear camera"] },
  { id: 11, name: "Tata Tiago", brand: "Tata", price: 1400, fuel: "CNG", transmission: "Manual", seats: 5, type: "Hatchback", mileage: "26 km/kg", available: true, image: "", features: ["Dual airbags", "Bluetooth", "Air conditioning", "Power windows"] },
  { id: 12, name: "Mahindra XUV700", brand: "Mahindra", price: 5200, fuel: "Diesel", transmission: "Automatic", seats: 7, type: "SUV", mileage: "15 km/l", available: false, image: "", features: ["ADAS", "Panoramic sunroof", "Sony audio", "7 airbags"] }
];

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const formatINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

// Inline SVG placeholder so the page never shows a broken image
function placeholderImage(text) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>` +
    `<rect width='100%' height='100%' fill='#e9edf4'/>` +
    `<text x='50%' y='50%' fill='#5548f5' font-family='Arial' font-size='28' font-weight='bold' ` +
    `text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function imageFor(car) {
  return car.image || placeholderImage(car.name);
}

// If a real image URL fails, swap in the placeholder
document.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.name && !img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = placeholderImage(img.dataset.name);
    }
  },
  true
);

let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ---------- Elements ----------
const carGrid = $("carGrid");
const emptyState = $("emptyState");
const resultsCount = $("resultsCount");
const searchInput = $("searchInput");
const priceFilter = $("priceFilter");
const brandFilter = $("brandFilter");
const fuelFilter = $("fuelFilter");
const transmissionFilter = $("transmissionFilter");
const sortSelect = $("sortSelect");

// ---------- Brand dropdown ----------
function populateBrands() {
  const brands = [...new Set(cars.map((c) => c.brand))].sort();
  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandFilter.appendChild(option);
  });
}

// ---------- Filter + sort ----------
function getFilteredCars() {
  const query = searchInput.value.trim().toLowerCase();
  const [minPrice, maxPrice] =
    priceFilter.value === "all" ? [0, Infinity] : priceFilter.value.split("-").map(Number);

  let list = cars.filter((car) => {
    const matchesSearch =
      !query ||
      `${car.name} ${car.brand} ${car.type} ${car.fuel}`.toLowerCase().includes(query);
    const matchesPrice = car.price >= minPrice && car.price < maxPrice;
    const matchesBrand = brandFilter.value === "all" || car.brand === brandFilter.value;
    const matchesFuel = fuelFilter.value === "all" || car.fuel === fuelFilter.value;
    const matchesTrans =
      transmissionFilter.value === "all" || car.transmission === transmissionFilter.value;
    return matchesSearch && matchesPrice && matchesBrand && matchesFuel && matchesTrans;
  });

  switch (sortSelect.value) {
    case "low":
      list.sort((a, b) => a.price - b.price);
      break;
    case "high":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      list.sort((a, b) => a.id - b.id); // featured = original order
  }
  return list;
}

// ---------- Render cars ----------
function renderCars() {
  const list = getFilteredCars();

  carGrid.innerHTML = list
    .map(
      (car, i) => `
      <article class="car-card" style="animation-delay:${i * 40}ms">
        <div class="car-photo">
          <img src="${imageFor(car)}" data-name="${car.name}" alt="${car.name}" loading="lazy">
          <span class="availability ${car.available ? "" : "unavailable"}">
            ${car.available ? "Available" : "Booked"}
          </span>
        </div>
        <div class="car-info">
          <div class="car-top">
            <h3>${car.name}</h3>
            <span class="car-brand">${car.brand}</span>
          </div>
          <p class="price">${formatINR(car.price)} <small>/ day</small></p>
          <div class="car-specs">
            <span>${car.fuel}</span>
            <span>${car.transmission}</span>
            <span>${car.seats} seats</span>
          </div>
          <div class="card-actions">
            <button class="button button-small button-outline" data-action="details" data-id="${car.id}">Details</button>
            <button class="button button-small button-primary" data-action="book" data-id="${car.id}" ${car.available ? "" : "disabled style='opacity:.5;cursor:not-allowed'"}>
              ${car.available ? "Book now" : "Unavailable"}
            </button>
          </div>
        </div>
      </article>`
    )
    .join("");

  emptyState.classList.toggle("hidden", list.length > 0);
  carGrid.classList.toggle("hidden", list.length === 0);
  resultsCount.textContent = `Showing ${list.length} of ${cars.length} cars`;
}

// ---------- Filter events ----------
[searchInput, priceFilter, brandFilter, fuelFilter, transmissionFilter, sortSelect].forEach((el) => {
  el.addEventListener(el === searchInput ? "input" : "change", renderCars);
});

$("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  renderCars();
  $("cars").scrollIntoView({ behavior: "smooth" });
});

$("clearFilters").addEventListener("click", () => {
  $("searchForm").reset();
  sortSelect.value = "featured";
  renderCars();
  showToast("Filters cleared");
});

// ---------- Card buttons (event delegation) ----------
carGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const car = cars.find((c) => c.id === Number(btn.dataset.id));
  if (!car) return;
  if (btn.dataset.action === "details") openDetails(car);
  if (btn.dataset.action === "book") openBooking(car);
});

// ---------- Details dialog ----------
const detailsDialog = $("detailsDialog");

function openDetails(car) {
  $("detailsContent").innerHTML = `
    <div class="detail-layout">
      <img class="detail-image" src="${imageFor(car)}" data-name="${car.name}" alt="${car.name}">
      <div class="detail-copy">
        <p class="eyebrow purple">${car.brand.toUpperCase()}</p>
        <h2>${car.name}</h2>
        <p class="price">${formatINR(car.price)} <small>/ day</small></p>
        <div class="detail-spec-grid">
          <div class="detail-spec"><b>Type</b>${car.type}</div>
          <div class="detail-spec"><b>Fuel</b>${car.fuel}</div>
          <div class="detail-spec"><b>Transmission</b>${car.transmission}</div>
          <div class="detail-spec"><b>Seats</b>${car.seats}</div>
          <div class="detail-spec"><b>Mileage / Range</b>${car.mileage}</div>
          <div class="detail-spec"><b>Status</b>${car.available ? "Available" : "Currently booked"}</div>
        </div>
        <h3>Features</h3>
        <div class="feature-list">${car.features.map((f) => `<span>${f}</span>`).join("")}</div>
        <br>
        <button class="button button-primary full-width" id="detailsBookBtn" ${car.available ? "" : "disabled style='opacity:.5;cursor:not-allowed'"}>
          ${car.available ? "Book this car →" : "Currently unavailable"}
        </button>
      </div>
    </div>`;

  const bookBtn = $("detailsBookBtn");
  if (car.available) {
    bookBtn.addEventListener("click", () => {
      detailsDialog.close();
      openBooking(car);
    });
  }
  detailsDialog.showModal();
}

$("closeDetails").addEventListener("click", () => detailsDialog.close());

// ---------- Booking dialog ----------
const bookingDialog = $("bookingDialog");
const pickupDate = $("pickupDate");
const returnDate = $("returnDate");
let selectedCar = null;

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // local date, not UTC
  return d.toISOString().split("T")[0];
}

function openBooking(car) {
  if (!car.available) {
    showToast("Sorry, this car is currently booked.");
    return;
  }
  selectedCar = car;
  $("bookingCarId").value = car.id;
  $("bookingCarName").textContent = `${car.name} · ${formatINR(car.price)} / day`;
  $("bookingForm").reset();
  pickupDate.min = todayISO();
  returnDate.min = todayISO();
  $("estimatedTotal").textContent = formatINR(0);
  $("bookingFeedback").textContent = "Demo only: your request is not sent to a server.";
  bookingDialog.showModal();
}

function updateTotal() {
  if (!selectedCar || !pickupDate.value || !returnDate.value) {
    $("estimatedTotal").textContent = formatINR(0);
    return;
  }
  const days = Math.round((new Date(returnDate.value) - new Date(pickupDate.value)) / 86400000);
  // Same-day return counts as 1 day
  const billableDays = days < 1 ? 1 : days;
  $("estimatedTotal").textContent = days < 0 ? formatINR(0) : formatINR(billableDays * selectedCar.price);
}

pickupDate.addEventListener("change", () => {
  returnDate.min = pickupDate.value || todayISO();
  if (returnDate.value && returnDate.value < pickupDate.value) returnDate.value = pickupDate.value;
  updateTotal();
});
returnDate.addEventListener("change", updateTotal);

$("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (returnDate.value < pickupDate.value) {
    $("bookingFeedback").textContent = "Return date cannot be before the pickup date.";
    return;
  }
  const name = $("bookingName").value.trim();
  bookingDialog.close();
  showToast(`Thanks ${name.split(" ")[0]}! Booking request for ${selectedCar.name} received.`);
});

$("closeBooking").addEventListener("click", () => bookingDialog.close());

// Close a dialog when clicking on the dark backdrop
[detailsDialog, bookingDialog].forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    const outside =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside) dialog.close();
  });
});

// ---------- Contact form ----------
$("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("contactName").value.trim();
  $("contactFeedback").textContent = `Thanks ${name}! We'll get back to you soon. (Demo only)`;
  e.target.reset();
  showToast("Message sent!");
});

// ---------- Mobile menu ----------
const menuToggle = $("menuToggle");
const navLinks = $("navLinks");

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.textContent = open ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  })
);

// ---------- Highlight active nav link on scroll ----------
const sections = ["home", "cars", "about", "contact"].map((id) => $(id));
const navItems = document.querySelectorAll(".nav-link");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navItems.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => s && observer.observe(s));

// ---------- Init ----------
$("year").textContent = new Date().getFullYear();
populateBrands();
renderCars();