# alfredoartilesv.github.io

Personal CV site of **Alfredo Artiles**, a C/C++ and Linux software engineer working in rail and mobility.

**Live:** https://alfredoartilesv.github.io

A static site with no build step and no dependencies, hosted free on GitHub Pages.

## Features
- Smooth scrolling (Lenis) with scroll-scrubbed motion (GSAP ScrollTrigger): hero layers rise in on load and drift at different speeds, headlines rise line by line, paragraphs fade in character by character, and sections stack, with each one shrinking and darkening as the next slides over it
- A train riding along the scroll-progress bar, a full-screen menu overlay
- Experience laid out as a metro line, and skills shown on a split-flap departure board
- English and Spanish, remembered between visits
- Curated project tickets, with live GitHub data and manual entries for private repos
- Both CV PDFs available to download
- Respects `prefers-reduced-motion`, responsive down to mobile
- Open Graph card, JSON-LD and sitemap for sharing and search

## Structure
```
index.html          page markup (EN and ES in one file)
404.html            "wrong platform" page
assets/
  style.css         all styles and animations
  main.js           base interactions, language switch and the GitHub fetch
  motion.js         smooth scroll + scroll-scrubbed animations (optional layer)
  vendor/           gsap, ScrollTrigger and Lenis, self-hosted
  config.js         the one file to edit for day-to-day changes
  og.png            share image (1200x630)
  cv_*.pdf          CVs built from the LaTeX source
```

## Editing the projects
Open `assets/config.js`:
- `only`: the repos to show, in order. `[]` shows every public repo.
- `privateRepos`: repos that aren't public yet, listed by hand as "Private" tickets, optionally with a `url` to a live app. Once a repo goes public, its live card replaces the manual entry.
- `pin`, `hide`, `includeForks`, `maxRepos`: further tuning.

## Updating the CV
Compile the LaTeX CV, copy `cv_english_latex.pdf` and `cv_espanol_latex.pdf` into `assets/`, then commit and push. Pages redeploys in about a minute.

## Run locally
```bash
python -m http.server
# open http://localhost:8000
```

## Credits
Layout and motion inspired by [carnilove.ashfall.studio](https://carnilove.ashfall.studio/). Motion built with [GSAP](https://gsap.com/) and [Lenis](https://lenis.darkroom.engineering/). Fonts: Archivo and JetBrains Mono (Google Fonts).

With `prefers-reduced-motion` on, or if the scripts in `assets/vendor/` fail to load, the site falls back to simple fade-in reveals.

The CV content and PDFs are personal. Please don't reuse them as your own.
