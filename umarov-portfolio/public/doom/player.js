// Runtime documentation: https://js-dos.com/player-api.html
const status = document.getElementById('status')
const notify = (state, message) => parent.postMessage({ type: 'umarov-doom', state, message }, location.origin)
let ready = false
let failed = false
let chromeReady = false
let capturePromptVisible = false

function fail() {
  if (failed || ready) return
  failed = true
  status.hidden = false
  status.textContent = 'Could not load DOOM. Check your connection, then press Retry.'
  notify('error', status.textContent)
}

const timeout = setTimeout(fail, 60000)
function hidePlayerChrome() {
  if (!chromeReady) return
  const selectors = [
    '.sidebar-slider',
    '.sidebar-thin',
    '[class*="sidebar"]',
    '[class*="sensitivity"]',
    '[aria-label*="sensitivity" i]',
  ]
  document.querySelectorAll(selectors.join(',')).forEach(element => {
    if (element.id === 'dos' || element.querySelector('canvas')) return
    element.style.setProperty('display', 'none', 'important')
  })
  if (!capturePromptVisible) setCapturePromptVisibility(false)
}

function setCapturePromptVisibility(visible) {
  document.querySelectorAll('[class*="absolute"], [class*="fixed"]').forEach(element => {
    if (element.querySelector('canvas')) return
    const text = element.textContent?.replace(/\s+/g, ' ').trim() || ''
    if (text.length > 0 && text.length < 220 && /click to capture mouse|use slider on the left|current sensitivity|use esc to unlock/i.test(text)) {
      if (visible) element.style.removeProperty('display')
      else element.style.setProperty('display', 'none', 'important')
    }
  })
}

const chromeObserver = new MutationObserver(hidePlayerChrome)
chromeObserver.observe(document.documentElement, { childList: true, subtree: true })
const chromeInterval = setInterval(hidePlayerChrome, 250)

const script = document.createElement('script')
script.src = 'https://v8.js-dos.com/latest/js-dos.js'
script.onerror = fail
script.onload = async () => {
  try {
    const response = await fetch('../doom-shareware.zip')
    if (!response.ok) throw new Error('Game archive unavailable')
    const archive = new Uint8Array(await response.arrayBuffer())
    const configResponse = await fetch('./UMAROV.CFG')
    if (!configResponse.ok) throw new Error('Control configuration unavailable')
    const config = new Uint8Array(await configResponse.arrayBuffer())
    if (failed) return
    const player = Dos(document.getElementById('dos'), {
      initFs: [archive, { path: 'UMAROV.CFG', contents: config }],
      dosboxConf: `[sdl]
autolock=true
[dosbox]
memsize=16
[cpu]
core=auto
cycles=max
[sblaster]
sbtype=sb16
sbbase=220
irq=7
dma=1
[render]
aspect=false
scaler=none
[autoexec]
@echo off
mount c .
c:
doom.exe -config UMAROV.CFG -warp 1 1 -skill 3
exit`,
      autoStart: true,
      theme: 'black',
      renderAspect: '4/3',
      renderBackend: 'canvas',
      imageRendering: 'pixelated',
      // Use the game canvas only: no js-dos control bar, sensitivity slider,
      // fullscreen button, or social links around it.
      style: 'none',
      noSideBar: true,
      noFullscreen: true,
      noSocialLinks: true,
      mouseSensitivity: .6,
      // Keep the js-dos chrome hidden, but allow a click on the game to
      // capture the pointer so horizontal mouse movement turns the view.
      mouseCapture: true,
      kiosk: true,
      volume: .45,
      onEvent(event) {
        if (event === 'ci-ready' && !failed) {
          ready = true
          chromeReady = true
          hidePlayerChrome()
          window.setTimeout(() => {
            capturePromptVisible = true
            setCapturePromptVisibility(true)
          }, 2200)
          clearTimeout(timeout)
          status.hidden = true
          notify('ready', 'DOOM running')
        }
      },
    })
    player.setNoCloud(true)
    notify('loaded', 'Click the game to play. Press Start if prompted.')
  } catch {
    fail()
  }
}
document.head.append(script)
