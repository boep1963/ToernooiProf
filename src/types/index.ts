// Organization (mapped from bj_organisaties)
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

// Member (mapped from bj_spelers_algemeen)
export interface Member {
  spa_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
  spa_org: number;
  spa_moy_lib: number;
  spa_moy_band: number;
  spa_moy_3bkl: number;
  spa_moy_3bgr: number;
  spa_moy_kad: number;
}

// Competition (mapped from bj_competities)
export interface Competition {
  org_nummer: number;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number; // 1=Libre, 2=Bandstoten, 3=Driebanden klein, 4=Driebanden groot, 5=Kader
  periode: number;
  punten_sys: number;
  moy_form: number; // 1=x15, 2=x20, 3=x25, 4=x30, 5=x40, 6=x50, 7=x60
  min_car: number;
  max_beurten: number;
  vast_beurten: number;
  sorteren: number; // 1=first name first, 2=last name first
}

// Competition Player (mapped from bj_spelers_comp)
export interface CompetitionPlayer {
  spc_nummer: number;
  spc_org: number;
  spc_competitie: number;
  spc_moyenne_1: number;
  spc_moyenne_2: number;
  spc_moyenne_3: number;
  spc_moyenne_4: number;
  spc_moyenne_5: number;
  spc_car_1: number;
  spc_car_2: number;
  spc_car_3: number;
  spc_car_4: number;
  spc_car_5: number;
}

// Match (mapped from bj_partijen)
export interface Match {
  org_nummer: number;
  comp_nr: number;
  nummer_A: number;
  naam_A: string;
  cartem_A: number;
  tafel: string; // binary string for table assignment
  nummer_B: number;
  naam_B: string;
  cartem_B: number;
  periode: number;
  uitslag_code: string;
  gespeeld: number; // 0=not played, 1=played
}

// Result (mapped from bj_uitslagen)
export interface Result {
  org_nummer: number;
  comp_nr: number;
  uitslag_code: string;
  periode: number;
  speeldatum: Date;
  sp_1_nr: number;
  sp_1_naam?: string; // Denormalized player 1 name for performance
  sp_1_cartem: number;
  sp_1_cargem: number;
  sp_1_hs: number;
  sp_1_punt: number;
  brt: number;
  sp_2_nr: number;
  sp_2_naam?: string; // Denormalized player 2 name for performance
  sp_2_cartem: number;
  sp_2_cargem: number;
  sp_2_hs: number;
  sp_2_punt: number;
  gespeeld: number;
}

// Table (mapped from bj_tafel)
export interface Table {
  org_nummer: number;
  comp_nr: number;
  u_code: string;
  tafel_nr: number;
  status: number; // 0=waiting, 1=started, 2=result
}

// Device Configuration (mapped from bj_bediening)
export interface DeviceConfig {
  org_nummer: number;
  tafel_nr: number;
  soort: number; // 1=mouse, 2=tablet
}

// Score Helper (mapped from bj_uitslag_hulp)
export interface ScoreHelper {
  org_nummer: number;
  comp_nr: number;
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

// Score Helper Tablet (mapped from bj_uitslag_hulp_tablet)
export interface ScoreHelperTablet extends ScoreHelper {
  tafel_nr: number;
  serie_A: number;
  serie_B: number;
}

// Discipline names
export const DISCIPLINES: Record<number, string> = {
  1: 'Libre',
  2: 'Bandstoten',
  3: 'Driebanden klein',
  4: 'Driebanden groot',
  5: 'Kader',
};

// Moyenne formula multipliers
export const MOYENNE_MULTIPLIERS: Record<number, number> = {
  1: 15,
  2: 20,
  3: 25,
  4: 30,
  5: 40,
  6: 50,
  7: 60,
};

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
