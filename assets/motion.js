/* Scroll choreography, modelled on carnilove.ashfall.studio:
   Lenis smooth scroll + GSAP ScrollTrigger scrubbing.
   Everything here is progressive: without GSAP/Lenis (or with reduced motion)
   the page keeps the simple CSS reveals from main.js. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger || !window.Lenis) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add("motion");

  /* ---------- Lenis smooth scroll wired to ScrollTrigger ---------- */
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // menu overlay should freeze the page
  const menu = $("#menu");
  new MutationObserver(() => (menu.classList.contains("open") ? lenis.stop() : lenis.start()))
    .observe(menu, { attributes: true, attributeFilter: ["class"] });
  document.body.style.overflow = "";

  /* ---------- stacking sections ---------- */
  const main = $("main");
  const stack = $$("#hero, #intro, #line, #projects, #skills, #contact");
  const mobile = () => innerWidth < 800;
  const wide = !mobile();

  // content wrapper + dark overlay per section, so the card can shrink while the next one slides over it
  const inners = new Map(), overlays = new Map();
  stack.forEach((sec, i) => {
    sec.style.zIndex = i + 1;
    const inner = document.createElement("div");
    inner.className = "stack-inner";
    while (sec.firstChild) inner.append(sec.firstChild);
    sec.append(inner);
    const ov = document.createElement("div");
    ov.className = "stack-overlay";
    sec.append(ov);
    inners.set(sec, inner); overlays.set(sec, ov);
  });
  $(".ticker").style.zIndex = stack.length + 2;

  function layoutStack() {
    root.classList.toggle("stack", !mobile());
    stack.forEach(sec => {
      // sticky with a negative top: tall sections scroll through, then rest at their bottom edge
      sec.style.top = mobile() ? "" : Math.min(0, innerHeight - sec.offsetHeight) + "px";
    });
  }
  layoutStack();

  function naturalTop(el) {
    let y = main.offsetTop;
    for (const c of main.children) {
      const cs = getComputedStyle(c), mt = parseFloat(cs.marginTop) || 0, mb = parseFloat(cs.marginBottom) || 0;
      if (c === el) return y + mt;
      y += c.offsetHeight + mt + mb;
    }
    return y;
  }
  const scrub = (vars) => ({ scrub: 0.5, ...vars });

  // each section is covered a little differently: scale, lean and shade vary per card
  const COVER = [
    { scale: 0.90, rotate: 0 },      // hero
    { scale: 0.95, rotate: -0.8 },   // about
    { scale: 0.88, rotate: 0.8 },    // the line
    { scale: 0.93, rotate: -1.1 },   // projects
    { scale: 0.86, rotate: 0 }       // skills
  ];
  function buildCover() {
    if (mobile()) return;
    stack.forEach((sec, i) => {
      const next = stack[i + 1];
      if (!next) return;
      const c = COVER[i] || COVER[0];
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true }
      })
        .to(inners.get(sec), { scale: c.scale, rotate: c.rotate, transformOrigin: "50% 100%" }, 0)
        .to(overlays.get(sec), { opacity: 0.5 + (i % 2) * 0.12 }, 0);
    });
  }

  /* ---------- hero: entrance + scrubbed parallax exit ---------- */
  const heroLayers = { sky: $(".layer--sky svg"), back: $(".layer--back svg"), mid: $(".layer--mid svg"), front: $(".layer--front svg") };
  // main.js drives .layer with data-speed; hand that over to GSAP
  $$(".layer").forEach(l => (l.style.transform = ""));
  gsap.set(heroLayers.sky, { autoAlpha: 0 });
  gsap.timeline({ delay: 0.25, defaults: { ease: "expo.out", duration: 1.5 } })
    .from(heroLayers.mid, { yPercent: 40 }, 0)
    .from(heroLayers.front, { yPercent: 80 }, 0.1)
    .from(heroLayers.back, { yPercent: 50 }, 0.2)
    .to(heroLayers.sky, { autoAlpha: 1, duration: 1.2, ease: "power1.out" }, 0);

  function buildHero() {
    const hero = $("#hero");
    const tl = gsap.timeline({ defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.2 } });
    tl.to(".layer--sky", { yPercent: 28 }, 0)
      .to(".layer--back", { yPercent: 16 }, 0)
      .to(".layer--mid", { yPercent: 8 }, 0)
      .to(".layer--front", { yPercent: 2 }, 0)
      .to(".hero__copy", { yPercent: -70, autoAlpha: 0 }, 0)
      .to(".scrollcue", { autoAlpha: 0 }, 0);
  }

  /* ---------- split helpers ---------- */
  function splitChars(el) {
    // splits every text node of el into per-character spans (works across the EN/ES children)
    const chars = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(tok => {
            if (/^\s+$/.test(tok) || !tok) { frag.append(tok); return; }
            const w = document.createElement("span"); w.className = "cw";
            [...tok].forEach(ch => { const c = document.createElement("span"); c.className = "ch"; c.textContent = ch; w.append(c); chars.push(c); });
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return chars;
  }

  // every section headline gets its own entrance
  const HEAD = { intro: "rise", line: "wipe", projects: "flip", skills: "zoom", contact: "slide" };
  function headline(h, kind) {
    h.classList.add("in");
    const words = $$(".w > span", h), wraps = $$(".w", h);
    const st = (o) => scrub({ trigger: h, start: "top 96%", end: "top 55%", ...o });
    if (kind === "wipe") {
      gsap.set(words, { yPercent: 0 });
      gsap.fromTo(h, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "power2.inOut", scrollTrigger: st() });
      gsap.fromTo(words, { x: -60 }, { x: 0, ease: "power2.out", stagger: 0.06, scrollTrigger: st() });
    } else if (kind === "flip") {
      wraps.forEach(w => (w.style.overflow = "visible"));
      gsap.fromTo(words, { rotateX: -95, yPercent: 40, autoAlpha: 0, transformOrigin: "50% 100%", transformPerspective: 700 },
        { rotateX: 0, yPercent: 0, autoAlpha: 1, ease: "power3.out", stagger: 0.07, scrollTrigger: st() });
    } else if (kind === "zoom") {
      wraps.forEach(w => (w.style.overflow = "visible"));
      gsap.fromTo(words, { yPercent: 0, scale: 2.4, autoAlpha: 0, filter: "blur(14px)" },
        { scale: 1, autoAlpha: 1, filter: "blur(0px)", ease: "expo.out", stagger: 0.05, scrollTrigger: st() });
    } else if (kind === "slide") {
      wraps.forEach(w => (w.style.overflow = "visible"));
      gsap.fromTo(words, { yPercent: 0, xPercent: i => (i % 2 ? 130 : -130), autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, ease: "power3.out", stagger: 0.05, scrollTrigger: st() });
    } else { // rise: lines climb out of a mask
      gsap.fromTo(words, { yPercent: i => 105 + 25 * (i % 3) }, {
        yPercent: 0, ease: "power2.out", stagger: { each: 0.03 }, scrollTrigger: st() });
    }
  }

  function buildText() {
    $$("[data-split]").filter(h => !h.closest(".hero")).forEach(h => headline(h, HEAD[h.closest("section")?.id] || "rise"));

    // lead paragraphs: the intro fades in letter by letter as you read; the others pop in word by word on arrival
    $$(".lead").forEach(p => {
      p.classList.remove("reveal"); p.style.opacity = 1; p.style.transform = "none";
      const chars = splitChars(p);
      if (p.closest("#intro")) {
        gsap.set(chars, { autoAlpha: 0.12 });
        gsap.to(chars, { autoAlpha: 1, ease: "none", stagger: { each: 0.012 },
          scrollTrigger: scrub({ trigger: p, start: "top 82%", end: "bottom 52%", scrub: 0.6 }) });
      } else {
        const words = $$(".cw", p);
        gsap.fromTo(words, { y: 36, autoAlpha: 0, rotate: 3 }, { y: 0, autoAlpha: 1, rotate: 0, ease: "power3.out", duration: 0.9, stagger: 0.035,
          scrollTrigger: { trigger: p, start: "top 88%", toggleActions: "play none none reverse" } });
      }
    });

    // kickers: tiny slide
    $$(".kicker.reveal").forEach(el => {
      el.classList.remove("reveal"); el.style.opacity = 1; el.style.transform = "none"; el.style.transition = "none";
      gsap.fromTo(el, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power2.out",
        scrollTrigger: scrub({ trigger: el, start: "top 94%", end: "top 74%" }) });
    });

    // stats: alternate sides, springy
    $$(".stats li.reveal").forEach((el, i) => {
      el.classList.remove("reveal"); el.style.opacity = 1; el.style.transform = "none"; el.style.transition = "none";
      gsap.fromTo(el, { x: i % 2 ? 90 : -90, y: 30, scale: 0.85, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, ease: "back.out(1.6)",
        scrollTrigger: scrub({ trigger: el, start: "top 96%", end: "top 66%" }) });
    });

    // contact buttons: triggered pop, staggered (not scrubbed)
    const links = $(".contact__links");
    if (links) {
      links.classList.remove("reveal"); links.style.opacity = 1; links.style.transform = "none"; links.style.transition = "none";
      gsap.fromTo($$(".btn", links), { scale: 0.5, y: 40, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, ease: "back.out(2.2)", duration: 0.8, stagger: 0.09,
        scrollTrigger: { trigger: links, start: "top 92%", toggleActions: "play none none reverse" } });
    }
  }

  /* ---------- the line: trail draws, stations tilt in ---------- */
  function buildLine() {
    const track = $(".line__track");
    ScrollTrigger.create({
      trigger: track, start: "top 60%", end: "bottom 60%", scrub: true,
      onUpdate: s => track.style.setProperty("--p", s.progress.toFixed(4))
    });
    const small = () => innerWidth < 960;
    $$(".station").forEach((st, i) => {
      st.classList.remove("reveal"); st.style.opacity = 1; st.style.transform = "none"; st.style.transition = "none";
      const body = $(".station__body", st), num = $(".station__num", st);
      const side = st.classList.contains("station--right") ? 1 : -1;
      st.classList.add("in");
      // 1: slides in from the left, 2: from the right, 3: rises and unfolds
      const from = [
        { x: small() ? -50 : -200, y: 40, rotate: -3, autoAlpha: 0 },
        { x: small() ? 50 : 200, y: 40, rotate: 3, autoAlpha: 0 },
        { x: 0, y: 130, scale: 0.88, rotateX: 18, transformPerspective: 900, autoAlpha: 0 }
      ][i % 3];
      gsap.fromTo(body, from, { x: 0, y: 0, rotate: 0, scale: 1, rotateX: 0, autoAlpha: 1, ease: "power3.out",
        scrollTrigger: scrub({ trigger: st, start: "top 98%", end: "top 55%" }) });
      gsap.fromTo(num, { scale: 0.2, rotate: -90 + i * 60 }, { scale: 1, rotate: 0, ease: "back.out(2)",
        scrollTrigger: scrub({ trigger: st, start: "top 90%", end: "top 62%" }) });
      // exit: leans away as it leaves the top
      gsap.to(body, { y: -50, rotate: -1.6 * side, ease: "none",
        scrollTrigger: { trigger: st, start: "bottom 35%", end: "bottom top", scrub: true } });
    });
  }

  /* ---------- project tickets ---------- */
  function buildTickets() {
    const box = $("#tickets");
    const FROM = [
      { y: 90, rotateX: -25 },                 // drops in from below
      { scale: 0.55, rotate: 9, y: 40 },       // spins up from small
      { x: 140, rotateY: 35, y: 20 }           // swings in from the right
    ];
    const play = () => {
      const t = $$(".ticket:not(.ticket--skeleton)", box);
      t.forEach(el => el.classList.remove("pop"));
      const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: "top 88%", toggleActions: "play none none reverse" } });
      t.forEach((el, i) => tl.fromTo(el, { ...FROM[i % 3], autoAlpha: 0 },
        { x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0, rotateY: 0, autoAlpha: 1, ease: i % 3 === 1 ? "back.out(1.8)" : "expo.out", duration: 1.1 }, i * 0.1));
    };
    new MutationObserver(() => { if (box.querySelector(".ticket:not(.ticket--skeleton)")) { play(); ScrollTrigger.refresh(); } })
      .observe(box, { childList: true });
    if (box.querySelector(".ticket:not(.ticket--skeleton)")) play();
  }

  /* ---------- skills board rows ---------- */
  function buildBoard() {
    const board = $("#board");
    board.classList.remove("reveal"); board.style.opacity = 1; board.style.transform = "none"; board.style.transition = "none";
    gsap.fromTo(board, { clipPath: "inset(0 0 100% 0 round 18px)" }, { clipPath: "inset(0 0 0% 0 round 18px)", ease: "power2.inOut",
      scrollTrigger: scrub({ trigger: board, start: "top 92%", end: "top 55%" }) });
    $$(".board__row").forEach((row, i) => {
      gsap.fromTo(row, { x: i % 2 ? 90 : -90, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power3.out",
        scrollTrigger: scrub({ trigger: row, start: "top 92%", end: "top 66%" }) });
    });
  }

  /* ---------- anchors + menu links use Lenis ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    const target = id === "#top" ? 0 : $(id);
    if (target == null) return;
    e.preventDefault();
    lenis.scrollTo(target === 0 ? 0 : naturalTop(target), { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
  }));

  /* ---------- go ---------- */
  buildHero(); buildCover(); buildText(); buildLine(); buildTickets(); buildBoard();
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { layoutStack(); ScrollTrigger.refresh(); }, 200); });
  addEventListener("load", () => { layoutStack(); ScrollTrigger.refresh(); });
  // language switch changes text height
  $$("[data-set-lang]").forEach(b => b.addEventListener("click", () => setTimeout(() => { layoutStack(); ScrollTrigger.refresh(); }, 60)));
})();
