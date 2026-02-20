import { useRef, useCallback } from 'react';

/**
 * Hook to prevent duplicate form submissions
 *
 * This hook prevents the same form from being submitted multiple times,
 * even if the user uses the browser back button after a successful submission.
 *
 * Usage:
 *   const { canSubmit, markSubmitted, resetSubmit } = useSubmitOnce('unique-form-id');
 *
 *   const handleSubmit = async () => {
 *     if (!canSubmit()) return; // Silent prevention
 *
 *     // ... perform submission ...
 *
 *     if (success) {
 *       markSubmitted(); // Mark as submitted to prevent future submits
 *     }
 *   };
 */
export function useSubmitOnce(formId: string) {
  const submittedRef = useRef(false);
  const storageKey = `form_submitted_${formId}`;

  /**
   * Check if this form can be submitted
   * Returns false if already submitted (prevents double-submit)
   */
  const canSubmit = useCallback((): boolean => {
    // Check in-memory flag first (fastest)
    if (submittedRef.current) {
      return false;
    }

    // Check sessionStorage (survives component unmount but not tab close)
    try {
      const wasSubmitted = sessionStorage.getItem(storageKey);
      if (wasSubmitted === 'true') {
        submittedRef.current = true;
        return false;
      }
    } catch {
      // If sessionStorage fails (privacy mode, etc.), rely on ref only
    }

    return true;
  }, [storageKey]);

  /**
   * Mark this form as successfully submitted
   * Prevents future submissions until reset or page reload
   */
  const markSubmitted = useCallback(() => {
    submittedRef.current = true;
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  }, [storageKey]);

  /**
   * Reset the submission state
   * Use this if you want to allow re-submission (e.g., after validation error)
   */
  const resetSubmit = useCallback(() => {
    submittedRef.current = false;
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  }, [storageKey]);

  return {
    canSubmit,
    markSubmitted,
    resetSubmit,
  };
}
