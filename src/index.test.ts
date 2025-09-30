import { describe, it, expect } from "vitest";
import { rruled } from "./index.js";

describe("rruled - Basic Frequencies", () => {
  describe("Daily patterns", () => {
    it("should convert 'daily'", () => {
      const result = rruled("daily");
      expect(result).toEqual({ rrules: ["FREQ=DAILY"] });
    });

    it("should convert 'every day'", () => {
      const result = rruled("every day");
      expect(result).toEqual({ rrules: ["FREQ=DAILY"] });
    });

    it("should convert 'daily at 9am'", () => {
      const result = rruled("daily at 9am");
      expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=9;BYMINUTE=0"] });
    });

    it("should convert 'every day at 9:30am'", () => {
      const result = rruled("every day at 9:30am");
      expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=9;BYMINUTE=30"] });
    });

    it("should convert 'every day at midnight'", () => {
      const result = rruled("every day at midnight");
      expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=0;BYMINUTE=0"] });
    });

    it("should convert 'every day at noon'", () => {
      const result = rruled("every day at noon");
      expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=12;BYMINUTE=0"] });
    });
  });

  describe("Weekly patterns", () => {
    it("should convert 'weekly'", () => {
      const result = rruled("weekly");
      expect(result).toEqual({ rrules: ["FREQ=WEEKLY"] });
    });

    it("should convert 'every week'", () => {
      const result = rruled("every week");
      expect(result).toEqual({ rrules: ["FREQ=WEEKLY"] });
    });

    it("should convert 'weekly at 9am'", () => {
      const result = rruled("weekly at 9am");
      expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYHOUR=9;BYMINUTE=0"] });
    });
  });

  describe("Monthly patterns", () => {
    it("should convert 'monthly'", () => {
      const result = rruled("monthly");
      expect(result).toEqual({ rrules: ["FREQ=MONTHLY"] });
    });

    it("should convert 'every month'", () => {
      const result = rruled("every month");
      expect(result).toEqual({ rrules: ["FREQ=MONTHLY"] });
    });

    it("should convert 'monthly at 9am'", () => {
      const result = rruled("monthly at 9am");
      expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYHOUR=9;BYMINUTE=0"] });
    });

    it("should convert 'on the 1st'", () => {
      const result = rruled("on the 1st");
      expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYMONTHDAY=1"] });
    });

    it("should convert 'on the 15th at 9am'", () => {
      const result = rruled("on the 15th at 9am");
      expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYMONTHDAY=15;BYHOUR=9;BYMINUTE=0"] });
    });

    it("should convert 'on the 1st and 15th'", () => {
      const result = rruled("on the 1st and 15th");
      expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYMONTHDAY=1,15"] });
    });
  });

  describe("Yearly patterns", () => {
    it("should convert 'yearly'", () => {
      const result = rruled("yearly");
      expect(result).toEqual({ rrules: ["FREQ=YEARLY"] });
    });

    it("should convert 'annually'", () => {
      const result = rruled("annually");
      expect(result).toEqual({ rrules: ["FREQ=YEARLY"] });
    });

    it("should convert 'every year'", () => {
      const result = rruled("every year");
      expect(result).toEqual({ rrules: ["FREQ=YEARLY"] });
    });
  });

  describe("Hourly patterns", () => {
    it("should convert 'hourly'", () => {
      const result = rruled("hourly");
      expect(result).toEqual({ rrules: ["FREQ=HOURLY"] });
    });

    it("should convert 'every hour'", () => {
      const result = rruled("every hour");
      expect(result).toEqual({ rrules: ["FREQ=HOURLY"] });
    });
  });
});

describe("rruled - Weekday Patterns", () => {
  it("should convert 'every monday'", () => {
    const result = rruled("every monday");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO"] });
  });

  it("should convert 'every monday at 9am'", () => {
    const result = rruled("every monday at 9am");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0"] });
  });

  it("should convert 'every tuesday and thursday'", () => {
    const result = rruled("every tuesday and thursday");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=TU,TH"] });
  });

  it("should convert 'every monday, wednesday, and friday at 9am'", () => {
    const result = rruled("every monday, wednesday, and friday at 9am");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=0"] });
  });

  it("should convert 'every weekday'", () => {
    const result = rruled("every weekday");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"] });
  });

  it("should convert 'every weekday at 9am'", () => {
    const result = rruled("every weekday at 9am");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0"] });
  });

  it("should convert 'every weekend'", () => {
    const result = rruled("every weekend");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=SA,SU"] });
  });

  it("should convert 'every saturday and sunday at 10am'", () => {
    const result = rruled("every saturday and sunday at 10am");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=SA,SU;BYHOUR=10;BYMINUTE=0"] });
  });
});

