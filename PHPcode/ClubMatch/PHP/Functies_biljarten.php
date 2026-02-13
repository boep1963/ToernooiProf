<?php
//© Hans Eekels, versie 25-12-2025
//sorteer volgorde namen toegevoegd
//prepared statements gebruikt
//Functies bij programma Biljarten

//fun_wisseldatum($Datum)
//fun_string_tafels($Tafels, $Aantal_tafels)
//fun_tafel_nummers($Tafel_string, $Aantal_tafels, $Specifieke_tafel, $Keuze)
//fun_soorttafel($Org_nr, $Tafel_nr, $Path)
//fun_test_input($data)
//fun_bestaatorg($Code, $Path)
//fun_nieuwsbrief($Code, $Path)
//fun_aantaltafels($Code, $Path)
//fun_bestaatemail($Path)
//fun_orgnaam($Org_nr, $Path)
//fun_naamdiscipline($Dis_nr)
//fun_nummoydis($Comp_nr, $Org_nummer, $Path)
//fun_car($Moy, $Comp_nr, $Org_nummer, $Path);
//fun_periode($Comp_nr, $Org_nummer, $Path)
//fun_ledennaam($Sp_nr, $Org_nummer, $Path)
//fun_spelersnaam_competitie($Sp_nr, $Org_nummer, $Comp_nr, $Periode, $Variant, $Path)
//fun_temakencar($Sp_nr, $Org_nummer, $Comp_nr, $Periode, $Path)
//fun_invertcode($Code)
//fun_competitienaam($Org_nummer, $Comp_nr, $Variant, $Path)
//fun_maxbeurten($Org_nummer, $Comp_nr, $Path)
//fun_mincar($Org_nummer, $Comp_nr, $Path)
//fun_moyform($Org_nr, $Comp_nr, $Path)
//fun_punten($Org_nr, $Comp_nr, $Periode, $Sp_1, $Car_1_gem, $Sp_2, $Car_2_gem, $Brt, $Path)
//fun_puntenmax($Org_nr, $Comp_nr, $Path)
//fun_algespeeld($Org_nummer, $Comp_nr, $Periode, $Sp_nr1, $Sp_nr2, $Path)
//fun_maakcode($Periode_keuze, $Nr_1, $Nr_2)
//fun_bestaatpartij($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path)
//fun_geeftafelstring($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path)
//fun_partgespeeld($Org_nr, $Comp_nr, $Periode_keuze, $Nr_speler, $Path)
//fun_vastaantalbeurten($Org_nr, $Comp_nr, $Path)

function fun_wisseldatum($Datum)
{
	//wisselt 2025-12-05 naar 05-12-2025
	$J = substr($Datum, 0, 4);
	$M = substr($Datum, 5, 2);
	$D = substr($Datum, 8, 2);
	
	$Dat_nieuw = $D . "-" . $M . "-" .$J;
	
	return $Dat_nieuw;
}

function fun_string_tafels($Tafels, $Aantal_tafels)
{
	/*
	Deze functies maakt de "tafel_string" met 1 en 0 als gekozen in maak partij
	$Tafels is een array in de vorm van:
	array(8) { 
		[1]=> array(2) { ["tafel_nr"]=> int(1) ["keuze"]=> int(1) } 
		[2]=> array(2) { ["tafel_nr"]=> int(2) ["keuze"]=> int(1) } 
		[3]=> array(2) { ["tafel_nr"]=> int(3) ["keuze"]=> int(0) } 
		[4]=> array(2) { ["tafel_nr"]=> int(4) ["keuze"]=> int(0) } 
		[5]=> array(2) { ["tafel_nr"]=> int(5) ["keuze"]=> int(0) } 
		[6]=> array(2) { ["tafel_nr"]=> int(6) ["keuze"]=> int(1) } 
		[7]=> array(2) { ["tafel_nr"]=> int(7) ["keuze"]=> int(0) } 
		[8]=> array(2) { ["tafel_nr"]=> int(8) ["keuze"]=> int(0) } }
	met $Aantal_tafels (hier 8) elementen
	Als de tafel is gekozen, is keuze 1, anders 0
	Dit moet een string worden van (in dit geval) 8 enen en nullen in de vorm van 11000100 en wordt uitgebreid met 0 aan de achterkant tot 12 cijfers
	*/
	$Bin_string = "";
	for ($a = 1; $a < $Aantal_tafels + 1; $a++) {
		$getal = $Tafels[$a]['keuze'];
		$Bin_string = $Bin_string . $getal;
	}
	//nu uitbreiden tot 12 met 0 er na
	if ($Aantal_tafels < 12) {
		$verschil = 12 - $Aantal_tafels;
		for ($a = 1; $a < $verschil + 1; $a++) {
			$Bin_string = $Bin_string . "0";
		}
	}

	return $Bin_string;
}

