declare module 'firebase-functions/v2/scheduler' {
  export function onSchedule(
    options: Record<string, unknown>,
    handler: () => Promise<void> | void
  ): unknown;
}
