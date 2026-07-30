import { useState } from 'react';
import {
  DosingCalculator,
  RSI_STANDALONE_TOOLS,
  StandaloneToolShell,
  type AgeGroup
} from '@closedose-md/rsi-reference';

export default function App() {
  const [weight, setWeight] = useState(10);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('toddler');
  const [resetKey, setResetKey] = useState(0);

  const onReset = () => {
    setWeight(10);
    setAgeGroup('toddler');
    setResetKey((key) => key + 1);
  };

  return (
    <StandaloneToolShell
      tool={RSI_STANDALONE_TOOLS['rsi-medications']}
      currentWeight={weight}
      onReset={onReset}
    >
      <DosingCalculator
        key={resetKey}
        weight={weight}
        setWeight={setWeight}
        ageGroup={ageGroup}
        setAgeGroup={setAgeGroup}
      />
    </StandaloneToolShell>
  );
}
