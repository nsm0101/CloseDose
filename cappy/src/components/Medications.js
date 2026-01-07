import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createMedications({ supabase }) {
  const container = document.createElement("section");
  container.className = "section";
  container.innerHTML = `
    <h3>Medications</h3>
    <div class="card-sub">
      <form id="med-form" class="stack">
        <div class="row">
          <input name="display_name" type="text" placeholder="Display name" required />
          <input name="med_key" type="text" placeholder="Key" />
        </div>
        <div class="row">
          <input name="concentration" type="text" placeholder="Concentration" />
        </div>
        <div class="row">
          <button type="submit">Save medication</button>
          <button type="button" id="med-reset">Reset</button>
        </div>
      </form>
    </div>
    <div id="med-list" class="card-sub"></div>
  `;

  const form = container.querySelector("#med-form");
  const listEl = container.querySelector("#med-list");
  const resetButton = container.querySelector("#med-reset");
  let familyId = null;
  let editingId = null;

  const renderList = (rows) => {
    if (!rows.length) {
      listEl.innerHTML = `<p class="muted">No medications yet.</p>`;
      return;
    }

    listEl.innerHTML = rows
      .map((row) => `
        <div class="list-row" data-id="${row.id}">
          <div>
            <strong>${row.display_name}</strong>
            <div class="muted">Key: ${row.med_key ?? "—"} | Concentration: ${row.concentration ?? "—"}</div>
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
        form.display_name.value = record.display_name ?? "";
        form.med_key.value = record.med_key ?? "";
        form.concentration.value = record.concentration ?? "";
      };
      row.querySelector("[data-action='delete']").onclick = async () => {
        const { error } = await supabase.from("medications").delete().eq("id", id);
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        showToast("Medication deleted.", "success");
        await load();
      };
    });
  };

  const load = async () => {
    if (!familyId) {
      listEl.innerHTML = `<p class="muted">Select a family to view medications.</p>`;
      return;
    }

    const { data, error } = await supabase
      .from("medications")
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
      display_name: form.display_name.value.trim(),
      med_key: form.med_key.value.trim() || null,
      concentration: form.concentration.value.trim() || null,
    };

    if (!payload.display_name) {
      showToast("Display name is required.", "error");
      return;
    }

    const action = editingId
      ? supabase.from("medications").update(payload).eq("id", editingId)
      : supabase.from("medications").insert(payload);

    const { error } = await action;
    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    showToast("Medication saved.", "success");
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
