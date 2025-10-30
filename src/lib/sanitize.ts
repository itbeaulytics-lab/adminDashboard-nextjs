export function sanitizeText(input: string): string {
  const s = typeof input === 'string' ? input : String(input ?? '');
  const noTags = s.replace(/<[^>]*>/g, '');
  return noTags.trim();
}

export function sanitizeUrl(input: string): string {
  const clean = sanitizeText(input);
  if (!clean) return '';
  try {
    const u = new URL(clean);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString();
    return '';
  } catch {
    return '';
  }
}

export function sanitizeStringArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => sanitizeText(String(x))).filter(Boolean);
}
