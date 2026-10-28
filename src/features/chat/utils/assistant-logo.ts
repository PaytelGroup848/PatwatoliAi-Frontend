/**
 * Resolves the custom image logo path for an AI Assistant based on its code or name.
 */
export function getAssistantLogo(code?: string | null, name?: string | null): string {
  const key = `${code || ""} ${name || ""}`.toLowerCase();

  if (key.includes("law")) {
    return "/assistants/lawgpt.png";
  }
  if (key.includes("astro")) {
    return "/assistants/astrology.png";
  }
  if (key.includes("code") || key.includes("coder")) {
    return "/assistants/code.png";
  }
  if (key.includes("med")) {
    return "/assistants/medical.png";
  }

  return "/assistants/general.png";
}
