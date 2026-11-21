// Display helpers.

/** Stored variant keys use " · " separators; show them as a readable list. */
export function prettyVariant(variant: string): string {
  if (variant === 'daily') return 'Daily challenge';
  const parts = variant.split(' · ');
  const text = parts.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
