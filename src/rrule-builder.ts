import type { MatchResult } from "./matchers.js";

/**
 * Build RRULE string from match results
 *
 * Proper RRULE order: FREQ, INTERVAL, COUNT, BYMONTH, BYDAY, BYMONTHDAY, BYHOUR, BYMINUTE
 */
export function buildRRule(matches: MatchResult): string {
  const parts: string[] = [];

  // FREQ is required
  if (!matches.frequency) {
    throw new Error("Frequency is required for RRULE");
  }

  parts.push(`FREQ=${matches.frequency}`);

  // INTERVAL
  if (matches.interval && matches.interval > 1) {
    parts.push(`INTERVAL=${matches.interval}`);
  }

  // COUNT
  if (matches.count) {
    parts.push(`COUNT=${matches.count}`);
  }

  // BYMONTH
  if (matches.months.length > 0) {
    parts.push(`BYMONTH=${matches.months.join(",")}`);
  }

  // BYDAY (weekdays or nth weekdays)
  if (matches.nthWeekdays.length > 0) {
    parts.push(`BYDAY=${matches.nthWeekdays.join(",")}`);
  } else if (matches.weekdays.length > 0) {
    parts.push(`BYDAY=${matches.weekdays.join(",")}`);
  }

  // BYMONTHDAY
  if (matches.monthDays.length > 0) {
    parts.push(`BYMONTHDAY=${matches.monthDays.join(",")}`);
  }

  // BYHOUR (from hour range or from times)
  if (matches.hourRange) {
    parts.push(`BYHOUR=${matches.hourRange.join(",")}`);
  } else if (matches.times.length > 0) {
    const hours = [...new Set(matches.times.map((t) => t.hour24))];
    if (hours.length > 0 && !allHoursAreWildcard(hours)) {
      parts.push(`BYHOUR=${hours.join(",")}`);
    }
  }

  // BYMINUTE (include all distinct minute values when times are specified)
  if (matches.times.length > 0 && !matches.hourRange) {
    const minutes = [...new Set(matches.times.map((t) => t.minute))].sort((a, b) => a - b);
    if (minutes.length > 0) {
      parts.push(`BYMINUTE=${minutes.join(",")}`);
    }
  }

  return parts.join(";");
}

/**
 * Helper to check if hours should be treated as wildcard
 */
function allHoursAreWildcard(hours: number[]): boolean {
  // If we have all 24 hours, treat as wildcard
  return hours.length === 24;
}

/**
 * Validate and potentially adjust match results before building
 */
export function normalizeMatches(matches: MatchResult): MatchResult {
  const normalized = { ...matches };

  // If we have multiple times at the same hour, consolidate them
  if (normalized.times.length > 1) {
    const uniqueHours = new Set(normalized.times.map((t) => t.hour24));

    // If all times have the same minute value, keep it
    const allMinutes = normalized.times.map((t) => t.minute);
    const uniqueMinutes = new Set(allMinutes);

    if (uniqueMinutes.size > 1) {
      // Different minutes - this might need special handling
      // For now, just keep the times as is
    }
  }

  // If hourly/minutely frequency is set with hour range, ensure proper configuration
  if (normalized.frequency === "HOURLY" && normalized.hourRange) {
    // Keep as is - BYHOUR will restrict which hours
  }

  // If frequency is MINUTELY with interval but no hour range, it applies to all hours
  if (normalized.frequency === "MINUTELY" && normalized.interval && !normalized.hourRange) {
    // This is correct - every N minutes of every hour
  }

  return normalized;
}