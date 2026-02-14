'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HelpTopic {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  relatedLink?: { href: string; label: string };
}

const QuestionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const helpTopics: HelpTopic[] = [
  {
    id: 'algemeen',
    title: 'Algemeen',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <p>
          ClubMatch is een biljart competitie beheersysteem voor clubbeheerders. Het stelt u in staat om leden te beheren, competities te organiseren in meerdere disciplines, wedstrijden te plannen, uitslagen in te voeren en standen te genereren.
        </p>
        <p>
          <strong>Aan de slag:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Maak eerst leden aan in de module &quot;Ledenbeheer&quot; met een naam en een moyenne per discipline.</li>
          <li>Maak een competitie aan bij &quot;Competities&quot;.</li>
          <li>Koppel spelers (leden) aan de competitie.</li>
          <li>Plan wedstrijden en voer uitslagen in.</li>
        </ol>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          NB: Een lid kunt u aan meerdere competities koppelen.
        </p>
      </div>
    ),
  },
  {
    id: 'leden',
    title: 'Ledenbeheer',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    relatedLink: { href: '/leden', label: 'Ga naar Ledenbeheer' },
    content: (
      <div className="space-y-4">
        <p>
          Leden moeten eerst ingevoerd worden met een naam en een moyenne per discipline. Elk lid krijgt automatisch een nummer toegewezen.
        </p>
        <div>
          <h4 className="font-semibold mb-2">Lid aanmaken</h4>
          <p>Klik op &quot;Nieuw lid&quot; om een lid aan te maken. Vul de voornaam, eventueel tussenvoegsel en achternaam in. U kunt ook het moyenne per discipline invullen (Libre, Bandstoten, Driebanden klein, Driebanden groot, Kader).</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Lid wijzigen</h4>
          <p>Klik op het bewerkicoon bij een lid om de gegevens te wijzigen.</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Let op: Als u een moyenne wijzigt van een lid dat als speler aan een competitie is gekoppeld, wordt het moyenne van die speler in die competitie niet aangepast. Bij koppeling aan een nieuwe competitie wordt wel het laatst bekende moyenne gebruikt.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Lid verwijderen</h4>
          <p>U kunt een lid verwijderen via de knop &quot;Verwijderen&quot;. Als een lid aan een competitie is gekoppeld, worden de bijbehorende spelersgegevens in die competitie(s) ook verwijderd.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Leden zoeken</h4>
          <p>Gebruik het zoekveld bovenaan de ledenlijst om snel een lid te vinden op naam.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'competities',
    title: 'Competities',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    relatedLink: { href: '/competities', label: 'Ga naar Competities' },
    content: (
      <div className="space-y-4">
        <p>
          U kunt zoveel competities aanmaken als u wilt. Aan elke competitie moet u spelers koppelen uit de ledenlijst.
        </p>
        <div>
          <h4 className="font-semibold mb-2">Competitie aanmaken</h4>
          <p>Bij het aanmaken van een competitie kiest u uit:</p>
          <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
            <li>Een discipline (Libre, Bandstoten, Driebanden klein, Driebanden groot, Kader)</li>
            <li>Diverse moyenne-formules om het aantal te maken caramboles te bepalen</li>
            <li>Drie puntensystemen (Winst/Remise/Verlies, 10-puntensysteem, Belgisch systeem)</li>
            <li>Minimaal aantal te maken caramboles</li>
            <li>Een beurtenlimiet indien gewenst</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Competitie wijzigen</h4>
          <p>Van een aangemaakte competitie kunt u later nog de naam, de datum of het puntensysteem wijzigen.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Competitie verwijderen</h4>
          <p>Bij het verwijderen van een competitie worden alle gekoppelde spelers, wedstrijden en uitslagen ook verwijderd.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'spelers',
    title: 'Spelers in competitie',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Speler koppelen</h4>
          <p>
            Als u een competitie hebt aangemaakt en geopend, moet u als eerste spelers aan de competitie toevoegen. Die spelers heeft u eerder in de module &quot;Ledenbeheer&quot; aangemaakt. U kunt zoveel spelers aan een competitie koppelen als u wilt.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Speler verwijderen</h4>
          <p>
            Spelers die aan een competitie zijn gekoppeld, kunt u altijd verwijderen. Let op: alle partijen van die speler worden verwijderd, inclusief bij de tegenstanders.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            NB: Spelers die u uit een competitie verwijdert, blijven als lid beschikbaar om later opnieuw of aan andere competities te koppelen.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Spelerslijst</h4>
          <p>Een overzicht van alle spelers die aan de competitie zijn gekoppeld, met hun moyenne en aantal te maken caramboles.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'planning',
    title: 'Planning',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Algemeen</h4>
          <p>
            U kunt een vrijblijvende planning maken voor een speeldag in uw competitie. Vink de spelers aan die aanwezig zijn en kies het aantal partijen (1 of 2) dat het programma moet maken. Klik dan op &quot;Maak planning&quot; en het programma genereert partijen tussen spelers die nog tegen elkaar kunnen spelen.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            NB: De voorgestelde partijen zijn vrijblijvend; u hoeft ze niet te gebruiken.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Suggestie aantal partijen</h4>
          <ul className="list-disc list-inside ml-2 space-y-2">
            <li><strong>Even aantal spelers:</strong> Kies voor 1 partij per speler. Na afloop kunt u een nieuwe planning maken.</li>
            <li><strong>Oneven aantal spelers:</strong> Kies voor 2 partijen per speler. Bij een oneven aantal hebt u altijd een rustspeler. Het programma deelt de rustspelers tegen elkaar in.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'uitslagen',
    title: 'Uitslagen',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Uitslag invoeren</h4>
          <p>
            U kunt twee spelers kiezen en een uitslag invoeren van een gespeelde wedstrijd. U kunt er ook voor kiezen om eerst een partij aan te maken die u oproept op een scorebord, waarna de uitslag automatisch wordt opgenomen.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Uitslag wijzigen</h4>
          <p>U kunt elke uitslag wijzigen, zowel handmatig ingevoerde als uitslagen vanuit de scoreborden.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Uitslag verwijderen</h4>
          <p>
            U kunt elke uitslag verwijderen. Let op: als u een uitslag verwijdert worden de resultaten van beide spelers verwijderd en wordt de partij niet meer in de stand meegenomen.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'stand',
    title: 'Stand',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <p>Bij het opmaken van de stand kunt u kiezen uit de volgende mogelijkheden:</p>
        <ul className="list-disc list-inside ml-2 space-y-2">
          <li>De stand van een gekozen periode of de totaalstand van alle perioden.</li>
          <li>De stand op basis van punten of op basis van percentage punten.</li>
        </ul>
        <p>
          Na het maken van uw keuze klikt u op &quot;Vernieuw stand&quot; om de stand te genereren.
        </p>
      </div>
    ),
  },
  {
    id: 'periodes',
    title: 'Periodes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Periode-overgang</h4>
          <p>
            Vanuit periode 1 t/m 4 kunt u een volgende periode aanmaken. Daarbij kunt u per speler aangeven of het nieuwe moyenne gaat gelden voor de nieuwe periode. Als u geen vinkje bij een speler zet, blijft het oude moyenne ook gelden in de nieuwe periode.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Moyenne aanpassen</h4>
          <p>
            Bent u niet akkoord met het voorgestelde moyenne? Dan kunt u het nieuwe moyenne voor de volgende periode handmatig aanpassen. Het aantal te maken caramboles wordt automatisch herberekend op basis van de gekozen moyenne-formule.
          </p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Er zijn maximaal 5 periodes per competitie mogelijk.
        </p>
      </div>
    ),
  },
  {
    id: 'scoreborden',
    title: 'Scoreborden',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    relatedLink: { href: '/scoreborden', label: 'Ga naar Scoreborden' },
    content: (
      <div className="space-y-4">
        <p>
          Met de scoreborden kunt u live partijen bijhouden en tonen op een scherm. De scoreborden zijn bedoeld voor gebruik op een tablet of computer naast de biljarttafel.
        </p>
        <div>
          <h4 className="font-semibold mb-2">Partij starten</h4>
          <p>Kies een competitie en een geplande wedstrijd. Het scorebord toont de namen van de spelers, het aantal te maken caramboles en de lopende score.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Bediening</h4>
          <p>U kunt het scorebord bedienen met muis of tablet. Deze instelling kunt u wijzigen bij Instellingen.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Advertenties / Slideshow</h4>
          <p>Op het scorebord kunt u een slideshow tonen met adverteerders of mededelingen wanneer er geen partij actief is.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'instellingen',
    title: 'Instellingen',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    relatedLink: { href: '/instellingen', label: 'Ga naar Instellingen' },
    content: (
      <div className="space-y-4">
        <p>Bij Instellingen kunt u het volgende beheren:</p>
        <ul className="list-disc list-inside ml-2 space-y-2">
          <li><strong>Logo:</strong> Upload uw eigen clublogo.</li>
          <li><strong>Organisatienaam:</strong> Wijzig de naam van uw organisatie.</li>
          <li><strong>Aantal tafels:</strong> Stel het aantal beschikbare biljarttafels in.</li>
          <li><strong>Nieuwsbrief:</strong> Kies of u de nieuwsbrief wilt ontvangen.</li>
          <li><strong>Bediening:</strong> Kies of de scoreborden met muis of tablet bediend worden.</li>
          <li><strong>Advertenties:</strong> Beheer de slideshow-afbeeldingen voor de scoreborden.</li>
          <li><strong>Avatars:</strong> Beheer spelerfoto&apos;s die op de scoreborden worden getoond.</li>
          <li><strong>Account:</strong> Bekijk uw accountgegevens of verwijder uw account.</li>
        </ul>
      </div>
    ),
  },
];

