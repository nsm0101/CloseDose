import { useState } from 'react';
import { RSI_STANDALONE_TOOLS, ScenarioGuide, StandaloneToolShell, WeightControl } from '@closedose-md/rsi-reference';

export default function App() {
  const [weight, setWeight] = useState(10);
  const [resetKey, setResetKey] = useState(0);
  const onReset = () => { setWeight(10); setResetKey((key) => key + 1); };
  return (
    <StandaloneToolShell tool={RSI_STANDALONE_TOOLS['airway-scenarios']} currentWeight={weight} onReset={onReset} controls={<WeightControl weight={weight} onWeightChange={setWeight} />}>
      <ScenarioGuide key={resetKey} weight={weight} />
    </StandaloneToolShell>
  );
}
