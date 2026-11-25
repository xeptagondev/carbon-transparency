/**
 * A storage key is the backend-neutral path a file is stored under, e.g.
 * "documents/exports/report.csv". Every adapter builds its URL from the same key,
 * which is what lets a stored reference survive a change of FILE_SERVICE.
 */

/**
 * The prefixes every upload path is built under. Used to recognise a stored
 * reference in an outbound response, and to recover a key from a URL a client
 * echoed back.
 */
const STORAGE_KEY_PREFIXES = ["documents", "profile_images", "signatures"];

const KEY_PATTERN = new RegExp(`^(${STORAGE_KEY_PREFIXES.join("|")})/`);

/** True when the value is a bare storage key rather than an absolute URL. */
export function isStorageKey(value: string): boolean {
  return KEY_PATTERN.test(value);
}

/**
 * Turns a stored reference into a fetchable URL.
 *
 * Code that consumes a stored reference server-side - email attachments, links
 * embedded in generated PDFs, values written into an export file - never passes
 * through the response pipeline and must resolve explicitly. Legacy absolute
 * URLs are returned unchanged.
 */
export async function resolveStoredFile(
  fileHandler: { getUrl(key: string): Promise<string> },
  value: string
): Promise<string> {
  if (!value || typeof value !== "string" || !isStorageKey(value)) {
    return value;
  }
  return fileHandler.getUrl(value);
}