function fun_tafel_nummers($Tafel_string, $Aantal_tafels, $Specifieke_tafel, $Keuze)
{
	//$Tafel_string is in de vorm van "100001100000"
	//Als $Keuze == 1: 	Dan willen we van alle tafels weten of ze al dan niet aangevinkt zijn bij de aanmaak van een partij
	//					retourneer een array met alle tafels en 1 of 0 op de plek van 1 of 0 in de string
	//					NB: $Specifieke_tafel is dan 0 en wordt niet gebruikt
	//Als $Keuze == 2: 	Dan selecteren we voor tafel x en dan willen we weten of het tafelnummer in de string op positie x een 1 is
	//					retourneert 1 of 0
	//					NB: $Specifieke_tafel is de gevraagde tafel

	$Tafels = array();

	if ($Keuze == 1) {
		for ($a = 1; $a < $Aantal_tafels + 1; $a++) {
			$Val = substr($Tafel_string, $a - 1, 1);
			$Tafels[$a] = intval($Val);
		}

		return $Tafels;
	} else {
		$Val = substr($Tafel_string, $Specifieke_tafel - 1, 1);
		return intval($Val);
	}
}

//functie die soort tafel muis=1 of tablet = 2 doorgeeft
function fun_soorttafel($Org_nr, $Tafel_nr, $Path)
{
	include($Path);
	// Initialiseer met de gewenste DEFAULT waarde: 1 (Muis)
	$ResultaatSoort = 1; // Nieuwe variabele om verwarring te voorkomen
    $dbh = null; // Voor gebruik in finally

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception("Connectie fout: " . mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT soort FROM bj_bediening WHERE org_nummer = ? AND tafel_nr = ?";
		
		$stmt = mysqli_prepare($dbh, $sql);
		if (!$stmt) {
			throw new Exception("Prepare fout: " . mysqli_error($dbh));
		}

		mysqli_stmt_bind_param($stmt, "ii", $Org_nr, $Tafel_nr);
		
		mysqli_stmt_execute($stmt);

		// De variabele waaraan we binden. Startwaarde is nu irrelevant.
		$SoortDB = null; 
		mysqli_stmt_bind_result($stmt, $SoortDB);
		
		// Fetch de EERSTE (en verwachte enige) rij
		$fetch_result = mysqli_stmt_fetch($stmt);

		// Als fetch_result TRUE is, is er een waarde gevonden en is $SoortDB gevuld.
		if ($fetch_result === true) {
			$ResultaatSoort = $SoortDB; // Overschrijf de default met de gevonden waarde
		} 
        // Anders (fetch_result is NULL/FALSE), blijft $ResultaatSoort op 1 staan.

		mysqli_stmt_close($stmt);
		
	} catch (Exception $e) {
		error_log("Databasefout in fun_soorttafel: " . $e->getMessage());
        // Bij een fout: keer terug met de default waarde 1
		$ResultaatSoort = 1; 
	} finally {
        // Sluit de connectie ALTIJD als deze succesvol is geopend
        if ($dbh) {
            mysqli_close($dbh);
        }
    }
    
    // Retourneer de gevonden waarde OF de default 1
    return $ResultaatSoort;
}

//functie escape data
function fun_test_input($data)
{
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}

