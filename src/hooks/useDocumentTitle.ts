import { useEffect } from "react";

/**
 * Sets document.title when a resolved title string is provided.
 */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    const trimmed = title?.trim();
    if (trimmed) {
      document.title = trimmed;
    }
  }, [title]);
}
