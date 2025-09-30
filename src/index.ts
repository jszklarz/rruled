// This is an RRULE expression converter that takes a natural language expression and attempts to convert to the representative RRULE.
//
// Notes:
// - RRULE format follows RFC 5545 (iCalendar)
// - Returns { rrules: string[] } or { unsupported: string } when text exceeds RRULE capability.

import type { RRuleResult } from "./types.js";
import { normalizeInput, parseDuration, parseTime, durationToCount, parseStartDate } from "./parsers.js";
import { matchPatterns, type MatchResult } from "./matchers.js";
import { buildRRule, normalizeMatches } from "./rrule-builder.js";

/**
 * Detect conflicting or nonsensical pattern combinations
 */
function detectConflicts(matches: MatchResult): string | null {
  // Conflict: HOURLY/MINUTELY frequency with nth weekday patterns
  if ((matches.frequency === "HOURLY" || matches.frequency === "MINUTELY") && matches.nthWeekdays.length > 0) {
    return "Conflicting patterns: hourly/minutely frequency cannot be combined with nth weekday patterns (e.g., 'first monday'). Please use a daily, weekly, or monthly frequency.";
  }

  // Conflict: DAILY frequency with nth weekday patterns
  if (matches.frequency === "DAILY" && matches.nthWeekdays.length > 0) {
    return "Conflicting patterns: daily frequency cannot be combined with nth weekday patterns (e.g., 'first monday'). Please use weekly or monthly frequency.";
  }

  // Conflict: YEARLY frequency with monthDays but no months specified
  if (matches.frequency === "YEARLY" && matches.monthDays.length > 0 && matches.months.length === 0) {
    return "Ambiguous pattern: yearly frequency with specific days (e.g., '15th') requires specifying which month(s). Please add a month like 'in january'.";
  }

  // Conflict: Multiple conflicting interval specifications
  if (matches.interval && matches.interval > 1) {
    // Allow MINUTELY with hour ranges (that's valid: every 15 minutes between 9am-5pm)
    if (matches.frequency === "MINUTELY" && matches.times.length > 0 && !matches.hourRange) {
      return "Conflicting patterns: cannot combine interval-based minutely recurrence (e.g., 'every 15 minutes') with specific times (e.g., 'at 9am'). Choose one approach.";
    }
    if (matches.frequency === "HOURLY" && matches.times.length > 0 && matches.times[0].minute !== 0) {
      return "Conflicting patterns: interval-based hourly recurrence (e.g., 'every 2 hours') with non-zero minutes is ambiguous. Use 'at :00' for on-the-hour times.";
    }
  }

  // Conflict: Hour range with non-hourly/minutely frequency
  if (matches.hourRange && matches.frequency !== "HOURLY" && matches.frequency !== "MINUTELY") {
    return "Conflicting patterns: hour ranges (e.g., 'between 9am and 5pm') require hourly or minutely frequency. Current frequency is " + matches.frequency + ".";
  }

  return null;
}

/**
 * Convert a natural language schedule description to RRULE expression(s).
 *
 * @param input - Natural language schedule description (e.g., "every monday at 9am")
 * @returns Object with either `rrules` array or `unsupported` message
 *
 * @example
 * ```typescript
 * rruled("every monday at 9am")
 * // => { rrules: ["FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0"] }
 *
 * rruled("every day at midnight")
 * // => { rrules: ["FREQ=DAILY;BYHOUR=0;BYMINUTE=0"] }
 *
 * rruled("first monday of the month")
 * // => { rrules: ["FREQ=MONTHLY;BYDAY=1MO"] }
 * ```
 */
