import { useState } from 'react';
import { RSI_STANDALONE_TOOLS, ScenarioGuide, StandaloneToolShell, WeightControl } from '@closedose-md/rsi-reference';
import IntegratedScenarioGuide from './IntegratedScenarioGuide';

declare const __CLOSEDOSE_MD_BUILD_MODE__: string;

export default function App() {
  const [weight, setWeight] = useState(10);
  const [resetKey, setResetKey] = useState(0);
  const isClinicalReview = __CLOSEDOSE_MD_BUILD_MODE__ === 'review';
  const onReset = () => { setWeight(10); setResetKey((key) => key + 1); };
  return (
    <StandaloneToolShell
      tool={RSI_STANDALONE_TOOLS['airway-scenarios']}
      currentWeight={weight}
      onReset={onReset}
      controls={isClinicalReview ? undefined : <WeightControl weight={weight} onWeightChange={setWeight} />}
    >
      {isClinicalReview ? (
        <IntegratedScenarioGuide key={resetKey} weight={weight} onWeightChange={setWeight} />
      ) : (
        <div className="airway-scenario-legacy">
          <ScenarioGuide key={resetKey} weight={weight} />
        </div>
      )}
    </StandaloneToolShell>
  );
}
