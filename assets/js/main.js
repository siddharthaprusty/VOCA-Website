/* =========================================================
   VOCA — shared layout, language, forms, carousel
   Loaded on every page after config.js and i18n.js
   ========================================================= */
(() => {
  const CONFIG = window.VOCA_CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  let lang = "en";
  try { lang = localStorage.getItem("voca-lang") || "en"; } catch (e) {}
  const langListeners = [];

  const t = (key) => I18N[lang][key] ?? I18N.en[key] ?? key;
  // Pick the current language from a {en, or} object (or return a plain string)
  const L = (v) => (v && typeof v === "object" ? v[lang] ?? v.en : v ?? "");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Shared header & footer ----------
  const NAV = [
    ["index.html", "navHome"], ["events.html", "navEvents"], ["gallery.html", "navGallery"],
    ["members.html", "navMembers"], ["volunteer.html", "navVolunteer"], ["sponsors.html", "navSponsors"],
    ["contact.html", "navContact"],
  ];
  const page = document.body.dataset.page;

  const SOCIAL_ICONS = {
    facebook: '<path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1Z" fill="currentColor"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>',
    youtube: '<path d="M22 8.2c-.2-1.5-1-2.6-2.6-2.8C16.9 5 12 5 12 5s-4.9 0-7.4.4C3 5.6 2.2 6.7 2 8.2 1.8 9.5 1.8 12 1.8 12s0 2.5.2 3.8c.2 1.5 1 2.6 2.6 2.8C7.1 19 12 19 12 19s4.9 0 7.4-.4c1.6-.2 2.4-1.3 2.6-2.8.2-1.3.2-3.8.2-3.8s0-2.5-.2-3.8ZM10 15V9l5.2 3L10 15Z" fill="currentColor"/>',
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.5 8.5c.3-.7.6-.8 1-.8h.5l1 2.2-.6.9c.5 1 1.3 1.8 2.3 2.3l.9-.6 2.2 1v.5c0 .4-.1.7-.8 1-1.3.6-3.3-.2-4.9-1.8S7.9 9.8 8.5 8.5Z" fill="currentColor"/>',
  };
  const socialHTML = () => Object.entries(CONFIG.social)
    .filter(([, url]) => url)
    .map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${k}"><svg viewBox="0 0 24 24">${SOCIAL_ICONS[k]}</svg></a>`)
    .join("");

  const WHEEL = '<svg class="brand-wheel" viewBox="0 0 100 100" aria-hidden="true"><use href="#wheel"/></svg>';

  function renderLayout() {
    const header = $("#site-header");
    if (header) header.outerHTML = `
      <header class="site-header" id="top">
        <div class="wrap header-inner">
          <a href="index.html" class="brand" aria-label="VOCA home">
            ${WHEEL}
            <span class="brand-text"><strong>VOCA</strong><small data-i18n="brandSub"></small></span>
          </a>
          <nav class="nav" id="nav" aria-label="Main">
            ${NAV.map(([href, key]) => `<a href="${href}" data-i18n="${key}"${href.startsWith(page) ? ' aria-current="page" class="active"' : ""}></a>`).join("")}
            <a href="register.html" class="nav-register" data-i18n="navRegister"></a>
          </nav>
          <div class="header-actions">
            <div class="lang-toggle" role="group" aria-label="Language">
              <button type="button" data-lang="en">EN</button>
              <button type="button" data-lang="or" lang="or">ଓଡ଼ିଆ</button>
            </div>
            <a href="register.html" class="btn btn-primary btn-sm header-register" data-i18n="navRegister"></a>
            <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
          </div>
        </div>
      </header>`;

    const footer = $("#site-footer");
    if (footer) footer.outerHTML = `
      <footer class="site-footer">
        <div class="ikat-band" aria-hidden="true"></div>
        <div class="wrap footer-grid">
          <div>
            <div class="brand footer-brand">${WHEEL}
              <span class="brand-text"><strong>VOCA</strong><small lang="or">ଭାଙ୍କୁଭର ଓଡ଼ିଆ ସାଂସ୍କୃତିକ ସଂଘ</small></span>
            </div>
            <p data-i18n="footerNote"></p>
            <div class="social">${socialHTML()}</div>
          </div>
          <div>
            <h4 data-i18n="footerExplore"></h4>
            <a href="index.html" data-i18n="navHome"></a>
            <a href="events.html" data-i18n="navEvents"></a>
            <a href="gallery.html" data-i18n="navGallery"></a>
            <a href="members.html" data-i18n="navMembers"></a>
          </div>
          <div>
            <h4 data-i18n="footerInvolved"></h4>
            <a href="register.html" data-i18n="navRegister"></a>
            <a href="volunteer.html" data-i18n="navVolunteer"></a>
            <a href="sponsors.html" data-i18n="navSponsors"></a>
            <a href="contact.html" data-i18n="navContact"></a>
          </div>
        </div>
        <div class="wrap footer-base">
          <p class="credits" data-i18n="credits"></p>
          <p>© ${new Date().getFullYear()} VOCA</p>
        </div>
      </footer>`;

    // Konark wheel symbol used by logos and decorations
    document.body.insertAdjacentHTML("beforeend", `
      <svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <symbol id="wheel" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="5"/>
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="4"/>
          <circle cx="50" cy="50" r="3.5" fill="currentColor"/>
          <g stroke="currentColor" stroke-linecap="round">
            <path d="M50 12v28M50 60v28M12 50h28M60 50h28M23.1 23.1l19.8 19.8M57.1 57.1l19.8 19.8M76.9 23.1L57.1 42.9M42.9 57.1L23.1 76.9" stroke-width="4"/>
            <path d="M35.4 14.7l10.7 26M53.9 59.3l10.7 26M85.3 35.4l-26 10.7M40.7 53.9l-26 10.7M64.6 14.7l-10.7 26M46.1 59.3l-10.7 26M85.3 64.6l-26-10.7M40.7 46.1l-26-10.7" stroke-width="1.6"/>
          </g>
        </symbol>
      </svg>`);

    const menuBtn = $("#menuBtn"), nav = $("#nav");
    menuBtn?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    $$(".lang-toggle button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  }

  // ---------- Language ----------
  function setLang(next) {
    lang = next;
    try { localStorage.setItem("voca-lang", lang); } catch (e) {}
    document.documentElement.lang = lang;
    document.body.classList.toggle("lang-or", lang === "or");
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$(".lang-toggle button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
    langListeners.forEach((fn) => fn(lang));
  }

  // ---------- Scroll reveal ----------
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: .1 });
  const observeReveals = (root = document) => $$(".reveal:not(.in)", root).forEach((el) => io.observe(el));

  // ---------- Data ----------
  const loadJSON = (path) => fetch(path, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

  const fmtDate = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) =>
    new Date(iso + "T12:00:00").toLocaleDateString(lang === "or" ? "or-IN" : "en-CA", opts);

  // ---------- Forms (FormSubmit.co, free & serverless) ----------
  function wireForms() {
    $$("form[data-form]").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const status = $(".form-status", form);
        let ok = true;
        $$("[required]", form).forEach((f) => {
          const bad = f.type === "checkbox" ? !f.checked : !f.value.trim() || !f.checkValidity();
          f.classList.toggle("invalid", bad);
          if (bad) ok = false;
        });
        if (!ok) { status.className = "form-status err"; status.textContent = t("formErr"); return; }

        // Collect fields; multi-value checkboxes are joined into one line
        const data = {};
        new FormData(form).forEach((v, k) => { data[k] = data[k] ? `${data[k]}, ${v}` : v; });
        data._subject = `VOCA website — ${form.dataset.form}${data.name ? `: ${data.name}` : ""}`;
        data._template = "table";
        data._captcha = "false";

        if (!CONFIG.formEmail || CONFIG.formEmail.includes("example.com")) {
          console.info("VOCA form (not sent, demo mode):", data);
          status.className = "form-status warn"; status.textContent = t("formDemo"); return;
        }
        const btn = $("button[type=submit]", form);
        btn.disabled = true; status.className = "form-status"; status.textContent = t("formSending");
        try {
          const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.formEmail)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error(res.status);
          status.className = "form-status ok"; status.textContent = t("formOk");
          form.reset();
        } catch (err) {
          status.className = "form-status err"; status.textContent = t("formFail");
        } finally { btn.disabled = false; }
      });
    });
  }

  // ---------- Carousel ----------
  // slides: [{ src, caption }] — swipe, arrows, dots, keyboard, optional autoplay
  function Carousel(root, slides, { autoplay = 0, start = 0 } = {}) {
    root.classList.add("carousel");
    root.innerHTML = `
      <div class="car-track" tabindex="0">
        ${slides.map((s, i) => `
          <figure class="car-slide" aria-roledescription="slide" aria-label="${i + 1} / ${slides.length}">
            <img src="${esc(s.src)}" alt="${esc(s.caption || "")}" ${i > 1 ? 'loading="lazy"' : ""} />
            ${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ""}
          </figure>`).join("")}
      </div>
      <button class="car-btn prev" aria-label="Previous">‹</button>
      <button class="car-btn next" aria-label="Next">›</button>
      <div class="car-dots">${slides.map((_, i) => `<button aria-label="Slide ${i + 1}"></button>`).join("")}</div>`;
    const track = $(".car-track", root);
    const dots = $$(".car-dots button", root);
    let index = 0, timer = null;

    // A missing photo becomes a decorative ikat placeholder instead of a broken image
    $$("img", root).forEach((im) => im.addEventListener("error", () => {
      im.replaceWith(Object.assign(document.createElement("div"), { className: "car-placeholder", innerHTML: `<span>${esc(t("albumEmpty"))}</span>` }));
    }));

    const go = (i, smooth = true) => {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: track.clientWidth * index, behavior: smooth ? "smooth" : "auto" });
    };
    track.addEventListener("scroll", () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== index) index = i;
      dots.forEach((d, j) => d.classList.toggle("active", j === index));
    }, { passive: true });
    $(".prev", root).addEventListener("click", () => { stop(); go(index - 1); });
    $(".next", root).addEventListener("click", () => { stop(); go(index + 1); });
    dots.forEach((d, i) => d.addEventListener("click", () => { stop(); go(i); }));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { stop(); go(index + 1); }
      if (e.key === "ArrowLeft") { stop(); go(index - 1); }
    });
    const stop = () => { clearInterval(timer); timer = null; };
    if (autoplay && slides.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = setInterval(() => go(index + 1), autoplay);
      root.addEventListener("pointerenter", stop, { once: true });
      track.addEventListener("touchstart", stop, { once: true, passive: true });
    }
    dots[0]?.classList.add("active");
    requestAnimationFrame(() => go(start, false));
    return { go, stop };
  }

  // Full-screen carousel, used for albums
  function openCarouselModal(title, slides, start = 0) {
    const modal = document.createElement("div");
    modal.className = "car-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", title);
    modal.innerHTML = `<div class="car-modal-head"><h3>${esc(title)}</h3><button class="lb-close" aria-label="Close">×</button></div><div class="car-modal-body"></div>`;
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
    const last = document.activeElement;
    Carousel($(".car-modal-body", modal), slides, { start });
    const close = () => { modal.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); last?.focus(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    $(".lb-close", modal).addEventListener("click", close);
    $(".lb-close", modal).focus();
    $(".car-track", modal).focus({ preventScroll: true });
  }

  // ---------- Boot ----------
  window.VOCA = {
    $, $$, t, L, esc, loadJSON, fmtDate, Carousel, openCarouselModal, observeReveals,
    get lang() { return lang; },
    onLang: (fn) => langListeners.push(fn),
  };

  renderLayout();
  wireForms();
  document.addEventListener("DOMContentLoaded", () => {
    setLang(lang);
    observeReveals();
  });
})();
