/**
 * Geen loading-UI bij navigatie binnen dashboard; voorkomt tweede scherm na "Even bezig".
 * Next.js gebruikt dit segment; we tonen niets zodat alleen de layout-loading zichtbaar is.
 */
export default function DashboardLoading() {
  return null;
}