//functie checkt of Organisatie bestaat
//aangepast met prepared statement
function fun_bestaatorg($Code, $Path)
{
	include($Path);
	$Return = FALSE; // Initialiseer return waarde
	$dbh = null;     // Initialiseer connection handler

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			// Fout bij de connectie is de eerste en meest kritieke fout
			throw new Exception("Connectie fout: " . mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		// Efficiëntere query: SELECT 1
		$sql = "SELECT 1 FROM bj_organisaties WHERE BINARY org_code = ?";

		$stmt = mysqli_prepare($dbh, $sql);
		if (!$stmt) {
			throw new Exception("Prepare fout: " . mysqli_error($dbh));
		}
		
		mysqli_stmt_bind_param($stmt, "s", $Code);
		
		mysqli_stmt_execute($stmt);
		
		// Cruciaal voor mysqli_stmt_num_rows()
		mysqli_stmt_store_result($stmt);
		
		$aantal_records = mysqli_stmt_num_rows($stmt);
		
		// Vereenvoudigde return logica
		$Return = ($aantal_records > 0);

		mysqli_stmt_close($stmt);
		
	} catch (Exception $e) {
		// Log de fout en zorg dat Return FALSE is
        error_log("Database fout in fun_bestaatorg: " . $e->getMessage()); 
		$Return = FALSE;
	} finally {
        // Sluit de connectie ALTIJD als deze succesvol is geopend
        if ($dbh) {
            mysqli_close($dbh);
        }
    }

	return $Return;
}

/*
//deze functie werkt
function fun_bestaatorg($Code, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_organisaties WHERE BINARY org_code = '$Code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			$Return = TRUE;
		} else {
			$Return = FALSE;
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Return;
}
*/

//fun nieuwsbrief ja of nee ontvangen
function fun_nieuwsbrief($Code, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_organisaties WHERE org_code = '$Code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nieuwsbrief = $resultaat['nieuwsbrief'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Nieuwsbrief;
}

//fun aantal tafels
function fun_aantaltafels($Code, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_organisaties WHERE org_code = '$Code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Aantal_tafels = $resultaat['aantal_tafels'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Aantal_tafels;
}

//functie checkt meervoudige aanmaak account
function fun_bestaatemail($email, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_organisaties WHERE org_wl_email = '$email' AND code_ontvangen = '1'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			$Return = TRUE;
		} else {
			$Return = FALSE;
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Return;
}

//functie levert naam organisatie
function fun_orgnaam($Nr_org, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT org_naam FROM bj_organisaties WHERE org_nummer = '$Nr_org'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Naam = $resultaat['org_naam'];
			}
		} else {
			$Naam = "Onbekend !";
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Naam;
}

function fun_naamdiscipline($Dis_nr)
{
	switch ($Dis_nr) {
		case 1:
			$Discipline = "Libre";
			break;

		case 2:
			$Discipline = "Bandstoten";
			break;

		case 3:
			$Discipline = "Driebanden klein";
			break;

		case 4:
			$Discipline = "Driebanden groot";
			break;

		case 5:
			$Discipline = "Kader";
			break;

		default:
			$Discipline = "Onbekend";
	}

	return $Discipline;
}

