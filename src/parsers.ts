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
 * Convert spelled-out numbers to digits
 */
function parseSpelledNumber(text: string): number | null {
  const numberMap: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'other': 2  // "every other week" means every 2 weeks
  };

  const normalized = text.toLowerCase().trim();
  return numberMap[normalized] ?? null;
}

/**
 * Parse interval expressions: "every 2 weeks", "every 15 minutes", "every other week", "every two days"
 */
export function parseInterval(text: string): { value: number; unit: string } | null {
  // Try digit match first: "every 2 weeks"
  const digitMatch = text.match(/every\s+(\d+)\s+(minute|hour|day|week|month|year)s?/);
  if (digitMatch) {
    return {
      value: parseInt(digitMatch[1], 10),
      unit: digitMatch[2],
    };
  }

  // Try spelled-out numbers: "every two weeks", "every other week"
  const spelledMatch = text.match(/every\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|other)\s+(minute|hour|day|week|month|year)s?/);
  if (spelledMatch) {
    const value = parseSpelledNumber(spelledMatch[1]);
    if (value !== null) {
      return {
        value,
        unit: spelledMatch[2],
      };
    }
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
 * Parse duration phrases like "for 3 weeks" and return the duration info.
 * This can be converted to COUNT based on the frequency.
 */
export function parseDuration(text: string): { value: number; unit: string } | null {
  // "for N days/weeks/months/years" - duration
  const durationMatch = text.match(/for\s+(\d+)\s+(day|week|month|year)s?/);
  if (durationMatch) {
    return {
      value: parseInt(durationMatch[1], 10),
      unit: durationMatch[2],
    };
  }

  return null;
}

/**
 * Convert duration to COUNT based on frequency.
 * E.g., "daily for 3 weeks" = 21 occurrences
 * E.g., "every monday and wednesday for 5 weeks" = 10 occurrences (2 days × 5 weeks)
 */
export function durationToCount(
  duration: { value: number; unit: string },
  frequency: string,
  interval: number = 1,
  weekdayCount: number = 1
): number | null {
  const { value, unit } = duration;

  // Define base occurrences per duration unit for each frequency
  const conversionTable: Record<string, Record<string, number>> = {
    DAILY: { day: 1, week: 7, month: 30, year: 365 },
    WEEKLY: { day: 1/7, week: 1, month: 4, year: 52 },
    MONTHLY: { day: 1/30, week: 1/4, month: 1, year: 12 },
    YEARLY: { day: 1/365, week: 1/52, month: 1/12, year: 1 },
    HOURLY: { day: 24, week: 168, month: 720, year: 8760 },
    MINUTELY: { day: 1440, week: 10080, month: 43200, year: 525600 },
  };

  const multiplier = conversionTable[frequency]?.[unit];
  if (multiplier === undefined) {
    return null;
  }

  // Calculate COUNT considering interval and weekday count
  // E.g., "every 2 weeks for 4 weeks" = 2 occurrences (not 4)
  // E.g., "every monday and wednesday for 5 weeks" = 10 (2 weekdays × 5 weeks)
  const rawCount = value * multiplier;
  const countWithInterval = Math.floor(rawCount / interval);

  // For WEEKLY frequency with multiple weekdays, multiply by weekday count
  if (frequency === "WEEKLY" && weekdayCount > 1) {
    return countWithInterval * weekdayCount;
  }

  return countWithInterval;
}

/**
 * Parse start date from phrases like "starting january 15, 2025" or "starting 2025-01-15"
 * Returns ISO 8601 date string (YYYYMMDD format for DTSTART)
 */
export function parseStartDate(text: string): string | null {
  // ISO format: YYYY-MM-DD
  const isoMatch = text.match(/starting\s+(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}`;
  }

  // Month name format: "starting january 15, 2025" or "starting january 15 2025"
  const monthNames = 'january|february|march|april|may|june|july|august|september|october|november|december';
  const monthMatch = text.match(new RegExp(`starting\\s+(${monthNames})\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'i'));
  if (monthMatch) {
    const monthMap: Record<string, string> = {
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12'
    };
    const month = monthMap[monthMatch[1].toLowerCase()];
    const day = monthMatch[2].padStart(2, '0');
    const year = monthMatch[3];
    return `${year}${month}${day}`;
  }

  return null;
}