export default function HelpPage() {
  const [activeTopic, setActiveTopic] = useState<string>('algemeen');

  const currentTopic = helpTopics.find((t) => t.id === activeTopic) || helpTopics[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Help</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Topic list sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 bg-green-700 text-white font-semibold text-sm">
              <div className="flex items-center gap-2">
                <QuestionIcon />
                Onderwerpen
              </div>
            </div>
            <nav className="p-2" aria-label="Help onderwerpen">
              {helpTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                    activeTopic === topic.id
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={activeTopic === topic.id ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}>
                    {topic.icon}
                  </span>
                  {topic.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Topic content area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-green-600 dark:text-green-400">
                  {currentTopic.icon}
                </span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentTopic.title}
                </h2>
              </div>
              {currentTopic.relatedLink && (
                <Link
                  href={currentTopic.relatedLink.href}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1"
                >
                  {currentTopic.relatedLink.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="p-6 text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentTopic.content}
            </div>
          </div>

          {/* Quick navigation to other topics */}
          <div className="mt-6 flex flex-wrap gap-2">
            {helpTopics
              .filter((t) => t.id !== activeTopic)
              .slice(0, 4)
              .map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="text-slate-400 dark:text-slate-500">
                    {topic.icon}
                  </span>
                  {topic.title}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
