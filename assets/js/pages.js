/* =========================================================
   VOCA — page logic (picked by <body data-page="…">)
   Needs main.js and odisha.js
   ========================================================= */
(() => {
  const { $, $$, t, L, esc, loadJSON, fmtDate, Carousel, openCarouselModal, observeReveals, onLang } = window.VOCA;
  const lang = () => window.VOCA.lang;
  const page = document.body.dataset.page;
  const ALBUM_DIR = "assets/img/albums/";
  const todayISO = new Date().toISOString().slice(0, 10);

  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const avatar = (photo, name, cls = "avatar") => photo
    ? `<img class="${cls}" src="${esc(photo)}" alt="" loading="lazy" />`
    : `<span class="${cls} avatar-initials" aria-hidden="true">${esc(name ? initials(name) : "ଓ")}</span>`;

  // =======================================================
  // Discover Odisha gallery + lightbox (home & gallery pages)
  // =======================================================
  function discoverGallery(root, { limit = Infinity, filters = null } = {}) {
    const items = PLACES.slice(0, limit);
    let active = "all";

    const render = () => {
      root.innerHTML = items.map((p, i) => `
        <button class="tile ${p.size}${active !== "all" && p.cat !== active ? " hide" : ""}" data-i="${i}" data-cat="${p.cat}">
          <img src="${p.src.sm}" alt="${esc(p.title.en)}" loading="lazy" />
          <span class="tile-info">
            <span class="tile-tag">${esc(t(CAT_LABEL[p.cat]))}</span>
            <span class="tile-title">${esc(L(p.title))}</span>
            <span class="tile-place">${esc(L(p.place))}</span>
          </span>
        </button>`).join("");
      $$(".tile", root).forEach((tile) => {
        tile.addEventListener("click", () => openLightbox(+tile.dataset.i));
        attachTilt(tile);
      });
    };

    filters?.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
      active = chip.dataset.filter;
      $$(".chip", filters).forEach((c) => c.classList.toggle("active", c === chip));
      $$(".tile", root).forEach((tile) => tile.classList.toggle("hide", active !== "all" && tile.dataset.cat !== active));
    }));

    // Lightbox
    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.hidden = true;
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `
      <button class="lb-close" aria-label="Close">×</button>
      <button class="lb-arrow prev" aria-label="Previous">‹</button>
      <figure class="lb-figure"><img alt="" /><figcaption><p class="lb-place"></p><h3></h3><p class="lb-body"></p></figcaption></figure>
      <button class="lb-arrow next" aria-label="Next">›</button>`;
    document.body.appendChild(lb);
    let visible = [], pos = 0, lastFocus = null;
    const show = () => {
      const p = items[visible[pos]];
      $("img", lb).src = p.src.lg; $("img", lb).alt = p.title.en;
      $(".lb-place", lb).textContent = L(p.place);
      $("h3", lb).textContent = L(p.title);
      $(".lb-body", lb).textContent = L(p.body);
    };
    const openLightbox = (i) => {
      visible = items.map((_, j) => j).filter((j) => active === "all" || items[j].cat === active);
      pos = visible.indexOf(i); lastFocus = document.activeElement;
      show(); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-close", lb).focus();
    };
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; lastFocus?.focus(); };
    const step = (d) => { pos = (pos + d + visible.length) % visible.length; show(); };
    $(".lb-close", lb).addEventListener("click", close);
    $(".prev", lb).addEventListener("click", () => step(-1));
    $(".next", lb).addEventListener("click", () => step(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });

    render();
    onLang(render);
  }

  function attachTilt(el) {
    if (matchMedia("(hover: none)").matches) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateY(${(x - .5) * 10}deg) rotateX(${(.5 - y) * 10}deg)`;
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  }

  // =======================================================
  // Konark festival wheel (home)
  // =======================================================
  function festivalWheel() {
    const NS = "http://www.w3.org/2000/svg";
    const spokesG = $("#konarkSpokes"), rotor = $("#konarkRotor");
    const C = 200, R_IN = 44, R_OUT = 150;
    let wheelAngle = 0, festIndex = FESTIVALS.findIndex((f) => f.name.en === "Rath Yatra");
    const line = (a, cls) => {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", C + Math.cos(a) * R_IN); l.setAttribute("y1", C + Math.sin(a) * R_IN);
      l.setAttribute("x2", C + Math.cos(a) * R_OUT); l.setAttribute("y2", C + Math.sin(a) * R_OUT);
      l.setAttribute("class", cls);
      return l;
    };

    // 16 thin spokes between the 8 major ones, as on the real Konark wheels
    for (let i = 0; i < 16; i++) spokesG.appendChild(line(((i * 22.5 + 11.25) * Math.PI) / 180, "k-minor"));
    FESTIVALS.forEach((f, i) => {
      const a = ((i * 45 - 90) * Math.PI) / 180;
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "spoke"); g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      g.setAttribute("aria-label", f.name.en);
      const bx = C + Math.cos(a) * 112, by = C + Math.sin(a) * 112;
      const bead = document.createElementNS(NS, "circle");
      bead.setAttribute("class", "s-bead"); bead.setAttribute("cx", bx); bead.setAttribute("cy", by); bead.setAttribute("r", 27);
      const label = document.createElementNS(NS, "text");
      label.setAttribute("x", bx); label.setAttribute("y", by + 4.5); label.setAttribute("text-anchor", "middle");
      label.dataset.cx = bx; label.dataset.cy = by;
      g.append(line(a, "s-bar"), bead, label);
      g.addEventListener("click", () => set(i));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(i); } });
      spokesG.appendChild(g);
    });

    const dots = $("#festDots");
    FESTIVALS.forEach((f, i) => {
      const d = document.createElement("button");
      d.setAttribute("aria-label", f.name.en);
      d.addEventListener("click", () => set(i));
      dots.appendChild(d);
    });
    $("#festPrev").addEventListener("click", () => set((festIndex + FESTIVALS.length - 1) % FESTIVALS.length));
    $("#festNext").addEventListener("click", () => set((festIndex + 1) % FESTIVALS.length));

    function set(i) {
      // turn the shortest way so the chosen spoke points to the top
      wheelAngle += ((-i * 45 - wheelAngle) % 360 + 540) % 360 - 180;
      festIndex = i;
      render(true);
    }
    function render(animate) {
      const f = FESTIVALS[festIndex];
      rotor.style.transform = `rotate(${wheelAngle}deg)`;
      // labels counter-rotate so they stay upright
      $$(".spoke text").forEach((el, i) => {
        el.textContent = L(FESTIVALS[i].short);
        el.setAttribute("transform", `rotate(${-wheelAngle} ${el.dataset.cx} ${el.dataset.cy})`);
      });
      $$(".spoke").forEach((s, i) => s.classList.toggle("active", i === festIndex));
      $$("#festDots button").forEach((d, i) => d.classList.toggle("active", i === festIndex));
      $("#festMonth").textContent = L(f.month);
      $("#festName").textContent = L(f.name);
      $("#festBody").textContent = L(f.body);
      $("#festBadge").hidden = !f.voca;
      if (animate) { const c = $("#festCard"); c.classList.remove("swap"); void c.offsetWidth; c.classList.add("swap"); }
    }
    set(festIndex);
    onLang(() => render(false));
  }

  // =======================================================
  // Events
  // =======================================================
  const gcalLink = (ev) => {
    const d = ev.date.replace(/-/g, "");
    const next = new Date(ev.date + "T12:00:00"); next.setDate(next.getDate() + 1);
    const d2 = next.toISOString().slice(0, 10).replace(/-/g, "");
    const q = new URLSearchParams({ action: "TEMPLATE", text: `VOCA — ${ev.title.en}`, dates: `${d}/${d2}`, details: ev.body.en, location: ev.venue?.en || "" });
    return `https://calendar.google.com/calendar/render?${q}`;
  };

  function eventCard(ev, albums = []) {
    const past = ev.date < todayISO;
    const album = albums.find((a) => a.id === ev.album && a.photos.length);
    const day = fmtDate(ev.date, { day: "numeric" });
    const mon = fmtDate(ev.date, { month: "short" });
    return `
      <article class="event-card reveal${past ? " past" : ""}">
        <div class="event-date"><span>${esc(day)}</span><small>${esc(mon)}</small></div>
        <div class="event-body">
          <h3>${esc(L(ev.title))}</h3>
          <p class="event-meta">
            ${esc(fmtDate(ev.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}${ev.time ? ` · ${esc(ev.time)}` : ""}
            ${ev.tbc ? `<span class="pill">${esc(t("evTbc"))}</span>` : ""}
          </p>
          ${ev.venue ? `<p class="event-venue">📍 ${esc(L(ev.venue))}</p>` : ""}
          <p>${esc(L(ev.body))}</p>
          <div class="event-actions">
            ${past ? "" : `<a class="btn btn-primary btn-sm" href="contact.html?subject=${encodeURIComponent("RSVP: " + ev.title.en)}">${esc(t("evRsvp"))}</a>
            <a class="btn btn-outline btn-sm" href="${gcalLink(ev)}" target="_blank" rel="noopener">${esc(t("evCal"))}</a>`}
            ${album ? `<a class="btn btn-outline btn-sm" href="gallery.html#${esc(album.id)}">${esc(t("evPhotos"))}</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  async function eventsList(upRoot, pastRoot, limit = Infinity) {
    const [events, albums] = await Promise.all([loadJSON("data/events.json"), loadJSON("data/albums.json").catch(() => [])]);
    events.sort((a, b) => a.date.localeCompare(b.date));
    const render = () => {
      const up = events.filter((e) => e.date >= todayISO).slice(0, limit);
      upRoot.innerHTML = up.length ? up.map((e) => eventCard(e, albums)).join("") : `<p class="empty">${esc(t("evNoneUp"))}</p>`;
      if (pastRoot) {
        const past = events.filter((e) => e.date < todayISO).reverse();
        pastRoot.innerHTML = past.length ? past.map((e) => eventCard(e, albums)).join("") : `<p class="empty">${esc(t("evNonePast"))}</p>`;
      }
      observeReveals();
    };
    render();
    onLang(render);
  }

  // =======================================================
  // Community albums + carousels
  // =======================================================
  const albumSlides = (a) => a.photos.map((f) => ({ src: `${ALBUM_DIR}${a.id}/${f}`, caption: L(a.title) }));

  async function momentsCarousel(root) {
    const albums = await loadJSON("data/albums.json").catch(() => []);
    // Up to 4 photos from each album, interleaved so every event is represented
    let slides = [];
    for (let i = 0; i < 4; i++) albums.forEach((a) => a.photos[i] && slides.push(albumSlides(a)[i]));
    // Until VOCA photos are added, show Odisha festival photos
    if (!slides.length) {
      slides = PLACES.filter((p) => ["festivals", "arts"].includes(p.cat))
        .map((p) => ({ src: p.src.lg, caption: L(p.title) }));
    }
    Carousel(root, slides, { autoplay: 5000 });
  }

  async function albumGrid(root) {
    const albums = await loadJSON("data/albums.json").catch(() => []);
    const render = () => {
      root.innerHTML = albums.length ? albums.map((a) => `
        <button class="album reveal" id="${esc(a.id)}" data-id="${esc(a.id)}" ${a.photos.length ? "" : "disabled"}>
          <span class="album-cover">
            ${a.photos.length
              ? a.photos.slice(0, 3).map((f) => `<img src="${ALBUM_DIR}${esc(a.id)}/${esc(f)}" alt="" loading="lazy" />`).join("")
              : `<span class="album-empty">${esc(t("albumEmpty"))}</span>`}
          </span>
          <span class="album-info">
            <span class="album-title">${esc(L(a.title))}</span>
            <span class="album-meta">${a.date ? esc(fmtDate(a.date + (a.date.length === 7 ? "-01" : ""), { month: "long", year: "numeric" })) + " · " : ""}${a.photos.length} ${esc(t("albumPhotos"))}</span>
          </span>
        </button>`).join("") : `<p class="empty">${esc(t("albumNone"))}</p>`;
      $$(".album", root).forEach((b) => b.addEventListener("click", () => {
        const a = albums.find((x) => x.id === b.dataset.id);
        openCarouselModal(L(a.title), albumSlides(a));
      }));
      observeReveals();
    };
    render();
    onLang(render);
    // Deep link from an event card: gallery.html#diwali opens that album
    const hash = location.hash.slice(1);
    const linked = albums.find((a) => a.id === hash && a.photos.length);
    if (linked) openCarouselModal(L(linked.title), albumSlides(linked));
  }

  // =======================================================
  // Members & profiles
  // =======================================================
  async function membersPage() {
    const data = await loadJSON("data/members.json");
    const committee = $("#committee"), dir = $("#directory"), search = $("#memberSearch");
    const render = () => {
      committee.innerHTML = data.committee.map((c) => `
        <article class="committee-card reveal">
          ${avatar(c.photo, c.name, "avatar avatar-lg")}
          <p class="committee-role">${esc(L(c.role))}</p>
          <h3>${c.name ? esc(c.name) : `<span class="muted">${esc(t("tbd"))}</span>`}</h3>
        </article>`).join("");
      const q = search.value.trim().toLowerCase();
      const list = data.members.filter((m) => !q || `${m.name} ${m.city} ${m.hometown || ""}`.toLowerCase().includes(q));
      dir.innerHTML = list.length ? list.map((m) => `
        <a class="member-card reveal" href="member.html?id=${encodeURIComponent(m.id)}">
          ${avatar(m.photo, m.name)}
          <span class="member-info">
            <strong>${esc(m.name)} ${m.example ? `<span class="pill">${esc(t("memExample"))}</span>` : ""}</strong>
            <small>${esc(m.city)}${m.since ? ` · ${esc(t("memJoined"))} ${m.since}` : ""}</small>
          </span>
          <span class="member-go" aria-hidden="true">→</span>
        </a>`).join("") : `<p class="empty">${esc(t("memEmpty"))}</p>`;
      observeReveals();
    };
    search.addEventListener("input", render);
    render();
    onLang(render);
  }

  async function memberProfile() {
    const root = $("#profile");
    const id = new URLSearchParams(location.search).get("id");
    const data = await loadJSON("data/members.json");
    const m = data.members.find((x) => x.id === id);
    const render = () => {
      if (!m) { root.innerHTML = `<p class="empty">${esc(t("memNotFound"))}</p>`; return; }
      document.title = `${m.name} · VOCA`;
      const chips = (keys) => keys.map((k) => `<span class="chip static">${esc(t(k))}</span>`).join("");
      root.innerHTML = `
        <div class="profile-card">
          <div class="profile-banner" aria-hidden="true"></div>
          ${avatar(m.photo, m.name, "avatar avatar-xl")}
          <h1>${esc(m.name)} ${m.example ? `<span class="pill">${esc(t("memExample"))}</span>` : ""}</h1>
          <p class="profile-meta">📍 ${esc(m.city)}${m.hometown ? ` · ${esc(m.hometown)}` : ""}${m.since ? ` · ${esc(t("memJoined"))} ${m.since}` : ""}</p>
          ${m.bio ? `<p class="profile-bio">${esc(m.bio)}</p>` : ""}
          <dl class="profile-facts">
            ${m.family ? `<div><dt>${esc(t("memFamily"))}</dt><dd>${esc(m.family)}</dd></div>` : ""}
            ${m.interests?.length ? `<div><dt>${esc(t("memInterests"))}</dt><dd>${chips(m.interests)}</dd></div>` : ""}
            ${m.volunteers?.length ? `<div><dt>${esc(t("memVolunteers"))}</dt><dd>${chips(m.volunteers)}</dd></div>` : ""}
          </dl>
        </div>`;
    };
    render();
    onLang(render);
  }

  // =======================================================
  // Sponsors
  // =======================================================
  async function sponsorsPage(root, { compact = false } = {}) {
    const data = await loadJSON("data/sponsors.json");
    const TIERS = [["platinum", "tierPlatinum", 1], ["gold", "tierGold", 2], ["silver", "tierSilver", 3], ["community", "tierCommunity", 4]];
    const logo = (s) => `
      <a class="sponsor-logo" ${s.url ? `href="${esc(s.url)}" target="_blank" rel="noopener"` : ""} title="${esc(s.name)}">
        ${s.logo ? `<img src="${esc(s.logo)}" alt="${esc(s.name)}" loading="lazy" />` : `<span>${esc(s.name)}</span>`}
      </a>`;
    const render = () => {
      if (compact) {
        const all = TIERS.flatMap(([k]) => data[k] || []);
        root.closest("section").hidden = !all.length;
        root.innerHTML = all.map(logo).join("");
        return;
      }
      root.innerHTML = TIERS.map(([k, label, slots]) => `
        <div class="tier tier-${k} reveal">
          <h3><span class="tier-gem" aria-hidden="true"></span>${esc(t(label))}</h3>
          <div class="tier-logos">
            ${(data[k] || []).map(logo).join("")}
            ${(data[k] || []).length ? "" : Array.from({ length: Math.min(slots, 3) }, () =>
              `<a class="sponsor-logo slot" href="#become"><span>${esc(t("spSlot"))}</span></a>`).join("")}
          </div>
        </div>`).join("");
      observeReveals();
    };
    render();
    onLang(render);
  }

  // =======================================================
  // Boot per page
  // =======================================================
  if (page === "index") {
    festivalWheel();
    discoverGallery($("#gallery"), { limit: 6 });
    momentsCarousel($("#moments"));
    eventsList($("#upcoming"), null, 3);
    sponsorsPage($("#sponsorStrip"), { compact: true });
  }
  if (page === "events") eventsList($("#upcoming"), $("#past"));
  if (page === "gallery") {
    albumGrid($("#albums"));
    discoverGallery($("#gallery"), { filters: $("#filters") });
    $$(".tabs [role=tab]").forEach((tab) => tab.addEventListener("click", () => {
      $$(".tabs [role=tab]").forEach((x) => x.setAttribute("aria-selected", x === tab));
      $$("[role=tabpanel]").forEach((p) => (p.hidden = p.id !== tab.getAttribute("aria-controls")));
    }));
  }
  if (page === "members") membersPage();
  if (page === "member") memberProfile();
  if (page === "sponsors") sponsorsPage($("#tiers"));
  if (page === "contact") {
    const subject = new URLSearchParams(location.search).get("subject");
    if (subject) $("#subject").value = subject;
  }
})();
