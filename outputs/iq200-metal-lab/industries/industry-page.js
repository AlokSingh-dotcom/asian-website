const data = window.ASIAN_INDUSTRIES[document.body.dataset.industry];
const savedTheme = localStorage.getItem("atis-theme");
const progress = document.querySelector(".scroll-progress");
const nav = document.querySelector(".industry-nav");

if (savedTheme === "light") {
  document.body.classList.add("light");
}

function renderList(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function render() {
  if (!data) {
    document.querySelector("main").innerHTML = "<section class='page-shell'><h1>Industry not found</h1></section>";
    return;
  }

  document.title = `${data.title} Industry | Asian Testing and Inspection Services`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", `${data.title} industry testing and inspection support by Asian Testing and Inspection Service LLP.`);
  document.querySelector(".hero-bg").style.backgroundImage = `url("${data.image}")`;
  document.querySelector(".breadcrumbs").innerHTML = `<a href="/">Home</a><span>/</span><a href="/#industries">Industries</a><span>/</span><span>${data.title}</span>`;
  document.querySelector(".category").textContent = data.category;
  document.querySelector("h1").textContent = data.title;
  document.querySelector(".intro").textContent = data.intro;
  document.querySelector(".hero-card strong").textContent = data.stat;
  document.querySelector(".hero-card span").textContent = data.statLabel;
  document.querySelector(".content").innerHTML = `
    <section class="industry-section reveal">
      <div class="split">
        <div>
          <p class="section-label">Overview</p>
          <h2>${data.title} testing support.</h2>
          <p class="lead">${data.overview}</p>
        </div>
        <img src="${data.image}" alt="${data.title} industry" loading="lazy" />
      </div>
    </section>
    <section class="industry-section reveal">
      <p class="section-label">Scope</p>
      <h2>How we support ${data.title.toLowerCase()} teams.</h2>
      <div class="info-grid">
        <article class="info-card"><h3>Testing Support</h3><ul>${renderList(data.supports)}</ul></article>
        <article class="info-card"><h3>Applications</h3><ul>${renderList(data.applications)}</ul></article>
        <article class="info-card"><h3>Deliverables</h3><ul>${renderList(data.deliverables)}</ul></article>
      </div>
    </section>
    <section class="cta-band reveal">
      <div>
        <h2>Need support for ${data.title.toLowerCase()} materials?</h2>
        <p class="lead">Share your material, drawing, standard or project requirement and we will help define the right testing scope.</p>
      </div>
      <div class="hero-actions"><a class="button secondary" href="/#industries">All Industries</a><a class="button primary" href="/#quote">Request Quote</a></div>
    </section>
  `;
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
  if (progress) progress.style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
  nav?.classList.toggle("scrolled", window.scrollY > 18);
}, { passive: true });

render();
initInteractions();
