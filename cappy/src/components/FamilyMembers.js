import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createFamilyMembers({ supabase, currentUser }) {
  const container = document.createElement("section");
  container.className = "section";
  container.innerHTML = `
    <h3>Members</h3>
    <div class="card-sub">
      <div class="row">
        <input id="member-user-id" type="text" placeholder="User ID" />
        <select id="member-role">
          <option value="member">member</option>
          <option value="admin">admin</option>
          <option value="owner">owner</option>
        </select>
        <button id="member-add">Add member</button>
      </div>
      <p class="muted">Owners/admins can add members by user ID.</p>
    </div>
    <div id="member-list" class="card-sub"></div>
  `;

  const listEl = container.querySelector("#member-list");
  const userInput = container.querySelector("#member-user-id");
  const roleSelect = container.querySelector("#member-role");

  let familyId = null;
  let canManage = false;

  const loadMembers = async () => {
    if (!familyId) {
      listEl.innerHTML = `<p class="muted">Select a family to manage members.</p>`;
      return;
    }

    const { data, error } = await supabase
      .from("user_families")
      .select("user_id, role, profiles ( display_name )")
      .eq("family_id", familyId)
      .order("role", { ascending: true });

    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    const members = data ?? [];

    listEl.innerHTML = members
      .map((member) => {
        const label = member.profiles?.display_name || member.user_id;
        const isSelf = member.user_id === currentUser.id;
        return `
          <div class="member-row" data-user-id="${member.user_id}">
            <div>
              <strong>${label}</strong>
              <div class="muted">${member.user_id}${isSelf ? " (you)" : ""}</div>
            </div>
            <div class="row">
              <select data-role>
                <option value="owner" ${member.role === "owner" ? "selected" : ""}>owner</option>
                <option value="admin" ${member.role === "admin" ? "selected" : ""}>admin</option>
                <option value="member" ${member.role === "member" ? "selected" : ""}>member</option>
              </select>
              <button data-action="update">Update</button>
              <button data-action="remove">Remove</button>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll(".member-row").forEach((row) => {
      const userId = row.dataset.userId;
      const roleInput = row.querySelector("[data-role]");
      const updateButton = row.querySelector("[data-action='update']");
      const removeButton = row.querySelector("[data-action='remove']");

      updateButton.disabled = !canManage;
      removeButton.disabled = !canManage || userId === currentUser.id;
      roleInput.disabled = !canManage;

      updateButton.onclick = async () => {
        const role = roleInput.value;
        const { error } = await supabase
          .from("user_families")
          .update({ role })
          .eq("family_id", familyId)
          .eq("user_id", userId);
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        showToast("Role updated.", "success");
        await loadMembers();
      };

      removeButton.onclick = async () => {
        const { error } = await supabase
          .from("user_families")
          .delete()
          .eq("family_id", familyId)
          .eq("user_id", userId);
        if (error) {
          showToast(toUserMessage(error), "error");
          return;
        }
        showToast("Member removed.", "success");
        await loadMembers();
      };
    });
  };

  container.querySelector("#member-add").onclick = async () => {
    if (!familyId) {
      showToast("Select a family first.", "error");
      return;
    }
    if (!canManage) {
      showToast("Only owners or admins can add members.", "error");
      return;
    }

    const userId = userInput.value.trim();
    const role = roleSelect.value;
    if (!userId) {
      showToast("User ID is required.", "error");
      return;
    }

    const { error } = await supabase
      .from("user_families")
      .insert({ user_id: userId, family_id: familyId, role });

    if (error) {
      showToast(toUserMessage(error), "error");
      return;
    }

    showToast("Member added.", "success");
    userInput.value = "";
    await loadMembers();
  };

  return {
    el: container,
    setFamilyContext({ id, role }) {
      familyId = id;
      canManage = role === "owner" || role === "admin";
      loadMembers();
    },
    refresh: loadMembers,
  };
}
