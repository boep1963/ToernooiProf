import { MOYENNE_MULTIPLIERS } from '@/types';

/**
 * Calculate target caramboles from moyenne and formula.
 * Caramboles = round(moyenne × formula_multiplier)
 * If result < min_car, use min_car instead.
 */
export function calculateCaramboles(
  moyenne: number,
  moyenneFormula: number,
  minCar: number
): number {
  const multiplier = MOYENNE_MULTIPLIERS[moyenneFormula] || 25;
  const calculated = Math.round(moyenne * multiplier);
  return Math.max(calculated, minCar);
}

/**
 * Get the moyenne field name for a given discipline.
 */
export function getMoyenneField(discipline: number): string {
  const fields: Record<number, string> = {
    1: 'spa_moy_lib',
    2: 'spa_moy_band',
    3: 'spa_moy_3bkl',
    4: 'spa_moy_3bgr',
    5: 'spa_moy_kad',
  };
  return fields[discipline] || 'spa_moy_lib';
}

/**
 * Calculate points using the WRV system.
 * Win (reached target, opponent didn't): 2 points
 * Loss: 0 points
 * Draw (both reached or same %): 1 point each
 *
 * Bonus points (if enabled via puntenSys):
 * - Winner bonus: +1 if winner's match moyenne > registered moyenne
 * - Draw bonus: +1 if draw player's match moyenne > registered moyenne (if enabled)
 * - Loss bonus: +1 if loser's match moyenne > registered moyenne (if enabled)
 */
export function calculateWRVPoints(
  player1Gem: number,
  player1Tem: number,
  player2Gem: number,
  player2Tem: number,
  maxBeurten: number,
  beurten: number,
  vastBeurten: boolean,
  puntenSys: number,
  player1Moyenne?: number,
  player2Moyenne?: number
): { points1: number; points2: number } {
  const pct1 = player1Tem > 0 ? (player1Gem / player1Tem) * 100 : 0;
  const pct2 = player2Tem > 0 ? (player2Gem / player2Tem) * 100 : 0;

  const reached1 = player1Gem >= player1Tem;
  const reached2 = player2Gem >= player2Tem;

  let points1 = 0;
  let points2 = 0;

  if (vastBeurten) {
    // Fixed turns mode: always compare by percentage
    if (pct1 > pct2) {
      points1 = 2;
      points2 = 0;
    } else if (pct2 > pct1) {
      points1 = 0;
      points2 = 2;
    } else {
      points1 = 1;
      points2 = 1;
    }
  } else if (maxBeurten > 0 && beurten >= maxBeurten && !reached1 && !reached2) {
    // Max turns reached, neither finished: compare by percentage
    if (pct1 > pct2) {
      points1 = 2;
      points2 = 0;
    } else if (pct2 > pct1) {
      points1 = 0;
      points2 = 2;
    } else {
      points1 = 1;
      points2 = 1;
    }
  } else if (reached1 && reached2) {
    // Both reached target: draw
    points1 = 1;
    points2 = 1;
  } else if (reached1 && !reached2) {
    // Player 1 wins
    points1 = 2;
    points2 = 0;
  } else if (!reached1 && reached2) {
    // Player 2 wins
    points1 = 0;
    points2 = 2;
  } else {
    // Neither reached: compare by percentage
    if (pct1 > pct2) {
      points1 = 2;
      points2 = 0;
    } else if (pct2 > pct1) {
      points1 = 0;
      points2 = 2;
    } else {
      points1 = 1;
      points2 = 1;
    }
  }

  // Apply bonus points if enabled
  const puntenStr = puntenSys.toString();
  if (puntenStr.length >= 2 && puntenStr[1] === '1' && player1Moyenne !== undefined && player2Moyenne !== undefined) {
    // Bonus enabled - calculate match moyenne (caramboles / beurten)
    const matchMoyenne1 = beurten > 0 ? player1Gem / beurten : 0;
    const matchMoyenne2 = beurten > 0 ? player2Gem / beurten : 0;

    // Check if match moyenne exceeds registered moyenne
    const aboveMoyenne1 = matchMoyenne1 > player1Moyenne;
    const aboveMoyenne2 = matchMoyenne2 > player2Moyenne;

    // Winner bonus
    if (points1 === 2 && aboveMoyenne1) points1 += 1;
    if (points2 === 2 && aboveMoyenne2) points2 += 1;

    // Draw bonus (if enabled, digit 4)
    if (puntenStr.length >= 4 && puntenStr[3] === '1') {
      if (points1 === 1 && aboveMoyenne1) points1 += 1;
      if (points2 === 1 && aboveMoyenne2) points2 += 1;
    }

    // Loss bonus (if enabled, digit 5)
    if (puntenStr.length >= 5 && puntenStr[4] === '1') {
      if (points1 === 0 && aboveMoyenne1) points1 += 1;
      if (points2 === 0 && aboveMoyenne2) points2 += 1;
    }
  }

  return { points1, points2 };
}

/**
 * Calculate points using the 10-point system.
 * Points = floor(caramboles_made / target_caramboles * 10)
 */
export function calculate10PointScore(
  carambolesGemaakt: number,
  carambolesTeMaken: number
): number {
  if (carambolesTeMaken <= 0) return 0;
  return Math.min(Math.floor((carambolesGemaakt / carambolesTeMaken) * 10), 10);
}

