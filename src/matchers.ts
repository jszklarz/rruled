import type { ParsedTime } from "./types.js";
import { extractTimes, parseOrdinal, parseInterval, parseCount } from "./parsers.js";

export interface MatchResult {
  frequency: string | null; // DAILY, WEEKLY, MONTHLY, YEARLY, HOURLY, MINUTELY
  interval: number | null;
  weekdays: string[]; // MO, TU, WE, TH, FR, SA, SU
  monthDays: number[]; // 1-31 or -1 for last day
  months: number[]; // 1-12
  nthWeekdays: string[]; // 1MO, 2TU, -1FR (last friday)
  times: ParsedTime[];
  hourRange: number[] | null; // For "between 9am and 5pm"
  count: number | null; // For "for 10 occurrences"
}

/**
 * Match all patterns in the input text
 */
export function matchPatterns(text: string): MatchResult {
  const result: MatchResult = {
    frequency: null,
    interval: null,
    weekdays: [],
    monthDays: [],
    months: [],
    nthWeekdays: [],
    times: extractTimes(text),
    hourRange: null,
    count: parseCount(text),
  };

  // Match frequency keywords
  if (/\b(hourly|every\s+hour)\b/.test(text)) {
    result.frequency = "HOURLY";
  } else if (/\b(daily|every\s+day)\b/.test(text)) {
    result.frequency = "DAILY";
  } else if (/\b(weekly|every\s+week)\b/.test(text)) {
    result.frequency = "WEEKLY";
  } else if (/\b(monthly|every\s+month)\b/.test(text)) {
    result.frequency = "MONTHLY";
  } else if (/\b(yearly|annually|every\s+year)\b/.test(text)) {
    result.frequency = "YEARLY";
  } else if (/\b(quarterly)\b/.test(text)) {
    result.frequency = "MONTHLY";
    result.interval = 3;
  }

  // Match intervals
  const intervalMatch = parseInterval(text);
  if (intervalMatch) {
    result.interval = intervalMatch.value;
    switch (intervalMatch.unit) {
      case "minute":
        result.frequency = "MINUTELY";
        break;
      case "hour":
        result.frequency = "HOURLY";
        break;
      case "day":
        result.frequency = "DAILY";
        break;
      case "week":
        result.frequency = "WEEKLY";
        break;
      case "month":
        result.frequency = "MONTHLY";
        break;
      case "year":
        result.frequency = "YEARLY";
        break;
    }
  }

  // Match weekdays
  result.weekdays = matchWeekdays(text);

  // If weekdays are specified without explicit frequency, default to WEEKLY
  if (result.weekdays.length > 0 && !result.frequency) {
    result.frequency = "WEEKLY";
  }

  // Match nth weekday patterns (first monday, last friday, etc.)
  result.nthWeekdays = matchNthWeekdays(text);

  // If nth weekdays are specified, set frequency to MONTHLY
  if (result.nthWeekdays.length > 0) {
    result.frequency = "MONTHLY";
  }

  // Match month days (1st, 15th, etc.)
  result.monthDays = matchMonthDays(text);

  // If month days are specified without explicit frequency, default to MONTHLY
  if (result.monthDays.length > 0 && !result.frequency) {
    result.frequency = "MONTHLY";
  }

  // Match specific months
  result.months = matchMonths(text);

  // Match hour ranges (between 9am and 5pm)
  result.hourRange = matchHourRange(text);

  // Frequency adjustment logic based on combinations:
  // 1. If hour range is present without explicit frequency, use HOURLY
  if (result.hourRange && !result.frequency) {
    result.frequency = "HOURLY";
  }

  // 2. If months + nth weekdays, use YEARLY
  if (result.months.length > 0 && result.nthWeekdays.length > 0) {
    result.frequency = "YEARLY";
  }

  // 3. If months + weekdays (not nth), use YEARLY
  if (result.months.length > 0 && result.weekdays.length > 0 && result.nthWeekdays.length === 0) {
    result.frequency = "YEARLY";
  }

  // 4. If months are specified without other frequency, default to YEARLY
  if (result.months.length > 0 && !result.frequency) {
    result.frequency = "YEARLY";
  }

  // 5. If hour range + weekdays, keep as HOURLY
  if (result.hourRange && result.weekdays.length > 0) {
    result.frequency = "HOURLY";
  }

  return result;
}

/**
 * Match weekday names
 */
function matchWeekdays(text: string): string[] {
  const weekdays: string[] = [];
  const dayMap: Record<string, string> = {
    monday: "MO",
    mon: "MO",
    tuesday: "TU",
    tue: "TU",
    tues: "TU",
    wednesday: "WE",
    wed: "WE",
    thursday: "TH",
    thu: "TH",
    thur: "TH",
    thurs: "TH",
    friday: "FR",
    fri: "FR",
    saturday: "SA",
    sat: "SA",
    sunday: "SU",
    sun: "SU",
  };

  // Check for "weekday" (Mon-Fri)
  if (/\bweekday(s)?\b/.test(text)) {
    return ["MO", "TU", "WE", "TH", "FR"];
  }

  // Check for "weekend" (Sat-Sun)
  if (/\bweekend(s)?\b/.test(text)) {
    return ["SA", "SU"];
  }

  // Match individual weekdays
  for (const [name, code] of Object.entries(dayMap)) {
    const pattern = new RegExp(`\\b${name}\\b`, "i");
    if (pattern.test(text) && !weekdays.includes(code)) {
      weekdays.push(code);
    }
  }

  return weekdays;
}

