export function resolvePhotoUrl(raw?: string | null) {
  if (!raw) return null;
  // If it looks like a file:// URL, strip it and convert to a relative path
  if (raw.startsWith('file://')) {
    try {
      const withoutScheme = raw.replace(/^file:\/\//, '');
      // keep only the filename and map to /user_photos/<name>
      const parts = withoutScheme.split(/\\|\//);
      const name = parts[parts.length - 1];
      return `/user_photos/${name}`;
    } catch (e) {
      return null;
    }
  }

  // If already a relative URL starting with /, prefix with backend origin (assume backend runs on port 3000)
  if (raw.startsWith('/')) {
    try {
      const host = window.location.hostname || 'localhost';
      const proto = window.location.protocol || 'http:';
      const backendPort = 3000;
      return `${proto}//${host}:${backendPort}${raw}`;
    } catch (e) {
      return raw;
    }
  }

  // If it already looks like an http(s) URL, return as-is
  if (/^https?:\/\//i.test(raw)) return raw;

  // Fallback: treat as a filename in /user_photos
  return `/user_photos/${raw}`;
}
