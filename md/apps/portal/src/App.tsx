import closeDoseMark from './assets/closedose-mark-teal.png';
import clinicalPreparationRoom640 from './assets/clinical-preparation-room-640.webp';
import clinicalPreparationRoom960 from './assets/clinical-preparation-room-960.webp';
import clinicalPreparationRoom from './assets/clinical-preparation-room.webp';
import { toolCatalog } from './toolCatalog.ts';

const HERO_LEDE = 'Pediatric airway, RSI, and emergency workflow tools for focused point-of-care support.';

const boundaries = [
  {
    title: 'PIG and RSI: local calculation',
    description:
      'Calculator inputs and outputs stay in the current browser tab. No backend service is used.'
  },
  {
    title: 'PIG and RSI: No patient identifiers',
    description:
      'The reference calculators do not request names, dates of birth, medical record numbers, or other patient identifiers.'
  },
  {
    title: 'PREtendingMD: authenticated sync',
    description:
      'PREtendingMD signs users in and synchronizes its operational shift board through the existing Firebase service.'
  },
  {
    title: 'No AI runtime',
    description:
      'There is no AI model, generated recommendation, or API key in this release.'
  },
  {
    title: 'Protocol verification',
    description:
      'Use as decision support. Verify all information against current institutional protocols before clinical use.'
  }
] as const;

function App() {
  return (
    <div className="site-shell">
      <header className="app-header">
        <nav className="app-nav" aria-label="Primary">
          <a className="brand" href="/" aria-label="CloseDose MD home">
            <img src={closeDoseMark} alt="" width="180" height="180" />
            <span>CloseDose MD</span>
          </a>
          <span className="nav-context">Provider tools</span>
          <a className="nav-link" href="#provider-tools">
            Tools
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <h1 id="hero-heading">
              <span>Clinical tools.</span>
              <span>Ready when needed.</span>
            </h1>
            <p>{HERO_LEDE}</p>
            <a className="primary-action" href="#provider-tools">
              View provider tools
            </a>
          </div>

          <figure className="hero-media">
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={`${clinicalPreparationRoom640} 640w, ${clinicalPreparationRoom960} 960w`}
                sizes="calc(100vw - 1.5rem)"
              />
              <source
                media="(max-width: 959px)"
                srcSet={`${clinicalPreparationRoom960} 960w`}
                sizes="calc(100vw - 2.5rem)"
              />
              <img
                src={clinicalPreparationRoom}
                srcSet={`${clinicalPreparationRoom960} 960w, ${clinicalPreparationRoom} 1586w`}
                sizes="(max-width: 1320px) 42vw, 575px"
                alt=""
                width="1586"
                height="992"
                fetchPriority="high"
              />
            </picture>
          </figure>
        </section>

        <section
          className="tools-section content-section"
          id="provider-tools"
          aria-labelledby="tools-heading"
        >
          <div className="section-heading">
            <h2 id="tools-heading">Choose the clinical reference</h2>
            <p>Open the tool that matches the task in front of you.</p>
          </div>

          <div className="tool-list">
            {toolCatalog.map((tool) => (
              <a className="tool-entry" href={tool.route} key={tool.id}>
                <div className="tool-meta">
                  <span className="tool-code">{tool.shortTitle}</span>
                  <span className="tool-status">{tool.status}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.scope}</p>
                <span className="tool-link-label">
                  Open reference <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section
          className="boundaries-section content-section"
          aria-labelledby="boundaries-heading"
        >
          <div className="boundary-intro">
            <h2 id="boundaries-heading">A clear clinical boundary</h2>
            <p>
              Data handling is explicit for each tool, while clinical
              responsibility stays with the provider and institution.
            </p>
          </div>

          <dl className="boundary-grid">
            {boundaries.map((boundary) => (
              <div key={boundary.title}>
                <dt>{boundary.title}</dt>
                <dd>{boundary.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="app-footer">
        <div>
          <p className="footer-lead">For provider use. Decision support only.</p>
          <p>
            PIG and RSI calculate locally. PREtendingMD uses authenticated
            Firebase sync. No tool in this release uses an AI runtime or
            analytics.
          </p>
        </div>
        <p className="footer-brand">CloseDose MD</p>
      </footer>
    </div>
  );
}

export default App;
