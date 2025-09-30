export type RRuleResult = { rrules: string[]; dtstart?: string; note?: string } | { unsupported: string };

export interface ParsedTime {
  hour24: number;
  minute: number;
}