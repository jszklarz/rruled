<div align="center">

### Convert natural language to RRULE expressions

#### `every monday at 9am` → `FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0`

[![npm version](https://img.shields.io/npm/v/@jszkl/rruled.svg)](https://www.npmjs.com/package/@jszkl/rruled)
[![Tests](https://github.com/jszklarz/rruled/actions/workflows/publish.yml/badge.svg)](https://github.com/jszklarz/rruled/actions/workflows/publish.yml)

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/jszklarz)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink.svg?style=for-the-badge&logo=github)](https://github.com/sponsors/jszklarz)

</div>

## Features

✅ **RFC 5545 compliant** - Standard iCalendar RRULE format \
✅ Times, weekdays, dates, intervals, and nth weekday patterns \
✅ Zero dependencies \
✅ Full TypeScript support \
✅ Supports patterns cron cannot express (first monday, last friday)

## Installation

```bash
npm install @jszkl/rruled
# or
pnpm add @jszkl/rruled
# or
yarn add @jszkl/rruled
```

## Quick Start

```typescript
import { rruled } from '@jszkl/rruled';

const result = rruled("every monday at 9am");
// => { rrules: ["FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0"] }

// Check if conversion succeeded
if ("rrules" in result) {
  console.log(result.rrules[0]);
} else {
  console.error(result.unsupported); // Error message
}
```

## Examples

### Basic Schedules

```typescript
rruled("daily")
// => { rrules: ["FREQ=DAILY"] }

rruled("every day at 9am")
// => { rrules: ["FREQ=DAILY;BYHOUR=9;BYMINUTE=0"] }

rruled("every day at midnight")
// => { rrules: ["FREQ=DAILY;BYHOUR=0;BYMINUTE=0"] }

rruled("hourly")
// => { rrules: ["FREQ=HOURLY"] }

rruled("weekly")
// => { rrules: ["FREQ=WEEKLY"] }

rruled("monthly")
// => { rrules: ["FREQ=MONTHLY"] }
```

### Weekdays

```typescript
rruled("every monday")
// => { rrules: ["FREQ=WEEKLY;BYDAY=MO"] }

rruled("every monday at 9am")
// => { rrules: ["FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0"] }

rruled("every weekday at 9am")
// => { rrules: ["FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0"] }

rruled("every weekend")
// => { rrules: ["FREQ=WEEKLY;BYDAY=SA,SU"] }

rruled("every monday and friday at 5pm")
// => { rrules: ["FREQ=WEEKLY;BYDAY=MO,FR;BYHOUR=17;BYMINUTE=0"] }
```

### Nth Weekday Patterns

Unlike cron, RRULE can express nth weekday patterns:

```typescript
rruled("first monday of the month")
// => { rrules: ["FREQ=MONTHLY;BYDAY=1MO"] }

rruled("second tuesday of the month")
// => { rrules: ["FREQ=MONTHLY;BYDAY=2TU"] }

rruled("third wednesday at 2pm")
// => { rrules: ["FREQ=MONTHLY;BYDAY=3WE;BYHOUR=14;BYMINUTE=0"] }

rruled("last friday of the month")
// => { rrules: ["FREQ=MONTHLY;BYDAY=-1FR"] }

rruled("last day of the month")
// => { rrules: ["FREQ=MONTHLY;BYMONTHDAY=-1"] }

rruled("first and third monday of the month")
// => { rrules: ["FREQ=MONTHLY;BYDAY=1MO,3MO"] }
```

### Dates and Months

```typescript
rruled("on the 1st")
// => { rrules: ["FREQ=MONTHLY;BYMONTHDAY=1"] }

rruled("on the 15th at 9am")
// => { rrules: ["FREQ=MONTHLY;BYMONTHDAY=15;BYHOUR=9;BYMINUTE=0"] }

rruled("on the 1st and 15th")
// => { rrules: ["FREQ=MONTHLY;BYMONTHDAY=1,15"] }

rruled("every january")
// => { rrules: ["FREQ=YEARLY;BYMONTH=1"] }

rruled("every january and july")
// => { rrules: ["FREQ=YEARLY;BYMONTH=1,7"] }

rruled("quarterly")
// => { rrules: ["FREQ=MONTHLY;INTERVAL=3"] }

rruled("first monday of january")
// => { rrules: ["FREQ=YEARLY;BYMONTH=1;BYDAY=1MO"] }
```

### Intervals

```typescript
rruled("every 2 days")
// => { rrules: ["FREQ=DAILY;INTERVAL=2"] }

rruled("every 2 weeks")
// => { rrules: ["FREQ=WEEKLY;INTERVAL=2"] }

rruled("every 2 weeks on monday")
// => { rrules: ["FREQ=WEEKLY;INTERVAL=2;BYDAY=MO"] }

rruled("every 3 months")
// => { rrules: ["FREQ=MONTHLY;INTERVAL=3"] }

rruled("every 15 minutes")
// => { rrules: ["FREQ=MINUTELY;INTERVAL=15"] }

rruled("every 2 hours")
// => { rrules: ["FREQ=HOURLY;INTERVAL=2"] }
```

### Time Windows

```typescript
rruled("every 15 minutes between 9am and 5pm")
// => { rrules: ["FREQ=MINUTELY;INTERVAL=15;BYHOUR=9,10,11,12,13,14,15,16,17"] }

rruled("hourly between 9am and 5pm")
// => { rrules: ["FREQ=HOURLY;BYHOUR=9,10,11,12,13,14,15,16,17"] }

rruled("every weekday between 9am and 5pm")
// => { rrules: ["FREQ=HOURLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9,10,11,12,13,14,15,16,17"] }
```

### Multiple Times

```typescript
rruled("at 9am and 5pm every day")
// => { rrules: ["FREQ=DAILY;BYHOUR=9,17;BYMINUTE=0"] }

rruled("at 8am, 12pm, and 6pm every weekday")
// => { rrules: ["FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=8,12,18;BYMINUTE=0"] }

rruled("every monday and friday at 9am and 5pm")
// => { rrules: ["FREQ=WEEKLY;BYDAY=MO,FR;BYHOUR=9,17;BYMINUTE=0"] }
```

### Count Limits

```typescript
rruled("daily for 10 occurrences")
// => { rrules: ["FREQ=DAILY;COUNT=10"] }

rruled("every monday for 5 weeks")
// => { rrules: ["FREQ=WEEKLY;COUNT=5;BYDAY=MO"] }

rruled("daily for 30 days")
// => { rrules: ["FREQ=DAILY;COUNT=30"] }
```

### Complex Combinations

```typescript
rruled("every 2 weeks on monday and wednesday at 10am")
// => { rrules: ["FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;BYHOUR=10;BYMINUTE=0"] }

rruled("on the 1st and 15th of every month at 9am")
// => { rrules: ["FREQ=MONTHLY;BYMONTHDAY=1,15;BYHOUR=9;BYMINUTE=0"] }

rruled("last friday of january and june")
// => { rrules: ["FREQ=YEARLY;BYMONTH=1,6;BYDAY=-1FR"] }
```

## API

### `rruled(input: string, locale?: string): RRuleResult`

Convert natural language to RRULE expression(s). Returns a discriminated union:

```typescript
type RRuleResult =
  | { rrules: string[]; note?: string }
  | { unsupported: string }
```

**Parameters:**
- `input` - Natural language schedule description
- `locale` - Optional locale code (currently only "en" supported, planned: "es", "zh")

**Returns:** `RRuleResult` - Either success with `rrules` array or `unsupported` error message

**Example:**
```typescript
const result = rruled("every monday at 9am");
if ("rrules" in result) {
  // Success: result.rrules is string[]
  console.log(result.rrules[0]);
} else {
  // Unsupported: result.unsupported is string
  console.error(result.unsupported);
}
```

## RRULE Format

The generated RRULE expressions follow RFC 5545 (iCalendar) format:

```
FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0
```

**Components:**
- `FREQ` - Frequency (DAILY, WEEKLY, MONTHLY, YEARLY, HOURLY, MINUTELY)
- `INTERVAL` - Interval multiplier (e.g., INTERVAL=2 for "every 2 weeks")
- `COUNT` - Number of occurrences (e.g., COUNT=10 for "10 times")
- `BYDAY` - Day(s) of week (MO, TU, WE, TH, FR, SA, SU) or nth weekday (1MO, -1FR)
- `BYMONTH` - Month(s) of year (1-12)
- `BYMONTHDAY` - Day(s) of month (1-31, or -1 for last day)
- `BYHOUR` - Hour(s) of day (0-23)
- `BYMINUTE` - Minute(s) of hour (0-59)

## Supported Patterns

- **Times**: "at 9am", "at 5:30pm", "at noon", "at midnight", "at 15:00"
- **Intervals**: "every 15 minutes", "every 2 hours", "every 3 days", "every 2 weeks"
- **Frequencies**: "hourly", "daily", "weekly", "monthly", "quarterly", "yearly"
- **Weekdays**: "monday", "weekdays", "weekends", "monday and friday"
- **Nth weekdays**: "first monday", "second tuesday", "last friday", "third wednesday"
- **Months**: "january", "every jan and feb", "quarterly"
- **Dates**: "on the 1st", "on the 15th", "last day of the month"
- **Time windows**: "between 9am and 5pm"
- **Count limits**: "for 10 occurrences", "for 5 weeks"
- **Combinations**: Any combination of the above

## Advantages Over Cron

RRULE can express patterns that standard cron cannot:

| Pattern | Cron | RRULE |
|---------|------|-------|
| First Monday of month | ❌ Not possible | ✅ `FREQ=MONTHLY;BYDAY=1MO` |
| Last Friday of month | ❌ Not possible | ✅ `FREQ=MONTHLY;BYDAY=-1FR` |
| Last day of month | ❌ Not standard | ✅ `FREQ=MONTHLY;BYMONTHDAY=-1` |
| Every 2 weeks | ❌ Not possible | ✅ `FREQ=WEEKLY;INTERVAL=2` |
| Specific occurrence count | ❌ Not possible | ✅ `FREQ=DAILY;COUNT=10` |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev

# Type checking
pnpm lint
```

## License

MIT

## Contributing

Contributions welcome! Just:
- Add tests for new features
- Keep it simple and focused
- Follow the existing code style

Tests run automatically on commit. Open a PR when ready!

## Related Projects

- [@jszkl/cronned](https://github.com/jszklarz/cronned) - Convert natural language to cron expressions

## Resources

- [RFC 5545 - iCalendar](https://tools.ietf.org/html/rfc5545)
- [RRULE Specification](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html)