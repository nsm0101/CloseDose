import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createPatients({ supabase }) {
  const container = document.createElement("section");
  container.className = "section";
  container.innerHTML = `
    <h3>Patients</h3>
    <div class="card-sub">
      <form id="patient-form" class="stack">
        <div class="row">
          <input name="name" type="text" placeholder="Name" required />
          <input name="dob" type="date" placeholder="DOB" />
        </div>
        <div class="row">
          <input name="color" type="text" placeholder="Color" />
          <input name="notes" type="text" placeholder="Notes" />
        </div>
        <div class="row">
          <button type="submit">Save patient</button>
          <button type="button" id="patient-reset">Reset</button>
        </div>
      </form>
    </div>
    <div id="patient-list" class="card-sub"></div>
  `;

  const form = container.querySelector("#patient-form");
  const listEl = container.querySelector("#patient-list");
  const resetButton = container.querySelector("#patient-reset");
  let familyId = null;
  let editingId = null;

  const renderList = (rows) => {
    if (!rows.length) {
      listEl.innerHTML = `<p class="muted">No patients yet.</p>`;
      return;
    }

    listEl.innerHTML = rows
      .map((row) => `
        <div class="list-row" data-id="${row.id}">
          <div>
            <strong>${row.name}</strong>
            <div class="muted">DOB: ${row.dob ?? "—"} | Color: ${row.color ?? "—"}</div>
            <div class="muted">Notes: ${row.notes ?? "—"}</div>
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
        form.name.value = record.name ?? "";
        form.dob.value = record.dob ?? "";
        form.color.value = record.color ?? "";
        form.notes.value = record.notes ?? "";
      };
      row.querySelector("[data-action='delete']").onclick = async () => {
        const { error } = await supabase.from("patients").delete().eq("id", id);
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        showToast("Patient deleted.", "success");
        await load();
      };
    });
  };

  const load = async () => {
    if (!familyId) {
      listEl.innerHTML = `<p class="muted">Select a family to view patients.</p>`;
      return;
    }

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });
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
      name: form.name.value.trim(),
      dob: form.dob.value || null,
      color: form.color.value.trim() || null,
      notes: form.notes.value.trim() || null,
    };

    if (!payload.name) {
      showToast("Name is required.", "error");
      return;
    }

    const action = editingId
      ? supabase.from("patients").update(payload).eq("id", editingId)
      : supabase.from("patients").insert(payload);

    const { error } = await action;
    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    showToast("Patient saved.", "success");
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
    refresh: load,
  };
}
