-- phpMyAdmin SQL Dump
-- version 5.2.3-1.el8.remi
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Gegenereerd op: 13 feb 2026 om 10:48
-- Serverversie: 10.11.15-MariaDB-cll-lve-log
-- PHP-versie: 8.2.30


-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--
-- Database: `deb129009n4_toernooiprof`
--
CREATE DATABASE IF NOT EXISTS `deb129009n4_toernooiprof` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `deb129009n4_toernooiprof`;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_bediening`
--

CREATE TABLE `tp_bediening` (
  `bediening_id` int(50) NOT NULL,
  `gebruiker_nr` int(50) NOT NULL,
  `taf_nr` int(50) NOT NULL,
  `soort` int(50) NOT NULL COMMENT '1=muis, 2=tablet'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_data`
--

CREATE TABLE `tp_data` (
  `tp_id` int(40) NOT NULL,
  `gebruiker_nr` int(40) NOT NULL,
  `t_nummer` int(40) NOT NULL,
  `t_naam` varchar(50) NOT NULL,
  `t_datum` varchar(50) NOT NULL,
  `datum_start` date NOT NULL DEFAULT '2025-01-01',
  `datum_eind` date NOT NULL DEFAULT '2025-01-01',
  `discipline` int(50) NOT NULL DEFAULT 1 COMMENT '1=lib, 2=band, 3=3bndkl, 4=3bndgr, 5=kad',
  `t_car_sys` int(40) NOT NULL DEFAULT 1 COMMENT '1=moyform, 2=car vrij',
  `t_moy_form` int(40) NOT NULL COMMENT '1=x20, 2=x25, 3=x30, 4=x40, 5=x50, 6=x60',
  `t_punten_sys` int(40) NOT NULL COMMENT '1=2/1/0, 2=10p, 3=Belg',
  `t_min_car` int(40) NOT NULL,
  `t_max_beurten` int(40) NOT NULL COMMENT '0=geen',
  `t_gestart` int(40) NOT NULL COMMENT '0=nee, 1=ja',
  `t_ronde` int(40) NOT NULL,
  `openbaar` int(40) NOT NULL COMMENT '0=nee, 1=ja'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_gebruikers`
--

CREATE TABLE `tp_gebruikers` (
  `gebruiker_id` int(40) NOT NULL,
  `gebruiker_nr` int(50) NOT NULL,
  `gebruiker_code` varchar(50) NOT NULL,
  `openbaar` int(40) NOT NULL DEFAULT 2,
  `gebruiker_naam` varchar(50) NOT NULL,
  `loc_naam` varchar(40) NOT NULL,
  `loc_straat` varchar(40) NOT NULL,
  `loc_pc` varchar(40) NOT NULL,
  `loc_plaats` varchar(40) NOT NULL,
  `gebruiker_logo` varchar(50) NOT NULL,
  `tp_wl_naam` varchar(50) NOT NULL,
  `tp_wl_email` varchar(50) NOT NULL,
  `toon_email` int(40) NOT NULL DEFAULT 0,
  `aantal_tafels` int(50) NOT NULL DEFAULT 4,
  `return_code` int(50) NOT NULL,
  `time_start` int(50) NOT NULL,
  `code_ontvangen` int(40) NOT NULL COMMENT '0=nee, 1=ja',
  `date_start` date NOT NULL DEFAULT '2025-01-01',
  `date_inlog` date NOT NULL DEFAULT '2025-01-01',
  `nieuwsbrief` int(50) NOT NULL DEFAULT 1,
  `reminder_send` int(40) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_poules`
--

CREATE TABLE `tp_poules` (
  `poule_id` int(40) NOT NULL,
  `gebruiker_nr` int(40) NOT NULL,
  `t_nummer` int(40) NOT NULL,
  `sp_nummer` int(40) NOT NULL,
  `sp_moy` decimal(10,3) NOT NULL,
  `sp_car` int(40) NOT NULL DEFAULT 0,
  `sp_volgnr` int(40) NOT NULL,
  `poule_nr` int(40) NOT NULL,
  `ronde_nr` int(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_spelers`
--

CREATE TABLE `tp_spelers` (
  `tps_id` int(40) NOT NULL,
  `gebruiker_nr` int(40) NOT NULL,
  `t_nummer` int(40) NOT NULL,
  `sp_nummer` int(40) NOT NULL,
  `sp_naam` varchar(50) NOT NULL,
  `sp_startmoy` decimal(10,3) NOT NULL,
  `sp_startcar` int(40) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_tafel`
--

CREATE TABLE `tp_tafel` (
  `tafel_id` int(50) NOT NULL,
  `gebruiker_nr` int(50) NOT NULL,
  `t_nummer` int(50) NOT NULL,
  `t_ronde` int(50) NOT NULL,
  `uitslag_code` varchar(50) NOT NULL,
  `poule_nr` int(50) NOT NULL,
  `tafel_nr` int(50) NOT NULL,
  `status` int(50) NOT NULL COMMENT '1=gestart, 2=resultaat'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_uitslagen`
--

CREATE TABLE `tp_uitslagen` (
  `uitslag_id` int(40) NOT NULL,
  `gebruiker_nr` int(40) NOT NULL,
  `t_nummer` int(40) NOT NULL,
  `sp_nummer_1` int(40) NOT NULL,
  `sp_volgnummer_1` int(40) NOT NULL,
  `sp_nummer_2` int(40) NOT NULL,
  `sp_volgnummer_2` int(40) NOT NULL,
  `sp_poule` int(40) NOT NULL,
  `t_ronde` int(40) NOT NULL COMMENT 'toernooi ronde',
  `p_ronde` int(40) NOT NULL COMMENT 'partij ronde',
  `koppel` int(40) NOT NULL,
  `sp_partcode` varchar(50) NOT NULL COMMENT 'ronde_koppel',
  `sp1_car_tem` int(40) NOT NULL,
  `sp2_car_tem` int(40) NOT NULL,
  `sp1_car_gem` int(40) NOT NULL,
  `sp2_car_gem` int(40) NOT NULL,
  `brt` int(40) NOT NULL,
  `sp1_hs` int(40) NOT NULL,
  `sp2_hs` int(40) NOT NULL,
  `sp1_punt` int(40) NOT NULL,
  `sp2_punt` int(40) NOT NULL,
  `gespeeld` int(40) NOT NULL COMMENT '0=nee, 1=ja, 8=gekoppeld, 9=bezig',
  `tafel_nr` int(40) NOT NULL COMMENT '0=allemaal'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_uitslag_hulp`
--

CREATE TABLE `tp_uitslag_hulp` (
  `hulp_id` int(40) NOT NULL,
  `gebruiker_nr` int(40) NOT NULL,
  `t_nummer` int(40) NOT NULL,
  `t_ronde` int(40) NOT NULL,
  `poule_nr` int(40) NOT NULL,
  `uitslag_code` varchar(50) NOT NULL COMMENT 'ronde_koppel',
  `car_A_tem` int(40) NOT NULL,
  `car_A_gem` int(40) NOT NULL,
  `hs_A` int(40) NOT NULL,
  `brt` int(40) NOT NULL,
  `car_B_tem` int(40) NOT NULL,
  `car_B_gem` int(40) NOT NULL,
  `hs_B` int(40) NOT NULL,
  `turn` int(40) NOT NULL,
  `alert` int(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `tp_uitslag_hulp_tablet`
--

CREATE TABLE `tp_uitslag_hulp_tablet` (
  `hulp_id` int(40) NOT NULL,
  `gebruiker_nr` int(40) NOT NULL,
  `t_nummer` int(40) NOT NULL,
  `t_ronde` int(40) NOT NULL,
  `poule_nr` int(40) NOT NULL,
  `uitslag_code` varchar(50) NOT NULL COMMENT 'ronde_koppel',
  `tafel_nr` int(50) NOT NULL,
  `car_A_tem` int(40) NOT NULL,
  `car_A_gem` int(40) NOT NULL,
  `serie_A` int(50) NOT NULL,
  `hs_A` int(40) NOT NULL,
  `brt` int(40) NOT NULL,
  `car_B_tem` int(40) NOT NULL,
  `car_B_gem` int(40) NOT NULL,
  `serie_B` int(50) NOT NULL,
  `hs_B` int(40) NOT NULL,
  `turn` int(40) NOT NULL,
  `alert` int(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `tp_bediening`
--
ALTER TABLE `tp_bediening`
  ADD PRIMARY KEY (`bediening_id`);

--
-- Indexen voor tabel `tp_data`
--
ALTER TABLE `tp_data`
  ADD PRIMARY KEY (`tp_id`);

--
-- Indexen voor tabel `tp_gebruikers`
--
ALTER TABLE `tp_gebruikers`
  ADD PRIMARY KEY (`gebruiker_id`);

--
-- Indexen voor tabel `tp_poules`
--
ALTER TABLE `tp_poules`
  ADD PRIMARY KEY (`poule_id`);

--
-- Indexen voor tabel `tp_spelers`
--
ALTER TABLE `tp_spelers`
  ADD PRIMARY KEY (`tps_id`);

--
-- Indexen voor tabel `tp_tafel`
--
ALTER TABLE `tp_tafel`
  ADD PRIMARY KEY (`tafel_id`);

--
-- Indexen voor tabel `tp_uitslagen`
--
ALTER TABLE `tp_uitslagen`
  ADD PRIMARY KEY (`uitslag_id`);

--
-- Indexen voor tabel `tp_uitslag_hulp`
--
ALTER TABLE `tp_uitslag_hulp`
  ADD PRIMARY KEY (`hulp_id`);

--
-- Indexen voor tabel `tp_uitslag_hulp_tablet`
--
ALTER TABLE `tp_uitslag_hulp_tablet`
  ADD PRIMARY KEY (`hulp_id`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `tp_bediening`
--
ALTER TABLE `tp_bediening`
  MODIFY `bediening_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_data`
--
ALTER TABLE `tp_data`
  MODIFY `tp_id` int(40) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_gebruikers`
--
ALTER TABLE `tp_gebruikers`
  MODIFY `gebruiker_id` int(40) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_poules`
--
ALTER TABLE `tp_poules`
  MODIFY `poule_id` int(40) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_spelers`
--
ALTER TABLE `tp_spelers`
  MODIFY `tps_id` int(40) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_tafel`
--
ALTER TABLE `tp_tafel`
  MODIFY `tafel_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_uitslagen`
--
ALTER TABLE `tp_uitslagen`
  MODIFY `uitslag_id` int(40) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_uitslag_hulp`
--
ALTER TABLE `tp_uitslag_hulp`
  MODIFY `hulp_id` int(40) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `tp_uitslag_hulp_tablet`
--
ALTER TABLE `tp_uitslag_hulp_tablet`
  MODIFY `hulp_id` int(40) NOT NULL AUTO_INCREMENT;
COMMIT;