/**
 * Match nth weekday patterns like "first monday", "last friday", "third wednesday"
 * Also handles "first and third monday" by looking for position words followed eventually by day
 */
function matchNthWeekdays(text: string): string[] {
  const nthWeekdays: string[] = [];

  const positionMap: Record<string, string> = {
    first: "1",
    second: "2",
    third: "3",
    fourth: "4",
    fifth: "5",
    last: "-1",
  };

  const dayMap: Record<string, string> = {
    monday: "MO",
    tuesday: "TU",
    wednesday: "WE",
    thursday: "TH",
    friday: "FR",
    saturday: "SA",
    sunday: "SU",
  };

  // First pass: match direct patterns like "first monday"
  for (const [position, num] of Object.entries(positionMap)) {
    for (const [day, code] of Object.entries(dayMap)) {
      const pattern = new RegExp(`\\b${position}\\s+${day}\\b`, "i");
      if (pattern.test(text)) {
        const combo = `${num}${code}`;
        if (!nthWeekdays.includes(combo)) {
          nthWeekdays.push(combo);
        }
      }
    }
  }

  // Second pass: match patterns like "first and third monday" where multiple positions share a day
  // Look for position words that appear before a day name (with "and" or comma between them)
  for (const [day, code] of Object.entries(dayMap)) {
    const dayPattern = new RegExp(`\\b${day}\\b`, "i");
    if (dayPattern.test(text)) {
      // Find all position words that appear before this day
      for (const [position, num] of Object.entries(positionMap)) {
        const contextPattern = new RegExp(`\\b${position}\\b[^.]*?\\b${day}\\b`, "i");
        if (contextPattern.test(text)) {
          const combo = `${num}${code}`;
          if (!nthWeekdays.includes(combo)) {
            nthWeekdays.push(combo);
          }
        }
      }
    }
  }

  // Sort nth weekdays by their numeric prefix (-1 goes to end, 1-5 in order)
  return nthWeekdays.sort((a, b) => {
    const numA = parseInt(a.match(/-?\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/-?\d+/)?.[0] || "0", 10);
    // Put -1 (last) at the end
    if (numA === -1) return 1;
    if (numB === -1) return -1;
    return numA - numB;
  });
}

/**
 * Match month day numbers like "1st", "15th", "last day"
 */
function matchMonthDays(text: string): number[] {
  const days: number[] = [];

  // Match "last day of the month" or "last day of every month"
  if (/\blast\s+day\s+of\s+(?:the\s+|every\s+)?month\b/.test(text)) {
    return [-1];
  }

  // Match ordinals: "1st", "2nd", "15th", etc.
  const ordinalPattern = /\b(\d{1,2})(?:st|nd|rd|th)\b/g;
  const matches = text.matchAll(ordinalPattern);

  for (const match of matches) {
    const day = parseInt(match[1], 10);
    if (day >= 1 && day <= 31 && !days.includes(day)) {
      days.push(day);
    }
  }

  return days.sort((a, b) => a - b);
}

/**
 * Match month names
 */
function matchMonths(text: string): number[] {
  const months: number[] = [];

  const monthMap: Record<string, number> = {
    january: 1,
    jan: 1,
    february: 2,
    feb: 2,
    march: 3,
    mar: 3,
    april: 4,
    apr: 4,
    may: 5,
    june: 6,
    jun: 6,
    july: 7,
    jul: 7,
    august: 8,
    aug: 8,
    september: 9,
    sep: 9,
    sept: 9,
    october: 10,
    oct: 10,
    november: 11,
    nov: 11,
    december: 12,
    dec: 12,
  };

  for (const [name, num] of Object.entries(monthMap)) {
    const pattern = new RegExp(`\\b${name}\\b`, "i");
    if (pattern.test(text) && !months.includes(num)) {
      months.push(num);
    }
  }

  return months.sort((a, b) => a - b);
}

/**
 * Match hour range patterns like "between 9am and 5pm"
 */
function matchHourRange(text: string): number[] | null {
  const rangePattern = /between\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+and\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = text.match(rangePattern);

  if (match) {
    let startHour = parseInt(match[1], 10);
    const startPeriod = match[3];
    let endHour = parseInt(match[4], 10);
    const endPeriod = match[6];

    // Convert to 24-hour format
    if (startPeriod === "pm" && startHour !== 12) {
      startHour += 12;
    } else if (startPeriod === "am" && startHour === 12) {
      startHour = 0;
    }

    if (endPeriod === "pm" && endHour !== 12) {
      endHour += 12;
    } else if (endPeriod === "am" && endHour === 12) {
      endHour = 0;
    }

    // Generate hour range
    const hours: number[] = [];

    // Check if range wraps around midnight (e.g., 21 to 5 means 21-23, 0-5)
    if (startHour > endHour) {
      // Overnight range: from start to 23, then 0 to end
      for (let h = startHour; h <= 23; h++) {
        hours.push(h);
      }
      for (let h = 0; h <= endHour; h++) {
        hours.push(h);
      }
    } else {
      // Normal range: from start to end
      for (let h = startHour; h <= endHour; h++) {
        hours.push(h);
      }
    }

    return hours;
  }

  return null;
}