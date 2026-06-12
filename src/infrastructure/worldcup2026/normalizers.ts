const DEFAULT_TEXT = "TBD";

export function normalizeText(value: unknown, fallback = DEFAULT_TEXT): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function normalizeOptionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function normalizeCountry(value: unknown): string {
  return normalizeText(value, DEFAULT_TEXT);
}

export function normalizeTeamName(
  teamId: unknown,
  name: unknown,
  label: unknown,
): string {
  const normalizedTeamId = normalizeText(teamId, "0");

  if (normalizedTeamId !== "0") {
    return normalizeText(name, normalizeText(label));
  }

  return normalizeText(label, normalizeText(name));
}

export function normalizePositiveInteger(value: unknown): number | undefined {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function normalizeScore(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function normalizeUtcDate(value: unknown): Date {
  if (typeof value !== "string" || !value.trim()) {
    return new Date(0);
  }

  const parsed = Date.parse(value);

  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  const [datePart, timePart = "00:00"] = value.trim().split(/\s+/);
  const [month, day, year] = datePart.split("/").map(Number);
  const [hours = 0, minutes = 0] = timePart.split(":").map(Number);
  const utcTime = Date.UTC(year, month - 1, day, hours, minutes);

  return Number.isNaN(utcTime) ? new Date(0) : new Date(utcTime);
}
