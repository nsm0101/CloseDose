import { useState } from 'react';
import { RSI_STANDALONE_TOOLS, SedationReference, StandaloneToolShell, WeightControl, type AgeGroup } from '@closedose-md/rsi-reference';

export default function App() {
  const [weight, setWeight] = useState(10);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('toddler');
  const [resetKey, setResetKey] = useState(0);
  const onReset = () => { setWeight(10); setAgeGroup('toddler'); setResetKey((key) => key + 1); };
  return (
    <StandaloneToolShell tool={RSI_STANDALONE_TOOLS['post-intubation']} currentWeight={weight} onReset={onReset} controls={<WeightControl weight={weight} onWeightChange={setWeight} ageGroup={ageGroup} onAgeGroupChange={setAgeGroup} />}>
      <SedationReference key={resetKey} weight={weight} ageGroup={ageGroup} />
    </StandaloneToolShell>
  );
}
