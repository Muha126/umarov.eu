# Local DOOM runtime

Vendored on 2026-10-09. These files are served by this site; DOOM does not
download its runtime from a CDN. Do not replace them with `latest` URLs.

- js-dos player: **8.5.3**
- Emulators: **8.5.2 (99337d87ab1cca2641a1b99779d5ab74)**
- Distribution source: https://v8.js-dos.com/latest/
- Player source: https://github.com/caiiiycuk/js-dos/tree/8.xx
- Emulator source: https://github.com/caiiiycuk/emulators
- Both packages declare GPL-2.0; see LICENSE-emulators for the license text.

`player.js` explicitly selects the local DOSBox backend and locks backend
selection. The iframe's Content Security Policy restricts resource loading
and HTTP connections to this site. Blob workers and dynamic JavaScript
evaluation are required by this emulator and permitted only within the DOOM
document. The portfolio's other documents are unaffected.

The game archive and UMAROV.CFG remain outside this directory. Vite copies
all of these public files into the production build without transformation.
