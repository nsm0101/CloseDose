import { useMemo, useState } from 'react';
import {
  buildTransferHandoff,
  DEVICE_GUIDANCE_SOURCE,
  DEVICE_RELEASE_STATE,
  getRescueGuidance
} from './deviceGuidance.mjs';
import type {
  Breathing,
  Cuff,
  DeviceRescueContext,
  InnerCannula,
  SuctionPassage,
  TracheostomyMaturity,
  UpperAirwayPatency,
  VentilatorDependence
} from './deviceGuidance.d.ts';

const steps = ['Act now', 'Identify', 'Troubleshoot', 'Equipment', 'Handoff'];
const publicReleaseApproved = DEVICE_RELEASE_STATE.publicReleaseApproved;
const releaseStatus = DEVICE_RELEASE_STATE.status;
const releaseDetail = DEVICE_RELEASE_STATE.detail;

const initialContext: DeviceRescueContext = {
  upperAirwayPatency: 'unknown',
  breathing: 'not-assessed',
  suctionPassage: 'not-assessed',
  cuff: 'unknown',
  innerCannula: 'unknown',
  tracheostomyMaturity: 'uncertain',
  ventilatorDependence: 'unknown',
  deviceDetails: {
    tubeType: '',
    tubeSize: '',
    tubeLength: ''
  },
  caregiverConfirmedBaseline: '',
  observedFailure: '',
  actionsTaken: [],
  currentOxygenationVentilationRoute: '',
  equipmentAccompanyingChild: []
};

type Choice<T extends string> = {
  value: T;
  label: string;
};

