// Gebruiker (mapped from tp_gebruikers)
export interface Gebruiker {
  gebruiker_nr: number;
  gebruiker_code: string;
  openbaar: number; // 0=privé, 1=openbaar, 2=standaard
  gebruiker_naam: string;
  loc_naam: string;
  loc_straat: string;
  loc_pc: string;
  loc_plaats: string;
  gebruiker_logo: string;
  tp_wl_naam: string;
  tp_wl_email: string;
  toon_email: number;
  aantal_tafels: number;
  return_code: number;
  time_start: number;
  code_ontvangen: number;
  date_start: string;
  date_inlog: string;
  nieuwsbrief: number;
  reminder_send: number;
  firebase_uid?: string;
  theme_preference?: 'light' | 'dark';
}

// Organization – alias for Gebruiker (kept for auth compatibility)
export interface Organization {
  org_nummer: number;
  org_code: string;
  org_naam: string;
  org_wl_naam: string;
  org_wl_email: string;
  org_logo: string;
  aantal_tafels: number;
  return_code: number;
  time_start: number;
  code_ontvangen: number;
  date_start: Date;
  date_inlog: Date;
  nieuwsbrief: number;
  reminder_send: number;
  firebase_uid?: string;
  theme_preference?: 'light' | 'dark';
}

// Tournament (mapped from tp_data)
export interface Tournament {
  gebruiker_nr: number;  // = org_nummer (routing key)
  t_nummer: number;      // = comp_nr (routing key)
  t_naam: string;        // tournament name
  t_datum: string;       // free text "sub-titel" (not a date!)
  datum_start: string;   // start date dd-mm-yyyy
  datum_eind: string;    // end date dd-mm-yyyy
  discipline: number;    // 1=Libre, 2=Bandstoten, 3=Driebanden klein, 4=Driebanden groot, 5=Kader
  t_car_sys: number;     // 1=moyenne-formule, 2=vrije invoer
  t_moy_form: number;    // 1=x20, 2=x25, 3=x30, 4=x40, 5=x50, 6=x60
  t_punten_sys: number;  // 1=WRV 2-1-0, 2=10-punten, 3=Belgisch
  t_min_car: number;
  t_max_beurten: number; // 0=geen limiet
  t_gestart: number;     // 0=nee, 1=ja
  t_ronde: number;       // huidige ronde
  openbaar: number;      // 0=nee, 1=ja (stand openbaar)
  // Legacy routing aliases (kept for URL routing compatibility)
  org_nummer?: number;
  comp_nr?: number;
  comp_naam?: string;
}

// TournamentPlayer (mapped from tp_spelers)
export interface TournamentPlayer {
  gebruiker_nr: number;
  t_nummer: number;
  sp_nummer: number;
  sp_naam: string;       // één naamveld (niet gesplitst!)
  sp_startmoy: number;   // startmoyenne
  sp_startcar: number;   // te maken caramboles (0 bij moyenne-formule)
}

// Poule assignment (mapped from tp_poules)
export interface Poule {
  poule_id?: number;
  gebruiker_nr: number;
  t_nummer: number;
  sp_nummer: number;     // FK naar tp_spelers
  sp_moy: number;        // moyenne in deze ronde
  sp_car: number;        // te maken caramboles in deze ronde
  sp_volgnr: number;     // volgorde in poule
  poule_nr: number;      // poule 1..25
  ronde_nr: number;      // toernooironde 1..n
}

// Uitslag (mapped from tp_uitslagen – combineert partij + uitslag)
export interface Uitslag {
  uitslag_id?: number;
  gebruiker_nr: number;
  t_nummer: number;
  sp_nummer_1: number;   // FK naar tp_spelers
  sp_volgnummer_1: number;
  sp_nummer_2: number;
  sp_volgnummer_2: number;
  sp_poule: number;      // poulenummer
  t_ronde: number;       // toernooironde
  p_ronde: number;       // partijronde
  koppel: number;        // koppelnummer
  sp_partcode: string;   // "ronde_koppel" bijv. "1_1"
  sp1_car_tem: number;   // te maken caramboles speler 1
  sp2_car_tem: number;
  sp1_car_gem: number;   // gemaakte caramboles speler 1
  sp2_car_gem: number;
  brt: number;           // beurten
  sp1_hs: number;        // hoogste serie speler 1
  sp2_hs: number;
  sp1_punt: number;      // punten speler 1
  sp2_punt: number;
  gespeeld: number;      // 0=nee, 1=ja, 8=gekoppeld, 9=bezig
  tafel_nr: number;      // 0=allemaal
}

// Score helper (mapped from tp_uitslag_hulp – tijdelijke tussenstand scorebord)
export interface ScoreHelper {
  gebruiker_nr: number;
  t_nummer: number;
  t_ronde: number;
  poule_nr: number;
  uitslag_code: string;
  car_A_tem: number;
  car_A_gem: number;
  hs_A: number;
  brt: number;
  car_B_tem: number;
  car_B_gem: number;
  hs_B: number;
  turn: number;
  alert: number;
}

// Score helper tablet (mapped from tp_uitslag_hulp_tablet)
export interface ScoreHelperTablet extends ScoreHelper {
  tafel_nr: number;
  serie_A: number;
  serie_B: number;
}

// Device Configuration (mapped from tp_bediening)
export interface DeviceConfig {
  gebruiker_nr: number;
  taf_nr: number;
  soort: number; // 1=mouse, 2=tablet
}

// Standing entry for display
export interface StandingEntry {
  rank: number;
  playerName: string;
  playerNr: number;
  matchesPlayed: number;
  carambolesGemaakt: number;
  carambolesTeMaken: number;
  percentage: number;
  beurten: number;
  moyenne: number;
  hoogsteSerie: number;
  punten: number;
}

// Discipline names
export const DISCIPLINES: Record<number, string> = {
  1: 'Libre',
  2: 'Bandstoten',
  3: 'Driebanden klein',
  4: 'Driebanden groot',
  5: 'Kader',
};

// Caramboles system labels (t_car_sys)
export const CAR_SYSTEMEN: Record<number, string> = {
  1: 'Moyenne-formule',
  2: 'Vrije invoer',
};

// Puntensystem labels (t_punten_sys)
export const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

// Moyenne formula multipliers (t_moy_form: 1=x20, 2=x25, 3=x30, 4=x40, 5=x50, 6=x60)
export const MOYENNE_MULTIPLIERS: Record<number, number> = {
  1: 20,
  2: 25,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
};

// Moyenne formula labels for dropdowns (full text)
export const MOYENNE_FORMULE_LABELS: Record<number, string> = {
  1: 'Te maken car = Moyenne x 20',
  2: 'Te maken car = Moyenne x 25',
  3: 'Te maken car = Moyenne x 30',
  4: 'Te maken car = Moyenne x 40',
  5: 'Te maken car = Moyenne x 50',
  6: 'Te maken car = Moyenne x 60',
};
