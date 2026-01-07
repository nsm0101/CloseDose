import "../../styles.css";
import { supabase } from "../../supabaseClient";
import { createAuthForm } from "../../components/AuthForm";
import { clearNextUrl, getNextUrl, setNextUrl } from "../../authService";

const root = document.querySelector("#app");
const params = new URLSearchParams(location.search);
const nextParam = params.get("next");

if (nextParam) setNextUrl(nextParam);

const { data } = await supabase.auth.getUser();
if (data?.user) {
  const next = getNextUrl("/cappy/onboarding/");
  clearNextUrl();
  location.replace(next);
} else {
  root.appendChild(createAuthForm());
}
