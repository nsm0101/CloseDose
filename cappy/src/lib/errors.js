export function toUserMessage(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  const message = error.message || String(error);
  const lower = message.toLowerCase();
  if (lower.includes("row-level security") || lower.includes("permission") || lower.includes("not allowed")) {
    return "You don’t have permission to perform this action. Ask a family owner or admin to grant access.";
  }
  return message || fallback;
}