describe("rruled - Nth Weekday Patterns", () => {
  it("should convert 'first monday of the month'", () => {
    const result = rruled("first monday of the month");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYDAY=1MO"] });
  });

  it("should convert 'first monday of every month'", () => {
    const result = rruled("first monday of every month");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYDAY=1MO"] });
  });

  it("should convert 'second tuesday of the month'", () => {
    const result = rruled("second tuesday of the month");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYDAY=2TU"] });
  });

  it("should convert 'third wednesday at 2pm'", () => {
    const result = rruled("third wednesday at 2pm");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYDAY=3WE;BYHOUR=14;BYMINUTE=0"] });
  });

  it("should convert 'last friday of the month'", () => {
    const result = rruled("last friday of the month");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYDAY=-1FR"] });
  });

  it("should convert 'last friday of every month at 5pm'", () => {
    const result = rruled("last friday of every month at 5pm");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYDAY=-1FR;BYHOUR=17;BYMINUTE=0"] });
  });

  it("should convert 'last day of the month'", () => {
    const result = rruled("last day of the month");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYMONTHDAY=-1"] });
  });

  it("should convert 'last day of every month at midnight'", () => {
    const result = rruled("last day of every month at midnight");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYMONTHDAY=-1;BYHOUR=0;BYMINUTE=0"] });
  });
});

describe("rruled - Interval Patterns", () => {
  it("should convert 'every 2 days'", () => {
    const result = rruled("every 2 days");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;INTERVAL=2"] });
  });

  it("should convert 'every 3 days at 9am'", () => {
    const result = rruled("every 3 days at 9am");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;INTERVAL=3;BYHOUR=9;BYMINUTE=0"] });
  });

  it("should convert 'every 2 weeks'", () => {
    const result = rruled("every 2 weeks");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;INTERVAL=2"] });
  });

  it("should convert 'every 2 weeks on monday'", () => {
    const result = rruled("every 2 weeks on monday");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;INTERVAL=2;BYDAY=MO"] });
  });

  it("should convert 'every 3 months'", () => {
    const result = rruled("every 3 months");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;INTERVAL=3"] });
  });

  it("should convert 'every 6 months on the 1st'", () => {
    const result = rruled("every 6 months on the 1st");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=1"] });
  });

  it("should convert 'every 2 hours'", () => {
    const result = rruled("every 2 hours");
    expect(result).toEqual({ rrules: ["FREQ=HOURLY;INTERVAL=2"] });
  });

  it("should convert 'every 15 minutes'", () => {
    const result = rruled("every 15 minutes");
    expect(result).toEqual({ rrules: ["FREQ=MINUTELY;INTERVAL=15"] });
  });

  it("should convert 'every 30 minutes'", () => {
    const result = rruled("every 30 minutes");
    expect(result).toEqual({ rrules: ["FREQ=MINUTELY;INTERVAL=30"] });
  });
});

describe("rruled - Specific Months", () => {
  it("should convert 'every january'", () => {
    const result = rruled("every january");
    expect(result).toEqual({ rrules: ["FREQ=YEARLY;BYMONTH=1"] });
  });

  it("should convert 'every january at 9am'", () => {
    const result = rruled("every january at 9am");
    expect(result).toEqual({ rrules: ["FREQ=YEARLY;BYMONTH=1;BYHOUR=9;BYMINUTE=0"] });
  });

  it("should convert 'every january and july'", () => {
    const result = rruled("every january and july");
    expect(result).toEqual({ rrules: ["FREQ=YEARLY;BYMONTH=1,7"] });
  });

  it("should convert 'every march, june, september, and december'", () => {
    const result = rruled("every march, june, september, and december");
    expect(result).toEqual({ rrules: ["FREQ=YEARLY;BYMONTH=3,6,9,12"] });
  });

  it("should convert 'quarterly'", () => {
    const result = rruled("quarterly");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;INTERVAL=3"] });
  });

  it("should convert 'every monday in january'", () => {
    const result = rruled("every monday in january");
    expect(result).toEqual({ rrules: ["FREQ=YEARLY;BYMONTH=1;BYDAY=MO"] });
  });

  it("should convert 'first monday of january'", () => {
    const result = rruled("first monday of january");
    expect(result).toEqual({ rrules: ["FREQ=YEARLY;BYMONTH=1;BYDAY=1MO"] });
  });
});

