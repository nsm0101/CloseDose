import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createPatientWeights({ supabase, user }) {
  const container = document.createElement("section");
  container.className = "section";
  container.innerHTML = `
    <h3>Patient Weights</h3>
    <div class="card-sub">
      <form id="weight-form" class="stack">
        <div class="row">
          <input name="patient_id" type="text" placeholder="Patient ID" />
          <input name="weight" type="number" step="0.1" placeholder="Weight (kg)" />
        </div>
        <div class="row">
          <input name="measured_at" type="datetime-local" />
        </div>
        <div class="row">
          <button type="submit">Save weight</button>
          <button type="button" id="weight-reset">Reset</button>
        </div>
      </form>
    </div>
    <div id="weight-list" class="card-sub"></div>
  `;

  const form = container.querySelector("#weight-form");
  const listEl = container.querySelector("#weight-list");
  const resetButton = container.querySelector("#weight-reset");
  let familyId = null;
  let editingId = null;
  let patientFilter = null;

  const renderList = (rows) => {
    if (!rows.length) {
      listEl.innerHTML = `<p class="muted">No weights recorded.</p>`;
      return;
    }

    listEl.innerHTML = rows
      .map((row) => `
        <div class="list-row" data-id="${row.id}">
          <div>
            <strong>${row.patient_id ?? "Unknown patient"}</strong>
            <div class="muted">Weight: ${row.weight ?? "—"} kg</div>
            <div class="muted">Measured at: ${row.measured_at ?? "—"}</div>
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
        form.weight.value = record.weight ?? "";
        form.measured_at.value = record.measured_at ? record.measured_at.slice(0, 16) : "";
      };
      row.querySelector("[data-action='delete']").onclick = async () => {
        const { error } = await supabase.from("patient_weights").delete().eq("id", id);
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        showToast("Weight entry deleted.", "success");
        await load();
      };
    });
  };

  const load = async () => {
    if (!familyId) {
      listEl.innerHTML = `<p class="muted">Select a family to view weights.</p>`;
      return;
    }

    let query = supabase.from("patient_weights").select("*").eq("family_id", familyId);
    if (patientFilter) query = query.eq("patient_id", patientFilter);

    const { data, error } = await query.order("measured_at", { ascending: false });
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
      weight: form.weight.value ? Number(form.weight.value) : null,
      measured_at: form.measured_at.value ? new Date(form.measured_at.value).toISOString() : null,
      created_by: user.id,
    };

    const action = editingId
      ? supabase.from("patient_weights").update(payload).eq("id", editingId)
      : supabase.from("patient_weights").insert(payload);

    const { error } = await action;
    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    showToast("Weight saved.", "success");
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
