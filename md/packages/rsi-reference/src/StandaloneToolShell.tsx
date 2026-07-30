import type { ReactNode } from 'react';
import type { RsiStandaloneTool } from './index';

export function StandaloneToolShell({
  tool,
  currentWeight,
  controls,
  onReset,
  children
}: {
  tool: RsiStandaloneTool;
  currentWeight?: number;
  controls?: ReactNode;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rsi-shell">
      <a className="rsi-skip-link" href="#tool-content">Skip to tool</a>
      <header className="rsi-site-header">
        <a className="rsi-home-link" href="/" aria-label="CloseDose MD provider suite">
          <span className="rsi-brand-mark" aria-hidden="true">CD</span>
          <span>CloseDose MD</span>
        </a>
        <div className="rsi-header-actions">
          {typeof currentWeight === 'number' ? (
            <span className="rsi-weight-readout" aria-label={`Current weight ${currentWeight.toFixed(1)} kilograms`}>
              {currentWeight.toFixed(1)} kg
            </span>
          ) : null}
          <button className="rsi-reset" type="button" onClick={onReset}>Reset local tool</button>
        </div>
      </header>

      <main id="tool-content" className="rsi-main">
        <section className="rsi-intro" aria-labelledby="tool-title">
          <p className="rsi-eyebrow">Airway and RSI</p>
          <h1 id="tool-title">{tool.title}</h1>
          <p>{tool.purpose}</p>
        </section>

        {controls ? <section className="rsi-context" aria-label="Calculation context">{controls}</section> : null}

        <section className="rsi-workflow" data-workflow={tool.id} aria-label={tool.title}>
          {children}
        </section>

        <aside className="rsi-evidence" aria-label="Evidence and safety boundary">
          <div>
            <p className="rsi-evidence-label">Imported reference boundary</p>
            <h2>Clinical source preserved during route separation</h2>
          </div>
          <p>
            Clinical components and data remain byte-pinned to CC-RSI commit a309bda. Verify against current institutional protocols, patient-specific factors, and an independently confirmed weight before use.
          </p>
        </aside>
      </main>

      <footer className="rsi-footer">
        <span>Provider reference</span>
        <span>No identifiers, saved data, analytics, AI, or external runtime calls</span>
      </footer>
    </div>
  );
}
