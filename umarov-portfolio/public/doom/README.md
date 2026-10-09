# DOOM console Easter egg

`doom` and `source doom` mount this isolated player only on request. Removing the
iframe stops its emulator and audio. No game code is loaded on the portfolio's initial visit.

The original shareware archive is preserved at `../doom-shareware.zip`, including
README.TXT, ORDER.FRM and the other distribution files. It contains DOOM1.WAD
(4,196,020 bytes), not the registered DOOM.WAD. DOOM is copyright id Software.
Source: https://archive.org/download/DoomsharewareEpisode/doom.ZIP

The runtime is js-dos v8, loaded from https://v8.js-dos.com/latest/ on launch.
Documentation and source: https://js-dos.com/player-api.html and
https://github.com/caiiiycuk/js-dos. Internet access is required for the runtime.

The launch configuration selects E1M1, skill 3, using UMAROV.CFG. W/S move
forward/backward; A/D strafe; mouse or left/right arrows turn; Ctrl fires;
Space opens doors; Shift runs; number keys select weapons. Escape releases
mouse capture / opens the game menu. The player's controls support touch devices.
Canvas rendering and disabled DOSBox scaling avoid stacked rendering effects.
The portfolio's CRT filter and overlay are disabled while the game is mounted.
