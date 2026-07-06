const data = window.ATIS_SERVICES[document.body.dataset.service];
const progress = document.querySelector(".scroll-progress");
const serviceNav = document.querySelector(".service-nav");
const savedTheme = localStorage.getItem("atis-theme");
const imageFallbacks = [
  "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1400",
  "https://images.pexels.com/photos/3912981/pexels-photo-3912981.jpeg?auto=compress&cs=tinysrgb&w=1400",
  "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=1400",
  "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1400"
];

if (savedTheme === "light") {
  document.body.classList.add("light");
}

function fallback(value, fallbackValue = []) {
  return Array.isArray(value) ? value : fallbackValue;
}

function section(id, title, html, classes = "") {
  if (!html || !String(html).trim()) return "";
  return `<section class="service-section reveal ${classes}" id="${id}"><div class="section-inner">${html}</div></section>`;
}

function sentence(items) {
  const values = fallback(items);
  if (!values.length) return "";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function chips(items) {
  return `<div class="chip-list">${fallback(items).map((item) => `<span><i></i>${item}</span>`).join("")}</div>`;
}

function timeline(items) {
  return `<div class="plain-steps">${fallback(items).map((item, index) => `<article><b>${String(index + 1).padStart(2, "0")}</b><p>${item}</p></article>`).join("")}</div>`;
}

function label(text) {
  return `<p class="section-label">${text}</p>`;
}

function related(items) {
  return `<div class="related-links">${fallback(items).map((slug) => {
    const item = window.ATIS_SERVICES[slug];
    return item ? `<a href="${slug}.html">${item.title}</a>` : "";
  }).join("")}</div>`;
}

function applyImageFallbacks() {
  document.querySelectorAll("img").forEach((image, index) => {
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => {
      if (image.dataset.fallbackApplied === "true") {
        const label = encodeURIComponent(image.alt || "Testing Laboratory");
        image.src = `https://placehold.co/1200x700/101722/4aa3ff?text=${label}`;
        return;
      }

      image.dataset.fallbackApplied = "true";
      image.src = imageFallbacks[index % imageFallbacks.length];
    });
  });
}

function render() {
  if (!data) {
    document.querySelector("main").innerHTML = "<section class='page-shell'><h1>Service not found</h1></section>";
    return;
  }

  document.title = `${data.title} | Asian Testing and Inspection Services`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", `${data.title} by Asian Testing and Inspection Services. ${data.intro}`);
  document.querySelector(".hero-bg").style.backgroundImage = `url("${data.image}")`;
  document.querySelector(".breadcrumbs").innerHTML = `<a href="/">Home</a><span>/</span><a href="/#capabilities">Services</a><span>/</span><span>${data.title}</span>`;
  document.querySelector(".category").textContent = data.category;
  document.querySelector("h1").textContent = data.title;
  document.querySelector(".intro").textContent = data.intro;
  document.querySelector(".intro").insertAdjacentHTML("afterend", `<div class="trust-badges">${fallback(data.standards).slice(0, 5).map((item) => `<span>${item}</span>`).join("")}</div>`);
  document.querySelector(".hero-card strong").textContent = `${fallback(data.standards).length}+`;
  document.querySelector(".hero-card span").textContent = "Relevant standards and customer specifications";
  document.querySelector(".hero-card").insertAdjacentHTML("beforeend", `<ul>${fallback(data.sourceScope).slice(0, 4).map((item) => `<li>${item}</li>`).join("")}</ul>`);

  const sections = [
    ["overview", "Overview", `${label("Overview")}<div class="split"><div><h2>Service overview</h2><p class="lead">${data.overview}</p></div><img src="${data.image}" alt="${data.title}" loading="lazy"></div>`],
    ["highlights", "Key Highlights", `${label("Key Highlights")}<div class="prose-grid"><article><h2>Key highlights</h2><p class="lead">This service covers ${sentence(data.highlights).toLowerCase()}. It is structured for practical review by quality, purchase, production and engineering teams.</p></article><article><h2>Applications</h2><p class="lead">Typical use cases include ${sentence(data.applications.slice(0, 4)).toLowerCase()}. The scope can be adjusted based on sample condition, project specification and reporting needs.</p></article></div>`],
    ["standards", "Standards & industries", `${label("Standards & Industries")}<div class="prose-grid"><article><h2>Standards</h2><p class="lead">Testing can be planned around ${sentence(data.standards)} or a customer-specific requirement.</p>${chips(data.standards.slice(0, 6))}</article><article><h2>Industries</h2><p class="lead">The service is commonly used by teams in ${sentence(data.industries).toLowerCase()}.</p></article></div>`],
    ["procedure", "Procedure", `${label("Procedure")}<h2>Testing workflow</h2><p class="lead">The process is kept simple and traceable from sample intake to final reporting.</p>${timeline(data.procedure)}`],
    ["samples", "Samples & deliverables", `${label("Samples & Deliverables")}<div class="prose-grid"><article><h2>Sample requirements</h2><p class="lead">Please share ${sentence(data.sampleRequirements).toLowerCase()} so the laboratory can confirm the correct scope before testing.</p></article><article><h2>Deliverables</h2><p class="lead">The final output generally includes ${sentence(data.deliverables).toLowerCase()}.</p></article></div>`],
    ["related", "Related", `${label("Related Services")}<h2>Related services</h2>${related(data.related)}`]
  ];

  document.querySelector(".content").innerHTML =
    sections
      .map(([id, , html], index) => section(id, "", html, index % 2 ? "alt" : ""))
      .join("") +
    `<section class="cta-band reveal" id="quote" style="display:none;">` +
    `<div>` +
    `<h2>Ready to plan ${data.title}?</h2>` +
    `<p class="lead">Share your material, standard, acceptance criteria and target date. Asian Testing and Inspection Services will help shape the right testing program.</p>` +
    `<small>Fast response - Certified testing - Accurate reports</small>` +
    `</div>` +
    `<div class="hero-actions">` +
    `<a class="button secondary" href="../brochure.pdf" target="_blank" rel="noopener noreferrer">Download brochure</a>` +
    `<a class="button primary" href="/#quote">Request Quote</a>` +
    `</div>` +
    `</section>`;
  
}

function initInteractions() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
}

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
  serviceNav?.classList.toggle("scrolled", window.scrollY > 18);
}, { passive: true });

render();
applyImageFallbacks();
initInteractions();




