import "../../styles.css";
import { requireAuth, signOut } from "../../authService";

const root = document.querySelector("#app");
const user = await requireAuth({ nextUrl: location.pathname + location.search });

if (!user) {
  // requireAuth navigates
} else {
  root.innerHTML = `
    <div class="card">
      <h2>Cappy</h2>
      <p><span class="badge">signed in</span> ${user.email ?? "(no email)"}</p>
      <p><small>This is your authenticated landing page. Next: load families/patients and subscribe to realtime.</small></p>
      <div class="row">
        <a href="/cappy/scan/">Go to scan</a>
        <button id="out">Sign out</button>
      </div>
    </div>
  `;

  document.querySelector("#out").onclick = async () => {
    await signOut();
    location.href = "/cappy/login/";
  };
}
