import { useMemo, useState } from 'react';

import closeDoseMark from './assets/closedose-mark-teal.png';
import clinicalPreparationRoom640 from './assets/clinical-preparation-room-640.webp';
import clinicalPreparationRoom960 from './assets/clinical-preparation-room-960.webp';
import clinicalPreparationRoom from './assets/clinical-preparation-room.webp';
import {
  categoryOrder,
  toolCatalog,
  type ToolCatalogEntry,
  type ToolStatus
} from './toolCatalog.ts';

const HERO_LEDE = 'Pediatric airway, RSI, and emergency workflow tools for focused point-of-care support.';

const actionLabels = {
  Available: 'Open tool',
  'Clinical review': 'Awaiting approval',
  Planned: 'Planned module'
} as const;

const audienceFilters = ['All clinicians', 'Community EM', 'PEM'] as const;
const statusFilters = ['All statuses', 'Available', 'Clinical review', 'Planned'] as const;
type AudienceFilter = (typeof audienceFilters)[number];
type StatusFilter = (typeof statusFilters)[number];

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
    title: 'Clinical review stays closed',
    description:
      'Device Rescue and the Sedation Console remain unavailable until named clinical, pharmacy, institutional, and regulatory approvals are recorded.'
  },
  {
    title: 'PREtendingMD: approved Firebase workspace',
    description:
      'Administrator-approved users synchronize patient first name and last initial, room, complaint, workflow notes, vitals, provider contact details, labs, imaging, and shift-team data through Firebase.'
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

function ToolContent({ tool }: { tool: ToolCatalogEntry }) {
  return (
    <>
      <div className="tool-identity">
        <span className="tool-code">{tool.shortTitle}</span>
        <span className={`tool-status tool-status-${tool.status.toLowerCase().replace(' ', '-')}`}>
          {tool.status}
        </span>
      </div>
      <div className="tool-copy">
        <h4>{tool.title}</h4>
        <p>{tool.task}</p>
        <dl className="tool-details">
          <div>
            <dt>Audience</dt>
            <dd>{tool.audience.join(', ')}</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{tool.evidenceVersion ?? 'Baseline pending'}</dd>
          </div>
          <div>
            <dt>Clinical review</dt>
            <dd>{tool.clinicalReviewDate ?? 'Not recorded'}</dd>
          </div>
        </dl>
      </div>
      <span className="tool-action">
        {actionLabels[tool.status]}
        {tool.publiclyAccessible ? <span aria-hidden="true">→</span> : null}
      </span>
    </>
  );
}

function App() {
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('All clinicians');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All statuses');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();
    return toolCatalog.filter((tool) => {
      const searchable = [
        tool.title.toLowerCase(),
        tool.shortTitle.toLowerCase(),
        tool.task.toLowerCase(),
        tool.category.toLowerCase(),
        tool.audience.join(' ').toLowerCase()
      ].join(' ');
      const matchesSearch = query.length === 0 || searchable.includes(query);
      const matchesAudience =
        audienceFilter === 'All clinicians' || tool.audience.includes(audienceFilter);
      const matchesStatus = statusFilter === 'All statuses' || tool.status === statusFilter;
      return matchesSearch && matchesAudience && matchesStatus;
    });
  }, [audienceFilter, search, statusFilter]);

  const groupedTools = categoryOrder
    .map((category) => ({
      category,
      tools: filteredTools.filter((tool) => tool.category === category)
    }))
    .filter((group) => group.tools.length > 0);

  const hasActiveFilters =
    search.length > 0 || audienceFilter !== 'All clinicians' || statusFilter !== 'All statuses';

  function resetFilters() {
    setSearch('');
    setAudienceFilter('All clinicians');
    setStatusFilter('All statuses');
  }

  return (
    <div className="site-shell">
      <header className="app-header">
        <nav className="app-nav" aria-label="Primary">
          <a className="brand" href="/" aria-label="CloseDose MD home">
            <img src={closeDoseMark} alt="" width="180" height="180" />
            <span>CloseDose MD</span>
          </a>
          <span className="nav-context">Provider tools</span>
          <a className="nav-link" href="#provider-tools">Tools</a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <p className="eyebrow">Pediatric emergency medicine</p>
            <h1 id="hero-heading">
              <span>Clinical tools.</span>
              <span>Ready when needed.</span>
            </h1>
            <p>{HERO_LEDE}</p>
            <a className="primary-action" href="#provider-tools">View provider tools</a>
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
            <figcaption>Built for uncommon, high-risk pediatric workflows.</figcaption>
          </figure>
        </section>

        <section className="tools-section content-section" id="provider-tools" aria-labelledby="tools-heading">
          <div className="section-heading">
            <p className="section-kicker">Provider suite</p>
            <h2 id="tools-heading">Find the next bedside task</h2>
            <p>Search the suite or narrow it to your clinical setting and release needs.</p>
          </div>

          <div className="discovery-panel" aria-label="Tool filters">
            <label className="search-field">
              <span>Search provider tools</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Airway, transport, newborn..."
              />
            </label>

            <div className="advanced-filters">
              <button
                type="button"
                className="filter-toggle"
                aria-expanded={filtersOpen}
                aria-controls="provider-filter-groups"
                onClick={() => setFiltersOpen((open) => !open)}
              >
                Audience and status
              </button>
              <div
                className={`filter-groups ${filtersOpen ? 'filter-groups-open' : ''}`}
                id="provider-filter-groups"
              >
                <fieldset>
                  <legend>Audience</legend>
                  <div className="filter-row">
                    {audienceFilters.map((filter) => (
                      <button
                        type="button"
                        key={filter}
                        aria-pressed={audienceFilter === filter}
                        onClick={() => setAudienceFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Status</legend>
                  <div className="filter-row">
                    {statusFilters.map((filter) => (
                      <button
                        type="button"
                        key={filter}
                        aria-pressed={statusFilter === filter}
                        onClick={() => setStatusFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="filter-summary">
              <p aria-live="polite">
                {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} shown
              </p>
              {hasActiveFilters && groupedTools.length > 0 ? (
                <button type="button" className="reset-filter" onClick={resetFilters}>Reset filters</button>
              ) : null}
            </div>
          </div>

          {groupedTools.length > 0 ? (
            <div className="catalog-groups">
              {groupedTools.map((group) => (
                <section className="catalog-group" key={group.category} aria-labelledby={`category-${group.category.replaceAll(' ', '-').toLowerCase()}`}>
                  <div className="category-heading">
                    <h3 id={`category-${group.category.replaceAll(' ', '-').toLowerCase()}`}>{group.category}</h3>
                    <span>{group.tools.length}</span>
                  </div>
                  <div className="tool-list">
                    {group.tools.map((tool) =>
                      tool.publiclyAccessible ? (
                        <a className="tool-entry" href={tool.canonicalRoute} key={tool.id}>
                          <ToolContent tool={tool} />
                        </a>
                      ) : (
                        <article className="tool-entry tool-entry-unavailable" key={tool.id} aria-label={`${tool.title}, ${tool.status}`}>
                          <ToolContent tool={tool} />
                        </article>
                      )
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-title">No tools match these filters</p>
              <p>Try another term or return to the full provider suite.</p>
              <button type="button" onClick={resetFilters}>Reset filters</button>
            </div>
          )}
        </section>

        <section className="boundaries-section content-section" aria-labelledby="boundaries-heading">
          <div className="boundary-intro">
            <p className="section-kicker">Release boundary</p>
            <h2 id="boundaries-heading">Clear about what each tool does</h2>
            <p>Data handling is explicit while clinical responsibility stays with the provider and institution.</p>
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
            PIG and RSI calculate locally. PREtendingMD persists patient and operational shift data in an access-controlled Firebase workspace. No tool in this release uses an AI runtime or analytics.
          </p>
        </div>
        <p className="footer-brand">CloseDose MD</p>
      </footer>
    </div>
  );
}

export default App;
