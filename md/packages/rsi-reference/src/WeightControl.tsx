import type { AgeGroup } from './index';

const ageGroups: readonly { value: AgeGroup; label: string }[] = [
  { value: 'infant', label: 'Infant' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' },
  { value: 'adolescent', label: 'Adolescent' }
];

export function WeightControl({
  weight,
  onWeightChange,
  ageGroup,
  onAgeGroupChange
}: {
  weight: number;
  onWeightChange: (weight: number) => void;
  ageGroup?: AgeGroup;
  onAgeGroupChange?: (ageGroup: AgeGroup) => void;
}) {
  return (
    <div className="rsi-control-grid">
      <label className="rsi-field">
        <span>Verified weight</span>
        <span className="rsi-number-field">
          <input
            aria-describedby="weight-boundary"
            inputMode="decimal"
            min="0.1"
            max="150"
            step="0.1"
            type="number"
            value={weight}
            onChange={(event) => {
              const next = event.currentTarget.valueAsNumber;
              if (Number.isFinite(next) && next > 0 && next <= 150) onWeightChange(next);
            }}
          />
          <span>kg</span>
        </span>
        <small id="weight-boundary">Enter a weight above 0 and up to 150 kg. Confirm independently.</small>
      </label>

      {ageGroup && onAgeGroupChange ? (
        <label className="rsi-field">
          <span>Age group</span>
          <select value={ageGroup} onChange={(event) => onAgeGroupChange(event.currentTarget.value as AgeGroup)}>
            {ageGroups.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <small>Select explicitly. Weight does not infer age in this tool.</small>
        </label>
      ) : null}
    </div>
  );
}
