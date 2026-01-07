import "../../styles.css";
import { requireAuth } from "../../authService";

/**
 * Scan page
 * Expected URL:
 *   https://closedose.com/cappy/scan/?token=TYL_CH_SUSP
 *
 * This file currently demonstrates auth gating.
 * Next step: after auth, call your Edge Function resolve_scan_token() and render UI.
 */

const root = document.querySelector("#app");
const token = new URLSearchParams(location.search).get("token");

root.innerHTML = `
  <div class="card">
    <h2>Scanning…</h2>
    <p><span class="badge">token</span> <code>${token ?? "—"}</code></p>
    <p><small>If you are not signed in, you will be redirected to login and brought back here.</small></p>
  </div>
`;

if (!token) {
  root.innerHTML = `
    <div class="card">
      <h2>Missing token</h2>
      <p>This link should look like <code>/cappy/scan/?token=...</code></p>
    </div>
  `;
} else {
  const user = await requireAuth({ nextUrl: location.pathname + location.search });
  if (!user) {
    // requireAuth navigates to login
  } else {
    root.innerHTML = `
      <div class="card">
        <h2>Scan unlocked</h2>
        <p><span class="badge">signed in</span> ${user.email ?? "(no email)"}</p>
        <p><span class="badge">token</span> <code>${token}</code></p>
        <hr />
        <p>✅ Auth is working.</p>
        <p>Next: call <code>supabase.functions.invoke("resolve_scan_token")</code> and render the medication dosing card.</p>
      </div>
    `;
  }
}