function fun_nummoydis($Comp_nr, $Org_nummer, $Path)
{
	//functie levert een array op met nummer discipline en kolomnaam moyenne in bj_spelers_algemeen
	$Moy_dis = array();

	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT discipline FROM bj_competities WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Discipline = $resultaat['discipline'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	switch ($Discipline) {
		case 1:
			$Kolom_naam = "spa_moy_lib";
			break;
		case 2:
			$Kolom_naam = "spa_moy_band";
			break;
		case 3:
			$Kolom_naam = "spa_moy_3bkl";
			break;
		case 4:
			$Kolom_naam = "spa_moy_3bgr";
			break;
		case 5:
			$Kolom_naam = "spa_moy_kad";
			break;
	}

	//array vullen
	$Moy_dis['dis_nummer'] = $Discipline;
	$Moy_dis['kolom_naam'] = $Kolom_naam;

	return $Moy_dis;
}

function fun_car($Moy, $Comp_nr, $Org_nummer, $Path)
{
	//functie bepaalt aantal car speler
	//let op: min car competitie
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_competities WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Formule = $resultaat['moy_form'];
			$Min_car = $resultaat['min_car'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	switch ($Formule) {
		case 1:
			$Car = round($Moy * 15);
			break;
		case 2:
			$Car = round($Moy * 20);
			break;
		case 3:
			$Car = round($Moy * 25);
			break;
		case 4:
			$Car = round($Moy * 30);
			break;
		case 5:
			$Car = round($Moy * 40);
			break;
		case 6:
			$Car = round($Moy * 50);
			break;
		case 7:
			$Car = round($Moy * 60);
			break;
		default:
			$Car = round($Moy * 30);
			break;
	}

	if ($Car < $Min_car) {
		$Car = $Min_car;
	}

	return $Car;
}

function fun_periode($Comp_nr, $Org_nummer, $Path)
{
	include($Path);

	//initialiseren
	$Periode = 1;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT periode FROM bj_competities WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Periode = $resultaat['periode'];
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Periode;
}

//Functie retourneert naam en car van spelers die aan een competitie zijn gekoppeld; $Variant = 1 dan alleen naam, 2=ook aantal car
function fun_spelersnaam_competitie($Sp_nr, $Org_nummer, $Comp_nr, $Periode, $Variant, $Path)
{
	include($Path);

	//initialiseren
	$Nm = "Onbekend";

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//bepaal eerst volgorde sorteren
		$sql = "SELECT sorteren FROM bj_competities WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Sorteren = $resultaat['sorteren'];
		}

		//zoek speler
		$sql = "SELECT * FROM bj_spelers_comp WHERE spc_nummer = '$Sp_nr' AND spc_org = '$Org_nummer' AND spc_competitie = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				switch ($Periode) {
					case 1:
						$Car = $resultaat['spc_car_1'];
						break;
					case 2:
						$Car = $resultaat['spc_car_2'];
						break;
					case 3:
						$Car = $resultaat['spc_car_3'];
						break;
					case 4:
						$Car = $resultaat['spc_car_4'];
						break;
					case 5:
						$Car = $resultaat['spc_car_5'];
						break;
				}
			}
		}

		//nu naam
		$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_nummer = '$Sp_nr' AND spa_org = '$Org_nummer'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Vn = $resultaat['spa_vnaam'];
				$Tv = $resultaat['spa_tv'];
				$An = $resultaat['spa_anaam'];
			}
			if (strlen($Tv) == 0) {
				if ($Sorteren == 1) {
					$Nm = $Vn . " " . $An;
				} else {
					$Nm = $An . ", " . $Vn;
				}
			} else {
				if ($Sorteren == 1) {
					$Nm = $Vn . " " . $Tv . " " . $An;
				} else {
					$Nm = $An . ", " . $Vn . " " . $Tv;
				}
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	if ($Variant == 1) {
		$Spelers_naam = $Nm;
	} else {
		$Spelers_naam = $Nm . " (" . $Car . ")";
	}

	return $Spelers_naam;
}

//functie bepaalt naam lid obv lidnummer en org_nr
function fun_ledennaam($Sp_nr, $Org_nummer, $Path)
{
	include($Path);
	$Nm = "Onbekend";

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_nummer = '$Sp_nr' AND spa_org = '$Org_nummer'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Vn = $resultaat['spa_vnaam'];
				$Tv = $resultaat['spa_tv'];
				$An = $resultaat['spa_anaam'];
			}
			if (strlen($Tv) == 0) {
				$Nm = $Vn . " " . $An;
			} else {
				$Nm = $Vn . " " . $Tv . " " . $An;
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Nm;
}

