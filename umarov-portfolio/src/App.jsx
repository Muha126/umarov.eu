import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import cvFile from './assets/MukhammadkarimUmarov_.pdf'
import './App.css'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\{}[]#%+=:;*'
const glyphs = {
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
}

const commandResponses = {
  help: 'available: about · experience · projects · contact · clear · reboot · doom · idkfa',
  about: 'M Umarov — software developer. From AI agents to production code.',
  experience: 'IBM Ireland · Software Development Intern · 2026\nUzAuto Chevrolet · Software Development Intern · 2022',
  projects: 'AI Baby · Cinema Ticketing System',
  contact: 'umarovm123@gmail.com',
  idkfa: 'CHEAT CODE DETECTED — NICE TRY.',
}

function playTerminalTone(frequency = 420, duration = 0.035) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const context = window.__umarovAudioContext || (window.__umarovAudioContext = new AudioContext())
    if (context.state === 'suspended') context.resume()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'square'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.018, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + duration)
  } catch {
    // Audio is a progressive enhancement and may be blocked by the browser.
  }
}

const doomKeyMap = {
  w: { key: 'w', code: 'KeyW', keyCode: 87 },
  s: { key: 's', code: 'KeyS', keyCode: 83 },
  ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
  Control: { key: 'Control', code: 'ControlLeft', keyCode: 17 },
  Space: { key: ' ', code: 'Space', keyCode: 32 },
}

function DoomMobileControls({ frameRef }) {
  const joystickRef = useRef(null)
  const knobRef = useRef(null)
  const pointerRef = useRef(null)
  const pressedRef = useRef(new Set())

  function sendKey(keyName, pressed) {
    const key = doomKeyMap[keyName]
    if (!key) return
    if (pressed && pressedRef.current.has(keyName)) return
    if (!pressed && !pressedRef.current.has(keyName)) return
    try {
      const frame = frameRef.current
      const target = frame?.contentWindow
      if (!target) return
      target.focus()
      const event = new target.KeyboardEvent(pressed ? 'keydown' : 'keyup', {
        key: key.key,
        code: key.code,
        keyCode: key.keyCode,
        which: key.keyCode,
        bubbles: true,
        cancelable: true,
      })
      Object.defineProperty(event, 'keyCode', { value: key.keyCode })
      Object.defineProperty(event, 'which', { value: key.keyCode })
      target.document.dispatchEvent(event)
      if (pressed) pressedRef.current.add(keyName)
      else pressedRef.current.delete(keyName)
    } catch {
      // Touch controls are optional if the browser blocks iframe access.
    }
  }

  function releaseAll() {
    for (const key of pressedRef.current) sendKey(key, false)
    pointerRef.current = null
    if (knobRef.current) knobRef.current.style.transform = 'translate(-50%, -50%)'
  }

  function updateJoystick(event) {
    const joystick = joystickRef.current
    if (!joystick) return
    const rect = joystick.getBoundingClientRect()
    const max = rect.width * .32
    let x = event.clientX - (rect.left + rect.width / 2)
    let y = event.clientY - (rect.top + rect.height / 2)
    const length = Math.hypot(x, y)
    if (length > max) {
      x = x / length * max
      y = y / length * max
    }
    if (knobRef.current) knobRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
    const threshold = max * .32
    sendKey('ArrowLeft', x < -threshold)
    sendKey('ArrowRight', x > threshold)
    sendKey('w', y < -threshold)
    sendKey('s', y > threshold)
  }

  function startJoystick(event) {
    event.preventDefault()
    pointerRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    updateJoystick(event)
  }

  function moveJoystick(event) {
    if (pointerRef.current === event.pointerId) {
      event.preventDefault()
      updateJoystick(event)
    }
  }

  function stopJoystick(event) {
    if (pointerRef.current === event.pointerId) releaseAll()
  }

  function startButton(event, key) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    sendKey(key, true)
  }

  function stopButton(key) {
    sendKey(key, false)
  }

  useEffect(() => () => {
    pressedRef.current.clear()
    pointerRef.current = null
  }, [])

  return (
    <div className="doom-touch-controls" aria-label="Touch controls">
      <div
        className="doom-joystick"
        ref={joystickRef}
        onPointerDown={startJoystick}
        onPointerMove={moveJoystick}
        onPointerUp={stopJoystick}
        onPointerCancel={stopJoystick}
        onLostPointerCapture={releaseAll}
      >
        <span className="doom-joystick-knob" ref={knobRef} />
      </div>
      <div className="doom-touch-buttons">
        <button type="button" onPointerDown={event => startButton(event, 'Control')} onPointerUp={() => stopButton('Control')} onPointerCancel={() => stopButton('Control')}>FIRE</button>
        <button type="button" onPointerDown={event => startButton(event, 'Space')} onPointerUp={() => stopButton('Space')} onPointerCancel={() => stopButton('Space')}>OPEN</button>
      </div>
    </div>
  )
}