describe("rruled - Time Windows and Multiple Times", () => {
  it("should convert 'every 15 minutes between 9am and 5pm'", () => {
    const result = rruled("every 15 minutes between 9am and 5pm");
    expect(result).toEqual({ rrules: ["FREQ=MINUTELY;INTERVAL=15;BYHOUR=9,10,11,12,13,14,15,16,17"] });
  });

  it("should convert 'hourly between 9am and 5pm'", () => {
    const result = rruled("hourly between 9am and 5pm");
    expect(result).toEqual({ rrules: ["FREQ=HOURLY;BYHOUR=9,10,11,12,13,14,15,16,17"] });
  });

  it("should convert 'every weekday between 9am and 5pm'", () => {
    const result = rruled("every weekday between 9am and 5pm");
    expect(result).toEqual({ rrules: ["FREQ=HOURLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9,10,11,12,13,14,15,16,17"] });
  });

  it("should convert 'at 9am and 5pm every day'", () => {
    const result = rruled("at 9am and 5pm every day");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=9,17;BYMINUTE=0"] });
  });

  it("should convert 'at 8am, 12pm, and 6pm every weekday'", () => {
    const result = rruled("at 8am, 12pm, and 6pm every weekday");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8,12,18;BYMINUTE=0"] });
  });

  it("should handle mixed hour/minute pairs without cartesian product", () => {
    // Bug: should NOT create 9:15, 9:45, 17:15, 17:45 (4 times)
    // Should only create 9:15 and 17:45 (2 times)
    const result = rruled("at 9:15am and 5:45pm every day");

    // Since RRULE BYHOUR+BYMINUTE creates a cartesian product,
    // we must split into separate RRULEs when hour/minute pairs differ
    if ("rrules" in result) {
      expect(result.rrules.length).toBeGreaterThanOrEqual(2);
      // Should have separate rules for each time
      expect(result.rrules).toContain("FREQ=DAILY;BYHOUR=9;BYMINUTE=15");
      expect(result.rrules).toContain("FREQ=DAILY;BYHOUR=17;BYMINUTE=45");
    } else {
      throw new Error("Expected rrules, got unsupported");
    }
  });

  it("should handle three different hour/minute pairs", () => {
    const result = rruled("at 9:15am, 12:30pm, and 6:45pm every day");

    if ("rrules" in result) {
      expect(result.rrules.length).toBe(3);
      expect(result.rrules).toContain("FREQ=DAILY;BYHOUR=9;BYMINUTE=15");
      expect(result.rrules).toContain("FREQ=DAILY;BYHOUR=12;BYMINUTE=30");
      expect(result.rrules).toContain("FREQ=DAILY;BYHOUR=18;BYMINUTE=45");
    } else {
      throw new Error("Expected rrules, got unsupported");
    }
  });

  it("should NOT duplicate COUNT when splitting hour/minute pairs", () => {
    // "for 10 occurrences" should mean 10 TOTAL, not 10 per time
    const result = rruled("daily at 9:15am and 5:45pm for 10 occurrences");

    if ("rrules" in result) {
      // Should split into 2 RRULEs to avoid cartesian product
      expect(result.rrules.length).toBe(2);

      // COUNT should be distributed: 5 for first time, 5 for second time
      // Or omitted entirely with a note
      const totalCount = result.rrules.reduce((sum, rule) => {
        const countMatch = rule.match(/COUNT=(\d+)/);
        return sum + (countMatch ? parseInt(countMatch[1], 10) : 0);
      }, 0);

      // Total should be 10, not 20
      expect(totalCount).toBe(10);
    } else {
      // If we can't handle it, at least it should be marked unsupported
      expect(result.unsupported).toBeDefined();
    }
  });

  it("should handle COUNT less than number of times (only emit COUNT rules)", () => {
    // "for 1 occurrence" with 2 times should only emit 1 RRULE, not 2
    const result = rruled("daily at 9:15am and 5:45pm for 1 occurrence");

    if ("rrules" in result) {
      // Should only create 1 RRULE since COUNT=1
      expect(result.rrules.length).toBe(1);
      expect(result.rrules[0]).toContain("COUNT=1");
      expect(result.rrules[0]).toContain("BYHOUR=9");
      expect(result.rrules[0]).toContain("BYMINUTE=15");
    } else {
      throw new Error("Expected rrules, got unsupported");
    }
  });

  it("should handle COUNT=2 with 3 times (only emit 2 rules)", () => {
    const result = rruled("daily at 9:15am, 12:30pm, and 5:45pm for 2 occurrences");

    if ("rrules" in result) {
      // Should only create 2 RRULEs since COUNT=2
      expect(result.rrules.length).toBe(2);

      // Both should have COUNT=1
      expect(result.rrules[0]).toContain("COUNT=1");
      expect(result.rrules[1]).toContain("COUNT=1");

      // Should be first 2 times
      expect(result.rrules[0]).toContain("BYHOUR=9");
      expect(result.rrules[1]).toContain("BYHOUR=12");
    } else {
      throw new Error("Expected rrules, got unsupported");
    }
  });
});

