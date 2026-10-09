import { useEffect, useRef, useState } from 'react'
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
  help: 'available: about · experience · projects · contact · clear',
  about: 'M Umarov — software developer building useful systems.',
  experience: 'IBM Ireland · Software Development Intern · 2026\nUzAuto Chevrolet · Software Development Intern · 2022',
  projects: 'AI Baby · Cinema Ticketing System',
  contact: 'umarovm123@gmail.com',
}

function TerminalConsole() {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  function runCommand(event) {
    event.preventDefault()
    const value = command.trim().toLowerCase()
    if (!value) return
    if (value === 'clear') {
      setHistory([])
    } else {
      setHistory(current => [...current, {
        command: value,
        response: commandResponses[value] || `command not found: ${value}`,
      }])
    }
    setCommand('')
  }

  return (
    <section className="live-console" aria-labelledby="console-title">
      <div className="console-topline">
        <h2 id="console-title">Console</h2>
      </div>
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
            autoComplete="off"
            spellCheck="false"
          />
        </span>
      </form>
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
      const subdivisions = width < 600 ? 1 : 3
      const columns = 47 * subdivisions
      const rows = 7 * subdivisions
      const stepX = width / columns
      const stepY = Math.min(height / rows, stepX * 2.05)
      const top = (height - rows * stepY) / 2
      const letters = 'M UMAROV'
      cells = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const blockX = Math.floor(x / subdivisions)
          const letterIndex = Math.floor(blockX / 6)
          const letterX = blockX % 6
          const letter = letters[letterIndex]
          const active = glyphs[letter]?.[Math.floor(y / subdivisions)]?.[letterX] === '1'
          cells.push({
            x: x * stepX, y: top + y * stepY, active,
            char: alphabet[Math.floor(Math.random() * alphabet.length)],
            brightness: 0.45 + Math.random() * 0.55,
            settle: 450 + (x / columns) * 1250 + Math.random() * 700,
          })
        }
      }
      context.font = `${Math.max(4, stepX * 1.2)}px "Share Tech Mono", monospace`
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

function App() {
  const [copied, setCopied] = useState(false)

  async function copyEmail(event) {
    event.preventDefault()
    await navigator.clipboard.writeText('umarovm123@gmail.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <main className="terminal" aria-labelledby="name">
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
      <TerminalConsole />
    </main>
  )
}

export default App
