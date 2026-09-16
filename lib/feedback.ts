export const feedbackKinds = [
  'missing',
  'mismatch',
  'unclear',
  'quality',
] as const;
export function screenFeedback(summary: string) {
  // Short, misspelled and non-Latin requests are valid. Only strong spam signals are quarantined.
  return /(.)\1{24}/u.test(summary) ||
    (summary.match(/https?:\/\//gi) || []).length >= 3
    ? 'quarantined'
    : 'pending';
}
export function validFeedback(
  b: unknown,
): b is {
  summary: string;
  context: string;
  kind: string;
  consent: true;
  website: string;
} {
  if (!b || typeof b !== 'object') return false;
  const x = b as Record<string, unknown>;
  return (
    typeof x.summary === 'string' &&
    x.summary.trim().length >= 2 &&
    x.summary.length <= 1000 &&
    typeof x.context === 'string' &&
    x.context.length <= 200 &&
    typeof x.kind === 'string' &&
    (feedbackKinds as readonly string[]).includes(x.kind) &&
    x.consent === true &&
    typeof x.website === 'string'
  );
}
