import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { scheduleRoundRobinEven, scheduleRoundRobinOdd } from '@/lib/billiards';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

type DraftItem = {
  sp_nummer: number;
  sp_naam: string;
  from_poule: number;
  to_poule: number;
  moy_start: number;
  car_start: number;
  include: boolean;
  order_idx: number;
};

function getDraftDocId(orgNummer: number, compNumber: number, targetRound: number): string {
  return `${orgNummer}_${compNumber}_${targetRound}`;
}

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

    const body = await request.json().catch(() => ({}));
    const sourceRound = Number(body.source_ronde || 0) || 0;
    const targetRound = Number(body.target_ronde || 0) || 0;
    if (sourceRound < 1 || targetRound < 2 || targetRound !== sourceRound + 1) {
      return NextResponse.json({ error: 'Ongeldige ronde-overgang voor finalisatie.' }, { status: 400 });
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
    const compData = (compDoc.data() ?? {}) as Record<string, unknown>;
    const currentRound = Number(compData.t_ronde ?? 0) || 0;
    if (currentRound !== sourceRound) {
      return NextResponse.json(
        { error: `Huidige ronde is ${currentRound}; verwachtte bronronde ${sourceRound}.` },
        { status: 409 }
      );
    }

    const draftDocId = getDraftDocId(orgNummer, compNumber, targetRound);
    const draftRef = db.collection('round_drafts').doc(draftDocId);
    const draftSnap = await draftRef.get();
    if (!draftSnap.exists) {
      return NextResponse.json({ error: 'Geen concept gevonden voor deze nieuwe ronde.' }, { status: 404 });
    }
    const draftData = (draftSnap.data() ?? {}) as Record<string, unknown>;
    const draftItems = (Array.isArray(draftData.items) ? draftData.items : []) as DraftItem[];
    const selected = draftItems
      .filter((it) => Boolean(it.include) && (Number(it.to_poule) || 0) > 0 && (Number(it.sp_nummer) || 0) > 0)
      .map((it) => ({
        ...it,
        sp_nummer: Number(it.sp_nummer) || 0,
        to_poule: Number(it.to_poule) || 0,
        moy_start: Number(it.moy_start) || 0,
        car_start: Math.max(Number(it.car_start) || 0, 3),
        order_idx: Number(it.order_idx) || 0,
      }));

    if (selected.length === 0) {
      return NextResponse.json({ error: 'Geen spelers geselecteerd om door te koppelen.' }, { status: 409 });
    }

    const bySpeler = new Map<number, number>();
    const byPoule = new Map<number, typeof selected>();
    for (const item of selected) {
      bySpeler.set(item.sp_nummer, (bySpeler.get(item.sp_nummer) || 0) + 1);
      if (!byPoule.has(item.to_poule)) byPoule.set(item.to_poule, []);
      byPoule.get(item.to_poule)!.push(item);
    }

    const duplicatePlayers = Array.from(bySpeler.entries()).filter(([, cnt]) => cnt > 1).map(([nr]) => nr);
    if (duplicatePlayers.length > 0) {
      return NextResponse.json(
        { error: 'Speler komt meerdere keren voor in de conceptindeling.', duplicate_spelers: duplicatePlayers },
        { status: 409 }
      );
    }

    const pouleNrs = Array.from(byPoule.keys()).sort((a, b) => a - b);
    const maxPoule = pouleNrs[pouleNrs.length - 1];
    for (let nr = 1; nr <= maxPoule; nr++) {
      if (!byPoule.has(nr)) {
        return NextResponse.json(
          { error: `Poule ${nr} ontbreekt. Gebruik aansluitende poulenummers zonder gaten.` },
          { status: 409 }
        );
      }
    }
    for (const [pouleNr, items] of byPoule.entries()) {
      if (items.length < 2) {
        return NextResponse.json(
          { error: `Poule ${pouleNr} heeft minder dan 2 spelers.` },
          { status: 409 }
        );
      }
    }

    const [existingPoulesTarget, existingUitslagenTarget] = await Promise.all([
      db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('ronde_nr', '==', targetRound)
        .get(),
      db.collection('uitslagen')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('t_ronde', '==', targetRound)
        .get(),
    ]);
    if (!existingPoulesTarget.empty || !existingUitslagenTarget.empty) {
      return NextResponse.json(
        { error: `Ronde ${targetRound} bestaat al. Draai deze eerst ongedaan voordat je opnieuw finaliseert.` },
        { status: 409 }
      );
    }

    let nextUitslagId = 1;
    const allUitslagenSnap = await db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    allUitslagenSnap.docs.forEach((doc) => {
      const uid = Number(doc.data()?.uitslag_id) || 0;
      if (uid >= nextUitslagId) nextUitslagId = uid + 1;
    });

    let createdPouleRows = 0;
    let createdMatches = 0;

    for (const [pouleNr, items] of Array.from(byPoule.entries()).sort((a, b) => a[0] - b[0])) {
      const ordered = [...items].sort((a, b) => (a.order_idx || 0) - (b.order_idx || 0));
      const withVolg = ordered.map((it, idx) => ({ ...it, sp_volgnr: idx + 1 }));

      for (const speler of withVolg) {
        await db.collection('poules').add({
          gebruiker_nr: orgNummer,
          t_nummer: compNumber,
          sp_nummer: speler.sp_nummer,
          sp_moy: speler.moy_start,
          sp_car: speler.car_start,
          sp_volgnr: speler.sp_volgnr,
          poule_nr: pouleNr,
          ronde_nr: targetRound,
        });
        createdPouleRows++;
      }

      const spNummers = withVolg.map((s) => s.sp_nummer);
      const rounds = spNummers.length % 2 === 0
        ? scheduleRoundRobinEven(spNummers)
        : scheduleRoundRobinOdd(spNummers).matches;

      for (let pRonde = 0; pRonde < rounds.length; pRonde++) {
        const matches = rounds[pRonde];
        for (let k = 0; k < matches.length; k++) {
          const [sp1, sp2] = matches[k];
          const sp1Data = withVolg.find((s) => s.sp_nummer === sp1);
          const sp2Data = withVolg.find((s) => s.sp_nummer === sp2);
          await db.collection('uitslagen').doc(String(nextUitslagId)).set({
            uitslag_id: nextUitslagId,
            gebruiker_nr: orgNummer,
            t_nummer: compNumber,
            sp_nummer_1: sp1,
            sp_volgnummer_1: sp1Data?.sp_volgnr || 0,
            sp_nummer_2: sp2,
            sp_volgnummer_2: sp2Data?.sp_volgnr || 0,
            sp_poule: pouleNr,
            t_ronde: targetRound,
            p_ronde: pRonde + 1,
            koppel: k + 1,
            sp_partcode: `${pRonde + 1}_${k + 1}`,
            sp1_car_tem: sp1Data?.car_start || 0,
            sp2_car_tem: sp2Data?.car_start || 0,
            sp1_car_gem: 0,
            sp2_car_gem: 0,
            brt: 0,
            sp1_hs: 0,
            sp2_hs: 0,
            sp1_punt: 0,
            sp2_punt: 0,
            gespeeld: 0,
            tafel_nr: 0,
          });
          nextUitslagId++;
          createdMatches++;
        }
      }
    }

    await compDoc.ref.update({
      t_ronde: targetRound,
      periode: targetRound,
      updated_at: new Date().toISOString(),
    });

    await draftRef.update({
      status: 'finalized',
      finalized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: `Ronde ${targetRound} succesvol aangemaakt.`,
      ronde_nr: targetRound,
      poule_rows: createdPouleRows,
      matches: createdMatches,
    });
  } catch (error) {
    console.error('[ROUNDS_FINALIZE] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij definitief aanmaken van nieuwe ronde', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
