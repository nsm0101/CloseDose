import "../../styles.css";
import { supabase } from "../../supabaseClient";
import { useProtectedRoute } from "../../hooks/useProtectedRoute";
import { showToast } from "../../lib/toast";
import { toUserMessage } from "../../lib/errors";

const root = document.querySelector("#app");
const user = await useProtectedRoute({ nextUrl: location.pathname + location.search });

if (!user) {
  // useProtectedRoute navigates
} else {
  const params = new URLSearchParams(location.search);
  const inviteCode = params.get("code") || "";

  root.innerHTML = `
    <div class="card">
      <h2>Welcome</h2>
      <p class="muted">Let’s set up your profile and family.</p>
      <div class="stack">
        <label class="field">
          <span>Display name</span>
          <input id="display-name" type="text" placeholder="Sam" />
        </label>
        <div class="card-sub">
          <h3>Create a new family</h3>
          <div class="row">
            <input id="family-name" type="text" placeholder="Family name" />
            <button id="create-family">Create</button>
          </div>
        </div>
        <div class="card-sub">
          <h3>Join with invite code</h3>
          <div class="row">
            <input id="invite-code" type="text" placeholder="Invite code" value="${inviteCode}" />
            <button id="join-family">Join</button>
          </div>
        </div>
      </div>
      <p id="status" class="muted"></p>
    </div>
  `;

  const displayNameInput = document.querySelector("#display-name");
  const familyNameInput = document.querySelector("#family-name");
  const inviteInput = document.querySelector("#invite-code");
  const status = document.querySelector("#status");

  const upsertProfile = async () => {
    const displayName = displayNameInput.value.trim();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName || null });
    if (error) throw error;
  };

  const goToApp = (familyId) => {
    const url = familyId ? `/cappy/app/?family=${familyId}` : "/cappy/app/";
    location.href = url;
  };

  const joinByCode = async (code) => {
    const { data, error } = await supabase.rpc("join_family_by_code", { code });
    if (error) throw error;
    const familyId = data?.family_id || data?.id || data;
    showToast("Joined family.", "success");
    goToApp(familyId);
  };

  if (inviteCode) {
    status.textContent = "Joining family…";
    try {
      await upsertProfile();
      await joinByCode(inviteCode);
    } catch (error) {
      status.textContent = "";
      showToast(toUserMessage(error), "error");
    }
  }

  document.querySelector("#create-family").onclick = async () => {
    const name = familyNameInput.value.trim();
    if (!name) {
      showToast("Family name is required.", "error");
      return;
    }

    try {
      await upsertProfile();
      const { data, error } = await supabase
        .from("families")
        .insert({ name, created_by_user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      showToast("Family created.", "success");
      goToApp(data?.id);
    } catch (error) {
      showToast(toUserMessage(error), "error");
    }
  };

  document.querySelector("#join-family").onclick = async () => {
    const code = inviteInput.value.trim();
    if (!code) {
      showToast("Invite code is required.", "error");
      return;
    }

    try {
      await upsertProfile();
      await joinByCode(code);
    } catch (error) {
      showToast(toUserMessage(error), "error");
    }
  };
}
