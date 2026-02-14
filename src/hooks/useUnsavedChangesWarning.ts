'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to warn users about unsaved form changes before navigation
 *
 * @param isDirty - Whether the form has unsaved changes
 * @param message - Optional custom warning message
 *
 * @example
 * const [formData, setFormData] = useState({ name: '' });
 * const [isDirty, setIsDirty] = useState(false);
 *
 * const handleChange = (e) => {
 *   setFormData({ ...formData, [e.target.name]: e.target.value });
 *   setIsDirty(true);
 * };
 *
 * useUnsavedChangesWarning(isDirty);
 */
export function useUnsavedChangesWarning(
  isDirty: boolean,
  message: string = 'Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je deze pagina wilt verlaten?'
) {
  const pathname = usePathname();

  // Warn on browser navigation (refresh, close tab, back/forward buttons)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Modern browsers ignore custom messages and show their own
        // But we still need to set returnValue for the dialog to appear
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  // Warn on client-side navigation (Link clicks, browser back button)
  useEffect(() => {
    if (!isDirty) return;

    // Intercept all link clicks to show confirmation dialog
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        // Only warn if navigating to a different page
        if (url.pathname !== currentUrl.pathname) {
          if (!window.confirm(message)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    // Intercept browser back/forward buttons
    const handlePopState = (e: PopStateEvent) => {
      if (!window.confirm(message)) {
        // Push state back to current page
        window.history.pushState(null, '', pathname);
      }
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, message, pathname]);
}
