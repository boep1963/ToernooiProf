<?php
//© Hans Eekels, versie 14-12-2025
//Functies bij programma ToernooiProf Online

//fun_carsys($Gebruiker_nr, $Toernooi_nr, $Path)
//fun_soorttafel($Gebruiker_nr, $Tafel_nr, $Path)
//fun_nummerdis($Gebruiker_nr, $Toernooi_nr, $Path)
//fun_naamdiscipline($Dis_nr)
//fun_nieuwsbrief($Code, $Path)
//fun_openbaar($Code, $Path)
//fun_aantaltafels($Code, $Path)
//fun_testgebruiker($Code)
//fun_test_input($data)
//fun_bestaatemail($email, $Path)
//fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path)
//fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Path)
//fun_spelersnummer($Gebruiker_nr, $Toernooi_nr, $Poule_nr, $Ronde_nr, $Volg_nr, $Path)
//fun_aantalcar($Gebruiker_nr, $Toernooi_nr, $Moy, $Path)
//fun_carspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde_nr, $Path)
//fun_moyspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde_nr, $Path)
//fun_maxbeurten($Gebruiker_nr, Toernooi_nr, $Path)
//fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path)
//fun_aantalpoules($Gebruiker_nr, $Toernooi_nr, $Ronde_nr, $Path)
//fun_aantalspelersinronde($Gebruiker_nr, $Toernooi_nr, $Ronde_nr, $Path)
//fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Ronde_nr, $Poule_nr, $Path)
//fun_punten($Gebruiker_nr, $Toernooi_nr, $Car_1_tem, $Car_1_gem, $Car_2_tem, $Car_2_gem, $Path)
//fun_puntensysteem($Gebruiker_nr, $Toernooi_nr, $Path)
//fun_stand($Gebruiker_nr, $Toernooi_nr, $Ronde, $Poule, $Path)

//fun_even($NrTeams)
//fun_oneven($NrTeams)

//["DOCUMENT_ROOT"]=> /home/deb129009n4/domains/specialsoftware.nl/public_html
//$Path = $_SERVER['DOCUMENT_ROOT'].'/../data/connectie_toernooiprof.php';
//$Path = '/home/deb129009n4/domains/specialsoftware.nl/data/connectie_toernooiprof.php';

