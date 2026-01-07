import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createFamilySettings({ supabase, user, onFamilySelect }) {
  const container = document.createElement("section");
  container.className = "section";
  container.innerHTML = `
    <h3>Family Settings</h3>
    <div class="stack">
      <div class="card-sub" id="family-list"></div>
      <div class="card-sub">
        <h4>Create family</h4>
        <div class="row">
          <input id="family-name" type="text" placeholder="Family name" />
          <button id="family-create">Create</button>
        </div>
      </div>
      <div class="card-sub">
        <h4>Join family by code</h4>
        <div class="row">
          <input id="family-code" type="text" placeholder="Invite code" />
          <button id="family-join">Join</button>
        </div>
      </div>
    </div>
  `;

  const listEl = container.querySelector("#family-list");
  const nameInput = container.querySelector("#family-name");
  const codeInput = container.querySelector("#family-code");
  let families = [];
  let memberships = new Map();

  const loadFamilies = async () => {
    const { data: membershipRows, error: membershipError } = await supabase
      .from("user_families")
      .select("family_id, role")
      .eq("user_id", user.id);

    if (membershipError) {
      showToast(toUserMessage(membershipError), "error");
      return;
    }

    memberships = new Map((membershipRows ?? []).map((row) => [row.family_id, row.role]));
    const ids = membershipRows?.map((row) => row.family_id) ?? [];

    if (!ids.length) {
      families = [];
      renderFamilies();
      return;
    }

    const { data: familyRows, error: familyError } = await supabase
      .from("families")
      .select("*")
      .in("id", ids);

    if (familyError) {
      showToast(toUserMessage(familyError), "error");
      return;
    }

    families = familyRows ?? [];
    renderFamilies();
  };

  const renderFamilies = () => {
    if (!families.length) {
      listEl.innerHTML = `<p class="muted">No families yet. Create or join one to get started.</p>`;
      return;
    }

    listEl.innerHTML = `
      <div class="stack">
        ${families
          .map((family) => {
            const role = memberships.get(family.id) || "member";
            const invite = family.invite_code ? `<span class="badge">${family.invite_code}</span>` : "—";
            return `
              <div class="family-card" data-family-id="${family.id}">
                <div>
                  <strong>${family.name}</strong>
                  <div class="muted">Role: ${role}</div>
                  <div class="muted">Invite code: ${invite}</div>
                </div>
                <div class="row">
                  <button data-action="select">Select</button>
                  <button data-action="invite">Generate invite code</button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    listEl.querySelectorAll(".family-card").forEach((card) => {
      const familyId = card.dataset.familyId;
      card.querySelector("[data-action='select']").onclick = () => {
        const family = families.find((item) => item.id === familyId);
        onFamilySelect?.({
          family,
          familyId,
          role: memberships.get(familyId) ?? "member",
        });
        showToast("Family selected.", "success");
      };

      card.querySelector("[data-action='invite']").onclick = async () => {
        const { data, error } = await supabase.rpc("generate_family_invite_code", { fid: familyId });
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        const code = data?.invite_code || data;
        showToast(`Invite code: ${code}`, "success");
        await loadFamilies();
      };
    });
  };

  container.querySelector("#family-create").onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) {
      showToast("Family name is required.", "error");
      return;
    }

    const { error } = await supabase
      .from("families")
      .insert({ name, created_by_user_id: user.id })
      .select()
      .single();

    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    nameInput.value = "";
    showToast("Family created.", "success");
    await loadFamilies();
  };

  container.querySelector("#family-join").onclick = async () => {
    const code = codeInput.value.trim();
    if (!code) {
      showToast("Invite code is required.", "error");
      return;
    }

    const { data, error } = await supabase.rpc("join_family_by_code", { code });
    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    showToast("Joined family.", "success");
    codeInput.value = "";
    await loadFamilies();

    if (data) {
      const familyId = data.family_id || data.id || data;
      const family = families.find((item) => item.id === familyId) ?? null;
      onFamilySelect?.({ family, familyId, role: memberships.get(familyId) ?? "member" });
    }
  };

  loadFamilies();

  return {
    el: container,
    refresh: loadFamilies,
  };
}
