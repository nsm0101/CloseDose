import { useState } from 'react';
import { RSI_STANDALONE_TOOLS, StandaloneToolShell } from '@closedose-md/rsi-reference';
import IntegratedScenarioGuide from './IntegratedScenarioGuide';

export default function App() {
  const [weight, setWeight] = useState(10);
  const [resetKey, setResetKey] = useState(0);
  const onReset = () => { setWeight(10); setResetKey((key) => key + 1); };
  return (
    <StandaloneToolShell
      tool={RSI_STANDALONE_TOOLS['airway-scenarios']}
      currentWeight={weight}
      onReset={onReset}
    >
      <IntegratedScenarioGuide key={resetKey} weight={weight} onWeightChange={setWeight} />
    </StandaloneToolShell>
  );
}