export function rruled(input: string): RRuleResult {
  const normalizedText = normalizeInput(input);

  // Handle empty or whitespace-only input
  if (!normalizedText) {
    return {
      unsupported: "Could not understand the input. Please provide a schedule description.",
    };
  }

  // Check for invalid times - only check patterns that look like times (with "at" or colons or am/pm)
  const invalidTimePattern = /(?:at\s+|^|\s)(-?\d{1,2})(:\d{2})?\s*(am|pm)?(?:\s|$)/gi;
  const timeMatches = normalizedText.matchAll(invalidTimePattern);
  for (const match of timeMatches) {
    const fullMatch = match[0].trim();
    // Extract just the time part (remove "at " if present)
    const timeStr = fullMatch.replace(/^at\s+/, '');

    // Only validate if it has a colon OR am/pm marker (to avoid false positives like "every 2 days")
    if ((timeStr.includes(':') || /am|pm/i.test(timeStr)) && /^-?\d{1,2}(:\d{2})?(am|pm)?$/i.test(timeStr)) {
      const parsed = parseTime(timeStr);
      if (parsed === null) {
        return {
          unsupported: `Invalid time value "${timeStr}". Hours must be 0-23 (or 1-12 with am/pm) and minutes must be 0-59.`,
        };
      }
    }
  }

  // Match patterns
  const matches = matchPatterns(normalizedText);

  // Check if we found any meaningful patterns
  if (!matches.frequency) {
    return {
      unsupported: "Could not understand the input. Please use natural language like 'every monday at 9am'.",
    };
  }

  // Validate for conflicting/nonsensical combinations
  const conflictError = detectConflicts(matches);
  if (conflictError) {
    return { unsupported: conflictError };
  }

  // Convert duration phrases to COUNT if present
  const duration = parseDuration(normalizedText);
  if (duration && !matches.count) {
    const weekdayCount = matches.weekdays.length > 0 ? matches.weekdays.length : 1;
    const calculatedCount = durationToCount(duration, matches.frequency, matches.interval || 1, weekdayCount);
    if (calculatedCount !== null && calculatedCount > 0) {
      matches.count = calculatedCount;
    }
  }

  // Parse start date if present
  const dtstart = parseStartDate(normalizedText);

  // Check if we have multiple distinct hour/minute pairs (cartesian product issue)
  if (matches.times.length > 1 && !matches.hourRange) {
    const uniqueMinutes = new Set(matches.times.map((t) => t.minute));
    const uniqueHours = new Set(matches.times.map((t) => t.hour24));

    // If we have different minutes AND different hours, we need separate RRULEs
    // to avoid creating a cartesian product (e.g., 9:15 and 17:45 shouldn't also create 9:45 and 17:15)
    if (uniqueMinutes.size > 1 && uniqueHours.size > 1) {
      try {
        const rrules: string[] = [];
        const numTimes = matches.times.length;

        // If COUNT is specified and less than number of times, this is ambiguous
        if (matches.count !== null && matches.count < numTimes) {
          return {
            unsupported: `Ambiguous: specified ${matches.count} occurrence(s) but ${numTimes} different times. Unable to determine which times should fire. Please specify "for ${numTimes} occurrences" or more, or reduce the number of times.`,
          };
        }

        // Determine how to distribute COUNT across all times
        let countPerRule: number | null;
        let remainderCount = 0;

        if (matches.count !== null) {
          // Distribute COUNT evenly across all times
          countPerRule = Math.floor(matches.count / numTimes);
          remainderCount = matches.count % numTimes;
        } else {
          // No COUNT, create a rule for each time without COUNT
          countPerRule = null;
        }

        // Create RRULEs for all times
        for (let i = 0; i < numTimes; i++) {
          const time = matches.times[i];
          const matchesForTime = {
            ...matches,
            times: [time],
            // Distribute count: first few RRULEs get +1 if there's a remainder
            count: countPerRule !== null ? countPerRule + (i < remainderCount ? 1 : 0) : null,
          };
          const normalized = normalizeMatches(matchesForTime);
          const rrule = buildRRule(normalized);
          rrules.push(rrule);
        }

        const result: RRuleResult = { rrules };
        if (dtstart) {
          result.dtstart = dtstart;
        }
        return result;
      } catch (error) {
        return {
          unsupported: `Could not construct a valid RRULE: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
  }

  // Normal single RRULE case
  try {
    const normalized = normalizeMatches(matches);
    const rrule = buildRRule(normalized);

    const result: RRuleResult = { rrules: [rrule] };
    if (dtstart) {
      result.dtstart = dtstart;
    }
    return result;
  } catch (error) {
    return {
      unsupported: `Could not construct a valid RRULE: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Export types
export type { RRuleResult } from "./types.js";