import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createNFCTags({ supabase }) {
  const container = document.createElement("section");
  container.className = "section";
  container.innerHTML = `
    <h3>NFC Tags</h3>
    <div class="card-sub">
      <form id="tag-form" class="stack">
        <div class="row">
          <input name="token" type="text" placeholder="Token" required />
          <input name="medication_id" type="text" placeholder="Medication ID" />
        </div>
        <div class="row">
          <input name="label" type="text" placeholder="Label" />
        </div>
        <div class="row">
          <button type="submit">Save tag</button>
          <button type="button" id="tag-reset">Reset</button>
        </div>
      </form>
    </div>
    <div id="tag-list" class="card-sub"></div>
  `;

  const form = container.querySelector("#tag-form");
  const listEl = container.querySelector("#tag-list");
  const resetButton = container.querySelector("#tag-reset");
  let familyId = null;
  let editingId = null;

  const renderList = (rows) => {
    if (!rows.length) {
      listEl.innerHTML = `<p class="muted">No NFC tags yet.</p>`;
      return;
    }

    listEl.innerHTML = rows
      .map((row) => `
        <div class="list-row" data-id="${row.id}">
          <div>
            <strong>${row.label ?? "Unnamed"}</strong>
            <div class="muted">Token: ${row.token ?? "—"}</div>
            <div class="muted">Medication: ${row.medication_id ?? "—"}</div>
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
        form.token.value = record.token ?? "";
        form.medication_id.value = record.medication_id ?? "";
        form.label.value = record.label ?? "";
      };
      row.querySelector("[data-action='delete']").onclick = async () => {
        const { error } = await supabase.from("nfc_tags").delete().eq("id", id);
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        showToast("Tag deleted.", "success");
        await load();
      };
    });
  };

  const load = async () => {
    if (!familyId) {
      listEl.innerHTML = `<p class="muted">Select a family to view tags.</p>`;
      return;
    }

    const { data, error } = await supabase
      .from("nfc_tags")
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
      token: form.token.value.trim(),
      medication_id: form.medication_id.value.trim() || null,
      label: form.label.value.trim() || null,
    };

    if (!payload.token) {
      showToast("Token is required.", "error");
      return;
    }

    const action = editingId
      ? supabase.from("nfc_tags").update(payload).eq("id", editingId)
      : supabase.from("nfc_tags").insert(payload);

    const { error } = await action;
    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    showToast("Tag saved.", "success");
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