//functie bepaalt te maken car obv spelernummer, org- en compnr en periode
function fun_temakencar($Sp_nr, $Org_nummer, $Comp_nr, $Periode, $Path)
{
	include($Path);

	//initialiseren
	$Car = "0";

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_spelers_comp WHERE spc_nummer = '$Sp_nr' AND spc_org = '$Org_nummer' AND spc_competitie = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				switch ($Periode) {
					case 1:
						$Car = $resultaat['spc_car_1'];
						break;
					case 2:
						$Car = $resultaat['spc_car_2'];
						break;
					case 3:
						$Car = $resultaat['spc_car_3'];
						break;
					case 4:
						$Car = $resultaat['spc_car_4'];
						break;
					case 5:
						$Car = $resultaat['spc_car_5'];
						break;
				}
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Car;
}
//functie draait spelers om in Uitslag_code
//Dus 1_012_007 => 1_007_012
function fun_invertcode($Code)
{
	$P = substr($Code, 0, 1);		//1
	$A = substr($Code, 2, 3);		//007
	$B = substr($Code, 6, 3);		//012
	$Code_reverse = $P . "_" . $B . "_" . $A;

	return $Code_reverse;
}

//functie retourneert competitie naam obv competitienummer
//$variant 1=naam, 2 = datum
function fun_competitienaam($Org_nummer, $Comp_nr, $Variant, $Path)
{
	include($Path);

	//initialiseren
	$Competitie_naam = "Onbekend";

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//zoek speler
		$sql = "SELECT * FROM bj_competities WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Dis_nr = $resultaat['discipline'];
				$Discipline_naam = fun_naamdiscipline($Dis_nr);
				$Nm = $resultaat['comp_naam'];
				$Dt = $resultaat['comp_datum'];
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	if ($Variant == 1) {
		$Competitie_naam = $Nm . " (" . $Discipline_naam . ")";
	}
	if ($Variant == 2) {
		$Competitie_naam = $Dt;
	}

	return $Competitie_naam;
}

//functie haalt max aantal beurten op
function fun_maxbeurten($Org_nummer, $Comp_nr, $Path)
{
	include($Path);

	//initialiseren
	$Max_beurten = 0;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT max_beurten FROM bj_competities WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Max_beurten = $resultaat['max_beurten'];
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Max_beurten;
}

//functie haalt min aantal car op
function fun_mincar($Org_nummer, $Comp_nr, $Path)
{
	include($Path);

	//initialiseren
	$Min_car = 3;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT min_car FROM bj_competities WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Min_car = $resultaat['min_car'];
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Min_car;
}

function fun_moyform($Org_nr, $Comp_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT moy_form FROM bj_competities WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Moy_form = $resultaat['moy_form'];
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Moy_form;
}


