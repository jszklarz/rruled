// This is an RRULE expression converter that takes a natural language expression and attempts to convert to the representative RRULE.
//
// Notes:
// - RRULE format follows RFC 5545 (iCalendar)
// - Returns { rrules: string[] } or { unsupported: string } when text exceeds RRULE capability.

import type { RRuleResult } from "./types.js";
import { normalizeInput, parseDuration, parseTime } from "./parsers.js";
import { matchPatterns } from "./matchers.js";
import { buildRRule, normalizeMatches } from "./rrule-builder.js";

/**
 * Convert a natural language schedule description to RRULE expression(s).
 *
 * @param input - Natural language schedule description (e.g., "every monday at 9am")
 * @param locale - Optional locale code (e.g., "en", "es"). Defaults to "en"
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
export function rruled(input: string, locale: string = "en"): RRuleResult {
  const normalizedText = normalizeInput(input);

  // Handle empty or whitespace-only input
  if (!normalizedText) {
    return {
      unsupported: "Could not understand the input. Please provide a schedule description.",
    };
  }

  // Check for duration phrases that are ambiguous with COUNT
  const duration = parseDuration(normalizedText);
  if (duration) {
    return {
      unsupported: `Duration phrases like "for ${duration.value} ${duration.unit}s" are ambiguous with occurrence counts. Please use "for N occurrences" to specify a count, or consider using UNTIL with an end date instead.`,
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

        // Determine how many RRULEs to create and how to distribute COUNT
        let rulesToCreate: number;
        let countPerRule: number | null;

        if (matches.count !== null) {
          // If COUNT < numTimes, only create COUNT rules (each with COUNT=1)
          // Otherwise distribute COUNT across all times
          if (matches.count < numTimes) {
            rulesToCreate = matches.count;
            countPerRule = 1;
          } else {
            rulesToCreate = numTimes;
            countPerRule = Math.floor(matches.count / numTimes);
          }
        } else {
          // No COUNT, create a rule for each time
          rulesToCreate = numTimes;
          countPerRule = null;
        }

        const remainderCount = matches.count && matches.count >= numTimes ? matches.count % numTimes : 0;

        // Create RRULEs (limited by COUNT if necessary)
        for (let i = 0; i < rulesToCreate; i++) {
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

        return { rrules };
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

    return { rrules: [rrule] };
  } catch (error) {
    return {
      unsupported: `Could not construct a valid RRULE: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Export types
export type { RRuleResult } from "./types.js";