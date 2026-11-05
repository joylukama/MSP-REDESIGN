# Millennium Scholars redesign

The current website files are in `dist/`. Edit `dist/index.html`, `dist/style.css`, and `dist/app.js`. Program page information lives in `dist/content.json`; logos and photographs are in `dist/assets/`.

Preview locally with `python3 -m http.server 4173 --directory dist`, then open http://localhost:4173.

GitHub Pages publishes `dist/` automatically when changes are pushed to `main`.
Website: https://joylukama.github.io/MSP-REDESIGN/
Deployment progress is available in the repository's Actions tab under “Publish MSP website”.

The project is connected to the existing private Sites publication through `.openai/hosting.json`.
