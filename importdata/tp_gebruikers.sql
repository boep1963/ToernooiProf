-- phpMyAdmin SQL Dump
-- version 5.2.3-1.el8.remi
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Gegenereerd op: 28 feb 2026 om 20:56
-- Serverversie: 10.11.15-MariaDB-cll-lve-log
-- PHP-versie: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `deb129009n4_toernooiprof`
--

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

--
-- Gegevens worden geëxporteerd voor tabel `tp_gebruikers`
--

INSERT INTO `tp_gebruikers` (`gebruiker_id`, `gebruiker_nr`, `gebruiker_code`, `openbaar`, `gebruiker_naam`, `loc_naam`, `loc_straat`, `loc_pc`, `loc_plaats`, `gebruiker_logo`, `tp_wl_naam`, `tp_wl_email`, `toon_email`, `aantal_tafels`, `return_code`, `time_start`, `code_ontvangen`, `date_start`, `date_inlog`, `nieuwsbrief`, `reminder_send`) VALUES
(8, 1002, '1002_PZJ@#', 2, 'BVZ Hilversum', '', '', '', '', 'Logo_1002.jpg', 'F.W. Som de Cerff', 'Pinkeltje200@hotmail.com', 0, 4, 0, 0, 1, '2025-01-01', '2025-01-01', 1, 1),
(12, 1004, '1004_SLE@#', 2, 'Ark kerst toernooi', '', '', '', '', 'Logo_1004.jpg', 'Piet Molenaar', 'pe.molenaar@quicknet.nl', 0, 4, 40936, 1735735469, 1, '2025-01-01', '2025-01-01', 1, 1),
(14, 1006, '1006_UYJ@#', 2, 'Dicky Dijkstra', '', '', '', '', 'Logo_1006.jpg', 'Chris Waltenee', 'waltech@planet.nl', 0, 4, 22435, 1736272599, 1, '2025-01-01', '2025-01-01', 1, 1),
(15, 1007, '1007_ERV@#', 2, 'O.B.V De Vliedberg', '', '', '', '', 'Logo_1007.jpg', 'Alie v Uden', 'alievanuden@icloud.com', 0, 4, 68570, 1736353653, 1, '2025-01-01', '2025-01-01', 1, 1),
(18, 1010, '1010_HGA@#', 2, 'Seniorenbiljart Obdam', '', '', '', '', 'Logo_1010.jpg', 'P. Mooij', 'pietmooij37@gmail.com', 0, 4, 56980, 1736454563, 1, '2025-01-01', '2026-01-12', 1, 0),
(19, 1011, '1011_EPT@#', 2, 'Bakkertoernooi', '', '', '', '', 'Logo_1011.jpg', 'Remy Bakker', 'bakkertoernooi@gmail.com', 0, 4, 95012, 1737057757, 1, '2025-01-01', '2026-01-31', 1, 0),
(20, 1012, '1012_ZQB@#', 2, 'WBB &amp; O', '', '', '', '', 'Logo_1012.jpg', 'Arjan Swinkels', 'wbb.arjan@gmail.com', 0, 4, 63877, 1737576407, 1, '2025-01-01', '2025-01-01', 1, 1),
(22, 1014, '1014_MKZ@#', 2, 'Loons Open', '', '', '', '', 'Logo_1014.jpg', 'Peter Bergers', 'phbergers@live.nl', 0, 4, 78535, 1738318010, 1, '2025-01-01', '2025-01-01', 1, 1),
(23, 1015, '1015_FLU@#', 2, 'Bilj. toernooi Sondel', '', '', '', '', 'Logo_1015.jpg', 'Riny Kramer', 'riny.kramer@gmail.com', 0, 4, 79150, 1738492425, 1, '2025-01-01', '2025-01-01', 1, 1),
(24, 1016, '1016_DJT@#', 2, 'Bernardus', '', '', '', '', 'Logo_1016.jpg', 'Spelleider', '1960jcaarts@gmail.com', 0, 4, 75226, 1738769150, 1, '2025-01-01', '2025-01-01', 1, 1),
(25, 1017, '1017_CPZ@#', 2, 'kbc1911', '', '', '', '', 'Logo_1017.jpg', 'Ilona Hollander', 'berendjan54@gmail.com', 0, 4, 58167, 1738836354, 1, '2025-01-01', '2025-01-01', 1, 1),
(26, 1018, '1018_RLD@#', 2, 'libreladys', '', '', '', '', 'Logo_1018.jpg', 'Fokje Sijszeling', 'fokjesijszeling@gmail.com', 0, 4, 59349, 1738867362, 1, '2025-01-01', '2025-01-01', 1, 1),
(27, 1019, '1019_BNA@#', 2, 'Regio Biljart Oss', '', '', '', '', 'Logo_1019.jpg', 'Rini van Hoogstraten', 'rinivanhoogstraten@gmail.com', 0, 4, 36282, 1739026611, 1, '2025-01-01', '2025-01-01', 1, 1),
(28, 1020, '1020_UDA@#', 2, 'Poedelclub', '', '', '', '', 'Logo_1020.jpg', 'Rene De Groot', 'renep.de.groot@outlook.com', 0, 4, 67253, 1739090692, 1, '2025-01-01', '2025-01-01', 1, 1),
(30, 1022, '1022_NZA@#', 2, 'Biljartaalsmeer', '', '', '', '', 'Logo_1022.jpg', 'Fred Pol', 'secretaris@biljartaalsmeer.nl', 0, 4, 69950, 1739107885, 1, '2025-01-01', '2025-01-01', 1, 1),
(31, 1023, '1023_AAU@#', 2, 'Lindehof woensdag', '', '', '', '', 'Logo_1023.jpg', 'Clemens de Wit', 'clemensdewit45@gmail.com', 0, 4, 44730, 1739713286, 1, '2025-01-01', '2025-01-01', 1, 1),
(33, 1024, '1024_AHS@#', 1, 'OnderOns Beverwijk', 'OnderOns', 'Adrichemlaan 3', '1947 KX', 'Beverwijk', 'Logo_1024.jpg', 'Hans Eekels', 'hanseekels@gmail.com', 1, 8, 48162, 1740378738, 1, '2025-01-01', '2026-02-28', 1, 0),
(34, 1025, '1025_USE@#', 2, 'De Pomerans', '', '', '', '', 'Logo_1025.jpg', 'Peter van Rooden', 'pevaro@kpnmail.nl', 0, 4, 16849, 1740407351, 1, '2025-01-01', '2025-01-01', 1, 1),
(35, 1026, '1026_XBG@#', 2, 'BIOLA', '', '', '', '', 'Logo_1026.jpg', 'Herman', 'cvcarb@gmail.com', 0, 4, 28600, 1740475897, 1, '2025-01-01', '2025-01-01', 1, 1),
(36, 1027, '1027_KRP@#', 2, 'Rkbc Tik m een Tijdje', '', '', '', '', 'Logo_1027.jpg', 'Richard Luik', 'reindor@quicknet.nl', 0, 4, 74909, 1741084787, 1, '2025-01-01', '2025-01-01', 1, 1),
(37, 1028, '1028_FXQ@#', 2, 'BV Harago', '', '', '', '', 'Logo_1028.jpg', 'Raoul van der Hoorn', 'bvharago@hotmail.com', 0, 4, 30174, 1741335196, 1, '2025-01-01', '2025-01-01', 1, 1),
(38, 1029, '1029_CKN@#', 2, 'bv Jong Leven ', '', '', '', '', 'Logo_1029.jpg', 'Kees Oudt', 'keesoudt@hotmail.com', 0, 4, 43397, 1741619911, 1, '2025-01-01', '2026-02-17', 1, 0),
(39, 1030, '1030_MUM@#', 2, 'de Bun', '', '', '', '', 'Logo_1030.jpg', 'tijdelijk', 'aria1@abakker.nl', 0, 4, 70487, 1742291116, 1, '2025-01-01', '2025-01-01', 1, 1),
(41, 1032, '1032_CNT@#', 2, 'Oud Zijper biljarttoernooi', '', '', '', '', 'Logo_1032.jpg', 'Dennis Lemmers', 'dennis.lemmers@planet.nl', 0, 4, 66299, 1742749862, 1, '2025-01-01', '2025-01-01', 1, 1),
(42, 1033, '1033_FYC@#', 2, 'KBO-Budel', '', '', '', '', 'Logo_1033.jpg', 'Gerard Stienen', 'gerard.stienen@outlook.com', 0, 4, 72320, 1743585767, 1, '2025-01-01', '2025-01-01', 1, 1),
(44, 1034, '1034_PEL@#', 2, 'Biljart Deurstoters', '', '', '', '', 'Logo_1034.jpg', 'Sanders', 'sanders.druk@planet.nl', 0, 4, 64308, 1744801699, 1, '2025-01-01', '2025-01-01', 1, 1),
(45, 1035, '1035_LPJ@#', 2, 'Biljart ver. De Brouwerij', '', '', '', '', 'Logo_1035.jpg', 'Johan Hofman', 'johan.hofman@home.nl', 0, 4, 89082, 1744882891, 1, '2025-01-01', '2026-01-07', 1, 0),
(47, 1037, '1037_RZL@#', 2, 'Keu-Ze 93', '', '', '', '', 'Logo_1037.jpg', 'Frits Wuis', 'frits.wuis@gmail.com', 0, 4, 89635, 1746181610, 1, '2025-01-01', '2025-11-26', 1, 0),
(48, 1038, '1038_VGQ@#', 2, 'BV The Citydibo', '', '', '', '', 'Logo_1038.jpg', 'Henri Schoppers', 'wedstrijdleidercity@gmail.com', 0, 4, 60923, 1746380377, 1, '2025-01-01', '2025-08-31', 1, 0),
(52, 1039, '1039_AZN@#', 2, 'Het Baarsje', '', '', '', '', 'Logo_1039.jpg', 'Abe vhBaarsje', 'Abes@home.nl', 0, 1, 83041, 1748527533, 1, '2025-05-29', '2025-08-24', 1, 0),
(55, 1041, '1041_GLL@#', 2, 'Jacobswoude', '', '', '', '', 'Logo_1041.jpg', 'Hans Schouten', 'j_schouten@ziggo.nl', 0, 6, 50623, 1748947718, 1, '2025-06-03', '2025-06-03', 1, 0),
(56, 1042, '1042_WQE@#', 2, 'De Plas', '', '', '', '', 'Logo_1042.jpg', 'George Schipper', 'george.schipper@upcmail.nl', 0, 4, 35940, 1749061169, 1, '2025-06-04', '2025-06-04', 1, 0),
(57, 1043, '1043_VTZ@#', 2, 'Biljartclub Aduard', '', '', '', '', 'Logo_1043.jpg', 'Arie van Essen', 'bcaduard@gmail.com', 0, 4, 51114, 1749116235, 1, '2025-06-05', '2025-06-05', 1, 0),
(58, 1044, '1044_TGM@#', 2, 'cafe bert', '', '', '', '', 'Logo_1044.jpg', 'raymond', 'raymond@cafebert.nl', 0, 2, 32393, 1749382399, 1, '2025-06-08', '2025-12-18', 1, 0),
(59, 1045, '1045_SCL@#', 2, 'BATCUP2.0', '', '', '', '', 'Logo_1045.jpg', 'AJTempelman', 'ajtempelman@home.nl', 0, 4, 12025, 1750502352, 1, '2025-06-21', '2025-06-21', 1, 0),
(60, 1046, '1046_VUE@#', 2, 'BV Hazelaar', '', '', '', '', 'Logo_1046.jpg', 'Persons', 'personsrinus@gmail.com', 0, 4, 74822, 1750921950, 1, '2025-06-26', '2025-08-04', 1, 0),
(61, 1047, '1047_ATS@#', 2, 'B.C. DE SCHUUR', '', '', '', '', 'Logo_1047.jpg', 'Sjra Ronnes', 'sjra@ronnes.nl', 0, 2, 12692, 1751364502, 1, '2025-07-01', '2025-07-30', 1, 0),
(62, 1048, '1048_EQJ@#', 1, 'OC &#039;T Verhaal', '&#039;T Verhaal', 'Didamseweg 21', '7037 DH', 'Loerbeek', 'Logo_1048.jpg', 'EMIEL FIELT', 'emiel@fieltmail.nl', 1, 1, 80794, 1751568925, 1, '2025-07-03', '2026-01-16', 1, 0),
(63, 1049, '1049_LKZ@#', 2, 'BBC Castricum', '', '', '', '', 'Logo_1049.jpg', 'Alex Völker', 'info@bbc-castricum.nl', 0, 7, 37331, 1752750431, 1, '2025-07-17', '2025-10-09', 1, 0),
(64, 1050, '1050_CZE@#', 2, 'De Driezeeg', '', '', '', '', 'Logo_1050.jpg', 'Reinald van den Hanenberg', 'info@autobedrijfhanenberg.nl', 0, 4, 17444, 1753027008, 1, '2025-07-20', '2025-07-20', 1, 0),
(67, 1052, '1052_JQE@#', 2, 'BV Kontakt', '', '', '', '', 'Logo_1052.jpg', 'Freek Bosschers', 'f.bosschers@hccnet.nl', 0, 2, 95901, 1753172626, 1, '2025-07-22', '2026-02-26', 1, 0),
(68, 1053, '1053_LWN@#', 2, 'kampeer vereniging muidenberg', '', '', '', '', 'Logo_1053.jpg', 'Rob Ubink', 'robubink@hotmail.com', 0, 2, 16391, 1753260416, 1, '2025-07-23', '2025-07-23', 1, 0),
(69, 1054, '1054_LEL@#', 2, 'De Plas', '', '', '', '', 'Logo_1054.jpg', 'PJM de Rijk', 'derijk.p@gmail.com', 0, 2, 26741, 1753443915, 1, '2025-07-25', '2025-07-25', 1, 0),
(70, 1055, '1055_ZXR@#', 2, 'BV De Stins', '', '', '', '', 'Logo_1055.jpg', 'M. van der Woude', 'lecramvanderwoude@gmail.com', 0, 6, 82674, 1753511621, 1, '2025-07-26', '2025-07-26', 1, 0),
(71, 1056, '1056_UKK@#', 2, 'de Springbok', '', '', '', '', 'Logo_1056.jpg', 'Jos Lugtigheid', 'joslugtigheid@gmail.com', 0, 3, 40771, 1754176386, 1, '2025-08-03', '2025-09-11', 1, 0),
(73, 1058, '1058_RWB@#', 2, 'Venbo&quot;kaal&quot; 2025', '', '', '', '', 'Logo_1058.jpg', 'Reinald van den Hanenberg', 'haontje73@gmail.com', 0, 4, 72075, 1754215563, 1, '2025-08-03', '2025-09-01', 1, 0),
(74, 1059, '1059_XVQ@#', 2, 'Onderlingr comp.', '', '', '', '', 'Logo_1059.jpg', 'Tinus van Tol', 'tinusvt@gmail.com', 0, 2, 17680, 1754338154, 1, '2025-08-04', '2025-11-09', 1, 0),
(75, 1060, '1060_NYU@#', 2, 'Biljartvereniging CENTRUM', '', '', '', '', 'Logo_1060.jpg', 'W.Stratingh', 'WSTRATINGH@OUTLOOK.COM', 0, 10, 25628, 1755081286, 1, '2025-08-13', '2025-08-21', 1, 0),
(76, 1061, '1061_YEW@#', 2, 'Akkpelle', '', '', '', '', 'Logo_1061.jpg', 'NiekJetten', 'Jettenniek@gmail.com', 0, 2, 26627, 1755523686, 1, '2025-08-18', '2025-08-18', 1, 0),
(77, 1062, '1062_XPH@#', 2, 'BC KLEITENAERKE', '', '', '', '', 'Logo_1062.jpg', 'Joris', 'joris_cornelis@hotmail.com', 0, 2, 71281, 1755886603, 1, '2025-08-22', '2025-08-22', 1, 0),
(78, 1063, '1063_ELU@#', 2, 'ABC’08', '', '', '', '', 'Logo_1063.jpg', 'Willem Baldé', 'asserbiljartclub08@gmail.com', 0, 8, 17220, 1756035937, 1, '2025-08-24', '2025-08-24', 1, 0),
(79, 1064, '1064_AFM@#', 2, 'Soos Markt18', '', '', '', '', 'Logo_1064.jpg', 'B.Schouten', 'penn.meester.soos@outlook.com', 0, 7, 76209, 1756650045, 1, '2025-08-31', '2025-09-26', 1, 0),
(80, 1065, '1065_FNZ@#', 2, 'N.V.C.B.', '', '', '', '', 'Logo_1065.jpg', 'Frank Knijn', 'frankknijn62@gmail.com', 0, 2, 35405, 1756811383, 1, '2025-09-02', '2025-09-02', 1, 0),
(81, 1066, '1066_CSQ@#', 2, 'OLK Schagen', '', '', '', '', 'Logo_1066.jpg', 'Ben Schouten', 'ba.schouten@quicknet.nl', 0, 7, 81793, 1756832751, 1, '2025-09-02', '2025-09-02', 1, 0),
(82, 1067, '1067_AHE@#', 2, '8e dames libre 4-sprong', '', '', '', '', 'Logo_1067.jpg', 'ruud reinds', 'ruudreinds@ziggo.nl', 0, 3, 41793, 1757430061, 1, '2025-09-09', '2025-09-09', 1, 0),
(83, 1068, '1068_SHZ@#', 2, 'Bregweid Open', '', '', '', '', 'Logo_1068.jpg', 'Carlo Smit', 'carlosmit@quicknet.nl', 0, 1, 76212, 1757432890, 1, '2025-09-09', '2025-11-25', 1, 0),
(84, 1069, '1069_CYB@#', 2, 'BCDEHOEF', '', '', '', '', 'Logo_1069.jpg', 'Ray Kramer', 'raykramer@ziggo.nl', 0, 3, 28876, 1757523865, 1, '2025-09-10', '2025-09-10', 1, 0),
(85, 1070, '1070_HZH@#', 1, 'Voorbeeld Organisatie', 'OnderOns &#039;67', 'Adrichemlaan 3', '1947 KX', 'Beverwijk', 'Logo_1070.jpg', 'Hans Eekels', 'info@specialsoftware.nl', 1, 12, 58622, 1758181417, 1, '2025-09-18', '2025-11-07', 1, 0),
(86, 1071, '1071_NVU@#', 1, 'GOB', 'Comertzicht', 'Irenestraat 1', '5971 BS', 'Grubbenvorst', 'Logo_1071.jpg', 'Ben Janssen', 'janssen.bennie@gmail.com', 1, 2, 69332, 1758535696, 1, '2025-09-22', '2025-09-22', 0, 0),
(88, 1072, '1072_QYM@#', 1, 'De Zwarte Hand', 'De Zwarte Hand', 'Zuiderweg 75', '7907ck', 'Hoogeveen', 'Logo_1072.jpg', 'Patrick Boertien', 'p.boertien@hotmail.nl', 0, 1, 71646, 1758890533, 1, '2025-09-26', '2025-09-26', 0, 0),
(89, 1073, '1073_KTJ@#', 1, 'St. Driebandkampioenschap Son', 'Cafe-Restaurant &quot;De Zwaan&quot;', 'Markt 9 ', '5691 AR', 'Son en Breugel', 'Logo_1073.jpg', 'Jack Donkers', 'j.donkers20@upcmail.nl', 1, 3, 26049, 1758893661, 1, '2025-09-26', '2025-09-27', 1, 0),
(90, 1074, '1074_HZF@#', 1, 'Kunstgenot', 'De post', 'tripkouw 28', '1679GX', 'Midwoud', 'Logo_1074.jpg', 'Jan Meijer', 'kunstgenot@outlook.com', 1, 3, 42690, 1758982761, 1, '2025-09-27', '2026-02-21', 1, 0),
(91, 1075, '1075_TWH@#', 2, 'Club&#039;70', '', '', '', '', 'Logo_1075.jpg', 'MdG', 'ma.de.gier@kpnplanet.nl', 0, 2, 68561, 1759236724, 1, '2025-09-30', '2025-10-02', 0, 0),
(92, 1076, '1076_FPQ@#', 1, 'BCBE', 'bcbe', 'trambaan11het ACHTERHUIS', '1766JA', 'WIERINGERWAARD', 'Logo_1076.jpg', 'EDO', 'edobijpost56@gmail.com', 1, 1, 35323, 1759984968, 1, '2025-10-09', '2025-10-09', 1, 0),
(93, 1077, '1077_GVF@#', 1, 'Biljarten Haaksbergen', 'Oude Molen', 'Fazantstraat 35', '7481BG', 'Haaksbergen', 'Logo_1077.jpg', 'Brian ter Braak', 'btb1970@gmail.com', 0, 6, 17909, 1759995945, 1, '2025-10-09', '2025-10-09', 0, 0),
(94, 1078, '1078_MNP@#', 1, 'biljartvereniging tm25', 'dorpshuis de munte', 'kenninckweg 7', '9947PA', 'termunten', 'Logo_1078.jpg', 'g bos', 'geertgbos@gmail.com', 1, 2, 65218, 1761402679, 1, '2025-10-25', '2025-10-25', 1, 0),
(95, 1079, '1079_EMC@#', 1, 'Biljartvereniging Ens', 'Dorpshuis het Roefje', 'Aanzee, 24', '8325 BV', 'VOLLENHOVE', 'Logo_1079.jpg', 'Alwin Rietberg', 'alwinrietberg@gmail.com', 1, 3, 76173, 1761864314, 1, '2025-10-30', '2025-10-31', 1, 0),
(96, 1080, '1080_TGQ@#', 1, 'bc de reiger', 'de rietkraag', 'zandweg 6', '1736 da', 'zijdewind', 'Logo_1080.jpg', 'patricia Doodeman', 'doodeman4@hotmail.com', 1, 3, 73405, 1762333642, 1, '2025-11-05', '2025-11-09', 0, 0),
(97, 1081, '1081_LGE@#', 2, 'HBC 007', '', '', '', '', 'Logo_1081.jpg', 'Koos de Kruijf', 'koosdekruijf@gmail.com', 0, 1, 49408, 1763122054, 1, '2025-11-14', '2025-12-17', 0, 0),
(98, 1082, '1082_DXR@#', 2, 'Wapen van Grootebroek', '', '', '', '', 'Logo_1082.jpg', 'Peter Broersen', 'peterbroersen@gmail.com', 0, 3, 41568, 1763122888, 1, '2025-11-14', '2025-11-14', 1, 0),
(99, 1083, '1083_FPU@#', 1, 'OPEN ZUIDLAARDER DRIEBANDEN ', 'Grand Café Zuidlaren ', 'De Millystraat 8', '9471 AH', 'Zuidlaren ', 'Logo_1083.jpg', 'Pierre', 'pierre_2010@hotmail.com', 1, 3, 49002, 1763647172, 1, '2025-11-20', '2025-11-20', 0, 0),
(100, 1084, '1084_WLL@#', 1, 'De Stins', 'De Stins', 'Ampèrestraat 38', '8801PR', 'Franeker', 'Logo_1084.jpg', 'M. van der Woude', 'm.vanderwoude@icloud.com', 1, 6, 31100, 1763987349, 1, '2025-11-24', '2025-11-27', 1, 0),
(101, 1085, '1085_CAY@#', 1, 'Bv De Hoop', 'Cultura', 'Kleingouw 112', '1619CH', 'Andijk', 'Logo_1085.jpg', 'Bob Blom', 'wedstrijdleider@bvdehoop.nl', 1, 5, 23804, 1764165111, 1, '2025-11-26', '2026-01-27', 1, 0),
(102, 1086, '1086_CTY@#', 2, 'BV Jacobswoude', '', '', '', '', 'Logo_1086.jpg', 'Henry van Rijn', 'h.van.rijn@outlook.com', 0, 6, 99778, 1764679258, 1, '2025-12-02', '2025-12-19', 1, 0),
(104, 1088, '1088_WSA@#', 2, 'biljartvereniging-tm25', '', '', '', '', 'Logo_1088.jpg', 'Evert bos', 'info@biljartvereniging-tm25.nl', 0, 2, 76506, 1765212608, 1, '2025-12-08', '2026-01-20', 1, 0),
(105, 1089, '1089_YNF@#', 2, 'BvE', '', '', '', '', 'Logo_1089.jpg', 'Jos Beekman', 'j.beekman@intergamma.nl', 0, 3, 44194, 1765233523, 1, '2025-12-08', '2025-12-09', 0, 0),
(106, 1090, '1090_QAU@#', 1, 'Bolwerk &#039;81', 'Cafe Bert', 'Voorzorgstraat 42', '2013vr', 'Haarlem ', 'Logo_1090.jpg', 'Richard Boelé', 'richardboele@planet.nl', 0, 2, 39737, 1765447401, 1, '2025-12-11', '2025-12-22', 1, 0),
(107, 1091, '1091_UDF@#', 2, 'Wemeldingse biljart vrienden', '', '', '', '', 'Logo_1091.jpg', 'Arthur Hoogesteger', 'tuurennancy@hotmail.com', 0, 1, 45164, 1765905605, 1, '2025-12-16', '2025-12-21', 1, 0),
(108, 1092, '1092_BVY@#', 1, 'Turnlust', 'Draaikolk', 'Dollardlaan 202', '1784   ', 'Den Helder', 'Logo_1092.jpg', 'H.J.de Boer', 'hj.deboer@ziggo.nl', 1, 6, 83493, 1766332920, 1, '2025-12-21', '2025-12-21', 1, 0),
(109, 1093, '1093_HTM@#', 1, 'Biljartclub SOS', 'Dorpshuis It Himsterhus', 'de Cingel ', '8618 NK', 'Oosthem', 'Logo_1093.jpg', 'Sytze de Vries', 'sytze@devriesstukadoors.nl', 1, 6, 32068, 1766931577, 1, '2025-12-28', '2025-12-30', 0, 0),
(110, 1094, '1094_CRF@#', 2, 'Biljartfederatie Heuvelland', '', '', '', '', 'Logo_1094.jpg', 'Jan Bock', 'jan.bock@ziggo.nl', 0, 1, 12411, 1767008096, 1, '2025-12-29', '2026-01-11', 1, 0),
(111, 1095, '1095_WNS@#', 2, 'De Dregt', '', '', '', '', 'Logo_1095.jpg', 'Cees-Jan Swart', 'cj.swart@hotmail.com', 0, 2, 54499, 1767106851, 1, '2025-12-30', '2026-01-23', 1, 0),
(112, 1096, '1096_SVS@#', 1, 'DSK', 'Sportcafe De Koggenhal', 'Dwingel 4', '1648 jm', 'De Goorn', 'Logo_1096.jpg', 'Ton', 'ton@tonlaan.nl', 0, 3, 45322, 1767526804, 1, '2026-01-04', '2026-01-04', 1, 0),
(113, 1097, '1097_QQR@#', 2, 'MooijenAppel', '', '', '', '', 'Logo_1097.jpg', 'P. Mooij', 'nelmooij38@gmail.com', 0, 2, 29088, 1768059975, 1, '2026-01-10', '2026-01-10', 1, 0),
(114, 1098, '1098_SYZ@#', 2, 'BC Mekkelholt', '', '', '', '', 'Logo_1098.jpg', 'Mekkelholt', 'ijzervreter-02@proton.me', 0, 1, 85217, 1768468370, 1, '2026-01-15', '2026-01-15', 0, 0),
(115, 1099, '1099_GCW@#', 2, 'djorven lousberg', '', '', '', '', 'Logo_1099.jpg', 'djorven lousberg', 'djorvenlousberg17@gmail.com', 0, 1, 49079, 1768476073, 1, '2026-01-15', '2026-01-15', 1, 0),
(116, 1100, '1100_ZQD@#', 2, 'Bilartclub S.O.S', '', '', '', '', 'Logo_1100.jpg', 'S. de Vries', 'sybrinsky@gmail.com', 0, 6, 27184, 1768742063, 1, '2026-01-18', '2026-01-18', 1, 0),
(117, 1101, '1101_TWL@#', 1, 'BC Ons Genoegen 2012', 'De Brinkhof', 'De Brink 1', '9331AA', 'Norg', 'Logo_1101.jpg', 'Ben Schuurman', 'bnschrmn@gmail.com', 1, 6, 96105, 1768745462, 1, '2026-01-18', '2026-01-18', 1, 0),
(118, 1102, '1102_UBS@#', 2, 'Toernooi Heeg', '', '', '', '', 'Logo_1102.jpg', 'Corrie Hettinga', 'corriehettinga@live.nl', 0, 3, 86623, 1768830742, 1, '2026-01-19', '2026-01-19', 0, 0),
(119, 1103, '1103_WMC@#', 2, 'BC Het Zuiden', '', '', '', '', 'Logo_1103.jpg', 'Ger Borremans', 'ger.borremans@ziggo.nl', 0, 2, 71950, 1770110012, 1, '2026-02-03', '2026-02-03', 1, 0),
(120, 1104, '1104_KGZ@#', 1, 'De Kiepe', 'De Kiepe', 'Seringenlaan', '9663EG', 'Nieuwe Pekela', 'Logo_1104.jpg', 'Schrik', 'dekiepebiljartclub@gmail.com', 1, 3, 94284, 1771335812, 1, '2026-02-17', '2026-02-17', 1, 0),
(121, 1105, '1105_DAY@#', 2, 'kbc 2026', '', '', '', '', 'Logo_1105.jpg', 'fred', 'gid_221@hotmail.com', 0, 5, 61905, 1771769128, 1, '2026-02-22', '2026-02-22', 0, 0),
(122, 1106, '1106_XQN@#', 1, 'Test door Pierre', 'Onder Ons Beverwijk', 'Adrichemlaan 3', '1947KX', 'Beverwijk', 'Logo_1106.jpg', 'Pierre de Boer', 'Pierrelmdeboer+toernooiprof@gmail.com', 1, 4, 88801, 1772186922, 1, '2026-02-27', '2026-02-27', 1, 0);

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `tp_gebruikers`
--
ALTER TABLE `tp_gebruikers`
  ADD PRIMARY KEY (`gebruiker_id`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `tp_gebruikers`
--
ALTER TABLE `tp_gebruikers`
  MODIFY `gebruiker_id` int(40) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
