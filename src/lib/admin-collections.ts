/**
 * ToernooiProf/data Firestore collecties.
 * Gebaseerd op tp_* tabellen: tp_gebruikers, tp_data, tp_spelers, tp_poules, tp_uitslagen.
 */
export const TOERNOOIPROF_COLLECTIONS = [
  'organizations', // organisaties/gebruikers (tp_gebruikers equivalent)
  'toernooien',   // competities (tp_data)
  'spelers',      // spelers per toernooi (tp_spelers)
  'poules',       // poules (tp_poules)
  'uitslagen',    // partijen + uitslagen (tp_uitslagen)
  'members',      // leden
  'tables',       // tafels
  'device_config',
  'score_helpers',
  'score_helpers_tablet',
  'email_queue',
  'contact_messages',
] as const;

export type ToernooiProfCollection = (typeof TOERNOOIPROF_COLLECTIONS)[number];

export function isValidAdminCollection(collection: string): boolean {
  return TOERNOOIPROF_COLLECTIONS.includes(collection as ToernooiProfCollection);
}