describe("rruled - Complex Combinations", () => {
  it("should convert 'every monday and friday at 9am and 5pm'", () => {
    const result = rruled("every monday and friday at 9am and 5pm");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO,FR;BYHOUR=9,17;BYMINUTE=0"] });
  });

  it("should convert 'first and third monday of the month'", () => {
    const result = rruled("first and third monday of the month");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYDAY=1MO,3MO"] });
  });

  it("should convert 'every 2 weeks on monday and wednesday at 10am'", () => {
    const result = rruled("every 2 weeks on monday and wednesday at 10am");
    expect(result).toEqual({ rrules: ["FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;BYHOUR=10;BYMINUTE=0"] });
  });

  it("should convert 'on the 1st and 15th of every month at 9am'", () => {
    const result = rruled("on the 1st and 15th of every month at 9am");
    expect(result).toEqual({ rrules: ["FREQ=MONTHLY;BYMONTHDAY=1,15;BYHOUR=9;BYMINUTE=0"] });
  });

  it("should convert 'last friday of january and june'", () => {
    const result = rruled("last friday of january and june");
    expect(result).toEqual({ rrules: ["FREQ=YEARLY;BYMONTH=1,6;BYDAY=-1FR"] });
  });
});

describe("rruled - Edge Cases", () => {
  it("should handle empty input", () => {
    const result = rruled("");
    expect(result).toHaveProperty("unsupported");
  });

  it("should handle whitespace only", () => {
    const result = rruled("   ");
    expect(result).toHaveProperty("unsupported");
  });

  it("should handle nonsensical input", () => {
    const result = rruled("purple elephant dancing");
    expect(result).toHaveProperty("unsupported");
  });

  it("should handle ambiguous input", () => {
    const result = rruled("sometime next week");
    expect(result).toHaveProperty("unsupported");
  });
});

describe("rruled - Start Dates and Counts", () => {
  it("should convert 'daily for 10 occurrences'", () => {
    const result = rruled("daily for 10 occurrences");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;COUNT=10"] });
  });

  it("should mark 'every monday for 5 weeks' as unsupported (duration ambiguity)", () => {
    const result = rruled("every monday for 5 weeks");
    expect(result).toHaveProperty("unsupported");
    if ("unsupported" in result) {
      expect(result.unsupported).toContain("ambiguous");
    }
  });

  it("should mark 'daily for 30 days' as unsupported (duration ambiguity)", () => {
    const result = rruled("daily for 30 days");
    expect(result).toHaveProperty("unsupported");
    if ("unsupported" in result) {
      expect(result.unsupported).toContain("ambiguous");
    }
  });
});

describe("rruled - Time Formats", () => {
  it("should handle 12-hour format with am/pm", () => {
    const result = rruled("every day at 3pm");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=15;BYMINUTE=0"] });
  });

  it("should handle 24-hour format", () => {
    const result = rruled("every day at 15:00");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=15;BYMINUTE=0"] });
  });

  it("should handle times with minutes", () => {
    const result = rruled("every day at 9:30am");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=9;BYMINUTE=30"] });
  });

  it("should handle times without colons", () => {
    const result = rruled("every day at 9am");
    expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=9;BYMINUTE=0"] });
  });
});