function DoomPlayer({ onClose }) {
  const panelRef = useRef(null)
  const frameRef = useRef(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    panelRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const timer = window.setTimeout(() => setBooted(true), 1800)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="doom-panel" ref={panelRef} aria-busy={!booted}>
      {!booted ? <div className="doom-boot" aria-live="polite">
        <p>C:\&gt; doom.exe -config UMAROV.CFG</p>
        <p>Loading DOOM shareware...</p>
        <p>IWAD found · E1M1 ready</p>
        <p className="doom-boot-cursor">_</p>
      </div> : <>
        <iframe ref={frameRef} className="doom-frame" title="DOOM shareware — Knee-Deep in the Dead" src={`${import.meta.env.BASE_URL}doom/index.html`} allow="autoplay; fullscreen; gamepad" allowFullScreen />
        <DoomMobileControls frameRef={frameRef} />
        <p className="doom-meta">DOOM / E1M1 · INPUT READY · MOUSE ACTIVE</p>
        <p className="doom-controls">WASD: move · ← →: turn · Ctrl: fire · Space: open · Esc: menu <button type="button" onClick={onClose}>Exit ×</button></p>
      </>}
    </div>
  )
}

function RebootOverlay({ onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1800)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return createPortal(
    <div className="reboot-overlay" role="status" aria-live="polite">
      <div className="reboot-screen">
        <p className="reboot-line reboot-brand">UMAROV BIOS v1.0.26</p>
        <p className="reboot-line">POST memory check ........ 16384K OK</p>
        <p className="reboot-line">terminal interface ....... READY</p>
        <p className="reboot-line">unmounting local session . DONE</p>
        <div className="reboot-progress" aria-hidden="true"><span /></div>
        <p className="reboot-line reboot-final">SYSTEM REBOOT · PLEASE WAIT<span className="reboot-cursor">_</span></p>
      </div>
    </div>,
    document.body,
  )
}

function BootTerminal({ onComplete }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1800)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="reboot-overlay boot-terminal" role="status" aria-live="polite">
      <div className="reboot-screen">
        <p className="reboot-line reboot-brand">UMAROV BIOS v1.0.26</p>
        <p className="reboot-line">POST memory check ........ 16384K OK</p>
        <p className="reboot-line">loading terminal renderer . OK</p>
        <p className="reboot-line">mounting profile filesystem  OK</p>
        <p className="reboot-line">resolving contact links .... OK</p>
        <p className="reboot-line">loading experience modules . OK</p>
        <div className="reboot-progress" aria-hidden="true"><span /></div>
        <p className="reboot-line reboot-final">SYSTEM BOOT · PLEASE WAIT<span className="reboot-cursor">_</span></p>
      </div>
    </div>
  )
}

function TerminalConsole({ onRebootComplete }) {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const [playingDoom, setPlayingDoom] = useState(false)
  const [consoleRestored, setConsoleRestored] = useState(false)
  const [rebooting, setRebooting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
    const unlockAudio = () => playTerminalTone(520, 0.06)
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    return () => window.removeEventListener('pointerdown', unlockAudio)
  }, [])

  function runCommand(event) {
    event.preventDefault()
    const value = command.trim().toLowerCase().replace(/\s+/g, ' ')
    if (!value) return
    if (value === 'doom' || value === 'source doom') {
      playTerminalTone(680, 0.08)
      setPlayingDoom(true)
    } else if (value === 'clear') {
      playTerminalTone(340)
      setHistory([])
    } else if (value === 'reboot') {
      playTerminalTone(260, 0.1)
      setCommand('')
      setRebooting(true)
      return
    } else {
      playTerminalTone(commandResponses[value] ? 460 : 190, commandResponses[value] ? 0.03 : 0.07)
      setHistory(current => [...current, {
        command: value,
        response: commandResponses[value] || `command not found: ${value}`,
      }])
    }
    setCommand('')
  }

  return (
    <section className={`live-console${consoleRestored ? ' console-restored' : ''}`} aria-labelledby="console-title">
      <div className="console-topline">
        <h2 id="console-title">Console</h2>
      </div>
      {rebooting ? <RebootOverlay onDone={onRebootComplete} /> : playingDoom ? <DoomPlayer onClose={() => { setConsoleRestored(true); setPlayingDoom(false); requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true })) }} /> : <>
      <div className="console-output" aria-live="polite">
        <p><span className="console-accent">+</span> connection established</p>
        <p><span className="console-accent">+</span> type <span className="console-command">help</span> to begin</p>
        {history.map((item, index) => (
          <div className="console-entry" key={`${item.command}-${index}`}>
            <p><span className="console-prompt">visitor@umarov:~$</span> {item.command}</p>
            <p className="console-response">{item.response}</p>
          </div>
        ))}
      </div>
      <form className="console-form" onSubmit={runCommand}>
        <label className="console-prompt" htmlFor="console-input">visitor@umarov:~$</label>
        <span className="console-input-wrap">
          <input
            id="console-input"
            ref={inputRef}
            value={command}
            onChange={event => setCommand(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') return
              if (event.key === 'Backspace') playTerminalTone(240, 0.025)
              else if (event.key.length === 1) playTerminalTone(390, 0.018)
            }}
            autoComplete="off"
            spellCheck="false"
          />
        </span>
      </form>
      </>}
    </section>
  )
}

