(function (global) {
  if (global.CloseDoseAllergyCalculator && typeof global.CloseDoseAllergyCalculator.mount === 'function') return;

  const LBS_PER_KG = 2.20462;
  const MEDICATIONS = {
    cetirizine: {
      label: 'Cetirizine', brand: 'Zyrtec®', purpose: 'Daily allergy relief or hives', concentration: '1 mg / mL liquid', minMonths: 24,
      doses: [{ minMonths: 24, maxMonths: 71, text: '2.5 mg (2.5 mL) by mouth once daily. Ask your clinician before increasing.' }, { minMonths: 72, text: '5–10 mg (5–10 mL) by mouth once daily.' }],
      notes: ['May cause sleepiness in some children.', 'Do not combine with another oral antihistamine unless directed.']
    },
    loratadine: {
      label: 'Loratadine', brand: 'Claritin®', purpose: 'Daily allergy relief', concentration: '5 mg / 5 mL liquid', minMonths: 24,
      doses: [{ minMonths: 24, maxMonths: 71, text: '5 mg (5 mL) by mouth once daily.' }, { minMonths: 72, text: '10 mg (10 mL) by mouth once daily.' }],
      notes: ['Usually less sedating than older antihistamines.', 'Do not combine with another oral antihistamine unless directed.']
    },
    fexofenadine: {
      label: 'Fexofenadine', brand: 'Allegra®', purpose: 'Daily allergy relief', concentration: '30 mg / 5 mL liquid', minMonths: 24,
      doses: [{ minMonths: 24, maxMonths: 143, text: '30 mg (5 mL) by mouth twice daily.' }, { minMonths: 144, text: '60 mg twice daily or 180 mg once daily.' }],
      notes: ['Avoid taking with fruit juice because it can reduce absorption.', 'Use the product label for your exact formulation.']
    },
    diphenhydramine: {
      label: 'Diphenhydramine', brand: 'Benadryl®', purpose: 'Short-term hives/allergic symptoms only', concentration: '12.5 mg / 5 mL liquid', minMonths: 72, weightBased: true,
      notes: ['Not a first-choice daily allergy medicine.', 'Can cause marked sleepiness or paradoxical agitation.', 'Do not use to make a child sleepy.']
    }
  };

  function ageMonths(value, unit) { return unit === 'years' ? value * 12 : value; }
  function formatMl(value) { return (Math.round(value * 2) / 2).toFixed(1).replace('.0', ''); }
  function escapeHtml(value) { return String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function mount(host) {
    if (!host) return;
    host.innerHTML = `
      <section class="card allergy-calculator" aria-labelledby="allergy-calculator-title">
        <div class="allergy-calculator__header">
          <span class="section-eyebrow">Allergy calculator</span>
          <h2 id="allergy-calculator-title">Children's allergy medicine dosing</h2>
          <p>Choose an antihistamine, enter age and weight, and get parent-friendly guidance. For wheezing, trouble breathing, face/tongue swelling, or severe reaction symptoms, call 911.</p>
        </div>
        <form class="allergy-calculator__form" novalidate>
          <label>Medicine
            <select name="medicine">
              <option value="cetirizine">Cetirizine / Zyrtec®</option>
              <option value="loratadine">Loratadine / Claritin®</option>
              <option value="fexofenadine">Fexofenadine / Allegra®</option>
              <option value="diphenhydramine">Diphenhydramine / Benadryl®</option>
            </select>
          </label>
          <div class="allergy-calculator__row">
            <label>Age
              <input name="age" type="number" min="0" step="0.1" placeholder="Age" inputmode="decimal" required />
            </label>
            <label>Age unit
              <select name="ageUnit"><option value="years">years</option><option value="months">months</option></select>
            </label>
          </div>
          <div class="allergy-calculator__row">
            <label>Weight
              <input name="weight" type="number" min="0" step="0.1" placeholder="Weight" inputmode="decimal" required />
            </label>
            <label>Weight unit
              <select name="weightUnit"><option value="lbs">lbs</option><option value="kg">kg</option></select>
            </label>
          </div>
          <button type="submit" class="primary-button">Calculate allergy dose</button>
        </form>
        <div class="allergy-calculator__result" aria-live="polite"></div>
      </section>`;

    const form = host.querySelector('form');
    const result = host.querySelector('.allergy-calculator__result');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const med = MEDICATIONS[data.get('medicine')];
      const ageValue = parseFloat(data.get('age'));
      const weightValue = parseFloat(data.get('weight'));
      const months = ageMonths(ageValue, data.get('ageUnit'));
      const kg = data.get('weightUnit') === 'lbs' ? weightValue / LBS_PER_KG : weightValue;
      if (!med || !ageValue || ageValue <= 0 || !weightValue || weightValue <= 0) {
        result.innerHTML = '<div class="warning-card warning-card--orange"><strong>Check the form.</strong> Enter a valid age and weight.</div>';
        return;
      }
      if (months < 12) {
        result.innerHTML = '<div class="warning-card warning-card--red-soft"><strong>Ask your child\'s clinician first.</strong> Children under 1 year need individualized allergy guidance. Call 911 for breathing trouble, severe swelling, or a rapidly worsening reaction.</div>';
        return;
      }
      if (months < med.minMonths) {
        result.innerHTML = `<div class="warning-card warning-card--red-soft"><strong>Clinician guidance needed.</strong> ${escapeHtml(med.brand)} dosing is not shown for this age group on CloseDose. Please contact your pediatrician or pharmacist.</div>`;
        return;
      }
      let doseText = '';
      if (med.weightBased) {
        const mg = Math.min(50, Math.round(kg * 1));
        const ml = formatMl((mg / 12.5) * 5);
        doseText = `${mg} mg (${ml} mL) by mouth every 6 hours as needed. Do not exceed 6 doses in 24 hours unless your clinician gives different instructions.`;
      } else {
        const band = med.doses.find(d => months >= d.minMonths && (!d.maxMonths || months <= d.maxMonths));
        doseText = band ? band.text : 'Use the product label or ask your clinician for this age.';
      }
      result.innerHTML = `
        <article class="result-card allergy-result-card">
          <h3>${escapeHtml(med.label)} <span>${escapeHtml(med.brand)}</span></h3>
          <p class="result-weight"><span>Patient weight</span><br><strong>${kg.toFixed(1)} kg (${(kg * LBS_PER_KG).toFixed(1)} lbs)</strong></p>
          <p><strong>Suggested dose:</strong> ${escapeHtml(doseText)}</p>
          <p><strong>Common liquid:</strong> ${escapeHtml(med.concentration)}</p>
          <ul>${med.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
          <div class="warning-card warning-card--teal"><strong>Safety reminder</strong> Use only one oral antihistamine at a time unless directed. Seek emergency care for trouble breathing, severe swelling, or signs of anaphylaxis.</div>
        </article>`;
    });
  }

  global.CloseDoseAllergyCalculator = { mount, medications: MEDICATIONS };
})(window);