//punten en wrv bepalen obv puntensysteem
function fun_punten($Org_nr, $Comp_nr, $Periode, $Sp_1, $Car_1_gem, $Sp_2, $Car_2_gem, $Brt, $Path)
{
	//resultaat is een array() met:
	//$Punten[1] = punten speler 1, $Punten[2] = punten speler 2, $Punten[3] = wrv speler 1, $Punten[4] = wrv speler 2
	//wrv = 1 =>speler heeft gewonnen of remise
	//wrv = 0 =>speler heeft verloren

	include($Path);
	$Punten = array();

	//haal punten-sys op en tevens al of niet vast aantal beurten
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_competities WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Punten_sys = $resultaat['punten_sys'];
			$Vast_aantal_beurten = $resultaat['vast_beurten'];
		}

		if ($Punten_sys < 20000) {
			if (substr($Punten_sys, 1, 1) == 1) {
				$bExtra = TRUE;
				$Extra_W = 1;
				$Extra_R = 0;
				$Extra_V = 0;
				if (substr($Punten_sys, 3, 1) == 1) {
					$Extra_R = 1;
				}
				if (substr($Punten_sys, 4, 1) == 1) {
					$Extra_V = 1;
				}
			} else {
				$bExtra = FALSE;
			}
		}

		//nodig: in periode, aantal te maken car, moyenne van sp1 en 2
		$sql = "SELECT * FROM bj_spelers_comp WHERE spc_nummer = '$Sp_1' AND spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			switch ($Periode) {
				case 1:
					$Car_1_tem = $resultaat['spc_car_1'];
					$Moy_1_tem = $resultaat['spc_moyenne_1'];
					break;
				case 2:
					$Car_1_tem = $resultaat['spc_car_2'];
					$Moy_1_tem = $resultaat['spc_moyenne_2'];
					break;
				case 3:
					$Car_1_tem = $resultaat['spc_car_3'];
					$Moy_1_tem = $resultaat['spc_moyenne_3'];
					break;
				case 4:
					$Car_1_tem = $resultaat['spc_car_4'];
					$Moy_1_tem = $resultaat['spc_moyenne_4'];
					break;
				case 5:
					$Car_1_tem = $resultaat['spc_car_5'];
					$Moy_1_tem = $resultaat['spc_moyenne_5'];
					break;
			}
		}

		$sql = "SELECT * FROM bj_spelers_comp WHERE spc_nummer = '$Sp_2' AND spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			switch ($Periode) {
				case 1:
					$Car_2_tem = $resultaat['spc_car_1'];
					$Moy_2_tem = $resultaat['spc_moyenne_1'];
					break;
				case 2:
					$Car_2_tem = $resultaat['spc_car_2'];
					$Moy_2_tem = $resultaat['spc_moyenne_2'];
					break;
				case 3:
					$Car_2_tem = $resultaat['spc_car_3'];
					$Moy_2_tem = $resultaat['spc_moyenne_3'];
					break;
				case 4:
					$Car_2_tem = $resultaat['spc_car_4'];
					$Moy_2_tem = $resultaat['spc_moyenne_4'];
					break;
				case 5:
					$Car_2_tem = $resultaat['spc_car_5'];
					$Moy_2_tem = $resultaat['spc_moyenne_5'];
					break;
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	if ($Punten_sys < 20000) {
		if ($Brt > 0) {
			$Moy_1_gem = number_format($Car_1_gem / $Brt, 3);
			if ($Moy_1_gem > $Moy_1_tem) {
				$bSp_1_bovenmoy = TRUE;
			} else {
				$bSp_1_bovenmoy = FALSE;
			}

			$Moy_2_gem = number_format($Car_2_gem / $Brt, 3);
			if ($Moy_2_gem > $Moy_2_tem) {
				$bSp_2_bovenmoy = TRUE;
			} else {
				$bSp_2_bovenmoy = FALSE;
			}
		} else {
			$Moy_1_gem = 0;
			$bSp_1_bovenmoy = FALSE;
			$Moy_2_gem = 0;
			$bSp_2_bovenmoy = FALSE;
		}

		//eerst geen vast aantal beurten
		if ($Vast_aantal_beurten == 0) {
			if ($Car_1_gem == $Car_1_tem && $Car_2_gem < $Car_2_tem) {
				//Winst sp1, Verlies sp2
				$Punten[1] = 2;
				if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_W == 1) {
					$Punten[1] = 3;
				}
				$Punten[2] = 0;
				if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_V == 1) {
					$Punten[2] = 1;
				}
				$Punten[3] = 1;		//wrv 1 = 1
				$Punten[4] = 0;		//wrv 2 = 0
			}
			if ($Car_1_gem < $Car_1_tem && $Car_2_gem == $Car_2_tem) {
				//Winst sp2, Verlies sp1
				$Punten[2] = 2;
				if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_W == 1) {
					$Punten[2] = 3;
				}
				$Punten[1] = 0;
				if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_V == 1) {
					$Punten[1] = 1;
				}
				$Punten[3] = 0;		//wrv 1 = 0
				$Punten[4] = 1;		//wrv 2 = 1
			}
			if ($Car_1_gem == $Car_1_tem && $Car_2_gem == $Car_2_tem) {
				//Remise
				$Punten[1] = 1;
				if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_R == 1) {
					$Punten[1] = 2;
				}
				$Punten[2] = 1;
				if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_R == 1) {
					$Punten[2] = 2;
				}
				$Punten[3] = 1;		//wrv 1 = 1
				$Punten[4] = 1;		//wrv 2 = 1
			}

			if ($Car_1_gem < $Car_1_tem && $Car_2_gem < $Car_2_tem) {
				//partij niet uit, dus op basis van % car
				$Car_1_per = number_format($Car_1_gem / $Car_1_tem * 100, 3);
				$Car_2_per = number_format($Car_2_gem / $Car_2_tem * 100, 3);

				if ($Car_1_per > $Car_2_per) {
					$Punten[1] = 2;
					if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_W == 1) {
						$Punten[1] = 3;
					}
					$Punten[2] = 0;
					if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_V == 1) {
						$Punten[2] = 1;
					}
					$Punten[3] = 1;		//wrv 1 = 1
					$Punten[4] = 0;		//wrv 2 = 0
				}
				if ($Car_1_per < $Car_2_per) {
					$Punten[2] = 2;
					if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_W == 1) {
						$Punten[2] = 3;
					}
					$Punten[1] = 0;
					if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_V == 1) {
						$Punten[1] = 1;
					}
					$Punten[3] = 0;		//wrv 1 = 0
					$Punten[4] = 1;		//wrv 2 = 1
				}
				if ($Car_1_per == $Car_2_per) {
					$Punten[1] = 1;
					if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_R == 1) {
						$Punten[1] = 2;
					}
					$Punten[2] = 1;
					if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_R == 1) {
						$Punten[2] = 2;
					}
					$Punten[3] = 1;		//wrv 1 = 1
					$Punten[4] = 1;		//wrv 2 = 1
				}
			}
		} else {
			//Vast aantal beurten; berekening op basis van % car
			$Car_1_per = number_format($Car_1_gem / $Car_1_tem * 100, 3);	//kan > 100% zijn
			$Car_2_per = number_format($Car_2_gem / $Car_2_tem * 100, 3);	//kan > 100% zijn

			if ($Car_1_per > $Car_2_per) {
				$Punten[1] = 2;
				if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_W == 1) {
					$Punten[1] = 3;
				}
				$Punten[2] = 0;
				if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_V == 1) {
					$Punten[2] = 1;
				}
				$Punten[3] = 1;		//wrv 1 = 1
				$Punten[4] = 0;		//wrv 2 = 0
			}
			if ($Car_1_per < $Car_2_per) {
				$Punten[2] = 2;
				if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_W == 1) {
					$Punten[2] = 3;
				}
				$Punten[1] = 0;
				if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_V == 1) {
					$Punten[1] = 1;
				}
				$Punten[3] = 0;		//wrv 1 = 0
				$Punten[4] = 1;		//wrv 2 = 1
			}
			if ($Car_1_per == $Car_2_per) {
				$Punten[1] = 1;
				if ($bExtra == TRUE && $bSp_1_bovenmoy == TRUE && $Extra_R == 1) {
					$Punten[1] = 2;
				}
				$Punten[2] = 1;
				if ($bExtra == TRUE && $bSp_2_bovenmoy == TRUE && $Extra_R == 1) {
					$Punten[2] = 2;
				}
				$Punten[3] = 1;		//wrv 1 = 1
				$Punten[4] = 1;		//wrv 2 = 1
			}
		}
	}

	if ($Punten_sys < 30000 && $Punten_sys > 19999) {
		//10 punten
		$Punten[1] = floor($Car_1_gem / $Car_1_tem * 10);
		$Punten[2] = floor($Car_2_gem / $Car_2_tem * 10);
		if ($Punten[1] > $Punten[2]) {
			$Punten[3] = 1;
			$Punten[4] = 0;
		}
		if ($Punten[1] < $Punten[2]) {
			$Punten[3] = 0;
			$Punten[4] = 1;
		}
		if ($Punten[1] == $Punten[2]) {
			$Punten[3] = 1;
			$Punten[4] = 1;
		}
	}

	if ($Punten_sys > 29999) {
		//Belgisch
		$Punten[1] = floor($Car_1_gem / $Car_1_tem * 10);
		$Punten[2] = floor($Car_2_gem / $Car_2_tem * 10);

		if ($Punten[1] == 10 && $Punten[2] < 10) {
			$Punten[1] = 12;
		}
		if ($Punten[1] < 10 && $Punten[2] == 10) {
			$Punten[2] = 12;
		}
		if ($Punten[1] == 10 && $Punten[2] == 10) {
			$Punten[1] = 11;
			$Punten[2] = 11;
		}

		if ($Punten[1] > $Punten[2]) {
			$Punten[3] = 1;
			$Punten[4] = 0;
		}
		if ($Punten[1] < $Punten[2]) {
			$Punten[3] = 0;
			$Punten[4] = 1;
		}
		if ($Punten[1] == $Punten[2]) {
			$Punten[3] = 1;
			$Punten[4] = 1;
		}
	}

	return $Punten;
}

