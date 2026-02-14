'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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

  // Warn on Next.js client-side navigation (sidebar links, programmatic navigation)
  useEffect(() => {
    // Store original router.push for interception
    const originalPush = router.push;
    const originalBack = router.back;

    if (isDirty) {
      // Intercept router.push
      router.push = (href: string, options?: Record<string, unknown>) => {
        if (window.confirm(message)) {
          originalPush.call(router, href, options);
        }
      };

      // Intercept router.back
      router.back = () => {
        if (window.confirm(message)) {
          originalBack.call(router);
        }
      };
    }

    return () => {
      // Restore original methods
      router.push = originalPush;
      router.back = originalBack;
    };
  }, [isDirty, message, router]);
}
