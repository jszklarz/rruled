import { describe, it, expect } from "vitest";
import { rruled } from "./index.js";

/**
 * ReDoS (Regular Expression Denial of Service) protection tests.
 *
 * These tests ensure that malicious or pathological inputs cannot cause
 * catastrophic backtracking in our regex patterns, which could lead to
 * CPU exhaustion and denial of service.
 *
 * Each test has a reasonable timeout to detect exponential-time behavior.
 */
describe("ReDoS protection", () => {
  const TIMEOUT_MS = 100; // Should complete well under 100ms

  describe("repeated words and patterns", () => {
    it(
      "handles extremely long repeated weekday names",
      () => {
        // Repeat "monday " 1000 times
        const input = "monday ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles extremely long repeated "every" keywords',
      () => {
        const input = "every ".repeat(1000) + "day";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles repeated "at" keywords',
      () => {
        const input = "at ".repeat(1000) + "9am";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles repeated "first/last" keywords',
      () => {
        const input = "first ".repeat(1000) + "monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("pathological whitespace patterns", () => {
    it(
      "handles excessive spaces",
      () => {
        const input = "every" + " ".repeat(10000) + "monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles alternating text and spaces",
      () => {
        let input = "";
        for (let i = 0; i < 500; i++) {
          input += "a ";
        }
        input += "monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles spaces in time patterns",
      () => {
        const input = "at" + " ".repeat(5000) + "9am";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("pathological comma patterns", () => {
    it(
      "handles excessive commas",
      () => {
        const input = ",".repeat(10000) + "every monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles alternating commas and spaces",
      () => {
        const input = ", ".repeat(5000) + "every monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles commas in weekday lists",
      () => {
        const input = "monday" + ",".repeat(1000) + " tuesday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("pathological time patterns", () => {
    it(
      "handles repeated time-like patterns",
      () => {
        const input = "99:99 ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles repeated invalid negative times",
      () => {
        const input = "-99:99 ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles repeated "between" keywords',
      () => {
        const input = "between ".repeat(1000) + "9am and 5pm";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles alternating numbers and colons",
      () => {
        const input = "1:2:3:4:5:".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles repeated am/pm markers",
      () => {
        const input = "ampmampm".repeat(5000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("pathological day-of-month patterns", () => {
    it(
      'handles repeated "on the" patterns',
      () => {
        const input = "on the ".repeat(1000) + "1st";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles repeated ordinal suffixes",
      () => {
        const input = "on the 1stndrdth".repeat(500);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles repeated "last day" patterns',
      () => {
        const input = "last day ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("pathological month patterns", () => {
    it(
      "handles repeated month names",
      () => {
        const input =
          "january february march april may june july august september october november december ".repeat(
            100,
          );
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles month abbreviations",
      () => {
        const input = "jan feb mar apr may jun jul aug sep oct nov dec ".repeat(200);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("pathological interval patterns", () => {
    it(
      'handles repeated "every N" patterns',
      () => {
        const input = "every 2 ".repeat(1000) + "days";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles large interval numbers",
      () => {
        const input = "every 999999999 days";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles repeated "for N" patterns',
      () => {
        const input = "for 10 ".repeat(1000) + "occurrences";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("pathological nth weekday patterns", () => {
    it(
      "handles repeated position words",
      () => {
        const input = "first second third fourth fifth last ".repeat(200) + "monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles repeated "of the month" patterns',
      () => {
        const input = "first monday of the month ".repeat(500);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      'handles "and" between position words',
      () => {
        const input = "first and second and third and ".repeat(500) + "monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("extremely long inputs", () => {
    it(
      "handles 100KB of random text",
      () => {
        const input = "x".repeat(100000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles 100KB of valid keywords",
      () => {
        const input = "every monday at 9am ".repeat(5000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles very long time lists",
      () => {
        let input = "at ";
        for (let i = 0; i < 1000; i++) {
          input += `${i % 12 || 12}:${i % 60}am, `;
        }
        input += "every day";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("nested quantifiers simulation", () => {
    it(
      "handles patterns that might cause backtracking",
      () => {
        // Patterns like "aaaaaaaaaaaab" that don't match expected patterns
        const input = "a".repeat(10000) + "b";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles almost-matching patterns",
      () => {
        // "mondaymondaymonday" without spaces - shouldn't match but shouldn't hang
        const input = "monday".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles alternating valid/invalid characters",
      () => {
        const input = "m1o2n3d4a5y6".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("unicode and special characters", () => {
    it(
      "handles unicode characters",
      () => {
        const input = "\u{1F4A9}".repeat(1000) + " every monday";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles mixed unicode and ascii",
      () => {
        const input = "every \u{1F4A9} monday \u{1F4A9} at \u{1F4A9} 9am";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles unicode in time patterns",
      () => {
        const input = "at 9\u{1F4A9}:30\u{1F4A9}am";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("boundary testing", () => {
    it(
      "handles maximum valid day numbers repeated",
      () => {
        const input = "on the 31st ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles maximum valid hour values repeated",
      () => {
        const input = "at 23:59 ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles minimum valid values repeated",
      () => {
        const input = "at 0:00 ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("combined attack vectors", () => {
    it(
      "handles multiple pathological patterns combined",
      () => {
        const input =
          " ".repeat(1000) +
          ",".repeat(1000) +
          "every".repeat(100) +
          " monday".repeat(100) +
          " at 9am";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles alternating valid and invalid patterns",
      () => {
        let input = "";
        for (let i = 0; i < 100; i++) {
          input += "every monday xxxxxxxx ";
        }
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles complex nested patterns",
      () => {
        const input =
          "first second third last first second third last ".repeat(250) +
          "monday of every month at 9:30am between 9am and 5pm";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles all features combined with repetition",
      () => {
        const input = (
          "every 2 weeks on first and last monday of january and june " +
          "at 9:15am and 5:30pm between 9am and 5pm for 10 occurrences "
        ).repeat(100);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("hour range edge cases", () => {
    it(
      "handles repeated overnight range patterns",
      () => {
        const input = "between 11pm and 2am ".repeat(500);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles malformed range patterns",
      () => {
        const input = "between and and between ".repeat(1000);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });

  describe("duration vs count patterns", () => {
    it(
      "handles repeated duration phrases",
      () => {
        const input = "for 5 weeks for 10 days for 3 months ".repeat(500);
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );

    it(
      "handles large duration numbers",
      () => {
        const input = "every monday for 999999 weeks";
        const result = rruled(input);
        expect(result).toBeDefined();
      },
      TIMEOUT_MS,
    );
  });
});