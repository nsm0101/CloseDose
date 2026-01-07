(() => {
  const NFC_OVERLAY_ID = 'nfc-overlay';
  const NFC_SCAN_BUTTON_ID = 'nfc-scan-button';
  const FAMILY_STORAGE_KEY = 'closeDoseFamilyMembers';
  const HISTORY_STORAGE_KEY = 'closeDoseDoseHistory';

  const defaultFamilyMembers = [
    {
      id: 'member-1',
      name: 'Avery',
      weightLbs: 38,
      weightKg: 17.2,
    },
    {
      id: 'member-2',
      name: 'Jordan',
      weightLbs: 62,
      weightKg: 28.1,
    },
  ];

  const overlayState = {
    medId: null,
    medication: null,
  };

  const slugify = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const formatTimeSince = (dateValue) => {
    if (!dateValue) {
      return 'No dose logged yet.';
    }
    const diffMs = Date.now() - new Date(dateValue).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours <= 0) {
      return `${minutes} minutes ago`;
    }
    if (minutes === 0) {
      return `${hours} hours ago`;
    }
    return `${hours} hours ${minutes} minutes ago`;
  };

  const loadFamilyMembers = () => {
    const stored = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        localStorage.removeItem(FAMILY_STORAGE_KEY);
      }
    }
    localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(defaultFamilyMembers));
    return defaultFamilyMembers;
  };

  const loadDoseHistory = () => {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      }
    }
    return [];
  };

  const saveDoseHistory = (history) => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  };

  const createOverlay = () => {
    if (document.getElementById(NFC_OVERLAY_ID)) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = NFC_OVERLAY_ID;
    overlay.className = 'nfc-overlay';
    overlay.innerHTML = `
      <div class="nfc-overlay__backdrop" data-nfc-close></div>
      <div class="nfc-card" role="dialog" aria-modal="true" aria-labelledby="nfc-card-title">
        <div class="nfc-card__header">
          <div>
            <h2 id="nfc-card-title" class="nfc-card__title">NFC medication scan</h2>
            <div class="nfc-pill" id="nfc-status">Tap a medication tag to pull details.</div>
          </div>
          <button class="nfc-card__close" type="button" data-nfc-close>Close</button>
        </div>
        <div class="nfc-grid">
          <section class="nfc-section">
            <h3>Medication</h3>
            <p><strong id="nfc-med-brand">—</strong> <span id="nfc-med-name"></span></p>
            <div class="nfc-grid two-column">
              <div>
                <span class="nfc-label">Dosage</span>
                <div id="nfc-med-dose">—</div>
              </div>
              <div>
                <span class="nfc-label">Frequency</span>
                <div id="nfc-med-frequency">—</div>
              </div>
            </div>
          </section>
          <section class="nfc-section">
            <h3>Family member</h3>
            <label class="nfc-label" for="nfc-family-select">Select patient</label>
            <select id="nfc-family-select" class="nfc-select"></select>
            <div class="nfc-grid two-column" style="margin-top: 10px;">
              <div>
                <span class="nfc-label">Weight</span>
                <div id="nfc-member-weight">—</div>
              </div>
              <div>
                <span class="nfc-label">Time since last dose</span>
                <div id="nfc-last-dose">—</div>
              </div>
            </div>
            <div id="nfc-weight-based" style="margin-top: 10px;"></div>
          </section>
          <section class="nfc-section">
            <h3>Dose history log</h3>
            <ul class="nfc-history" id="nfc-history-list"></ul>
            <button type="button" class="nfc-log-btn" id="nfc-log-dose">Log dose now</button>
          </section>
          <section class="nfc-section">
            <h3>NFC tag encoding</h3>
            <div class="nfc-encoding">
              <div>Write a single NDEF Text or MIME record containing JSON:</div>
              <code>{"v":1,"m":{"id":"acet-160","b":"Tylenol","n":"Acetaminophen","d":"160 mg/5 mL","f":"q4-6h","k":12.5,"o":1}}</code>
              <div style="margin-top: 10px;">
                Tag info: NTAG215 stores ~504 bytes total. If your writer limits payloads to 215 bytes, keep the JSON under that size.
              </div>
              <div style="margin-top: 8px;">
                Field map: <strong>b</strong>=brand, <strong>n</strong>=name, <strong>d</strong>=dosage, <strong>f</strong>=frequency, <strong>k</strong>=mgPerKg, <strong>o</strong>=otc.
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const scanButton = document.createElement('button');
    scanButton.id = NFC_SCAN_BUTTON_ID;
    scanButton.className = 'nfc-scan-button';
    scanButton.type = 'button';
    scanButton.textContent = 'Enable NFC scanning';
    document.body.appendChild(scanButton);
  };

  const updateFamilyOptions = (members) => {
    const select = document.getElementById('nfc-family-select');
    if (!select) {
      return;
    }
    select.innerHTML = '';
    members.forEach((member, index) => {
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      if (index === 0) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  };

  const getSelectedMember = (members) => {
    const select = document.getElementById('nfc-family-select');
    if (!select) {
      return members[0];
    }
    return members.find((member) => member.id === select.value) || members[0];
  };

  const updateDoseHistory = (history, medId, memberId) => {
    const list = document.getElementById('nfc-history-list');
    if (!list) {
      return;
    }
    list.innerHTML = '';
    const filtered = history
      .filter((entry) => entry.medId === medId && entry.memberId === memberId)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    if (filtered.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'No doses logged yet.';
      list.appendChild(item);
      return;
    }

    filtered.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = `${new Date(entry.time).toLocaleString()} · ${entry.note || 'Dose logged'}`;
      list.appendChild(item);
    });
  };

  const updateMemberDetails = (member, medication, history) => {
    const weightEl = document.getElementById('nfc-member-weight');
    const lastDoseEl = document.getElementById('nfc-last-dose');
    const weightBasedEl = document.getElementById('nfc-weight-based');
    if (!member || !weightEl || !lastDoseEl || !weightBasedEl) {
      return;
    }
    weightEl.textContent = `${member.weightLbs} lbs (${member.weightKg} kg)`;
    const lastDose = history
      .filter((entry) => entry.medId === overlayState.medId && entry.memberId === member.id)
      .sort((a, b) => new Date(b.time) - new Date(a.time))[0];
    lastDoseEl.textContent = formatTimeSince(lastDose?.time);

    if (medication?.mgPerKg) {
      const calculatedMg = medication.mgPerKg * member.weightKg;
      weightBasedEl.innerHTML = `<strong>Weight-based dose:</strong> ${calculatedMg.toFixed(0)} mg per dose`;
    } else {
      weightBasedEl.textContent = '';
    }
  };

  const showOverlay = () => {
    const overlay = document.getElementById(NFC_OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const hideOverlay = () => {
    const overlay = document.getElementById(NFC_OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const updateMedicationDetails = (data) => {
    const brandEl = document.getElementById('nfc-med-brand');
    const nameEl = document.getElementById('nfc-med-name');
    const dosageEl = document.getElementById('nfc-med-dose');
    const frequencyEl = document.getElementById('nfc-med-frequency');
    if (!brandEl || !nameEl || !dosageEl || !frequencyEl) {
      return;
    }

    const medication = data.medication || {};
    const brand = medication.brand || 'Medication';
    const name = medication.name ? `(${medication.name})` : '';
    brandEl.textContent = brand;
    nameEl.textContent = name;
    dosageEl.textContent = medication.dosage || '—';
    frequencyEl.textContent = medication.frequency || '—';

    overlayState.medId = medication.id || slugify(`${brand}-${medication.name || ''}`);
    overlayState.medication = medication;
  };

  const decodeTextRecord = (record) => {
    const dataView = record.data instanceof DataView ? record.data : new DataView(record.data);
    const status = dataView.getUint8(0);
    const languageLength = status & 0x3f;
    const textBytes = new Uint8Array(dataView.buffer, 1 + languageLength);
    return new TextDecoder('utf-8').decode(textBytes);
  };

  const parseNdefMessage = (message) => {
    for (const record of message.records) {
      if (record.recordType === 'mime' && record.mediaType === 'application/json') {
        const jsonText = new TextDecoder().decode(record.data);
        return JSON.parse(jsonText);
      }
      if (record.recordType === 'text') {
        const text = decodeTextRecord(record);
        return JSON.parse(text);
      }
    }
    return null;
  };

  const normalizePayload = (payload) => {
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    if (payload.medication) {
      return payload;
    }
    if (payload.m) {
      return {
        version: payload.v || 1,
        medication: {
          id: payload.m.id,
          brand: payload.m.b,
          name: payload.m.n,
          dosage: payload.m.d,
          frequency: payload.m.f,
          mgPerKg: payload.m.k,
          otc: Boolean(payload.m.o),
        },
      };
    }
    return payload;
  };

  const updateStatus = (text) => {
    const statusEl = document.getElementById('nfc-status');
    if (statusEl) {
      statusEl.textContent = text;
    }
  };

  const attachEventListeners = () => {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.hasAttribute('data-nfc-close')) {
        hideOverlay();
      }
    });

    const familySelect = document.getElementById('nfc-family-select');
    const logButton = document.getElementById('nfc-log-dose');
    const history = loadDoseHistory();
    const members = loadFamilyMembers();

    if (familySelect) {
      familySelect.addEventListener('change', () => {
        updateMemberDetails(getSelectedMember(members), overlayState.medication, history);
        updateDoseHistory(history, overlayState.medId, getSelectedMember(members).id);
      });
    }

    if (logButton) {
      logButton.addEventListener('click', () => {
        const selected = getSelectedMember(members);
        if (!overlayState.medId || !selected) {
          return;
        }
        const newEntry = {
          medId: overlayState.medId,
          memberId: selected.id,
          time: new Date().toISOString(),
          note: overlayState.medication?.dosage || 'Dose logged',
        };
        history.push(newEntry);
        saveDoseHistory(history);
        updateMemberDetails(selected, overlayState.medication, history);
        updateDoseHistory(history, overlayState.medId, selected.id);
      });
    }
  };

  const initNfc = () => {
    createOverlay();
    const scanButton = document.getElementById(NFC_SCAN_BUTTON_ID);
    const members = loadFamilyMembers();
    updateFamilyOptions(members);
    attachEventListeners();

    if (!scanButton) {
      return;
    }

    if (!('NDEFReader' in window)) {
      scanButton.textContent = 'NFC not supported on this device';
      scanButton.disabled = true;
      updateStatus('This device does not support Web NFC.');
      return;
    }

    let scanning = false;
    let reader;

    const startScan = async () => {
      if (scanning) {
        showOverlay();
        updateStatus('Scanning is active. Tap the medication tag.');
        return;
      }
      reader = new NDEFReader();
      try {
        await reader.scan();
        scanning = true;
        scanButton.textContent = 'NFC scanning active';
        updateStatus('Hold your phone near the medication tag.');
      } catch (error) {
        updateStatus('Unable to start NFC scanning. Please allow permissions.');
        return;
      }

      reader.addEventListener('readingerror', () => {
        updateStatus('Could not read the NFC tag. Try again.');
      });

      reader.addEventListener('reading', (event) => {
        let parsed;
        try {
          parsed = parseNdefMessage(event.message);
        } catch (error) {
          parsed = null;
        }

        const normalized = normalizePayload(parsed);
        if (!normalized) {
          updateStatus('NFC tag read, but no medication data found.');
          showOverlay();
          return;
        }

        updateMedicationDetails(normalized);
        const history = loadDoseHistory();
        const selected = getSelectedMember(members);
        updateMemberDetails(selected, overlayState.medication, history);
        updateDoseHistory(history, overlayState.medId, selected.id);
        updateStatus('Medication details loaded from NFC tag.');
        showOverlay();
      });
    };

    scanButton.addEventListener('click', startScan);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNfc);
  } else {
    initNfc();
  }
})();
