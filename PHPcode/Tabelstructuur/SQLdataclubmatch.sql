SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `deb129009n4_clubmatch`
--
CREATE DATABASE IF NOT EXISTS `deb129009n4_clubmatch` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `deb129009n4_clubmatch`;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_bediening`
--

CREATE TABLE `bj_bediening` (
  `bediening_id` int(50) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `tafel_nr` int(40) NOT NULL,
  `soort` int(40) NOT NULL COMMENT '1=muis, 2=tablet'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_competities`
--

CREATE TABLE `bj_competities` (
  `comp_id` int(50) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `comp_nr` int(50) NOT NULL,
  `comp_naam` varchar(50) NOT NULL,
  `comp_datum` varchar(50) NOT NULL,
  `discipline` int(50) NOT NULL COMMENT '1=lib, 2=band, 3=driebnd_kl, 4=driebnd_gr, 5=kader',
  `periode` int(50) NOT NULL,
  `punten_sys` int(50) NOT NULL COMMENT '1=WRV, 2=10p, 3=Belgsys',
  `moy_form` int(50) NOT NULL COMMENT '1=x15, 2=x20, 3=x25, 4=x30, 5=x40, 6=x50, 7=x60',
  `min_car` int(50) NOT NULL COMMENT '0=geen, rest value',
  `max_beurten` int(50) NOT NULL COMMENT '0=geen, 10-60 stap5',
  `vast_beurten` int(40) NOT NULL DEFAULT 0,
  `sorteren` int(40) NOT NULL DEFAULT 1 COMMENT '1=vn, 2=an'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_organisaties`
--

CREATE TABLE `bj_organisaties` (
  `org_id` int(50) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `org_code` varchar(50) NOT NULL,
  `org_naam` varchar(50) NOT NULL,
  `org_wl_naam` varchar(50) NOT NULL,
  `org_wl_email` varchar(50) NOT NULL,
  `org_logo` varchar(50) NOT NULL,
  `aantal_tafels` int(50) NOT NULL,
  `return_code` int(50) NOT NULL,
  `time_start` int(50) NOT NULL,
  `code_ontvangen` int(40) NOT NULL COMMENT '0=nee, 1=ja',
  `date_start` date NOT NULL DEFAULT '2025-01-01',
  `date_inlog` date NOT NULL DEFAULT '2025-01-01',
  `nieuwsbrief` int(50) NOT NULL DEFAULT 1 COMMENT '0=nee, 1=ja',
  `reminder_send` int(40) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_partijen`
--

CREATE TABLE `bj_partijen` (
  `part_id` int(50) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `comp_nr` int(50) NOT NULL,
  `nummer_A` int(50) NOT NULL,
  `naam_A` varchar(50) NOT NULL,
  `cartem_A` int(50) NOT NULL,
  `tafel` varchar(50) NOT NULL,
  `nummer_B` int(50) NOT NULL,
  `naam_B` varchar(50) NOT NULL,
  `cartem_B` int(50) NOT NULL,
  `periode` int(40) NOT NULL,
  `uitslag_code` varchar(50) NOT NULL COMMENT 'periode_001_012',
  `gespeeld` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_spelers_algemeen`
--

CREATE TABLE `bj_spelers_algemeen` (
  `spa_id` int(50) NOT NULL,
  `spa_nummer` int(50) NOT NULL,
  `spa_vnaam` varchar(50) NOT NULL,
  `spa_tv` varchar(50) NOT NULL,
  `spa_anaam` varchar(50) NOT NULL,
  `spa_org` int(50) NOT NULL,
  `spa_moy_lib` decimal(10,3) NOT NULL,
  `spa_moy_band` decimal(10,3) NOT NULL,
  `spa_moy_3bkl` decimal(10,3) NOT NULL,
  `spa_moy_3bgr` decimal(10,3) NOT NULL,
  `spa_moy_kad` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_spelers_comp`
--

CREATE TABLE `bj_spelers_comp` (
  `spc_id` int(50) NOT NULL,
  `spc_nummer` int(50) NOT NULL,
  `spc_org` int(50) NOT NULL,
  `spc_competitie` int(50) NOT NULL,
  `spc_moyenne_1` decimal(10,3) NOT NULL,
  `spc_car_1` int(50) NOT NULL,
  `spc_moyenne_2` decimal(10,3) NOT NULL,
  `spc_car_2` int(50) NOT NULL,
  `spc_moyenne_3` decimal(10,3) NOT NULL,
  `spc_car_3` int(50) NOT NULL,
  `spc_moyenne_4` decimal(10,3) NOT NULL,
  `spc_car_4` int(50) NOT NULL,
  `spc_moyenne_5` decimal(10,3) NOT NULL,
  `spc_car_5` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_tafel`
--

CREATE TABLE `bj_tafel` (
  `tafel_id` int(40) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `comp_nr` int(50) NOT NULL,
  `u_code` varchar(50) NOT NULL,
  `tafel_nr` int(40) NOT NULL,
  `status` int(40) NOT NULL COMMENT '0=wachten, 1=gestart, 2=resultaat'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_uitslagen`
--

CREATE TABLE `bj_uitslagen` (
  `uitslag_id` int(50) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `comp_nr` int(50) NOT NULL,
  `uitslag_code` varchar(50) NOT NULL COMMENT 'periode-sp1-sp2',
  `periode` int(50) NOT NULL,
  `speeldatum` date NOT NULL DEFAULT '2025-01-06',
  `sp_1_nr` int(50) NOT NULL,
  `sp_1_cartem` int(50) NOT NULL,
  `sp_1_cargem` int(50) NOT NULL,
  `sp_1_hs` int(50) NOT NULL,
  `sp_1_punt` int(50) NOT NULL,
  `brt` int(50) NOT NULL,
  `sp_2_nr` int(50) NOT NULL,
  `sp_2_cartem` int(50) NOT NULL,
  `sp_2_cargem` int(50) NOT NULL,
  `sp_2_hs` int(50) NOT NULL,
  `sp_2_punt` int(50) NOT NULL,
  `gespeeld` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_uitslag_hulp`
--

CREATE TABLE `bj_uitslag_hulp` (
  `hulp_id` int(50) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `comp_nr` int(50) NOT NULL,
  `uitslag_code` varchar(50) NOT NULL,
  `car_A_tem` int(50) NOT NULL,
  `car_A_gem` int(50) NOT NULL,
  `hs_A` int(50) NOT NULL,
  `brt` int(50) NOT NULL,
  `car_B_tem` int(50) NOT NULL,
  `car_B_gem` int(50) NOT NULL,
  `hs_B` int(50) NOT NULL,
  `turn` int(50) NOT NULL,
  `alert` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `bj_uitslag_hulp_tablet`
--

CREATE TABLE `bj_uitslag_hulp_tablet` (
  `hulp_id` int(50) NOT NULL,
  `org_nummer` int(50) NOT NULL,
  `comp_nr` int(50) NOT NULL,
  `uitslag_code` varchar(50) NOT NULL,
  `tafel_nr` int(40) NOT NULL,
  `car_A_tem` int(50) NOT NULL,
  `car_A_gem` int(50) NOT NULL,
  `serie_A` int(50) NOT NULL,
  `hs_A` int(50) NOT NULL,
  `brt` int(50) NOT NULL,
  `car_B_tem` int(50) NOT NULL,
  `car_B_gem` int(50) NOT NULL,
  `serie_B` int(50) NOT NULL,
  `hs_B` int(50) NOT NULL,
  `turn` int(50) NOT NULL,
  `alert` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `specialsoftware_reacties`
--

CREATE TABLE `specialsoftware_reacties` (
  `id_reactie` int(50) NOT NULL,
  `nummer` int(50) NOT NULL,
  `tijd` datetime NOT NULL,
  `naam` varchar(50) NOT NULL,
  `tekst` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `bj_bediening`
--
ALTER TABLE `bj_bediening`
  ADD PRIMARY KEY (`bediening_id`);

--
-- Indexen voor tabel `bj_competities`
--
ALTER TABLE `bj_competities`
  ADD PRIMARY KEY (`comp_id`);

--
-- Indexen voor tabel `bj_organisaties`
--
ALTER TABLE `bj_organisaties`
  ADD PRIMARY KEY (`org_id`);

--
-- Indexen voor tabel `bj_partijen`
--
ALTER TABLE `bj_partijen`
  ADD PRIMARY KEY (`part_id`);

--
-- Indexen voor tabel `bj_spelers_algemeen`
--
ALTER TABLE `bj_spelers_algemeen`
  ADD PRIMARY KEY (`spa_id`);

--
-- Indexen voor tabel `bj_spelers_comp`
--
ALTER TABLE `bj_spelers_comp`
  ADD PRIMARY KEY (`spc_id`);

--
-- Indexen voor tabel `bj_tafel`
--
ALTER TABLE `bj_tafel`
  ADD PRIMARY KEY (`tafel_id`);

--
-- Indexen voor tabel `bj_uitslagen`
--
ALTER TABLE `bj_uitslagen`
  ADD PRIMARY KEY (`uitslag_id`);

--
-- Indexen voor tabel `bj_uitslag_hulp`
--
ALTER TABLE `bj_uitslag_hulp`
  ADD PRIMARY KEY (`hulp_id`);

--
-- Indexen voor tabel `bj_uitslag_hulp_tablet`
--
ALTER TABLE `bj_uitslag_hulp_tablet`
  ADD PRIMARY KEY (`hulp_id`);

--
-- Indexen voor tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  ADD PRIMARY KEY (`id_reactie`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `bj_bediening`
--
ALTER TABLE `bj_bediening`
  MODIFY `bediening_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_competities`
--
ALTER TABLE `bj_competities`
  MODIFY `comp_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_organisaties`
--
ALTER TABLE `bj_organisaties`
  MODIFY `org_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_partijen`
--
ALTER TABLE `bj_partijen`
  MODIFY `part_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_spelers_algemeen`
--
ALTER TABLE `bj_spelers_algemeen`
  MODIFY `spa_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_spelers_comp`
--
ALTER TABLE `bj_spelers_comp`
  MODIFY `spc_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_tafel`
--
ALTER TABLE `bj_tafel`
  MODIFY `tafel_id` int(40) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_uitslagen`
--
ALTER TABLE `bj_uitslagen`
  MODIFY `uitslag_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_uitslag_hulp`
--
ALTER TABLE `bj_uitslag_hulp`
  MODIFY `hulp_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `bj_uitslag_hulp_tablet`
--
ALTER TABLE `bj_uitslag_hulp_tablet`
  MODIFY `hulp_id` int(50) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `specialsoftware_reacties`
--
ALTER TABLE `specialsoftware_reacties`
  MODIFY `id_reactie` int(50) NOT NULL AUTO_INCREMENT;
--