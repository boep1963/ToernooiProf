import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { scheduleRoundRobinEven, scheduleRoundRobinOdd } from '@/lib/billiards';
import { calculateCaramboles } from '@/lib/billiards';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
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

    // Check if poules are already defined
    const poulesSnap = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('ronde_nr', '==', tRonde)
      .get();

    let pouleAssignments: Map<number, { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[]>;

    if (poulesSnap.empty) {
      // No poules defined yet – put all spelers in poule 1
      const pouleMap = new Map<number, typeof pouleAssignments extends Map<number, infer V> ? V : never>();
      const spList: { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[] = [];

      for (let i = 0; i < spelers.length; i++) {
        const sp = spelers[i];
        const sp_car = tCarSys === 1
          ? calculateCaramboles(sp.sp_startmoy, tMoyForm, tMinCar)
          : sp.sp_startcar;

        spList.push({
          sp_nummer: sp.sp_nummer,
          sp_car,
          sp_moy: sp.sp_startmoy,
          sp_volgnr: i + 1,
        });

        // Create poule document
        await db.collection('poules').add({
          gebruiker_nr: orgNummer,
          t_nummer: compNumber,
          sp_nummer: sp.sp_nummer,
          sp_moy: sp.sp_startmoy,
          sp_car,
          sp_volgnr: i + 1,
          poule_nr: 1,
          ronde_nr: tRonde,
        });
      }

      pouleMap.set(1, spList);
      pouleAssignments = pouleMap;
    } else {
      // Use existing poule assignments
      const pouleMap = new Map<number, { sp_nummer: number; sp_car: number; sp_moy: number; sp_volgnr: number }[]>();

      poulesSnap.docs.forEach(d => {
        const data = d.data() ?? {};
        const pouleNr = (data.poule_nr as number) || 1;
        if (!pouleMap.has(pouleNr)) pouleMap.set(pouleNr, []);
        pouleMap.get(pouleNr)!.push({
          sp_nummer: (data.sp_nummer as number) || 0,
          sp_car: (data.sp_car as number) || 0,
          sp_moy: (data.sp_moy as number) || 0,
          sp_volgnr: (data.sp_volgnr as number) || 0,
        });
      });

      pouleAssignments = pouleMap;
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

    // Update tournament: t_gestart=1, t_ronde=1
    await compDoc.ref.update({
      t_gestart: 1,
      t_ronde: tRonde,
      periode: tRonde, // routing alias
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
