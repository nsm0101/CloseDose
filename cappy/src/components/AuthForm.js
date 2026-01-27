import { supabase } from "../supabaseClient";
import { clearNextUrl, getNextUrl } from "../authService";
import { showToast } from "../lib/toast";
import { toUserMessage } from "../lib/errors";

export function createAuthForm() {
  const container = document.createElement("div");
  container.className = "card";
  container.innerHTML = `
    <h2>Sign in</h2>
    <p><small>Use your email and password to access your families.</small></p>
    <div class="stack">
      <label class="field">
        <span>Email</span>
        <input id="auth-email" type="email" placeholder="you@example.com" autocomplete="email" />
      </label>
      <label class="field">
        <span>Password</span>
        <input id="auth-password" type="password" placeholder="••••••••" autocomplete="current-password" />
      </label>
      <label class="field" id="display-name-field">
        <span>Display name (for sign up)</span>
        <input id="auth-display-name" type="text" placeholder="Sam" autocomplete="name" />
      </label>
      <div class="row">
        <button id="sign-in-btn">Sign in</button>
        <button id="sign-up-btn">Create account</button>
      </div>
      <p class="muted">After signing in, you’ll continue to your dashboard.</p>
    </div>
  `;

  const emailInput = container.querySelector("#auth-email");
  const passwordInput = container.querySelector("#auth-password");
  const displayNameInput = container.querySelector("#auth-display-name");

  const handleAuth = async (mode) => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
      showToast("Email and password are required.", "error");
      return;
    }

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      showToast("Signed in successfully.", "success");
      const next = getNextUrl("/dashboard.html");
      clearNextUrl();
      location.href = next;
    } catch (error) {
      showToast(toUserMessage(error), "error");
    }
  };

  container.querySelector("#sign-in-btn").onclick = () => handleAuth("signin");
  container.querySelector("#sign-up-btn").onclick = () => handleAuth("signup");

  return container;
}