function ConsoleName() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame
    let cells = []
    let width = 0
    let height = 0
    let start = performance.now()
    let lastDraw = 0

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Each large letter is itself built from a grid of tiny console characters.
      const subdivisionsX = 4
      const subdivisionsY = 4
      const columns = 47 * subdivisionsX
      const rows = 7 * subdivisionsY
      const stepX = width / columns
      const stepY = Math.min(height / rows, (width / 47) * 1.75 / subdivisionsY)
      const top = (height - rows * stepY) / 2
      const letters = 'M UMAROV'
      cells = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const blockX = Math.floor(x / subdivisionsX)
          const letterIndex = Math.floor(blockX / 6)
          const letterX = blockX % 6
          const letter = letters[letterIndex]
          const active = glyphs[letter]?.[Math.floor(y / subdivisionsY)]?.[letterX] === '1'
          cells.push({
            x: Math.round(x * stepX * dpr) / dpr,
            y: Math.round((top + y * stepY) * dpr) / dpr, active,
            char: alphabet[Math.floor(Math.random() * alphabet.length)],
            brightness: 0.68 + Math.random() * 0.32,
            settle: 450 + (x / columns) * 1250 + Math.random() * 700,
          })
        }
      }
      context.font = `${Math.min(stepX * 1.2, stepY)}px "Share Tech Mono", monospace`
      context.textBaseline = 'top'
      start = performance.now()
    }

    function draw(now) {
      frame = requestAnimationFrame(draw)
      if (now - lastDraw < 65 || document.hidden) return
      lastDraw = now
      const elapsed = motion.matches ? 3000 : now - start
      context.clearRect(0, 0, width, height)
      for (const cell of cells) {
        const settled = elapsed > cell.settle
        if (!settled || (!motion.matches && Math.random() < 0.045)) {
          cell.char = alphabet[Math.floor(Math.random() * alphabet.length)]
        }
        if (settled && !cell.active) continue
        const opacity = settled ? cell.brightness : (0.06 + Math.random() * 0.4)
        context.fillStyle = `rgba(102, 255, 128, ${opacity})`
        context.fillText(cell.char, cell.x, cell.y)
      }

      if (motion.matches) cancelAnimationFrame(frame)
    }

    const observer = new ResizeObserver(() => {
      resize()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    })
    observer.observe(canvas)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="console-name" aria-hidden="true" />
}

function CrtScreen({ children }) {
  const [map] = useState(() => {
    // Red and green encode horizontal and vertical sampling offsets.
    // Cross-axis curvature bends straight rows toward the screen corners.
    const canvas = document.createElement('canvas')
    const size = 256
    canvas.width = canvas.height = size
    const context = canvas.getContext('2d')
    const pixels = context.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = (x / (size - 1)) * 2 - 1
        const ny = (y / (size - 1)) * 2 - 1
        const offset = (y * size + x) * 4
        pixels.data[offset] = Math.round(255 * (.5 + .5 * nx * ny * ny))
        pixels.data[offset + 1] = Math.round(255 * (.5 + .5 * ny * nx * nx))
        pixels.data[offset + 2] = 128
        pixels.data[offset + 3] = 255
      }
    }
    context.putImageData(pixels, 0, 0)
    return canvas.toDataURL()
  })

  return (
    <>
      <svg className="crt-filter-defs" aria-hidden="true">
        <defs>
          <filter id="crt-curvature" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={map || undefined} width="100%" height="100%" preserveAspectRatio="none" result="curve" />
            <feDisplacementMap in="SourceGraphic" in2="curve" scale="44" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className={`crt-screen${map ? ' crt-screen-ready' : ''}`}>
        <div className="crt-viewport">{children}</div>
        <div className="crt-glass" aria-hidden="true">
          <div className="crt-noise" />
          <div className="crt-sweep" />
        </div>
      </div>
    </>
  )
}

