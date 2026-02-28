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
          ToernooiProf is een toernooibeheersysteem voor wedstrijdleiders. Het stelt u in staat om toernooien te organiseren, deelnemers toe te voegen, wedstrijden te plannen in poules, uitslagen in te voeren en standen te genereren.
        </p>
        <p>
          <strong>Aan de slag:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Maak een toernooi aan bij &quot;Toernooien&quot;.</li>
          <li>Voeg deelnemers aan het toernooi toe in de gewenste poules.</li>
          <li>Start het toernooi en laat alle partijen genereren.</li>
          <li>Voeg uitslagen toe of beheer de standen.</li>
        </ol>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          NB: Deelnemers worden per toernooi beheerd, niet in een algemene ledenlijst.
        </p>
        <div>
          <h4 className="font-semibold mb-2">Printen en exporteren</h4>
          <p>
            In ToernooiProf betekent <strong>printen</strong> of <strong>exporteren</strong> steeds: printen naar PDF. U kunt daarmee standen, planningen of andere overzichten als PDF opslaan.
          </p>
        </div>
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
          <p>Een lid dat gekoppeld is aan een competitie kan niet verwijderd worden! Verwijder dit lid eerst uit de competitie.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Leden zoeken</h4>
          <p>Gebruik het zoekveld bovenaan de ledenlijst om snel een lid te vinden op naam.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'toernooien',
    title: 'Toernooien',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    relatedLink: { href: '/toernooien', label: 'Ga naar Toernooien' },
    content: (
      <div className="space-y-4">
        <p>
          U kunt zoveel toernooien aanmaken als u wilt. Aan elk toernooi moet u deelnemers toevoegen, die in poules verdeeld worden.
        </p>
        <div>
          <h4 className="font-semibold mb-2">Toernooi aanmaken</h4>
          <p>Bij het aanmaken van een toernooi kiest u uit:</p>
          <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
            <li>Sub-titel, start/eind datum, discipline</li>
            <li>Diverse moyenne-formules of vrije invoer om het aantal te maken caramboles te bepalen</li>
            <li>Drie puntensystemen</li>
            <li>Minimaal aantal te maken caramboles en/of een beurtenlimiet indien gewenst</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Toernooi wijzigen of verwijderen</h4>
          <p>Van een aangemaakt toernooi kunt u later nog de actieve instellingen wijzigen of het in zijn geheel verwijderen.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'spelers',
    title: 'Deelnemers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Deelnemer toevoegen</h4>
          <p>
            Als u een toernooi hebt aangemaakt, voegt u deelnemers toe aan een specifieke poule.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Deelnemer verwijderen</h4>
          <p>
            Deelnemers kunt u altijd verwijderen. Let op: als het toernooi al is gestart worden de actieve partijen in de planning beïnvloed.
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
            Wanneer u het toernooi start, creëert ToernooiProf alle partijen voor een halve competitie (Round Robin). Bij een even aantal deelnemers is er in elke speelronde geen rust, en bij een oneven aantal is er in elke speelronde exact één deelnemer die rust heeft. U beheert deze wedstrijden in het beheersscherm.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'uitslagen',
    title: 'Uitslagbeheer',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <p>
          Via Uitslagbeheer beheert u de partijen en uitslagen per poule. Kies eerst de gewenste poule, daarna ziet u de planning met alle partijen voor die poule in de huidige ronde.
        </p>
        <p>
          Per partij kunt u een uitslag invoeren (groene knop) of een bestaande uitslag wijzigen (oranje knop). Vul caramboles gemaakt, beurten, hoogste serie en punten in.
        </p>
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
          <li>De stand van een gekozen ronde of de totaalstand van alle ronden.</li>
          <li>De stand op basis van punten of op basis van percentage punten.</li>
        </ul>
        <p>
          Na het maken van uw keuze klikt u op &quot;Vernieuw stand&quot; om de stand te genereren.
        </p>
      </div>
    ),
  },
  {
    id: 'ronden',
    title: 'Toernooironden',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Overgang naar nieuwe ronde</h4>
          <p>
            Nadat een toernooironde klaar is (alle poules voltooid) kunt u een volgende toernooironde aanmaken. U bepaalt zelf welke deelnemers doorkoppelen en in welke nieuwe poule zij terechtkomen. Ook besluit u of hun moyenne (en daarmee aantal te maken caramboles) gewijzigd dient te worden voor de nieuwe ronde.
          </p>
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
          <li><strong>Nieuwsbrief:</strong> Kies of u de nieuwsbrief wilt ontvangen.</li>
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
            <div className="px-4 py-3 bg-orange-600 text-white font-semibold text-sm">
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
                      ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={activeTopic === topic.id ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}>
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
                <span className="text-orange-600 dark:text-orange-400">
                  {currentTopic.icon}
                </span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentTopic.title}
                </h2>
              </div>
              {currentTopic.relatedLink && (
                <Link
                  href={currentTopic.relatedLink.href}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center gap-1"
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
