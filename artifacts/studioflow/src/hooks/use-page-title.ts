import { useEffect } from "react";

/** Sets the document title (e.g. "Projects · StudioFlow") for the current page. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · StudioFlow` : "StudioFlow";
  }, [title]);
}
