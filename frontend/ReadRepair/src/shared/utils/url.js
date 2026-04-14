export function trimTrailingSlash(value) {
  const trimmedValue = `${value || ""}`.trim();
  return trimmedValue.endsWith("/") ? trimmedValue.slice(0, -1) : trimmedValue;
}