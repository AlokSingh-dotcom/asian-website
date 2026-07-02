const loader = document.querySelector(".loader");
const progress = document.querySelector(".scroll-progress");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorText = document.querySelector(".cursor-ring span");
const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navDropdown = document.querySelector(".nav-dropdown");
const navDropButton = document.querySelector(".nav-drop-button");
const navItems = siteNav ? siteNav.querySelectorAll(".nav-link") : [];
const searchButton = document.querySelector(".search-button");
const themeToggle = document.querySelector(".theme-toggle");
const serviceSearch = document.querySelector("#service-search");
const chips = document.querySelectorAll("[data-filter]");
const serviceGrid = document.querySelector("#service-grid");
const serviceCards = document.querySelectorAll(".service-card");
const quoteForm = document.querySelector("#quote-form");
const quoteStatus = document.querySelector("#quote-status");
const testimonials = document.querySelectorAll(".testimonial");
const galleryButtons = document.querySelectorAll("[data-gallery]");
const galleryItems = document.querySelectorAll("[data-gallery-item]");
const savedTheme = localStorage.getItem("atis-theme");
const imageFallbacks = [
  "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3912981/pexels-photo-3912981.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1200"
];

let activeFilter = "all";
let testimonialIndex = 0;

if (savedTheme === "light") {
  document.body.classList.add("light");
}

document.querySelectorAll("img").forEach((image, index) => {
  image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => {
    if (image.dataset.fallbackApplied === "true") {
      const label = encodeURIComponent(image.alt || "Testing Laboratory");
      image.src = `https://placehold.co/900x600/101722/4aa3ff?text=${label}`;
      return;
    }

    image.dataset.fallbackApplied = "true";
    image.src = imageFallbacks[index % imageFallbacks.length];
  });
});

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("hidden"), 700);
});

function updateScrollUi() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
  siteHeader.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateScrollUi, { passive: true });

function moveNavPill(target) {
  if (!target || window.innerWidth <= 1180) return;
  const navRect = siteNav.getBoundingClientRect();
  const itemRect = target.getBoundingClientRect();
  siteNav.style.setProperty("--pill-left", `${itemRect.left - navRect.left}px`);
  siteNav.style.setProperty("--pill-top", `${itemRect.top - navRect.top}px`);
  siteNav.style.setProperty("--pill-width", `${itemRect.width}px`);
  siteNav.style.setProperty("--pill-height", `${itemRect.height}px`);
  siteNav.style.setProperty("--pill-opacity", "1");
}

navItems.forEach((item) => {
  item.addEventListener("mouseenter", () => moveNavPill(item));
  item.addEventListener("focus", () => moveNavPill(item));
});
siteNav.addEventListener("mouseleave", () => moveNavPill(navItems[0]));

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navDropButton.addEventListener("click", () => {
  const isOpen = navDropdown.classList.toggle("open");
  navDropButton.setAttribute("aria-expanded", String(isOpen));
});

searchButton.addEventListener("click", () => {
  document.querySelector("#capabilities").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => serviceSearch.focus(), 550);
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("atis-theme", document.body.classList.contains("light") ? "light" : "dark");
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest(".nav-drop-button")) return;
  siteNav.classList.remove("open");
  navDropdown.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navDropButton.setAttribute("aria-expanded", "false");
});

document.addEventListener("mousemove", (event) => {
  if (!cursorDot || !cursorRing) return;
  cursorDot.style.left = `${event.clientX}px`;
  cursorDot.style.top = `${event.clientY}px`;
  cursorRing.animate({ left: `${event.clientX}px`, top: `${event.clientY}px` }, { duration: 420, fill: "forwards" });
});

document.querySelectorAll("a, button, .service-card, .industry-card, .magnetic").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    cursorRing.classList.add("active");
    cursorText.textContent = item.dataset.cursor || "VIEW";
  });
  item.addEventListener("mouseleave", () => {
    cursorRing.classList.remove("active");
    cursorText.textContent = "";
    item.style.transform = "";
  });
});

function filterServices() {
  const query = serviceSearch.value.trim().toLowerCase();
  serviceCards.forEach((card) => {
    const categoryMatch = activeFilter === "all" || card.dataset.category === activeFilter;
    const text = `${card.textContent} ${card.dataset.service}`.toLowerCase();
    card.classList.toggle("hidden", !(categoryMatch && (!query || text.includes(query))));
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    filterServices();
  });
});
serviceSearch.addEventListener("input", filterServices);

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.querySelector("#quote-name").value.trim();
  const email = document.querySelector("#quote-email").value.trim();
  const phone = document.querySelector("#quote-phone").value.trim();
  const service = document.querySelector("#quote-service").value;
  const message = document.querySelector("#quote-message").value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !validEmail || !phone || !service || !message) {
    quoteStatus.textContent = validEmail ? "Please complete all required fields." : "Please enter a valid email address.";
    quoteStatus.classList.add("error");
    return;
  }

  quoteStatus.classList.remove("error");
  quoteStatus.textContent = "Sending request...";

  try {
    const response = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, service, message })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || "Request failed.");
    quoteStatus.textContent = result.message;
    quoteForm.reset();
  } catch (error) {
    quoteStatus.classList.add("error");
    quoteStatus.textContent = "Could not send right now. Please call or email the lab directly.";
  }
});

const newsletterForm = document.querySelector(".newsletter");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = newsletterForm.querySelector("input");
    const button = newsletterForm.querySelector("button");
    const email = input.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
      button.textContent = "Check email";
      return;
    }

    button.textContent = "Sending...";
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Subscription failed.");
      newsletterForm.reset();
      button.textContent = "Subscribed";
    } catch (error) {
      button.textContent = "Try again";
    }
    setTimeout(() => {
      button.textContent = "Subscribe";
    }, 2200);
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.13 });

document.querySelectorAll(".reveal").forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
  revealObserver.observe(item);
});

const metricObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const metric = entry.target;
    const target = Number(metric.dataset.count);
    const suffix = metric.dataset.suffix || "";
    const start = performance.now();
    const duration = 1100;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = target % 1 ? (target * progress).toFixed(1) : Math.round(target * progress);
      metric.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    observer.unobserve(metric);
  });
}, { threshold: 0.45 });
document.querySelectorAll(".metric").forEach((metric) => metricObserver.observe(metric));

setInterval(() => {
  testimonials[testimonialIndex].classList.remove("active");
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  testimonials[testimonialIndex].classList.add("active");
}, 4300);

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    galleryButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.gallery;
galleryItems.forEach((item) => {
      item.style.display = filter === "all" || item.dataset.galleryItem === filter ? "" : "none";
    });
  });
});

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = '<button type="button" aria-label="Close gallery preview">&times;</button><img alt="" />';
document.body.appendChild(lightbox);
const lightboxImage = lightbox.querySelector("img");
lightbox.querySelector("button").addEventListener("click", () => lightbox.classList.remove("open"));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.classList.remove("open");
});
galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightbox.classList.add("open");
  });
});

document.querySelectorAll(".button, .nav-cta, .newsletter button").forEach((button) => {
  button.addEventListener("click", function (event) {
    const ripple = document.createElement("span");
    const rect = this.getBoundingClientRect();
    ripple.className = "ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

updateScrollUi();
moveNavPill(navItems[0]);

