// Edit this file to customise the site. No build step needed.
window.CV_CONFIG = {
  githubUser: "alfredoartilesv", // repos are fetched live from the public GitHub API
  maxRepos: 9,                   // how many ticket cards to show
  includeForks: false,
  hide: [],                      // repo names to hide, e.g. ["dotfiles"]
  only: ["even", "alfredoartilesv.github.io"], // curated list: ONLY these repos are shown, in this order. [] = show everything
  pin: [],                       // repo names to show first, e.g. ["my-best-repo"]
  // Private repos can't be read from the public API, so list them here. They show as "Private" tickets (no link).
  // description can be a string or { en: "...", es: "..." }
  // Once a repo here becomes public, the live GitHub card replaces this entry automatically.
  privateRepos: [
    { name: "even",
      url: "https://even-sepia.vercel.app/", // live app; the card links here while the repo is private
      description: {
        en: "Personal health app: Garmin data, food and drink logs, meal prep, measurements and goals in one place.",
        es: "App personal de salud: datos de Garmin, registro de comidas y bebidas, meal prep, medidas y objetivos en un solo sitio."
      } },
  ],
  email: "alfredoartilesv@outlook.com",
  linkedin: "https://linkedin.com/in/alfredo-artiles-4559a01a1"
};
