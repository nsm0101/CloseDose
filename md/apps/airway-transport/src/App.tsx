import { useState } from 'react';
import { RSI_STANDALONE_TOOLS, StandaloneToolShell, TransportKit, WeightControl } from '@closedose-md/rsi-reference';

export default function App() {
  const [weight, setWeight] = useState(10);
  const [resetKey, setResetKey] = useState(0);
  const onReset = () => { setWeight(10); setResetKey((key) => key + 1); };
  return (
    <StandaloneToolShell tool={RSI_STANDALONE_TOOLS['airway-transport']} currentWeight={weight} onReset={onReset} controls={<WeightControl weight={weight} onWeightChange={setWeight} />}>
      <TransportKit key={resetKey} weight={weight} />
    </StandaloneToolShell>
  );
}