describe("rruled - Bug Fixes", () => {
  describe("BYMINUTE with multiple different minute values", () => {
    it("should handle multiple times at same hour with different minutes", () => {
      const result = rruled("every day at 9:15am and 9:45am");
      expect(result).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=9;BYMINUTE=15,45"] });
    });

    it("should handle times at different hours with different minutes", () => {
      const result = rruled("every day at 9:15am and 10:30am");
      // Should create separate RRULEs to avoid cartesian product (9:15, 9:30, 10:15, 10:30)
      expect(result).toEqual({
        rrules: [
          "FREQ=DAILY;BYHOUR=9;BYMINUTE=15",
          "FREQ=DAILY;BYHOUR=10;BYMINUTE=30",
        ],
      });
    });

    it("should not drop minutes when they differ", () => {
      const result = rruled("at 9:15am and 9:45am on weekdays");
      expect(result).toEqual({ rrules: ["FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=15,45"] });
    });
  });

  describe("Overnight hour ranges", () => {
    it("should handle or reject overnight ranges (9pm to 5am)", () => {
      const result = rruled("hourly between 9pm and 5am");
      if ("rrules" in result) {
        // If supported, should normalize to 21-23,0-5
        expect(result.rrules[0]).toContain("BYHOUR=21,22,23,0,1,2,3,4,5");
      } else {
        // If not supported, should provide clear error
        expect(result.unsupported).toContain("overnight");
      }
    });

    it("should handle or reject range wrapping midnight (11pm to 2am)", () => {
      const result = rruled("every 15 minutes between 11pm and 2am");
      if ("rrules" in result) {
        expect(result.rrules[0]).toContain("BYHOUR=23,0,1,2");
      } else {
        expect(result.unsupported).toContain("overnight");
      }
    });
  });

  describe("Duration vs occurrence count", () => {
    it("should interpret 'for N weeks' with multiple days per week correctly", () => {
      const result = rruled("every monday and wednesday for 5 weeks");
      if ("rrules" in result) {
        // Should fire 10 times (2 days × 5 weeks), not 5 times
        expect(result.rrules[0]).toContain("COUNT=10");
      } else {
        // Or explain this is a duration, not count
        expect(result.unsupported).toBeDefined();
      }
    });

    it("should interpret 'for N days' with hourly frequency correctly", () => {
      const result = rruled("every hour for 30 days");
      if ("rrules" in result) {
        // Should fire for 30 days (720 hours), not 30 times
        expect(result.rrules[0]).toContain("COUNT=720");
      } else {
        // Or explain this needs UNTIL instead of COUNT
        expect(result.unsupported).toBeDefined();
      }
    });

    it("should handle 'for N occurrences' literally", () => {
      const result = rruled("daily for 10 occurrences");
      expect(result).toEqual({ rrules: ["FREQ=DAILY;COUNT=10"] });
    });
  });

  describe("Invalid time bounds", () => {
    it("should reject hour > 23", () => {
      const result = rruled("every day at 25:00");
      expect(result).toHaveProperty("unsupported");
      if ("unsupported" in result) {
        expect(result.unsupported).toMatch(/invalid.*time|hour.*valid/i);
      }
    });

    it("should reject minute > 59", () => {
      const result = rruled("every day at 9:99am");
      expect(result).toHaveProperty("unsupported");
      if ("unsupported" in result) {
        expect(result.unsupported).toMatch(/invalid.*time|minute.*valid/i);
      }
    });

    it("should reject negative hours", () => {
      const result = rruled("every day at -5:00");
      expect(result).toHaveProperty("unsupported");
      if ("unsupported" in result) {
        expect(result.unsupported).toMatch(/invalid.*time|hour.*valid/i);
      }
    });

    it("should reject hour 25 even with am/pm", () => {
      const result = rruled("every day at 25am");
      expect(result).toHaveProperty("unsupported");
      if ("unsupported" in result) {
        expect(result.unsupported).toMatch(/invalid.*time|hour.*valid/i);
      }
    });

    it("should accept valid edge cases (midnight and 23:59)", () => {
      const result1 = rruled("every day at midnight");
      expect(result1).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=0;BYMINUTE=0"] });

      const result2 = rruled("every day at 23:59");
      expect(result2).toEqual({ rrules: ["FREQ=DAILY;BYHOUR=23;BYMINUTE=59"] });
    });
  });
});