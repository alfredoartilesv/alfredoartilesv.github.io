// Edit this file to customise the site. No build step needed.
window.CV_CONFIG = {
  githubUser: "alfredoartilesv", // repos are fetched live from the public GitHub API
  maxRepos: 9,                   // how many ticket cards to show
  includeForks: false,
  hide: [],                      // repo names to hide, e.g. ["dotfiles"]
  only: ["even", "alfredoartilesv.github.io"], // curated list: ONLY these repos are shown, in this order. [] = show everything
  pin: [],                       // repo names to show first, e.g. ["my-best-repo"]
  // Extra info for public repos, by name: a bilingual description (replaces GitHub's English one) and
  // a live app link (else the repo's GitHub "homepage" is used). Also used to draw the cards when GitHub can't be reached.
  repoInfo: {
    even: {
      live: "https://even-sepia.vercel.app/",
      description: {
        en: "Open-source personal health app: Garmin data encrypted on the phone, food, drinks and meal prep, end-to-end sealed sync with a web app, and Claude on top.",
        es: "App personal de salud de código abierto: datos de Garmin cifrados en el móvil, comidas, bebidas y meal prep, sincronización cifrada de extremo a extremo con la web, y Claude encima."
      } },
    "alfredoartilesv.github.io": {
      description: {
        en: "This site: a static CV in plain HTML, CSS and JavaScript, with scroll animations and projects read live from GitHub.",
        es: "Esta web: un CV estático en HTML, CSS y JavaScript, con animaciones al hacer scroll y proyectos leídos en vivo de GitHub."
      } },
  },
  // Private repos can't be read from the public API, so list them here. They show as "Private" tickets.
  // { name, url (live app, optional), description: "..." or { en, es } }. Once one becomes public, its live card replaces it.
  privateRepos: [],
  email: "alfredoartilesv@outlook.com",
  linkedin: "https://linkedin.com/in/alfredo-artiles-4559a01a1"
};
