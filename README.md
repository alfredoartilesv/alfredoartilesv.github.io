# alfredoartilesv.github.io

Personal CV site of **Alfredo Artiles**, a C/C++ and Linux software engineer working in rail and mobility.

**Live:** https://alfredoartilesv.github.io

A static site with no build step and no dependencies, hosted free on GitHub Pages.

## Features
- Parallax hero with a train riding along the scroll-progress bar, scroll reveals, a full-screen menu and word-by-word headlines
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
  main.js           interactions and the GitHub fetch
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
Layout and motion inspired by [carnilove.ashfall.studio](https://carnilove.ashfall.studio/). Fonts: Archivo and JetBrains Mono (Google Fonts).

The CV content and PDFs are personal. Please don't reuse them as your own.
