import { supabase } from "./supabase.js";

const statusEl = document.getElementById("joinStatus");
const acceptBtn = document.getElementById("acceptInviteBtn");
const errorDetails = document.getElementById("errorDetails");
const errorMessage = document.getElementById("errorMessage");

const token = new URLSearchParams(window.location.search).get("token");

const setStatus = (message, type = "") => {
  statusEl.textContent = message;
  statusEl.classList.remove("error", "success");
  if (type) {
    statusEl.classList.add(type);
  }
};

const showErrorDetails = (message) => {
  if (!errorDetails || !errorMessage) return;
  errorMessage.textContent = message || "";
  errorDetails.hidden = !message;
};

const redirectToLogin = () => {
  localStorage.setItem("pending_invite_token", token || "");
  window.location.href = "/login.html?redirect=/cappy/join.html";
};

const handleInvite = async () => {
  if (!token) {
    setStatus("Invite link is missing a token. Please check the link and try again.", "error");
    acceptBtn.hidden = true;
    return;
  }

  const { data } = await supabase.auth.getSession();
  if (!data?.session) {
    setStatus("You need to log in before accepting this invite. Redirecting to login...");
    acceptBtn.hidden = true;
    redirectToLogin();
    return;
  }

  setStatus("Invite ready! Click accept to join the family.");
  acceptBtn.hidden = false;
};

const classifyInviteError = (message = "") => {
  const normalized = message.toLowerCase();
  if (normalized.includes("email") && normalized.includes("match")) {
    return "email-mismatch";
  }
  if (normalized.includes("expired") || normalized.includes("invalid") || normalized.includes("used")) {
    return "invalid";
  }
  return "generic";
};

acceptBtn?.addEventListener("click", async () => {
  if (!token) return;
  setStatus("Accepting your invite...", "");
  acceptBtn.disabled = true;
  showErrorDetails("");

  const { data, error } = await supabase.rpc("accept_family_invite", { p_token: token });

  if (error) {
    const type = classifyInviteError(error.message);
    if (type === "email-mismatch") {
      setStatus("This invite was issued for a different email address.", "error");
    } else if (type === "invalid") {
      setStatus("This invite link is invalid, expired, or already used.", "error");
    } else {
      setStatus("Something went wrong while accepting the invite.", "error");
    }
    showErrorDetails(error.message);
    acceptBtn.disabled = false;
    return;
  }

  localStorage.removeItem("pending_invite_token");
  setStatus("Invite accepted! Redirecting to your dashboard...", "success");
  acceptBtn.hidden = true;

  if (data) {
    showErrorDetails("");
  }

  setTimeout(() => {
    window.location.href = "/dashboard.html";
  }, 900);
});

handleInvite();
