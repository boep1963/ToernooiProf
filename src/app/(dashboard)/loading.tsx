import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Toont tijdens navigatie binnen het dashboard een lichte loading state.
 * De fullscreen "App is aan het laden" is alleen voor eerste startup (StartupGuard / auth).
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[280px]">
      <LoadingSpinner size="lg" label="Pagina laden..." />
    </div>
  );
}