/**
 * Calculate points using the Belgian system.
 * Same as 10-point but winner gets 12, draw = 11 each.
 */
export function calculateBelgianScore(
  player1Gem: number,
  player1Tem: number,
  player2Gem: number,
  player2Tem: number
): { points1: number; points2: number } {
  const score1 = calculate10PointScore(player1Gem, player1Tem);
  const score2 = calculate10PointScore(player2Gem, player2Tem);

  if (score1 >= 10 && score2 >= 10) {
    // Both reached max: draw at 11
    return { points1: 11, points2: 11 };
  } else if (score1 >= 10) {
    // Player 1 wins with 12
    return { points1: 12, points2: score2 };
  } else if (score2 >= 10) {
    // Player 2 wins with 12
    return { points1: score1, points2: 12 };
  }

  return { points1: score1, points2: score2 };
}

/**
 * Generate match code in format: period_playerA_playerB
 * Player numbers are zero-padded to 3 digits.
 */
export function generateMatchCode(
  periode: number,
  playerA: number,
  playerB: number
): string {
  const padA = String(playerA).padStart(3, '0');
  const padB = String(playerB).padStart(3, '0');
  return `${periode}_${padA}_${padB}`;
}

/**
 * Invert match code (swap player order).
 */
export function invertMatchCode(code: string): string {
  const parts = code.split('_');
  if (parts.length !== 3) return code;
  return `${parts[0]}_${parts[2]}_${parts[1]}`;
}

/**
 * Round Robin scheduling for even number of players.
 * Returns array of rounds, each round is an array of [playerA, playerB] pairs.
 */
export function scheduleRoundRobinEven(
  players: number[]
): [number, number][][] {
  const n = players.length;
  if (n < 2) return [];

  const rounds: [number, number][][] = [];
  const playerList = [...players];

  for (let round = 0; round < n - 1; round++) {
    const matches: [number, number][] = [];

    for (let i = 0; i < n / 2; i++) {
      const home = playerList[i];
      const away = playerList[n - 1 - i];

      // Home/away alternation
      if (round % 2 === 0) {
        matches.push(i === 0 ? [home, away] : (i % 2 === 0 ? [home, away] : [away, home]));
      } else {
        matches.push(i === 0 ? [away, home] : (i % 2 === 0 ? [home, away] : [away, home]));
      }
    }

    rounds.push(matches);

    // Rotate: keep first player fixed, rotate rest clockwise
    const last = playerList.pop()!;
    playerList.splice(1, 0, last);
  }

  return rounds;
}

/**
 * Round Robin scheduling for odd number of players (adds bye).
 */
export function scheduleRoundRobinOdd(
  players: number[]
): { matches: [number, number][][]; byes: number[][] } {
  const ghost = -1; // Ghost player for bye
  const allPlayers = [...players, ghost];
  const rounds = scheduleRoundRobinEven(allPlayers);

  const byes: number[][] = [];
  const filteredRounds: [number, number][][] = [];

  for (const round of rounds) {
    const roundByes: number[] = [];
    const roundMatches: [number, number][] = [];

    for (const match of round) {
      if (match[0] === ghost) {
        roundByes.push(match[1]);
      } else if (match[1] === ghost) {
        roundByes.push(match[0]);
      } else {
        roundMatches.push(match);
      }
    }

    filteredRounds.push(roundMatches);
    byes.push(roundByes);
  }

  return { matches: filteredRounds, byes };
}

/**
 * Format player name based on sort preference.
 * sorteren=1: "Voornaam Tussenvoegsel Achternaam"
 * sorteren=2: "Achternaam, Voornaam Tussenvoegsel"
 *
 * Defensive against undefined/null inputs - converts all to strings.
 */
export function formatPlayerName(
  voornaam: string | undefined | null,
  tussenvoegsel: string | undefined | null,
  achternaam: string | undefined | null,
  sorteren: number = 1
): string {
  // Convert to strings defensively, treating undefined/null as empty string
  const vn = voornaam ? String(voornaam) : '';
  const tv = tussenvoegsel ? String(tussenvoegsel) : '';
  const an = achternaam ? String(achternaam) : '';

  // If all parts are empty, return empty string
  if (!vn && !tv && !an) return '';

  const tvFormatted = tv ? ` ${tv}` : '';

  if (sorteren === 2) {
    return `${an}, ${vn}${tvFormatted}`.trim();
  }

  return `${vn}${tvFormatted} ${an}`.trim();
}

/**
 * Encode table assignment as binary string.
 * Example: tables [1, 2] → "110000000000"
 */
export function encodeTableAssignment(tables: number[], maxTables: number = 12): string {
  const bits = new Array(maxTables).fill('0');
  for (const t of tables) {
    if (t >= 1 && t <= maxTables) {
      bits[t - 1] = '1';
    }
  }
  return bits.join('');
}

/**
 * Decode table assignment from binary string.
 * Example: "110000000000" → [1, 2]
 */
export function decodeTableAssignment(binary: string): number[] {
  const tables: number[] = [];
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      tables.push(i + 1);
    }
  }
  return tables;
}
