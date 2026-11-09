(() => {
  "use strict";
  const cfg = window.CV_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* ---------- language ---------- */
  const store = {
    get() { try { return localStorage.getItem("cv-lang"); } catch { return null; } },
    set(v) { try { localStorage.setItem("cv-lang", v); } catch {} }
  };
  const initial = store.get() || (/^es/i.test(navigator.language) ? "es" : "en");
  function setLang(l) {
    root.lang = l; root.dataset.lang = l; store.set(l);
    $$("[data-set-lang]").forEach(b => b.classList.toggle("is-on", b.dataset.setLang === l));
    buildBoard();
  }
  $$("[data-set-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.setLang)));

  /* ---------- word-split headings ---------- */
  $$("[data-split]").forEach(h => {
    const targets = h.children.length ? [...h.children] : [h];
    let i = 0;
    targets.forEach(t => {
      const words = t.textContent.trim().split(/\s+/);
      t.setAttribute("aria-label", words.join(" "));
      t.innerHTML = words.map(w => `<span class="w" aria-hidden="true"><span style="--i:${i++}">${w}</span></span>`).join(" ");
    });
  });

  /* ---------- menu ---------- */
  const menu = $("#menu"), btn = $("#menuBtn");
  function toggleMenu(open) {
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  btn.addEventListener("click", () => toggleMenu(!menu.classList.contains("open")));
  $$("a", menu).forEach(a => a.addEventListener("click", () => toggleMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape") toggleMenu(false); });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.matches("[data-count]") && !root.classList.contains("motion")) countUp(e.target);
    io.unobserve(e.target);
  }), { threshold: .18, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, [data-split]:not(.hero [data-split]), [data-count]").forEach(el => io.observe(el));

  /* ---------- counters ---------- */
  function countUp(el) {
    const to = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    const id = (el._cu = (el._cu || 0) + 1); // a newer run cancels an older one
    if (reduce) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now(), dur = 1400;
    (function step(t) {
      if (el._cu !== id) return;
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- scroll: progress, parallax, line ---------- */
  const bar = $(".progress__bar"), train = $(".progress__train");
  const layers = $$(".layer");
  const hero = $("#hero"), line = $(".line__track");
  let mx = 0, my = 0, ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    bar.style.transform = `scaleX(${p})`;
    $(".header").classList.toggle("scrolled", scrollY > 80);
    train.style.left = `${p * 100}%`;
    if (!reduce && !root.classList.contains("motion") && scrollY < innerHeight * 1.2) {
      layers.forEach(l => {
        const s = +l.dataset.speed || 0;
        l.style.transform = `translate3d(${mx * s * -40}px,${scrollY * s + my * s * -16}px,0)`;
      });
    }
    const r = line.getBoundingClientRect();
    const lp = Math.min(1, Math.max(0, (innerHeight * .55 - r.top) / r.height));
    line.style.setProperty("--p", lp.toFixed(4));
    ticking = false;
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  hero.addEventListener("pointermove", e => {
    mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; req();
  });

  /* ---------- departure board (split-flap) ---------- */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+#·";
  let boardVisible = false;
  function flap(text) {
    const el = document.createElement("span");
    el.className = "flap";
    const cells = [...text].map(() => { const i = document.createElement("i"); i.textContent = " "; el.append(i); return i; });
    el._text = text; el._cells = cells;
    return el;
  }
  function settle(el, delay) {
    const chars = [...el._text];
    el._cells.forEach((c, idx) => {
      const final = chars[idx];
      if (reduce) { c.textContent = final; return; }
      const flips = 6 + idx * 2 + Math.floor(delay / 40);
      let n = 0;
      const tick = () => {
        c.textContent = n++ < flips ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : final;
        if (n <= flips) setTimeout(tick, 45);
      };
      setTimeout(tick, delay);
    });
  }
  function buildBoard() {
    $$(".board__cells").forEach(box => {
      const es = root.dataset.lang === "es" && box.dataset.flapsEs;
      const items = (es ? box.dataset.flapsEs : box.dataset.flaps).split("|");
      box.innerHTML = "";
      items.forEach(t => box.append(flap(t)));
      if (boardVisible) $$(".flap", box).forEach((f, i) => settle(f, i * 90));
    });
  }
  const boardIO = new IntersectionObserver(es => {
    if (es[0].isIntersecting) {
      boardVisible = true;
      if (!root.classList.contains("motion")) $$(".board__cells").forEach(box => $$(".flap", box).forEach((f, i) => settle(f, i * 90)));
      boardIO.disconnect();
    }
  }, { threshold: .25 });
  boardIO.observe($("#board"));

  window.__cv = { countUp, replayBoard: () => $$(".board__cells").forEach(box => $$(".flap", box).forEach((f, i) => settle(f, i * 90))) };

  /* ---------- GitHub projects ---------- */
  const LANG_COLORS = { "C++": "#f34b7d", C: "#555555", Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051", TeX: "#3D6117", Go: "#00ADD8", Rust: "#dea584", "C#": "#178600", Kotlin: "#A97BFF", PowerShell: "#012456" };
  const tickets = $("#tickets"), chips = $("#chips"), note = $("#repoNote");
  const L = k => ({
    err: { en: "Couldn't reach GitHub right now (rate limit or offline). Browse everything at", es: "No se pudo contactar con GitHub ahora (límite o sin conexión). Mira todo en" },
    none: { en: "No public repositories to show yet.", es: "Aún no hay repositorios públicos que mostrar." },
    all: { en: "All", es: "Todos" },
    codepriv: { en: "Code private", es: "Código privado" },
    live: { en: "Live app ↗", es: "App en vivo ↗" },
    privnote: { en: "Private repo", es: "Repo privado" },
    repo: { en: "source code on GitHub", es: "código en GitHub" },
    nodesc: { en: "No description yet.", es: "Sin descripción todavía." }
  })[k][root.dataset.lang];
  let repos = [], filter = "*";

  function renderRepos() {
    const list = repos.filter(r => filter === "*" || r.language === filter);
    tickets.innerHTML = "";
    list.forEach((r, i) => {
      const info = cfg.repoInfo?.[r.name.toLowerCase()] || {};
      const live = r.private ? r.url : info.live || r.homepage || "";
      // A public repo with a live app has two links (repo and app), so its card is a div with a
      // stretched link to the repo and the app link above it: links can't nest.
      const split = !r.private && live;
      const link = r.private ? r.url : r.html_url;   // private repos can still link to a live app
      const a = document.createElement(link && !split ? "a" : "div");
      a.className = "ticket pop" + (r.private ? " ticket--private" : "") + (split ? " ticket--split" : "");
      if (link && !split) { a.href = link; a.target = "_blank"; a.rel = "noopener"; }
      a.style.setProperty("--i", i);
      a.style.setProperty("--c", LANG_COLORS[r.language] || "#e2472f");
      const upd = r.private ? L("codepriv") : r.pushed_at ? new Date(r.pushed_at).toLocaleDateString(root.lang, { month: "short", year: "numeric" }) : "GitHub";
      const licence = r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : info.licence;
      a.innerHTML = `
        <div class="ticket__top"><span>№ ${String(i + 1).padStart(3, "0")}</span><span>${upd}</span></div>
        <h3>${split ? `<a class="ticket__repo" target="_blank" rel="noopener"></a>` : ""}</h3><p></p>
        <div class="ticket__foot">
          ${r.language ? `<span><span class="dot"></span>${r.language}</span>` : ""}
          ${licence ? `<span class="ticket__licence"></span>` : ""}
          ${r.stargazers_count ? `<span>★ ${r.stargazers_count}</span>` : ""}
          ${r.private ? `<span class="ticket__go ticket__lock">${r.url ? L("live") : "🔒 " + L("privnote")}</span>`
            : split ? `<a class="ticket__go ticket__live" target="_blank" rel="noopener">${L("live")}</a>` : `<span class="ticket__go">→</span>`}
        </div>`;
      const name = r.name.replace(/[-_]/g, " ");
      if (split) {
        const repo = $(".ticket__repo", a);
        repo.href = r.html_url; repo.textContent = name; repo.setAttribute("aria-label", `${name}: ${L("repo")}`);
        $(".ticket__live", a).href = live;
      } else $("h3", a).textContent = name;
      if (licence) $(".ticket__licence", a).textContent = "⚖ " + licence;
      const d = info.description || r.description;
      $("p", a).textContent = (d && typeof d === "object" ? d[root.lang] || d.en : d) || L("nodesc");
      tickets.append(a);
    });
    if (!reduce) $$(".ticket", tickets).forEach(t => {
      t.addEventListener("pointermove", e => {
        const b = t.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        t.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      t.addEventListener("pointerleave", () => (t.style.transform = ""));
    });
  }
  function renderChips() {
    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))];
    chips.innerHTML = "";
    if (langs.length < 2) return;
    ["*", ...langs].forEach(l => {
      const b = document.createElement("button");
      b.className = "chip" + (l === filter ? " is-on" : "");
      b.textContent = l === "*" ? L("all") : l;
      b.onclick = () => { filter = l; renderChips(); renderRepos(); };
      chips.append(b);
    });
  }
  // Repos that aren't public can't come from the GitHub API, so they are listed by hand in config.js
  const privateRepos = (pub = []) => (cfg.privateRepos || []).filter(r => !pub.some(p => p.name.toLowerCase() === r.name.toLowerCase())).map(r => ({ ...r, private: true }));
  async function loadRepos() {
    const user = cfg.githubUser;
    const fallback = `<a href="https://github.com/${user}" target="_blank" rel="noopener">github.com/${user}</a>`;
    try {
      const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`);
      if (!res.ok) throw new Error(res.status);
      let data = await res.json();
      data = data.filter(r => !r.archived && !cfg.hide?.includes(r.name) && (cfg.includeForks || !r.fork));
      // `only` = curated mode: show just these repos (in this order); the rest of the account is ignored
      const only = (cfg.only || []).map(n => n.toLowerCase());
      if (only.length) data = data.filter(r => only.includes(r.name.toLowerCase()));
      const pin = only.length ? (cfg.only || []) : (cfg.pin || []);
      const rank = n => { const i = pin.findIndex(p => p.toLowerCase() === n.toLowerCase()); return i < 0 ? 1e9 : i; };
      data.sort((a, b) => rank(a.name) - rank(b.name) || new Date(b.pushed_at) - new Date(a.pushed_at));
      repos = data.slice(0, cfg.maxRepos || 9);
      repos = repos.concat(privateRepos(repos));
      if (!repos.length) { tickets.innerHTML = ""; note.textContent = L("none"); return; }
      renderChips(); renderRepos();
    } catch {
      tickets.innerHTML = "";
      // GitHub unreachable: still show the curated public repos we know about, linking to GitHub.
      const known = (cfg.only || []).filter(n => cfg.repoInfo?.[n.toLowerCase()])
        .map(n => ({ name: n, html_url: `https://github.com/${user}/${n}` }));
      repos = known.concat(privateRepos(known));
      if (repos.length) { renderChips(); renderRepos(); }
      note.innerHTML = `${L("err")} ${fallback}`;
    }
  }

  /* ---------- misc ---------- */
  if (cfg.email) $("#mailLink").href = "mailto:" + cfg.email, $("#mailLink").textContent = cfg.email;
  if (cfg.linkedin) $("#liLink").href = cfg.linkedin;
  if (cfg.githubUser) $("#ghLink").href = "https://github.com/" + cfg.githubUser;
  $("#year").textContent = new Date().getFullYear();

  // railway ties along the track
  const ties = $(".ties");
  if (ties) for (let x = 0; x < 1440; x += 36) ties.insertAdjacentHTML("beforeend", `<rect x="${x}" y="778" width="14" height="22"/>`);
  $$("svg").forEach(s => s.setAttribute("focusable", "false"));

  setLang(initial);
  onScroll();
  loadRepos();
  // re-render localized strings in tickets when language changes
  $$("[data-set-lang]").forEach(b => b.addEventListener("click", () => { if (repos.length) { renderChips(); renderRepos(); } }));
})();
