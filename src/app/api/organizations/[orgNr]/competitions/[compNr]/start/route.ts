import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { scheduleRoundRobinEven, scheduleRoundRobinOdd } from '@/lib/billiards';
import { calculateCaramboles } from '@/lib/billiards';
import { isSuperAdmin } from '@/lib/admin-shared';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

function validatePouleAssignments(
  pouleAssignments: Map<number, { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[]>
): string | null {
  const pouleNrs = Array.from(pouleAssignments.keys()).sort((a, b) => a - b);
  if (pouleNrs.length === 0) return 'Er zijn geen poules beschikbaar.';

  const maxPoule = pouleNrs[pouleNrs.length - 1];
  for (let nr = 1; nr <= maxPoule; nr++) {
    if (!pouleAssignments.has(nr)) {
      return `Poule ${nr} ontbreekt. Gebruik aansluitende poulenummers zonder gaten.`;
    }
  }

  for (const [pouleNr, spelersInPoule] of pouleAssignments.entries()) {
    if (spelersInPoule.length < 2) {
      return `Poule ${pouleNr} heeft minder dan 2 spelers.`;
    }
  }

  return null;
}

function buildPouleMapFromDocs(
  docs: Array<{ data: () => Record<string, unknown> | undefined }>
): Map<number, { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[]> {
  const pouleMap = new Map<number, { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[]>();
  docs.forEach((d) => {
    const data = d.data() ?? {};
    const pouleNr = Number(data.poule_nr) || 1;
    if (!pouleMap.has(pouleNr)) pouleMap.set(pouleNr, []);
    pouleMap.get(pouleNr)!.push({
      sp_nummer: Number(data.sp_nummer) || 0,
      sp_car: Number(data.sp_car) || 0,
      sp_moy: Number(data.sp_moy) || 0,
      sp_volgnr: Number(data.sp_volgnr) || 0,
    });
  });
  return pouleMap;
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/start
 * Start a tournament:
 * 1. Set t_gestart=1, t_ronde=1 on the tournament
 * 2. If poules exist, create Round Robin matches per poule in `uitslagen`
 * 3. If no poules, create a single poule with all spelers and generate matches
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    // Find the tournament
    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compDoc = compSnap.docs[0];
    const compData = compDoc.data();

    if ((compData?.t_gestart as number) === 1) {
      return NextResponse.json({ error: 'Toernooi is al gestart.' }, { status: 400 });
    }

    let body: { testPopulate?: boolean; playerCount?: number; pouleCount?: number } = {};
    try {
      body = await request.json();
    } catch {
      // Geen body of ongeldige JSON
    }

    const compNaam = String(compData?.t_naam ?? compData?.comp_naam ?? '').trim();
    const isTestToernooi = compNaam.toUpperCase().startsWith('TEST_');
    let testPopulateDone = false;

    if (isTestToernooi && body.testPopulate === true) {
      const playerCount = Math.max(2, Math.min(200, Number(body.playerCount) || 0));
      const pouleCount = Math.max(1, Math.min(25, Number(body.pouleCount) || 1));
      if (playerCount < 2 * pouleCount) {
        return NextResponse.json(
          { error: 'Minimaal 2 spelers per poule. Verhoog het aantal spelers of verlaag het aantal poules.' },
          { status: 400 }
        );
      }
      const orgSnap = await db.collection('organizations').where('org_nummer', '==', orgNummer).limit(1).get();
      if (orgSnap.empty) {
        return NextResponse.json({ error: 'Organisatie niet gevonden.' }, { status: 404 });
      }
      const orgEmail = (orgSnap.docs[0].data()?.org_wl_email as string) ?? '';
      if (!isSuperAdmin(orgEmail)) {
        return NextResponse.json(
          { error: 'Alleen beheerders mogen testdata genereren voor TEST_-toernooien.' },
          { status: 403 }
        );
      }
      const tCarSys = (compData?.t_car_sys as number) ?? 1;
      const tMoyForm = (compData?.t_moy_form as number) ?? 3;
      const tMinCar = (compData?.t_min_car as number) ?? 0;
      const existingSpelers = await db.collection('spelers')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .get();
      for (const d of existingSpelers.docs) await d.ref.delete();
      const existingPoules = await db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .get();
      for (const d of existingPoules.docs) await d.ref.delete();

      const pouleVolgnr: Record<number, number> = {};
      for (let p = 1; p <= pouleCount; p++) pouleVolgnr[p] = 0;
      for (let i = 0; i < playerCount; i++) {
        const sp_nummer = i + 1;
        const sp_startmoy = Math.round((1 + Math.random() * 1.5) * 1000) / 1000;
        const sp_startcar = tCarSys === 1
          ? calculateCaramboles(sp_startmoy, tMoyForm, tMinCar)
          : Math.max(25, Math.floor(sp_startmoy * 25));
        const pouleNr = (i % pouleCount) + 1;
        pouleVolgnr[pouleNr]++;
        const sp_volgnr = pouleVolgnr[pouleNr];
        await db.collection('spelers').add({
          gebruiker_nr: orgNummer,
          t_nummer: compNumber,
          sp_nummer,
          sp_naam: `Test Speler ${sp_nummer}`,
          sp_startmoy,
          sp_startcar,
          poule_nr: pouleNr,
          created_at: new Date().toISOString(),
        });
        await db.collection('poules').add({
          gebruiker_nr: orgNummer,
          t_nummer: compNumber,
          sp_nummer,
          sp_moy: sp_startmoy,
          sp_car: sp_startcar,
          sp_volgnr,
          poule_nr: pouleNr,
          ronde_nr: 1,
        });
      }
      testPopulateDone = true;
    }

    // Get spelers
    const spelersSnap = await db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .orderBy('sp_nummer', 'asc')
      .get();

    if (spelersSnap.empty) {
      return NextResponse.json({ error: 'Er zijn nog geen spelers toegevoegd aan dit toernooi.' }, { status: 400 });
    }

    const spelers = spelersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{
      id: string;
      sp_nummer: number;
      sp_naam: string;
      sp_startmoy: number;
      sp_startcar: number;
    }>;

    const tCarSys = (compData?.t_car_sys as number) ?? 1;
    const tMoyForm = (compData?.t_moy_form as number) ?? 3;
    const tMinCar = (compData?.t_min_car as number) ?? 0;
    const tRonde = 1;

    // Check if ronde-1 poules are already defined
    const poulesSnap = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('ronde_nr', '==', tRonde)
      .get();

    let pouleAssignments: Map<number, { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[]>;

    if (!poulesSnap.empty) {
      pouleAssignments = buildPouleMapFromDocs(poulesSnap.docs);
    } else {
      // Fallback: reconstruct ronde-1 from spelers.poule_nr when available.
      const spListByPoule = new Map<number, { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[]>();
      for (const sp of spelers) {
        const storedPoule = Number((sp as Record<string, unknown>).poule_nr) || 0;
        const assignedPoule = storedPoule > 0 ? storedPoule : 1;
        const sp_car = tCarSys === 1
          ? calculateCaramboles(sp.sp_startmoy, tMoyForm, tMinCar)
          : Math.max(Number(sp.sp_startcar) || 0, 3);
        if (!spListByPoule.has(assignedPoule)) spListByPoule.set(assignedPoule, []);
        spListByPoule.get(assignedPoule)!.push({
          sp_nummer: sp.sp_nummer,
          sp_car,
          sp_moy: sp.sp_startmoy,
          sp_volgnr: 0,
        });
      }

      const hasAnyExplicitPoule = spelers.some((sp) => (Number((sp as Record<string, unknown>).poule_nr) || 0) > 0);
      if (!hasAnyExplicitPoule) {
        return NextResponse.json(
          { error: 'Geen start-poule indeling gevonden. Wijs eerst spelers toe aan poules.' },
          { status: 409 }
        );
      }

      // Persist reconstructed ronde-1 poules to keep state stable for retries/undo.
      for (const [pouleNr, list] of spListByPoule.entries()) {
        list.sort((a, b) => a.sp_nummer - b.sp_nummer);
        for (let i = 0; i < list.length; i++) {
          const speler = list[i];
          speler.sp_volgnr = i + 1;
          await db.collection('poules').add({
            gebruiker_nr: orgNummer,
            t_nummer: compNumber,
            sp_nummer: speler.sp_nummer,
            sp_moy: speler.sp_moy,
            sp_car: speler.sp_car,
            sp_volgnr: speler.sp_volgnr,
            poule_nr: pouleNr,
            ronde_nr: tRonde,
          });
        }
      }
      const rebuiltSnap = await db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('ronde_nr', '==', tRonde)
        .get();
      pouleAssignments = buildPouleMapFromDocs(rebuiltSnap.docs);
    }

    // Harden: every speler must appear exactly once in ronde-1 poules.
    const spelerNumbers = new Set(spelers.map((s) => Number(s.sp_nummer) || 0).filter((nr) => nr > 0));
    const assignmentCount = new Map<number, number>();
    for (const list of pouleAssignments.values()) {
      for (const sp of list) {
        if (!sp.sp_nummer) continue;
        assignmentCount.set(sp.sp_nummer, (assignmentCount.get(sp.sp_nummer) || 0) + 1);
      }
    }
    const missing = Array.from(spelerNumbers).filter((nr) => !assignmentCount.has(nr));
    const duplicates = Array.from(assignmentCount.entries()).filter(([, cnt]) => cnt > 1).map(([nr]) => nr);
    if (missing.length > 0 || duplicates.length > 0) {
      return NextResponse.json(
        {
          error: 'Poule-indeling ronde 1 is inconsistent. Herstel de indeling en probeer opnieuw.',
          details: { missing_spelers: missing, duplicate_spelers: duplicates },
        },
        { status: 409 }
      );
    }

    const validationError = validatePouleAssignments(pouleAssignments);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Generate Round Robin matches per poule
    let uitslagId = 1;
    const existingUitslagen = await db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    if (!existingUitslagen.empty) {
      existingUitslagen.docs.forEach(d => {
        const uid = ((d.data()?.uitslag_id) as number) || 0;
        if (uid >= uitslagId) uitslagId = uid + 1;
      });
    }

    let totalMatches = 0;
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH = 499;

    const commitBatch = async () => {
      if (batchCount > 0) {
        await batch.commit();
        batchCount = 0;
      }
    };

    for (const [pouleNr, spelersInPoule] of pouleAssignments.entries()) {
      const spNummers = spelersInPoule.map(s => s.sp_nummer);

      let rounds: [number, number][][];
      if (spNummers.length % 2 === 0) {
        rounds = scheduleRoundRobinEven(spNummers);
      } else {
        const { matches } = scheduleRoundRobinOdd(spNummers);
        rounds = matches;
      }

      for (let pRonde = 0; pRonde < rounds.length; pRonde++) {
        const rondMatches = rounds[pRonde];
        for (let k = 0; k < rondMatches.length; k++) {
          const [sp1, sp2] = rondMatches[k];
          const sp1Data = spelersInPoule.find(s => s.sp_nummer === sp1)!;
          const sp2Data = spelersInPoule.find(s => s.sp_nummer === sp2)!;

          const uitslagDoc: Record<string, unknown> = {
            uitslag_id: uitslagId,
            gebruiker_nr: orgNummer,
            t_nummer: compNumber,
            sp_nummer_1: sp1,
            sp_volgnummer_1: sp1Data?.sp_volgnr ?? 0,
            sp_nummer_2: sp2,
            sp_volgnummer_2: sp2Data?.sp_volgnr ?? 0,
            sp_poule: pouleNr,
            t_ronde: tRonde,
            p_ronde: pRonde + 1,
            koppel: k + 1,
            sp_partcode: `${pRonde + 1}_${k + 1}`,
            sp1_car_tem: sp1Data?.sp_car ?? 0,
            sp2_car_tem: sp2Data?.sp_car ?? 0,
            sp1_car_gem: 0,
            sp2_car_gem: 0,
            brt: 0,
            sp1_hs: 0,
            sp2_hs: 0,
            sp1_punt: 0,
            sp2_punt: 0,
            gespeeld: 0,
            tafel_nr: 0,
          };

          const docRef = db.collection('uitslagen').doc(String(uitslagId));
          batch.set(docRef, uitslagDoc);
          uitslagId++;
          batchCount++;
          totalMatches++;

          if (batchCount >= MAX_BATCH) {
            await commitBatch();
          }
        }
      }
    }

    await commitBatch();

    // Bij test-populate: vul alle uitslagen met gegenereerde resultaten (gespeeld=1)
    if (testPopulateDone) {
      const uitslagenSnap = await db.collection('uitslagen')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('t_ronde', '==', tRonde)
        .get();
      for (const doc of uitslagenSnap.docs) {
        const u = doc.data() ?? {};
        const sp1_tem = Number(u.sp1_car_tem) || 50;
        const sp2_tem = Number(u.sp2_car_tem) || 50;
        const brt = 40 + Math.floor(Math.random() * 30);
        let sp1_gem = Math.floor(Math.random() * Math.min(sp1_tem, brt));
        let sp2_gem = Math.floor(Math.random() * Math.min(sp2_tem, brt));
        sp1_gem = Math.min(sp1_gem, sp1_tem);
        sp2_gem = Math.min(sp2_gem, sp2_tem);
        const sp1_hs = 2 + Math.floor(Math.random() * 7);
        const sp2_hs = 2 + Math.floor(Math.random() * 7);
        const per1 = sp1_tem > 0 ? (sp1_gem / sp1_tem) * 100 : 0;
        const per2 = sp2_tem > 0 ? (sp2_gem / sp2_tem) * 100 : 0;
        let sp1_punt: number;
        let sp2_punt: number;
        if (per1 > per2) {
          sp1_punt = 2;
          sp2_punt = 0;
        } else if (per2 > per1) {
          sp1_punt = 0;
          sp2_punt = 2;
        } else {
          sp1_punt = 1;
          sp2_punt = 1;
        }
        await doc.ref.update({
          sp1_car_gem: sp1_gem,
          sp2_car_gem: sp2_gem,
          brt,
          sp1_hs,
          sp2_hs,
          sp1_punt,
          sp2_punt,
          gespeeld: 1,
        });
      }
    }

    // Update tournament: t_gestart=1, t_ronde=1, ronde_status=definitief
    await compDoc.ref.update({
      t_gestart: 1,
      t_ronde: tRonde,
      periode: tRonde,
      ronde_status: 'definitief',
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: `Toernooi gestart. ${totalMatches} wedstrijden aangemaakt voor ronde ${tRonde}.`,
      t_ronde: tRonde,
      total_matches: totalMatches,
    });
  } catch (error) {
    console.error('[START TOERNOOI] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij starten toernooi', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr/start
 * Undo start of a tournament (round 1 only).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compDoc = compSnap.docs[0];
    const compData = compDoc.data() ?? {};
    const isStarted = ((compData.t_gestart as number) ?? 0) === 1;
    const currentRound = Number(compData.t_ronde ?? 0) || 0;

    if (!isStarted) {
      return NextResponse.json({ error: 'Toernooi is nog niet gestart.' }, { status: 400 });
    }

    if (currentRound > 1) {
      return NextResponse.json({ error: 'Start terugdraaien kan alleen zolang alleen ronde 1 bestaat.' }, { status: 409 });
    }

    const uitslagenSnap = await db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('t_ronde', '==', 1)
      .get();

    for (const doc of uitslagenSnap.docs) {
      await doc.ref.delete();
    }

    await compDoc.ref.update({
      t_gestart: 0,
      t_ronde: 0,
      periode: 0,
      ronde_status: 'voorlopig',
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Start van het toernooi is teruggedraaid.',
      deleted_uitslagen: uitslagenSnap.size,
      deleted_poules: 0,
      poules_preserved: true,
    });
  } catch (error) {
    console.error('[UNDO START] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij terugdraaien start', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
