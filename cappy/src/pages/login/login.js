import "../../styles.css";
import { initAuthFromUrl, getNextUrl, setNextUrl, clearNextUrl, sendMagicLink } from "../../authService";
import { supabase } from "../../supabaseClient";

const root = document.querySelector("#app");
const params = new URLSearchParams(location.search);
const nextParam = params.get("next");

// Store intended destination (scan/app) so we can return after login
if (nextParam) setNextUrl(nextParam);

// Handle the magic-link callback if we landed here from emailRedirectTo
await initAuthFromUrl();

// If already logged in, bounce immediately to next
{
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    const next = getNextUrl("/cappy/app/");
    clearNextUrl();
    location.replace(next);
  }
}

root.innerHTML = `
  <div class="card">
    <h2>Sign in</h2>
    <p><small>We’ll email you a sign-in link. After you click it, you’ll return to where you left off.</small></p>
    <div class="row">
      <input id="email" type="email" placeholder="Email address" autocomplete="email" />
      <button id="btn">Send link</button>
    </div>
    <p id="msg"></p>
    <hr />
    <p><small>Next: <code>${getNextUrl("/cappy/app/")}</code></small></p>
  </div>
`;

document.querySelector("#btn").onclick = async () => {
  const email = document.querySelector("#email").value.trim();
  const msg = document.querySelector("#msg");
  if (!email) {
    msg.textContent = "Enter an email address.";
    return;
  }

  msg.textContent = "Sending…";

  try {
    // Redirect back to the intended page after clicking the email link
    const redirectTo = `${location.origin}${getNextUrl("/cappy/app/")}`;
    await sendMagicLink(email, redirectTo);
    msg.textContent = "Check your email for the sign-in link.";
  } catch (e) {
    msg.textContent = e?.message || "Error sending link.";
  }
};
