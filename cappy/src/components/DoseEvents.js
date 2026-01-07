import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createDoseEvents({ supabase, user }) {
  const container = document.createElement("section");
  container.className = "section";
  container.innerHTML = `
    <h3>Dose Events</h3>
    <div class="card-sub">
      <form id="dose-form" class="stack">
        <div class="row">
          <input name="patient_id" type="text" placeholder="Patient ID" />
          <input name="medication_id" type="text" placeholder="Medication ID" />
        </div>
        <div class="row">
          <input name="dose_mg" type="number" step="0.1" placeholder="Dose mg" />
          <input name="dose_ml" type="number" step="0.1" placeholder="Dose mL" />
        </div>
        <div class="row">
          <input name="given_at" type="datetime-local" />
        </div>
        <div class="row">
          <button type="submit">Save dose event</button>
          <button type="button" id="dose-reset">Reset</button>
        </div>
      </form>
    </div>
    <div id="dose-list" class="card-sub"></div>
  `;

  const form = container.querySelector("#dose-form");
  const listEl = container.querySelector("#dose-list");
  const resetButton = container.querySelector("#dose-reset");
  let familyId = null;
  let editingId = null;
  let patientFilter = null;

  const renderList = (rows) => {
    if (!rows.length) {
      listEl.innerHTML = `<p class="muted">No dose events yet.</p>`;
      return;
    }

    listEl.innerHTML = rows
      .map((row) => `
        <div class="list-row" data-id="${row.id}">
          <div>
            <strong>${row.patient_id ?? "Unknown patient"}</strong>
            <div class="muted">Medication: ${row.medication_id ?? "—"}</div>
            <div class="muted">Dose: ${row.dose_mg ?? "—"} mg / ${row.dose_ml ?? "—"} mL</div>
            <div class="muted">Given at: ${row.given_at ?? "—"}</div>
          </div>
          <div class="row">
            <button data-action="edit">Edit</button>
            <button data-action="delete">Delete</button>
          </div>
        </div>
      `)
      .join("");

    listEl.querySelectorAll(".list-row").forEach((row) => {
      const id = row.dataset.id;
      row.querySelector("[data-action='edit']").onclick = () => {
        const record = rows.find((item) => item.id === id);
        if (!record) return;
        editingId = id;
        form.patient_id.value = record.patient_id ?? "";
        form.medication_id.value = record.medication_id ?? "";
        form.dose_mg.value = record.dose_mg ?? "";
        form.dose_ml.value = record.dose_ml ?? "";
        form.given_at.value = record.given_at ? record.given_at.slice(0, 16) : "";
      };
      row.querySelector("[data-action='delete']").onclick = async () => {
        const { error } = await supabase.from("dose_events").delete().eq("id", id);
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        showToast("Dose event deleted.", "success");
        await load();
      };
    });
  };

  const load = async () => {
    if (!familyId) {
      listEl.innerHTML = `<p class="muted">Select a family to view dose events.</p>`;
      return;
    }

    let query = supabase.from("dose_events").select("*").eq("family_id", familyId);
    if (patientFilter) query = query.eq("patient_id", patientFilter);

    const { data, error } = await query.order("given_at", { ascending: false });
    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }
    renderList(data ?? []);
  };

  form.onsubmit = async (event) => {
    event.preventDefault();
    if (!familyId) {
      showToast("Select a family first.", "error");
      return;
    }

    const payload = {
      family_id: familyId,
      patient_id: form.patient_id.value.trim() || null,
      medication_id: form.medication_id.value.trim() || null,
      dose_mg: form.dose_mg.value ? Number(form.dose_mg.value) : null,
      dose_ml: form.dose_ml.value ? Number(form.dose_ml.value) : null,
      given_at: form.given_at.value ? new Date(form.given_at.value).toISOString() : null,
      created_by: user.id,
    };

    const action = editingId
      ? supabase.from("dose_events").update(payload).eq("id", editingId)
      : supabase.from("dose_events").insert(payload);

    const { error } = await action;
    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    showToast("Dose event saved.", "success");
    editingId = null;
    form.reset();
    await load();
  };

  resetButton.onclick = () => {
    editingId = null;
    form.reset();
  };

  return {
    el: container,
    setFamilyId(id) {
      familyId = id;
      load();
    },
    setPatientFilter(id) {
      patientFilter = id || null;
      load();
    },
    refresh: load,
  };
}