function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  choices,
  onChange
}: {
  legend: string;
  name: string;
  value: T;
  choices: Choice<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="choice-group">
      <legend>{legend}</legend>
      <div className="choice-row">
        {choices.map((choice) => (
          <label
            className={value === choice.value ? 'choice selected' : 'choice'}
            key={choice.value}
          >
            <input
              checked={value === choice.value}
              name={name}
              onChange={() => onChange(choice.value)}
              type="radio"
            />
            <span>{choice.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Checklist({
  items,
  selected,
  onChange
}: {
  items: string[];
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  const toggle = (item: string) => {
    onChange(
      selected.includes(item)
        ? selected.filter((entry) => entry !== item)
        : [...selected, item]
    );
  };

  return (
    <div className="checklist">
      {items.map((item) => (
        <label className="check-row" key={item}>
          <input
            checked={selected.includes(item)}
            onChange={() => toggle(item)}
            type="checkbox"
          />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [context, setContext] = useState<DeviceRescueContext>(initialContext);
  const [copyStatus, setCopyStatus] = useState('');

  const guidance = useMemo(() => getRescueGuidance(context), [context]);
  const handoff = useMemo(() => buildTransferHandoff(context), [context]);

  const updateContext = <K extends keyof DeviceRescueContext>(
    field: K,
    value: DeviceRescueContext[K]
  ) => {
    setContext((current) => ({ ...current, [field]: value }));
  };

  const updateDeviceDetail = (
    field: 'tubeType' | 'tubeSize' | 'tubeLength',
    value: string
  ) => {
    setContext((current) => ({
      ...current,
      deviceDetails: { ...current.deviceDetails, [field]: value }
    }));
  };

  const startRescue = () => {
    setStarted(true);
    setActiveStep(0);
  };

  const copyHandoff = async () => {
    try {
      await navigator.clipboard.writeText(handoff);
      setCopyStatus('Handoff copied');
    } catch {
      setCopyStatus(
        'Copy failed. Select and copy the handoff preview manually.'
      );
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to rescue content
      </a>

      <header className="site-header">
        <a className="return-link" href="/">
          CloseDose MD
        </a>
        <div>
          <p className="eyebrow">Pediatric airway support</p>
          <h1>Peds Device Rescue</h1>
        </div>
        <div className="review-badge" role="status">
          <span className="status-dot" aria-hidden="true" />
          <span>
            <strong>{releaseStatus}</strong>
            <small>{releaseDetail}</small>
          </span>
        </div>
      </header>

      <aside className="emergency-strip" aria-label="Immediate emergency actions">
        <strong>Call for help</strong>
        <span aria-hidden="true" />
        <strong>Oxygen to face and stoma</strong>
      </aside>

      <main id="main-content">
        {!started ? (
          <section className="start-view" aria-labelledby="start-title">
            <div className="start-copy">
              <p className="kicker">Tracheostomy emergency review pathway</p>
              <h2 id="start-title">
                Support the first critical actions, then prepare a clear handoff.
              </h2>
              <p>
                This review application organizes a deterministic emergency
                sequence. It does not diagnose, replace training, or replace
                local emergency protocols.
              </p>
              <button className="primary-action" onClick={startRescue} type="button">
                Start tracheostomy rescue
              </button>
            </div>
            <aside className="gate-card" aria-label="Release status">
              <p className="gate-label">
                {publicReleaseApproved ? 'Release scope' : 'Clinical release gate'}
              </p>
              <h3>{releaseDetail}</h3>
              <p>
                {publicReleaseApproved
                  ? 'Use with local emergency protocols, trained responders, and the named evidence boundary.'
                  : 'Simulated review only. Required clinical, safety, accessibility, and regulatory reviews remain open.'}
              </p>
            </aside>
          </section>
        ) : (
          <div className="workflow">
            <nav className="step-nav" aria-label="Rescue workflow">
              {steps.map((step, index) => (
                <button
                  aria-current={activeStep === index ? 'step' : undefined}
                  className={activeStep === index ? 'step active' : 'step'}
                  key={step}
                  onClick={() => setActiveStep(index)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  {step}
                </button>
              ))}
            </nav>

            <section className="workflow-panel">
              {activeStep === 0 && (
                <div className="panel-content">
                  <p className="section-label">Act now</p>
                  <h2>Begin with these actions for every branch</h2>
                  <ol className="urgent-list">
                    {guidance.immediateActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ol>
                  <ChoiceGroup<Breathing>
                    legend="Is the child breathing?"
                    name="breathing"
                    value={context.breathing}
                    choices={[
                      { value: 'present', label: 'Breathing present' },
                      { value: 'absent', label: 'Breathing absent' }
                    ]}
                    onChange={(value) => updateContext('breathing', value)}
                  />
                  {context.breathing === 'absent' && (
                    <div className="danger-card" role="alert">
                      <strong>Breathing absent</strong>
                      <ul>
                        {guidance.breathingSupport.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeStep === 1 && (
                <div className="panel-content">
                  <p className="section-label">Identify</p>
                  <h2>Ask the caregiver and identify the device</h2>
                  <div className="question-card">
                    <h3>Caregiver questions</h3>
                    <ul>
                      <li>What is normal for breathing and secretions?</li>
                      <li>Can the child normally breathe through the mouth or nose?</li>
                      <li>Is the child dependent on a ventilator?</li>
                      <li>When was the tracheostomy created or last changed?</li>
                    </ul>
                  </div>
                  <div className="field-grid">
                    <label>
                      Tube type
                      <input
                        onChange={(event) =>
                          updateDeviceDetail('tubeType', event.target.value)
                        }
                        placeholder="unknown"
                        type="text"
                        value={context.deviceDetails?.tubeType ?? ''}
                      />
                    </label>
                    <label>
                      Tube size
                      <input
                        onChange={(event) =>
                          updateDeviceDetail('tubeSize', event.target.value)
                        }
                        placeholder="unknown"
                        type="text"
                        value={context.deviceDetails?.tubeSize ?? ''}
                      />
                    </label>
                    <label>
                      Tube length
                      <input
                        onChange={(event) =>
                          updateDeviceDetail('tubeLength', event.target.value)
                        }
                        placeholder="unknown"
                        type="text"
                        value={context.deviceDetails?.tubeLength ?? ''}
                      />
                    </label>
                  </div>
                  <label className="full-field">
                    Caregiver-confirmed baseline
                    <textarea
                      onChange={(event) =>
                        updateContext(
                          'caregiverConfirmedBaseline',
                          event.target.value
                        )
                      }
                      placeholder="Record only relevant clinical baseline. Do not enter identifiers."
                      value={context.caregiverConfirmedBaseline}
                    />
                  </label>
                  <ChoiceGroup<VentilatorDependence>
                    legend="Ventilator dependence"
                    name="ventilator-dependence"
                    value={context.ventilatorDependence}
                    choices={[
                      { value: 'dependent', label: 'Dependent' },
                      { value: 'not-dependent', label: 'Not dependent' },
                      { value: 'unknown', label: 'Unknown' }
                    ]}
                    onChange={(value) =>
                      updateContext('ventilatorDependence', value)
                    }
                  />
                  <ChoiceGroup<TracheostomyMaturity>
                    legend="Tracheostomy state"
                    name="tracheostomy-maturity"
                    value={context.tracheostomyMaturity}
                    choices={[
                      { value: 'established', label: 'Established' },
                      { value: 'fresh', label: 'Fresh' },
                      { value: 'uncertain', label: 'Uncertain' }
                    ]}
                    onChange={(value) =>
                      updateContext('tracheostomyMaturity', value)
                    }
                  />
                </div>
              )}

              {activeStep === 2 && (
                <div className="panel-content">
                  <p className="section-label">Troubleshoot</p>
                  <h2>Check patency without inferring a diagnosis</h2>
                  <ChoiceGroup<SuctionPassage>
                    legend="Can a suction catheter pass?"
                    name="suction-passage"
                    value={context.suctionPassage}
                    choices={[
                      { value: 'passable', label: 'Passes' },
                      { value: 'not-passable', label: 'Does not pass' }
                    ]}
                    onChange={(value) => updateContext('suctionPassage', value)}
                  />
                  <ChoiceGroup<InnerCannula>
                    legend="Inner cannula"
                    name="inner-cannula"
                    value={context.innerCannula}
                    choices={[
                      { value: 'present', label: 'Present' },
                      { value: 'absent', label: 'Absent' },
                      { value: 'unknown', label: 'Unknown' }
                    ]}
                    onChange={(value) => updateContext('innerCannula', value)}
                  />
                  <ChoiceGroup<Cuff>
                    legend="Cuff"
                    name="cuff"
                    value={context.cuff}
                    choices={[
                      { value: 'present', label: 'Present' },
                      { value: 'absent', label: 'Absent' },
                      { value: 'unknown', label: 'Unknown' }
                    ]}
                    onChange={(value) => updateContext('cuff', value)}
                  />
                  <ChoiceGroup<UpperAirwayPatency>
                    legend="Upper-airway patency"
                    name="upper-airway-patency"
                    value={context.upperAirwayPatency}
                    choices={[
                      { value: 'patent', label: 'Patent' },
                      { value: 'obstructed', label: 'Obstructed' },
                      { value: 'unknown', label: 'Unknown' }
                    ]}
                    onChange={(value) =>
                      updateContext('upperAirwayPatency', value)
                    }
                  />

                  {guidance.tubeStatus !== 'not-assessed' ? (
                    <div className="guidance-grid" aria-live="polite">
                      <article className="guidance-card">
                        <p className="card-label">Tube status</p>
                        <h3>
                          {guidance.tubeStatus === 'patent'
                            ? 'Tube patent'
                            : 'Patency not confirmed'}
                        </h3>
                        <ol>
                          {guidance.troubleshooting.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ol>
                      </article>
                      <article className="guidance-card">
                        <p className="card-label">Ventilation route</p>
                        <ul>
                          {guidance.ventilationRoutes.map((route) => (
                            <li key={route}>{route}</li>
                          ))}
                        </ul>
                      </article>
                    </div>
                  ) : (
                    <div className="observation-prompt" role="status">
                      Record whether a suction catheter passes before viewing
                      tube-patency guidance.
                    </div>
                  )}

                  {guidance.warnings.length > 0 && (
                    <div className="danger-card" role="alert">
                      <strong>Dangerous-action warning</strong>
                      <ul>
                        {guidance.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeStep === 3 && (
                <div className="panel-content">
                  <p className="section-label">Equipment</p>
                  <h2>Prepare rescue and transfer equipment</h2>
                  <div className="equipment-alert">
                    <strong>Prepare both spare tubes now</strong>
                    <p>
                      Same-size spare tracheostomy tube and half-size-smaller
                      spare tracheostomy tube.
                    </p>
                  </div>
                  <Checklist
                    items={[
                      'Same-size spare tracheostomy tube',
                      'Half-size-smaller spare tracheostomy tube',
                      'Suction equipment and catheters',
                      'Bag-mask ventilation equipment',
                      'Child-specific emergency equipment'
                    ]}
                    selected={context.equipmentAccompanyingChild ?? []}
                    onChange={(value) =>
                      updateContext('equipmentAccompanyingChild', value)
                    }
                  />
                  <div className="danger-card" role="alert">
                    <strong>Do not perform an unfamiliar tube change</strong>
                    <p>
                      Tube change language applies only to trained responders
                      when the tracheostomy is established. Do not attempt blind
                      reinsertion into a fresh or uncertain tract.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="panel-content">
                  <p className="section-label">Handoff</p>
                  <h2>Prepare an identifier-free transfer handoff</h2>
                  <p className="privacy-note">
                    Do not enter a name, record number, birth date, address, or
                    contact information. Unknown values remain explicit.
                  </p>
                  <label className="full-field">
                    Observed failure
                    <textarea
                      onChange={(event) =>
                        updateContext('observedFailure', event.target.value)
                      }
                      placeholder="What was observed?"
                      value={context.observedFailure}
                    />
                  </label>
                  <label className="full-field">
                    Current oxygenation and ventilation route
                    <input
                      onChange={(event) =>
                        updateContext(
                          'currentOxygenationVentilationRoute',
                          event.target.value
                        )
                      }
                      placeholder="unknown"
                      type="text"
                      value={context.currentOxygenationVentilationRoute}
                    />
                  </label>
                  <Checklist
                    items={[
                      'Called for help',
                      'Applied oxygen to face and stoma',
                      'Opened the airway',
                      'Attempted suction',
                      'Gave rescue breaths',
                      'Started CPR'
                    ]}
                    selected={context.actionsTaken ?? []}
                    onChange={(value) => updateContext('actionsTaken', value)}
                  />
                  <div className="handoff-block">
                    <div>
                      <p className="card-label">Transfer handoff preview</p>
                      <p>No identifiers. No saved data.</p>
                    </div>
                    <pre aria-label="Selectable handoff preview" tabIndex={0}>
                      {handoff}
                    </pre>
                    <button
                      className="secondary-action"
                      onClick={copyHandoff}
                      type="button"
                    >
                      Copy identifier-free handoff
                    </button>
                    <span aria-live="polite">{copyStatus}</span>
                  </div>
                </div>
              )}

              <div className="panel-footer">
                <button
                  className="text-action"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
                  type="button"
                >
                  Previous
                </button>
                {activeStep < steps.length - 1 && (
                  <button
                    className="secondary-action"
                    onClick={() =>
                      setActiveStep((step) =>
                        Math.min(steps.length - 1, step + 1)
                      )
                    }
                    type="button"
                  >
                    Continue to {steps[activeStep + 1]}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        <section className="evidence-panel" aria-labelledby="evidence-title">
          <div>
            <p className="section-label">Evidence and version</p>
            <h2 id="evidence-title">{DEVICE_GUIDANCE_SOURCE.title}</h2>
          </div>
          <dl>
            <div>
              <dt>Source</dt>
              <dd>{DEVICE_GUIDANCE_SOURCE.organization}</dd>
            </div>
            <div>
              <dt>Source review</dt>
              <dd>{DEVICE_GUIDANCE_SOURCE.reviewDate}</dd>
            </div>
            <div>
              <dt>Application version</dt>
              <dd>0.1.0</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{DEVICE_GUIDANCE_SOURCE.status}</dd>
            </div>
          </dl>
        </section>
      </main>

      <footer>
        <p>
          Review application only. No identifiers, saved data, analytics, AI,
          or external runtime calls.
        </p>
        <a href="/">Return to CloseDose MD</a>
      </footer>
    </div>
  );
}