//functie bepaalt car_sys. 1=moy_form, 2= vriie invoer
function fun_carsys($Gebruiker_nr, $Toernooi_nr, $Path)
{
	include($Path);
	//initialiseren
	$Car_sys = 1;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT t_car_sys FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Car_sys = $resultaat['t_car_sys'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Car_sys;
}

//functie die soort tafel muis=1 of tablet = 2 doorgeeft
function fun_soorttafel($Gebruiker_nr, $Tafel_nr, $Path)
{
	include($Path);
	//initialiseren
	$Soort = 1;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_bediening WHERE gebruiker_nr = '$Gebruiker_nr' AND taf_nr = '$Tafel_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Soort = $resultaat['soort'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Soort;
}

//functie die nummer discipline doorgeeft voor een en nog 5 of 3
function fun_nummerdis($Gebruiker_nr, $Toernooi_nr, $Path)
{
	include($Path);
	//initialiseren
	$Nr_dis = 1;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT discipline FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nr_dis = $resultaat['discipline'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Nr_dis;
}

//fun_naamdiscipline
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

//fun nieuwsbrief ja of nee ontvangen
function fun_nieuwsbrief($Code, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_gebruikers WHERE gebruiker_code = '$Code'";

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

//standen openbaar of niet; ook mail wl openbaar of niet
function fun_openbaar($Code, $Path)
{
	include($Path);
	$Openbaar = array();

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_gebruikers WHERE gebruiker_code = '$Code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Openbaar[1] = $resultaat['openbaar'];		//1 = ja, 2 = nee
			$Openbaar[2] = $resultaat['toon_email'];	//1=ja, 0=nee
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Openbaar;
}

//fun aantal tafels
function fun_aantaltafels($Code, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_gebruikers WHERE gebruiker_code = '$Code'";

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

//test gebruiker
function fun_testgebruiker($Code, $Path)
{
	include($Path);

	$Gebruiker_nr = substr($Code, 0, 4);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_gebruikers WHERE gebruiker_nr = '$Gebruiker_nr' AND BINARY gebruiker_code = '$Code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) == 0) {
			$Naam = "9999";
		} else {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Naam = $resultaat['gebruiker_naam'];
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Naam;
}

function fun_test_input($data)
{
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}

//functie checkt meervoudige aanmaak account
function fun_bestaatemail($email, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_gebruikers WHERE tp_wl_email = '$email' AND code_ontvangen = '1'";

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

function fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nm = $resultaat['t_naam'];
			$Dt = $resultaat['t_datum'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	$Naam = $Nm . " (" . $Dt . ")";
	return $Naam;
}

//spelersnaam obv sp_nummer
function fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_spelers WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Sp_nummer'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Naam = $resultaat['sp_naam'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Naam;
}

//spelersnummer obv volgnummer, ronde en poule
function fun_spelersnummer($Gebruiker_nr, $Toernooi_nr, $Poule_nr, $Ronde_nr, $Volg_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT sp_nummer FROM tp_poules 
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_volgnr = '$Volg_nr' AND poule_nr = '$Poule_nr' AND ronde_nr = '$Ronde_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Sp_nummer = $resultaat['sp_nummer'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Sp_nummer;
}

//car min
function fun_carmin($Gebruiker_nr, $Toernooi_nr, $Path)
{
	include($Path);
	//initialiseren
	$Car_min = 5;
	
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT t_min_car FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Car_min = $resultaat['t_min_car'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}
	
	return $Car_min;
}

//alleen voor aantal car bij invoer spelers als car_sys == 1
function fun_aantalcar($Gebruiker_nr, $Toernooi_nr, $Moy, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Moy_form = $resultaat['t_moy_form'];
			$Car_min = $resultaat['t_min_car'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	switch ($Moy_form) {
		case 1:
			$Car = round($Moy * 20);
			break;
		case 2:
			$Car = round($Moy * 25);
			break;
		case 3:
			$Car = round($Moy * 30);
			break;
		case 4:
			$Car = round($Moy * 40);
			break;
		case 5:
			$Car = round($Moy * 50);
			break;
		case 6:
			$Car = round($Moy * 60);
			break;
		default:
			$Car = round($Moy * 25);
			break;
	}

	if ($Car < $Car_min) {
		$Car = $Car_min;
	}

	return $Car;
}

//aantal car_tem speler, afhankelijk van ronde
function fun_carspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT sp_car FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Sp_nummer' AND ronde_nr = '$Ronde_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Car = $resultaat['sp_car'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Car;
}

//moy speler, kan per ronde anders zijn, dus opzoeken in tp_poules
function fun_moyspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT sp_moy FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Sp_nummer' AND ronde_nr = '$Ronde_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Moy = $resultaat['sp_moy'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Moy;
}

//bepaalt huidige toernooi-ronde
function fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT t_ronde FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Huidige_ronde = $resultaat['t_ronde'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Huidige_ronde;
}

//aantal poules in ronde
function fun_aantalpoules($Gebruiker_nr, $Toernooi_nr, $Ronde_nr, $Path)
{
	include($Path);

	//initieren
	$Aantal_poules = 0;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND ronde_nr = '$Ronde_nr' ORDER BY poule_nr DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Aantal_poules = $resultaat['poule_nr'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Aantal_poules;
}

//aantal spelers in ronde
function fun_aantalspelersinronde($Gebruiker_nr, $Toernooi_nr, $Ronde_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND ronde_nr = '$Ronde_nr' ";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$Aantal_spelers = mysqli_num_rows($res);

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Aantal_spelers;
}

//bepaal aantal spelers in poule
function fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Ronde_nr, $Poule_nr, $Path)
{
	include($Path);

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND poule_nr = '$Poule_nr' AND ronde_nr = '$Ronde_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$Aantal_pouleleden = mysqli_num_rows($res);

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Aantal_pouleleden;
}

//========================================
//functie haalt max aantal beurten op
function fun_maxbeurten($Gebruiker_nr, $Toernooi_nr, $Path)
{
	include($Path);

	//initialiseren
	$Max_beurten = 25;

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT t_max_beurten FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Max_beurten = $resultaat['t_max_beurten'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Max_beurten;
}

//punten bepalen obv puntensysteem
function fun_punten($Gebruiker_nr, $Toernooi_nr, $Car_1_tem, $Car_1_gem, $Car_2_tem, $Car_2_gem, $Path)
{
	include($Path);
	$Punten = array();

	//haal punten-sys op
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT t_punten_sys FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Punten_sys = $resultaat['t_punten_sys'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	switch ($Punten_sys) {
		case 1:
			//2-1-0
			if ($Car_1_gem == $Car_1_tem && $Car_2_gem < $Car_2_tem) {
				$Punten[1] = 2;
				$Punten[2] = 0;
			}
			if ($Car_1_gem < $Car_1_tem && $Car_2_gem == $Car_2_tem) {
				$Punten[1] = 0;
				$Punten[2] = 2;
			}
			if ($Car_1_gem == $Car_1_tem && $Car_2_gem == $Car_2_tem) {
				$Punten[1] = 1;
				$Punten[2] = 1;
			}

			if ($Car_1_gem < $Car_1_tem && $Car_2_gem < $Car_2_tem) {
				$Car_1_per = number_format($Car_1_gem / $Car_1_tem * 100, 2);
				$Car_2_per = number_format($Car_2_gem / $Car_2_tem * 100, 2);

				if ($Car_1_per > $Car_2_per) {
					$Punten[1] = 2;
					$Punten[2] = 0;
				}
				if ($Car_1_per < $Car_2_per) {
					$Punten[1] = 0;
					$Punten[2] = 2;
				}
				if ($Car_1_per == $Car_2_per) {
					$Punten[1] = 1;
					$Punten[2] = 1;
				}
			}
			break;

		case 2:
			//10 punten
			$Punten[1] = floor($Car_1_gem / $Car_1_tem * 10);
			$Punten[2] = floor($Car_2_gem / $Car_2_tem * 10);
			break;

		case 3:
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
			break;
	}

	return $Punten;
}

//puntensysteem
function fun_puntensysteem($Gebruiker_nr, $Toernooi_nr, $Path)
{
	include($Path);

	//haal punten-sys op
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT t_punten_sys FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Punten_sys = $resultaat['t_punten_sys'];
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	return $Punten_sys;
}

//stand voor carousel
function fun_stand($Gebruiker_nr, $Toernooi_nr, $Ronde, $Poule, $Path)
{
	include($Path);
	$Uitslagen = array();

	$Aantal_spelers = fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Ronde, $Poule, $Path);
	$Punten_sys = fun_puntensysteem($Gebruiker_nr, $Toernooi_nr, $Path);

	//initieren
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_nummer = fun_spelersnummer($Gebruiker_nr, $Toernooi_nr, $Poule, $Ronde, $a, $Path);
		$Sp_naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Path);

		$Uitslagen[$a]['punten'] = 0;			//op sorteren, nl punten of % punten
		$Uitslagen[$a]['per_car'] = 0;			//op sorteren, later toekennen
		$Uitslagen[$a]['hs'] = 0;				//op sorteren
		$Uitslagen[$a]['moy'] = 0;				//op sorteren
		$Uitslagen[$a]['naam'] = $Sp_naam;
		$Uitslagen[$a]['sp_nummer'] = $Sp_nummer;
		$Uitslagen[$a]['car_gem'] = 0;
		$Uitslagen[$a]['brt'] = 0;
		$Uitslagen[$a]['partijen'] = 0;
	}

	//haal uitslagen op
	//uitslagen ophalen
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslagen WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule' AND t_ronde = '$Ronde' AND gespeeld = '1'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) == 0) {
			$bKan = FALSE;
		} else {
			$bKan = TRUE;
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Nr_1 = $resultaat['sp_volgnummer_1'];
				$Uitslagen[$Nr_1]['car_gem'] = $Uitslagen[$Nr_1]['car_gem'] + $resultaat['sp1_car_gem'];
				$Uitslagen[$Nr_1]['brt'] = $Uitslagen[$Nr_1]['brt'] + $resultaat['brt'];
				$Hs_1_hulp = $resultaat['sp1_hs'];
				if ($Hs_1_hulp > $Uitslagen[$Nr_1]['hs']) {
					$Uitslagen[$Nr_1]['hs'] = $Hs_1_hulp;
				}
				$Uitslagen[$Nr_1]['punten'] = $Uitslagen[$Nr_1]['punten'] + $resultaat['sp1_punt'];
				$Uitslagen[$Nr_1]['partijen'] = $Uitslagen[$Nr_1]['partijen'] + 1;

				$Nr_2 = $resultaat['sp_volgnummer_2'];
				$Uitslagen[$Nr_2]['car_gem'] = $Uitslagen[$Nr_2]['car_gem'] + $resultaat['sp2_car_gem'];
				$Uitslagen[$Nr_2]['brt'] = $Uitslagen[$Nr_2]['brt'] + $resultaat['brt'];
				$Hs_2_hulp = $resultaat['sp2_hs'];
				if ($Hs_2_hulp > $Uitslagen[$Nr_2]['hs']) {
					$Uitslagen[$Nr_2]['hs'] = $Hs_2_hulp;
				}
				$Uitslagen[$Nr_2]['punten'] = $Uitslagen[$Nr_2]['punten'] + $resultaat['sp2_punt'];
				$Uitslagen[$Nr_2]['partijen'] = $Uitslagen[$Nr_2]['partijen'] + 1;
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	if ($bKan == TRUE) {
		//%car toevoegen en dan sorteren
		for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
			$Sp_nummer = $Uitslagen[$a]['sp_nummer'];
			$Car_tem_hulp = fun_carspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde, $Path);
			$Nr_partijen = $Uitslagen[$a]['partijen'];
			$Car_tem_tot = $Car_tem_hulp * $Nr_partijen;
			if ($Car_tem_tot > 0) {
				$Uitslagen[$a]['per_car'] = number_format(($Uitslagen[$a]['car_gem'] / $Car_tem_tot) * 100, 3);
			} else {
				$Uitslagen[$a]['per_car'] = '0.000';
			}

			if ($Uitslagen[$a]['brt'] > 0) {
				$Uitslagen[$a]['moy'] = number_format($Uitslagen[$a]['car_gem'] / $Uitslagen[$a]['brt'], 3);
			} else {
				$Uitslagen[$a]['moy'] = '0.000';
			}
		}
	}
	rsort($Uitslagen);		//key-start = 0;
	return $Uitslagen;
}

//=================================================================
//Onderstaande functie maakt een enkel basisrooster voor een even aantal teams ($NrTeams) en optimaliseert gelijk de uit- en thuiswedstrijden
//De functie staat nog los van de gegevens van de teams waar het om gaat. Deze functie werkt met volgnummers;
//de gegevens van de teams worden hier later aan gekoppeld.
//Het algoritme vraagt om een start-indeling: die is altijd 1-2, 3-4, 5-6, ... etc.

function fun_even($NrTeams)
{
	//de functie retourneert $Rooster_array_f; hierin worden per ronde en per koppel de gegevens van beide teams opgeslagen
	//Het formaat van de werk $Rooster_array is: $Rooster_array[rondenummer][koppelnummer][1 - 2]
	//1 = volgnummer team 1 (dit team speelt thuis)
	//2 = volgnummer team 2 (dit team speelt uit)
	//NB: het aantal teams $NrTeams wordt doorgegeven in de functie en is daarvoor al gechecked op even of oneven
	$Rooster_array = array();	//werk-array
	$Rooster_array_f = array();	//return-array

	$AantalKoppels = $NrTeams / 2;	// Bepaal aantal koppels, is aantal teams gedeeld door 2

	//De draaitabel van de methode Round Robin wordt opgeslagen en gewijzigd in array $Regel[] met team 1 altijd op 1
	//De volgorde in de draaitabel is zodanig dat in ronde 1 spelen: 1-2, 3-4, 5-6, etc.
	//Team 1 blijft staan, de overige teams draaien rechtsom
	//Team 1 speelt thuis in de oneven ronden en uit in de even ronden
	//De overige koppels worden van boven naar beneden uitgelezen (3-4, 5-6, etc in ronde 1; 2-6, 3-8, etc in ronde 2)
	//De teams in de overige koppels: team 1 speelt thuis in een even koppel en uit in een oneven koppel; team 2 net andersom.
	//De Round Robin carrousel (voor 10 teams als voorbeeld):
	//		3	5	7	9							2	3	5	7							4	2	3	5
	//1-2	|	|	|	|					1-4		|	|	|	|					1-6		|	|	|	|
	//		4	6	8	10							6	8	10	9							8	10	9	7

	//volgnummer 1 en 2 toekennen
	$Regel[1] = 1;
	$Regel[2] = 2;

	//volgnummers 3 t/m aantal teams toekennen (per koppel)
	for ($count_1 = 3; $count_1 < $AantalKoppels + 2; $count_1++) {
		$Regel[$count_1] = 2 * $count_1 - 3;
		$Regel[$NrTeams + 3 - $count_1] = 2 * $count_1 - 2;
	}

	//nu rooster vullen in $Rooster_array[ronde][koppel][1 en 2]
	for ($count_1 = 1; $count_1 < $NrTeams; $count_1++)	//ronden. Bij $count_1 is oneven: team 1 thuis, anders team 1 uit
	{
		for ($count_2 = 1; $count_2 < $AantalKoppels + 1; $count_2++)	//koppels. Bij $count_2 is even: team 1 van de overige koppels thuis, team 2 uit. Bij oneven andersom.
		{
			if ($count_2 == 1)	//koppel 1
			{
				if ($count_1 % 2 == 0)	//even ronde, dus team 1 uit
				{
					$Rooster_array[$count_1][$count_2][1] = $Regel[2];	//team 2 in koppel met team 1
					$Rooster_array[$count_1][$count_2][2] = 1;			//team 1 uit
				} else	//oneven ronde, dus team 1 thuis
				{
					$Rooster_array[$count_1][$count_2][1] = 1;			//team 1 thuis
					$Rooster_array[$count_1][$count_2][2] = $Regel[2];	//team 2 in koppel met team 1
				}	//end if
			} else				//overige koppels (3 tegen laatste, 3+1 tegen laagste-1, etc in $Regel[] )
			{
				if ($count_2 % 2 == 0)	//even koppel, dus team 1 thuis
				{
					$Rooster_array[$count_1][$count_2][1] = $Regel[$count_2 + 1];				//team 1 koppel thuis
					$Rooster_array[$count_1][$count_2][2] = $Regel[$NrTeams - $count_2 + 2];	//team 2 koppel uit
				} else	//oneven koppel, dus team 1 uit
				{
					$Rooster_array[$count_1][$count_2][1] = $Regel[$NrTeams - $count_2 + 2];	//team 2 koppel thuis
					$Rooster_array[$count_1][$count_2][2] = $Regel[$count_2 + 1];				//team 1 koppel uit	
				}	//end if
			}	//end if
		}	//end for $count_2

		//nu de nummers in Regel[] een plek linksom draaien: elke plek in de Regel krijgt de waarde uit de vorige regel.
		//laatste regelplek even bewaren
		$Hulp = $Regel[$NrTeams];

		for ($count_3 = $NrTeams; $count_3 > 2; $count_3--) {
			$Regel[$count_3] = $Regel[$count_3 - 1];
		}

		$Regel[1] = 1;		//overbodig, wordt niet gewijzigd
		$Regel[2] = $Hulp;	//laatste regelplek naar 2e team in 1e koppel
	}	//end for $count_1


	return $Rooster_array;
}	//end function

//=================================================================
//Onderstaande functie maakt een enkel basisrooster voor een oneven aantal teams en optimaliseert gelijk de uit- en thuiswedstrijden
//De functie staat nog los van de gegevens van de teams waar het om gaat. Deze functie werkt met volgnummers;
//de gegevens van de teams worden hier later aan gekoppeld.
//Het algoritme vraagt om een start-indeling: die is altijd 1-2, 3-4, 5-6, ... etc.
function fun_oneven($NrTeams)
{
	//de functie retourneert $Rooster_array_f; hierin worden per ronde en per koppel de gegevens van beide teams opgeslagen
	//Het formaat van werk $Rooster_array is: $Rooster_array[rondenummer][koppelnummer][1 - 2]
	//1 = volgnummer team 1 (dit team speelt thuis)
	//2 = volgnummer team 2 (dit team speelt uit)
	//NB1: het aantal teams $NrTeams wordt doorgegeven in de functie en is daarvoor al gechecked op even of oneven
	//NB2: bij een oneven aantal teams werken we met een extra ghost-team om het aantal even te maken,
	//het ghost-team wordt op het einde weer verwijderd; de tegenstander van het ghost-team is het rustteam.

	$Rooster_array = array();	//werk-array
	$Rooster_array_f = array();	//return-array

	$NrTeams = $NrTeams + 1;		//aantal even maken met een ghost-team
	$AantalKoppels = $NrTeams / 2;	// Bepaal aantal koppels, is aantal teams gedeeld door 2

	//De draaitabel van de methode Round Robin wordt opgeslagen en gewijzigd in array $Regel[] met team 1 altijd op 1
	//De volgorde in de draaitabel is zodanig dat in ronde 1 spelen: 1-2, 3-4,5-6, etc.
	//Team 1 blijft staan, de overige teams draaien rechtsom
	//Team 1 speelt thuis in de oneven ronden en uit in de even ronden
	//De overige koppels worden van boven naar beneden uitgelezen (3-4, 5-6, etc in ronde 1; 2-6, 3-8, etc in ronde 2)
	//De teams in de overige koppels: team 1 speelt thuis in een even koppel en uit in een oneven koppel; team 2 net andersom.
	//De Round Robin carrousel
	//		3	5	7	9							2	3	5	7							4	2	3	5
	//1-2	|	|	|	|					1-4		|	|	|	|					1-6		|	|	|	|
	//		4	6	8	10							6	8	10	9							8	10	9	7

	//volgnummer 1 en 2 toekennen
	$Regel[1] = 1;
	$Regel[2] = 2;

	//volgnummers 3 t/m aantal teams toekennen (per koppel)
	for ($count_1 = 3; $count_1 < $AantalKoppels + 2; $count_1++) {
		$Regel[$count_1] = 2 * $count_1 - 3;
		$Regel[$NrTeams + 3 - $count_1] = 2 * $count_1 - 2;
	}

	//nu rooster vullen in $Rooster_array[ronde][koppel][1 en 2]
	for ($count_1 = 1; $count_1 < $NrTeams; $count_1++)	//ronden. Bij $count_1 is oneven: team 1 thuis, anders team 1 uit
	{
		for ($count_2 = 1; $count_2 < $AantalKoppels + 1; $count_2++)	//koppels. Bij $count_2 is even: team 1 thuis, team 2 uit. Bij oneven andersom
		{
			if ($count_2 == 1)	//koppel 1
			{
				if ($Regel[2] == $NrTeams)	//ghost eruit; koppel wordt rustteam
				{
					$Rooster_array[$count_1][$count_2][1] = -1;	//bij een koppel met rustteam wordt team 1 op -1 gezet en team 2 als rustteam beschouwd
					$Rooster_array[$count_1][$count_2][2] = 1;	//rustteam
				} else {
					if ($count_1 % 2 == 0)	//even ronde, dus team 1 uit
					{
						$Rooster_array[$count_1][$count_2][1] = $Regel[2];	//team 2 thuis
						$Rooster_array[$count_1][$count_2][2] = 1;	//team 1 uit
					} else	//oneven ronde, dus team 1 thuis
					{
						$Rooster_array[$count_1][$count_2][1] = 1;	//team 1 thuis
						$Rooster_array[$count_1][$count_2][2] = $Regel[2];	//team 2 uit
					}
				}
			} else	//overige koppels (3 tegen laatste, 3+1 tegen laagste-1, etc in $Regel[] )
			{
				if ($Regel[$count_2 + 1] == $NrTeams || $Regel[$NrTeams - $count_2 + 2] == $NrTeams)	//zowel "boven" als "beneden" in de draaitabel kan de ghost staan
				{
					if ($Regel[$count_2 + 1] == $NrTeams)	//"bovenste" team is ghost, dus "onderste" team wordt rustteam
					{
						$Rooster_array[$count_1][$count_2][1] = -1;	//Afspraak: in het rustkoppel wordt team1=-1 en team2 het rustteam in de array
						$Rooster_array[$count_1][$count_2][2] = $Regel[$NrTeams - $count_2 + 2];	//rustteam
					} else	//"onderste" team is ghost, dus "bovenste" team wordt rustteam
					{
						$Rooster_array[$count_1][$count_2][1] = -1;
						$Rooster_array[$count_1][$count_2][2] = $Regel[$count_2 + 1];	//rustteam
					}
				} else	//normaal koppel "boven tegen onder"
				{
					if ($count_2 % 2 == 0)	//even koppel, dus team 1 thuis
					{
						$Rooster_array[$count_1][$count_2][1] = $Regel[$count_2 + 1];
						$Rooster_array[$count_1][$count_2][2] = $Regel[$NrTeams - $count_2 + 2];
					} else	//oneven koppel, dus team 1 uit
					{
						$Rooster_array[$count_1][$count_2][1] = $Regel[$NrTeams - $count_2 + 2];
						$Rooster_array[$count_1][$count_2][2] = $Regel[$count_2 + 1];
					}	//end if
				}	//end if
			}
		}	//end for $count_2

		//nu Regel draaien: elke plek in de Regel krijgt de waarde van de vorige regel.
		//laatste regelplek even bewaren
		$Hulp = $Regel[$NrTeams];

		for ($count_3 = $NrTeams; $count_3 > 2; $count_3--) {
			$Regel[$count_3] = $Regel[$count_3 - 1];
		}

		$Regel[1] = 1;		//overbodig, wordt niet gewijzigd
		$Regel[2] = $Hulp;	//laatste regelplek naar 2e team in 1e koppel
	}	//end for $count_1

	//nu rustteams naar laatse koppel verplaatsen (Afspraak)
	//de rustteams staan willekeurig in de regel met koppels, dat werkt onhandig, dus alle rustteams in laatste koppel plaatsen.
	for ($count_1 = 1; $count_1 < $NrTeams; $count_1++) {
		for ($count_2 = 1; $count_2 < $AantalKoppels; $count_2++)		//het laatste koppel hoeft niet onderzocht te worden:
		//of het rustteam staat er voor (en wordt dan gewisseld)
		//of het rustteam staat in het laatste koppel en dat is dan ook de bedoeling
		{
			if ($Rooster_array[$count_1][$count_2][1] == -1)	//koppel met rustteam: dus wisselen
			{
				$Hulp = $Rooster_array[$count_1][$count_2][1];
				$Rooster_array[$count_1][$count_2][1] = $Rooster_array[$count_1][$AantalKoppels][1];
				$Rooster_array[$count_1][$AantalKoppels][1] = $Hulp;

				$Hulp = $Rooster_array[$count_1][$count_2][2];
				$Rooster_array[$count_1][$count_2][2] = $Rooster_array[$count_1][$AantalKoppels][2];
				$Rooster_array[$count_1][$AantalKoppels][2] = $Hulp;
			}	//end if
		}	//end for
	}	//end for

	return $Rooster_array;
}	//end function