//functie bepaalt punten max in punten_sys
function fun_puntenmax($Org_nr, $Comp_nr, $Path)
{
	include($Path);

	//haal punten-sys op
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_competities WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Punten_sys = $resultaat['punten_sys'];
			$Vast_aantal_beurten = $resultaat['vast_beurten'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}
	//bepaal max aantal punten
	$Punten_switch = substr($Punten_sys, 0, 1);

	switch ($Punten_switch) {
		case 1:
			if ($Vast_aantal_beurten == 0) {
				$Punten_max = 2;
			} else {
				$Punten_max = 3;
			}
			break;
		case 2:
			$Punten_max = 10;
			break;
		case 3:
			$Punten_max = 12;
			break;
		default:
			$Punten_max = 10;
			break;
	}

	return $Punten_max;
}

//bepaal of spelers in opgegeven periode al tegen elkaar hebben gespeeld
function fun_algespeeld($Org_nummer, $Comp_nr, $Periode, $Sp_nr1, $Sp_nr2, $Path)
{
	include($Path);
	//initieren
	$Gespeeld = 0;	//niet tegen elkaar gespeeld

	//haal uitslagen
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslagen 
		WHERE org_nummer = '$Org_nummer' AND comp_nr = '$Comp_nr' AND periode = '$Periode' AND gespeeld = '1'
		AND ((sp_1_nr = '$Sp_nr1' AND sp_2_nr = '$Sp_nr2') OR (sp_1_nr = '$Sp_nr2' AND sp_2_nr = '$Sp_nr1'))";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			$Gespeeld = 1;
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Gespeeld;
}

