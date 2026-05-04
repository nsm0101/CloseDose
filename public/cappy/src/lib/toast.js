const TOAST_CONTAINER_ID = "toast-container";

function getContainer() {
  let container = document.querySelector(`#${TOAST_CONTAINER_ID}`);
  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, variant = "info") {
  const container = getContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast-${variant}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3200);
}
