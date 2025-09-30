import type { ParsedTime } from "./types.js";

/**
 * Normalize input text: lowercase, trim, collapse whitespace
 */
export function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[,;]+/g, ",");
}

/**
 * Parse time expressions like "9am", "5:30pm", "15:00", "noon", "midnight"
 * Returns null if time is invalid (out of bounds)
 */
export function parseTime(timeStr: string): ParsedTime | null {
  const normalized = timeStr.toLowerCase().trim();

  // Special cases
  if (normalized === "midnight") {
    return { hour24: 0, minute: 0 };
  }
  if (normalized === "noon") {
    return { hour24: 12, minute: 0 };
  }

  // 12-hour format with am/pm: "9am", "9:30pm", "9:30 pm"
  const amPmMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (amPmMatch) {
    let hour = parseInt(amPmMatch[1], 10);
    const minute = amPmMatch[2] ? parseInt(amPmMatch[2], 10) : 0;
    const period = amPmMatch[3];

    // Validate 12-hour format (1-12)
    if (hour < 1 || hour > 12) {
      return null; // Invalid hour for 12-hour format
    }

    // Validate minute
    if (minute < 0 || minute > 59) {
      return null; // Invalid minute
    }

    if (period === "pm" && hour !== 12) {
      hour += 12;
    } else if (period === "am" && hour === 12) {
      hour = 0;
    }

    return { hour24: hour, minute };
  }

  // 24-hour format: "15:00", "9:30", also catches invalid "-5:00"
  const time24Match = normalized.match(/(-?\d{1,2}):(\d{2})/);
  if (time24Match) {
    const hour24 = parseInt(time24Match[1], 10);
    const minute = parseInt(time24Match[2], 10);

    // Validate bounds
    if (hour24 < 0 || hour24 > 23) {
      return null; // Invalid hour
    }
    if (minute < 0 || minute > 59) {
      return null; // Invalid minute
    }

    return { hour24, minute };
  }

  return null;
}

/**
 * Extract all time expressions from text
 */
export function extractTimes(text: string): ParsedTime[] {
  const times: ParsedTime[] = [];

  // Match time patterns: "9am", "5:30pm", "15:00", "noon", "midnight", and invalid "-5:00"
  // Note: Can't use \b with negative sign, match before/after more liberally
  const timePattern = /(noon|midnight|-?\d{1,2}(?::\d{2})?\s*(?:am|pm)|-?\d{1,2}:\d{2})/gi;
  const matches = text.matchAll(timePattern);

  for (const match of matches) {
    const parsed = parseTime(match[0].trim());
    if (parsed) {
      times.push(parsed);
    }
  }

  return times;
}

/**
 * Parse ordinal numbers: "1st", "2nd", "3rd", "15th", etc.
 */
export function parseOrdinal(text: string): number | null {
  const match = text.match(/(\d+)(?:st|nd|rd|th)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Parse interval expressions: "every 2 weeks", "every 15 minutes"
 */
export function parseInterval(text: string): { value: number; unit: string } | null {
  const match = text.match(/every\s+(\d+)\s+(minute|hour|day|week|month|year)s?/);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: match[2],
    };
  }
  return null;
}

/**
 * Parse count/limit expressions: "for 10 occurrences"
 * Returns the count value, or null if no count pattern found
 */
export function parseCount(text: string): number | null {
  // "for N occurrences" - literal count
  const occurrenceMatch = text.match(/for\s+(\d+)\s+occurrences?/);
  if (occurrenceMatch) {
    return parseInt(occurrenceMatch[1], 10);
  }

  return null;
}

/**
 * Check if text contains a duration phrase that's ambiguous with count
 * Returns the duration info if found
 */
export function parseDuration(text: string): { value: number; unit: string } | null {
  // "for N days/weeks/months" - duration, not occurrence count
  const durationMatch = text.match(/for\s+(\d+)\s+(day|week|month|year)s?/);
  if (durationMatch) {
    return {
      value: parseInt(durationMatch[1], 10),
      unit: durationMatch[2],
    };
  }

  return null;
}