//uitslagcode bepalen
function fun_maakcode($Periode_keuze, $Nr_1, $Nr_2)
{

	if ($Nr_1 < 10) {
		$A = "00" . $Nr_1;
	} elseif ($Nr_1 < 100) {
		$A = "0" . $Nr_1;
	} else {
		$A = $Nr_1;
	}

	if ($Nr_2 < 10) {
		$B = "00" . $Nr_2;
	} elseif ($Nr_2 < 100) {
		$B = "0" . $Nr_2;
	} else {
		$B = $Nr_2;
	}

	$Uitslag_code = $Periode_keuze . "_" . $A . "_" . $B;

	return $Uitslag_code;
}

//functie test op er een partij is aangemaakt met uitslag_code 2_011_008
function fun_bestaatpartij($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path)
{
	include($Path);
	$bBestaat = FALSE;

	$Uitslag_code_1 = fun_invertcode($Uitslag_code);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_partijen
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_1')";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			$bBestaat = TRUE;
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $bBestaat;
}

//functie haalt tafelstring op uit bj_partijen met uitslag_code 2_011_008
function fun_geeftafelstring($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path)
{
	include($Path);
	//initialiseren
	$Taf_string = "111111111111";

	$Uitslag_code_1 = fun_invertcode($Uitslag_code);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT tafel FROM bj_partijen
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_1')";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Taf_string = $resultaat['tafel'];
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Taf_string;
}

//functie bepaalt aantal gespeelde partijen van een speler in een gegeven periode; gebruikt in planning partijen maken
function fun_partgespeeld($Org_nr, $Comp_nr, $Periode_keuze, $Nr_speler, $Path)
{
	include($Path);
	$bBestaat = FALSE;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslagen
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND (sp_1_nr = '$Nr_speler' OR sp_2_nr = '$Nr_speler')";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$Aantal_partijen = mysqli_num_rows($res);

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Aantal_partijen;
}

//functie bepaalt vastaantalbeurten
function fun_vastaantalbeurten($Org_nr, $Comp_nr, $Path)
{
	include($Path);
	//initialiseren
	$Aantal_beurten = 20;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT vast_beurten FROM bj_competities
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Aantal_beurten = $resultaat['vast_beurten'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Aantal_beurten;
}