function App() {
  const [copied, setCopied] = useState(false)
  const [bootCycle, setBootCycle] = useState(0)
  const [bootReady, setBootReady] = useState(false)

  function finishReboot() {
    const viewport = document.querySelector('.crt-viewport')
    if (viewport) viewport.scrollTop = 0
    window.scrollTo({ top: 0, behavior: 'auto' })
    setBootCycle(current => current + 1)
  }

  async function copyEmail(event) {
    event.preventDefault()
    await navigator.clipboard.writeText('umarovm123@gmail.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <CrtScreen>
    {!bootReady && <BootTerminal key={bootCycle} onComplete={() => setBootReady(true)} />}
    {bootReady && <main key={bootCycle} className="terminal boot-sequence" aria-labelledby="name">
      <nav className="social-links" aria-label="Contact links">
        <a href="https://github.com/Muha126" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
        <a href="https://www.linkedin.com/in/mukhammadkarim-umarov-495916262/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
        <span className="gmail-row">
          <a href="mailto:umarovm123@gmail.com" onClick={copyEmail}>Gmail <span>↗</span></a>
        </span>
        <a className="cv-link" href={cvFile} target="_blank" rel="noreferrer">CV.pdf <span>↗</span></a>
        {copied && <span className="copy-note" role="status">umarovm123@gmail.com copied</span>}
      </nav>
      <h1 id="name" className="sr-only">M UMAROV</h1>
      <ConsoleName />
            <section className="experience" aria-labelledby="education-title">
        <h2 id="education-title">Education</h2>
        <div className="experience-heading">
          <h3><span className="tud-mark" aria-label="TUD"><b>T</b><span className="tud-bottom"><b>D</b><b>U</b></span></span><span className="tud-name">Technological University Dublin</span></h3>
          <p className="experience-dates">Expected Jun 2027</p>
        </div>
        <p className="experience-role">Software Development · 4th year</p>
      </section>
      <section className="experience" aria-labelledby="experience-title">
        <h2 id="experience-title">Experience</h2>
        <article>
          <div className="experience-heading">
            <h3><span className="ibm-mark" aria-label="IBM">IBM</span><span>Ireland</span></h3>
            <p className="experience-dates">Jan — Sep 2026</p>
          </div>
          <p className="experience-role">Software Development Intern</p>
          <p className="experience-summary">
            Watson Speech-to-Text: built a production training pipeline for Portuguese
            and improved speech recognition models.
          </p>
        </article>
        <article className="experience-entry">
          <div className="experience-heading">
            <h3><span className="uzauto-mark" aria-label="UzAuto">UzAuto</span> <span>Chevrolet</span></h3>
            <p className="experience-dates">Jun — Dec 2022</p>
          </div>
          <p className="experience-role">Software Development Intern</p>
          <p className="experience-summary">
            Fixed software bugs, built internal automation modules, deployed updates,
            and worked with CRM and ERP systems in Odoo.
          </p>
        </article>
      </section>
      <section className="experience" aria-labelledby="projects-title">
        <h2 id="projects-title">Projects</h2>
        <article className="project">
          <h3><a href="https://github.com/Muha126/AI_Baby/tree/main" target="_blank" rel="noreferrer"><span className="project-mark ai-mark" aria-label="AI">AI</span> Developmental AI Agent <span aria-hidden="true">↗</span></a></h3>
          <p className="experience-role">Python · Machine Learning · Reinforcement Learning</p>
          <p className="experience-summary">An autonomous agent inspired by human learning, with curiosity-driven exploration and continual memory.</p>
        </article>
        <article className="project">
          <h3><a href="https://github.com/Muha126/Cinema_Ticketing_System" target="_blank" rel="noreferrer"><span className="project-mark cinema-mark" aria-label="Cinema">▦</span> Cinema Ticketing Booking <span aria-hidden="true">↗</span></a></h3>
          <p className="experience-role">Django · React · SQLite · REST API</p>
          <p className="experience-summary">A team-built cinema booking app with authentication, seat reservations and a staff admin panel.</p>
        </article>
      </section>


      <section className="experience" aria-labelledby="skills-title">
        <h2 id="skills-title">Skills</h2>
        <ul className="skills-list" aria-label="Technical skills">
          {['Python', 'C#', 'PHP', 'SQL', 'HTML5', 'CSS3', 'Git', 'Linux / Bash', 'OOP', 'Machine Learning'].map(skill => <li key={skill}>{skill}</li>)}
        </ul>
      </section>
      <TerminalConsole onRebootComplete={finishReboot} />
    </main>
    }
    </CrtScreen>
  )
}

export default App
