import { Timestamp } from 'firebase/firestore';

export interface Poule {
  id: string;
  org_nummer: number;
  comp_nr: number;
  ronde_nr: number;
  poule_nr: number; // 1=A, 2=B, etc.
  poule_naam: string; // e.g., "Poule A"
  created_at: string | Timestamp;
}

export interface PoulePlayer {
  id: string;
  org_nummer: number;
  comp_nr: number;
  ronde_nr: number;
  poule_id: string; // Reference to Poule.id
  spc_nummer: number;
  moyenne_start: number;
  caramboles_start: number;
  naam?: string; // Enriched during fetch
}

export interface RoundInfo {
  ronde_nr: number;
  poules: Poule[];
  is_active: boolean;
}
