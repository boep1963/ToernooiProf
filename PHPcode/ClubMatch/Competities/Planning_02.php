<?php
//© Hans Eekels, versie 02-09-2025
/*
Planning maken: maximaal 2 partijen per speler
Toegevoegd: koppeldeel niet beschikbaar bij competitie met vast aantal beurten
Aanpak: bepaal aantal gespeelde partijen per speler.
Begin met spelers met de meeste gespeelde partijen en zet die tegen spelers met de minst gespeelde partijen.
Bij een oneven aantal spelers: spaar stilzitters op (bij 2 partijen) en kijk of die in een ronde 3 nog tegen elkaar kunnen.
Gebruik in ronde 2 als eerste de stilzitter van ronde 1.
NB: Niets zo lastig als het maken van een planning met spelers die al tegen elkaar hebben gespeeld.
Vandaar dat er per ronde naar een optimale indeling wordt gezocht; dat is een indeling met de meeste mogelijke partijen

Na terugkeer uit koppelen, bij gekoppelde partijen het tafelnummer weergeven en bij alles gekoppeld de aan/uit knop weg
*/
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();
$Spelers_nietingedeeld = array();
$Matrix = array();
$Matrix_Copie = array();
$Matrix_tijdelijk = array();
$Partijen = array();
$Partijen_tijdelijk = array();
$Partijen_def = array();
$Gespeeld = array();
$Gespeeld_tijdelijk = array();

/*
var_dump($_POST) geeft:

array(8) { 
[11]=> string(2) "11" 	//dit zijn de aangevinkte spelers
[8]=> string(1) "8" 
[2]=> string(1) "2" 
[1]=> string(1) "1" 

["ronden"]=> string(1) "2" 
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" 
["periode_keuze"]=> string(1) "2" }

wellicht ook de partijen terug uit Planning_03.php
["str_var"]=> string(548) "YToyOntpOjE7YTo2OntpO............."
Dan GEEN spelers en ronden !! Die ontlenen aan de array Partijen die doorgestuurd zijn
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";
$bAkkoord_2 = TRUE;
$error_message_2 = "U moet minimaal 2 spelers selecteren om een planning te kunnen maken !<br>U keert terug naar de start planning.";

if (isset($_POST['user_code'])) {
	$Code = $_POST['user_code'];
	if (strlen($Code) != 10) {
		$bAkkoord = FALSE;
	} else {
		if (fun_bestaatorg($Code, $Path) == FALSE) {
			$bAkkoord = FALSE;
		} else {
			$Org_nr = substr($Code, 0, 4);
			$Org_naam = fun_orgnaam($Org_nr, $Path);
			$Logo_naam = "../Beheer/uploads/Logo_" . $Org_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['comp_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Comp_nr = $_POST['comp_nr'];
	$Comp_naam = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['periode_keuze'])) {
	$bAkkoord = FALSE;
} else {
	$Periode_keuze = $_POST['periode_keuze'];
	if (filter_var($Periode_keuze, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

//partijen doorgegeven ?
if (isset($_POST['str_var'])) {
	$str_var = $_POST['str_var'];
	$Partijen_def = unserialize(base64_decode($str_var));
	$bPartijenAlBekend = TRUE;
} else {
	$bPartijenAlBekend = FALSE;
	if (isset($_POST['ronden'])) {
		$Aantal_ronden = $_POST['ronden'];
	} else {
		$bAkkoord = FALSE;
	}
	//bepaal aantal geselecteerde spelers
	$teller = 0;
	foreach ($_POST as $key_var => $value_var) {
		if ($key_var == "str_var" || $key_var == "ronden" || $key_var == "periode_keuze" || $key_var == "user_code" || $key_var == "comp_nr") {
			//geen actie
		} else {
			$teller++;
			$Nr_hulp = $value_var;
			$Spelers[$teller]['aantal_partijen'] = fun_partgespeeld($Org_nr, $Comp_nr, $Periode_keuze, $Nr_hulp, $Path);
			$Spelers[$teller]['spc_nummer'] = $Nr_hulp;
		}
	}

	$Aantal_spelers = $teller;
	if ($Aantal_spelers < 2) {
		$bAkkoord_2 = FALSE;
	}
}

if ($bAkkoord == FALSE) {
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../PHP/script_competitie.js" defer></script>
		<style type="text/css">
			body {
				width: 500px;
				margin-top: 100px;
			}

			.button:hover {
				border-color: #FFF;
			}
		</style>
	</head>

	<body>
		<table width="500" border="0">
			<tr>
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print($error_message); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<form name="cancel" method="post" action="../../Start.php">
						<input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					</form>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&nbsp;&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

if ($bAkkoord_2 == FALSE)
{
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
	//terug naar start planning
	?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../PHP/script_competitie.js" defer></script>
		<style type="text/css">
			body {
				width: 500px;
				margin-top: 100px;
			}

			.button:hover {
				border-color: #FFF;
			}
		</style>
	</head>

	<body>
		<table width="500" border="0">
			<tr>
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print($error_message_2); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<form name="cancel" method="post" action="Planning_01.php">
						<input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Naar start planning" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          				<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          				<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
					</form>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&nbsp;&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
//Vast aantal beurten ?
$Brt_sys = fun_vastaantalbeurten($Org_nr, $Comp_nr, $Path);
if ($Brt_sys == 0) {
	$bVastAantalBeurten = FALSE;
} else {
	$bVastAantalBeurten = TRUE;
}

//aantal tafels
$Aantal_tafels = fun_aantaltafels($Code, $Path);

if ($bPartijenAlBekend == FALSE) {
	rsort($Spelers);	//keystart=0 en speler met meeste partijen als eerste

	//aantal partijen gespeeld op 0 zetten
	for ($gs = 0; $gs < $Aantal_spelers; $gs++) {
		$Nr_hulp = $Spelers[$gs]['spc_nummer'];
		$Gespeeld[$Nr_hulp][1] = 0;
		$Gespeeld[$Nr_hulp][2] = 0;

		$Gespeeld_tijdelijk[$Nr_hulp][1] = 0;
		$Gespeeld_tijdelijk[$Nr_hulp][2] = 0;
	}

	//bepaal max aantal ronden
	if ($Aantal_ronden == 2 && $Aantal_spelers < 3) {
		$Aantal_ronden = 1;
	}

	if ($Aantal_spelers % 2 != 0 && $Aantal_ronden == 2) {
		$bRust = TRUE;
	} else {
		$bRust = FALSE;
	}

	//bepaal bruto aantal koppels (als er geen partijen te vinden zijn, neemt het aantal koppels af)
	if ($Aantal_spelers % 2 == 0) {
		$Aantal_koppels = $Aantal_spelers / 2;
	} else {
		$Aantal_koppels = ($Aantal_spelers - 1) / 2;
	}

	//matrix, waarin nieuwe partijen komen, vullen met spelernummers op 0 als beschikbaar (na indelen partij wordt het 1)
	for ($a = 0; $a < $Aantal_spelers; $a++) {
		$Nr_1 = $Spelers[$a]['spc_nummer'];
		for ($b = 0; $b < $Aantal_spelers; $b++) {
			$Nr_2 = $Spelers[$b]['spc_nummer'];
			if ($Nr_1 == $Nr_2) {
				$Matrix[$Nr_1][$Nr_2] = 1;
				$Matrix_tijdelijk[$Nr_1][$Nr_2] = 1;
			} else {
				$Matrix[$Nr_1][$Nr_2] = 0;
				$Matrix_tijdelijk[$Nr_1][$Nr_2] = 0;
			}
		}
	}

	//partijen initialiseren
	for ($a = 1; $a < $Aantal_ronden + 1; $a++) {
		for ($b = 1; $b < $Aantal_koppels + 1; $b++) {
			$Partijen[$a][$b][1] = 0;
			$Partijen[$a][$b][2] = 0;

			$Partijen_tijdelijk[$a][$b][1] = 0;
			$Partijen_tijdelijk[$a][$b][2] = 0;
		}
	}

	//ronde 1 en optimaliseren
	//sla per poging alle partijen op in $Partijen_tijdelijk en $Gespeeld_tijdelijk; 
	//	bepaal aantal partijen en sla definitief op in $Partijen en $Gespeeld als aantal > vorig aantal
	//Alleen doorgaan met optimaliseren als aantal partijen < aantal koppels
	//Aanpak: 
	//-	begin met speler keymin in lus 1 en met speler keymax in lus 2
	//-	begin opnieuw met verhogen keymin in lus 1 en hetzelfde in lus 2; 
	//-	stop als keymin > keymax

	//Eerste ronde
	$lus_1_teller = 0;
	$Max_partijen = 0;
	$ronde = 1;

	while ($lus_1_teller < $Aantal_spelers) {
		//bij terugkeer hier met dus $lus_1_teller > 0, alle tijdelijke bestanden legen, behalve $Max_partijen
		if ($lus_1_teller > 0) {
			//alle tijdelijke arrays op 0
			//partijen in ronde 1
			for ($b = 1; $b < $Aantal_koppels + 1; $b++) {
				$Partijen_tijdelijk[1][$b][1] = 0;
				$Partijen_tijdelijk[1][$b][2] = 0;
			}
			//gespeeld in ronde 1
			for ($gs = 0; $gs < $Aantal_spelers; $gs++) {
				$Nr_hulp = $Spelers[$gs]['spc_nummer'];
				$Gespeeld_tijdelijk[$Nr_hulp][1] = 0;
			}
			//matrix
			for ($a = 0; $a < $Aantal_spelers; $a++) {
				$Nr_1 = $Spelers[$a]['spc_nummer'];
				for ($b = 0; $b < $Aantal_spelers; $b++) {
					$Nr_2 = $Spelers[$b]['spc_nummer'];
					if ($Nr_1 == $Nr_2) {
						$Matrix_tijdelijk[$Nr_1][$Nr_2] = 1;
					} else {
						$Matrix_tijdelijk[$Nr_1][$Nr_2] = 0;
					}
				}	//end for $b
			}	//end for $a
		}	//end if $lus_1_teller > 0

		//lus 1 in ronde 1
		$koppel = 0;
		for ($teller_1 = $lus_1_teller; $teller_1 < $Aantal_spelers; $teller_1++) {
			$Nr_1 = $Spelers[$teller_1]['spc_nummer'];

			//initialiseren
			$bBeschikbaar_1 = TRUE;
			if ($Gespeeld_tijdelijk[$Nr_1][$ronde] == 1) {
				$bBeschikbaar_1 = FALSE;
			}

			if ($bBeschikbaar_1 == TRUE) {
				//initialiseren
				$bGevonden = FALSE;

				//nu zoek 2			
				for ($teller_2 = $Aantal_spelers - 1; $teller_2 >= 0; $teller_2--) {
					$Nr_2 = $Spelers[$teller_2]['spc_nummer'];

					if ($Nr_1 <> $Nr_2) {
						//initialiseren
						$bBeschikbaar_2 = TRUE;

						if ($Gespeeld_tijdelijk[$Nr_2][$ronde] == 1) {
							$bBeschikbaar_2 = FALSE;
						}

						if ($bBeschikbaar_2 == TRUE) {
							//checks
							$Uitslag_code = fun_maakcode($Periode_keuze, $Nr_1, $Nr_2);
							if (
								fun_algespeeld($Org_nr, $Comp_nr, $Periode_keuze, $Nr_1, $Nr_2, $Path) == 0
								&& fun_bestaatpartij($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path) == 0
							)	//nog niet tegen elkaar gespeeld; nog niet ingedeeld
							{
								if ($Matrix_tijdelijk[$Nr_1][$Nr_2] == 0)	//ook nog niet toegekend
								{
									$koppel++;
									$Matrix_tijdelijk[$Nr_1][$Nr_2] = 1;
									$Matrix_tijdelijk[$Nr_2][$Nr_1] = 1;
									$Partijen_tijdelijk[$ronde][$koppel][1] = $Nr_1;
									$Partijen_tijdelijk[$ronde][$koppel][2] = $Nr_2;
									$Gespeeld_tijdelijk[$Nr_1][$ronde] = 1;
									$Gespeeld_tijdelijk[$Nr_2][$ronde] = 1;
									$bGevonden = TRUE;
								}
							}	//end if al gespeeld ?
						}	//end if 2 beschikbaar

						if ($bGevonden == TRUE || $koppel == $Aantal_koppels) {
							break;		//uit lus teller_2
						}
					}	//end if 1<>2
				}	//end for teller_2
			}	//end if 1 beschikbaar
		}	//end for $teller_1	

		if ($koppel > $Max_partijen) {
			//betere variant, dus in definitief opslaan
			//Max_partijen aanpassen
			$Max_partijen = $koppel;

			//partijen
			for ($b = 1; $b < $Aantal_koppels + 1; $b++) {
				$Partijen[1][$b][1] = $Partijen_tijdelijk[1][$b][1];
				$Partijen[1][$b][2] = $Partijen_tijdelijk[1][$b][2];
			}
			//gespeeld in ronde 1
			for ($gs = 0; $gs < $Aantal_spelers; $gs++) {
				$Nr_hulp = $Spelers[$gs]['spc_nummer'];
				$Gespeeld[$Nr_hulp][1] = $Gespeeld_tijdelijk[$Nr_hulp][1];
			}
			//matrix
			for ($a = 0; $a < $Aantal_spelers; $a++) {
				$Nr_1 = $Spelers[$a]['spc_nummer'];
				for ($b = 0; $b < $Aantal_spelers; $b++) {
					$Nr_2 = $Spelers[$b]['spc_nummer'];
					$Matrix[$Nr_1][$Nr_2] = $Matrix_tijdelijk[$Nr_1][$Nr_2];
				}
			}	//end for $a
		}	//end if $koppel > $Max_partijen

		//verder als $koppel < $Aantal_koppels, anders break while
		if ($koppel == $Aantal_koppels) {
			break;
		}

		$lus_1_teller++;
	}	//end while $lus_1_teller < $Aantal_spelers

	//twee ronden ?
	if ($Aantal_ronden == 2) {
		//voordat we ronde 2 aanmaken, eerst kijken of er een rustspeler is in ronde 1; zo ja: daarmee beginnen voor een extra partij
		if ($bRust == TRUE) {
			//initialiseren
			$Partijen[3][1][1] = 0;		//wordt, indien mogelijk, rustspeler uit ronde 1
			$Partijen[3][1][2] = 0;		//wordt, indien mogelijk, rustspeler uit ronde 2
			$bGevonden_rustspeler1 = FALSE;

			//zoek niet gespeelde speler in ronde 1
			for ($a = 0; $a < $Aantal_spelers; $a++) {
				$Nr_hulp = $Spelers[$a]['spc_nummer'];
				if ($Gespeeld[$Nr_hulp][1] == 0) {
					//Gevonden
					$Rustspeler_1 = $Nr_hulp;
					$bGevonden_rustspeler1 = TRUE;

					//zoek tegenstander die rust krijgt in ronde 2, te beginnen met speler met meeste partijen
					for ($zoek = 0; $zoek < $Aantal_spelers; $zoek++) {
						//initialiseren
						$bGevonden_rustspeler2 = FALSE;

						$Rustspeler_2 = $Spelers[$zoek]['spc_nummer'];

						$Uitslag_code = fun_maakcode($Periode_keuze, $Rustspeler_1, $Rustspeler_2);

						if (
							fun_algespeeld($Org_nr, $Comp_nr, $Periode_keuze, $Rustspeler_1, $Rustspeler_2, $Path) == 0
							&& fun_bestaatpartij($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path) == 0
						)	//nog niet tegen elkaar gespeeld; nog niet ingedeeld
						{
							if ($Matrix[$Rustspeler_1][$Rustspeler_2] == 0)	//ook nog niet toegekend
							{
								$Matrix[$Rustspeler_1][$Rustspeler_2] = 1;
								$Matrix[$Rustspeler_2][$Rustspeler_1] = 1;
								$Partijen[3][1][1] = $Rustspeler_1;
								$Partijen[3][1][2] = $Rustspeler_2;
								$Gespeeld[$Rustspeler_2][2] = 1;
								$bGevonden_rustspeler2 = TRUE;
								//$Aantal_ronden = 3;
								break;	//uit lus for $zoek
							}
						}	//end if al gespeeld ?
					}	//end for $zoek
				}	//end if Gespeeld = 0

				if ($bGevonden_rustspeler2 == TRUE) {
					break;	//uit lus for $a
				}
			}	//end for per speler
		}	//end if $bRust == TRUE

		$lus_2_teller = 0;
		$Max_partijen = 0;
		$ronde = 2;

		//initialiseren
		//partijen in ronde 2
		for ($b = 1; $b < $Aantal_koppels + 1; $b++) {
			$Partijen_tijdelijk[2][$b][1] = 0;
			$Partijen_tijdelijk[2][$b][2] = 0;
		}
		//gespeeld in ronde 2
		unset($Gespeeld_tijdelijk);
		$Gespeeld_tijdelijk = $Gespeeld;

		//matrix
		//Eerst een Copie maken van de matrix na ronde 1 en evt ronde 3 om te bewaren
		$Matrix_Copie = $Matrix;

		//Nu een wekrcopie maken van matrix
		$Matrix_tijdelijk = $Matrix_Copie;

		//start lus 2
		while ($lus_2_teller < $Aantal_spelers) {
			//bij terugkeer hier (dus $lus_2_teller > 0, alle tijdelijke bestanden legen, behalve $Max_partijen
			if ($lus_2_teller > 0) {
				//alle tijdelijke arrays op 0
				//partijen in ronde 2
				for ($b = 1; $b < $Aantal_koppels + 1; $b++) {
					$Partijen_tijdelijk[2][$b][1] = 0;
					$Partijen_tijdelijk[2][$b][2] = 0;
				}
				//gespeeld in ronde 2; overnemen van gespeeld definitief
				unset($Gespeeld_tijdelijk);
				$Gespeeld_tijdelijk = $Gespeeld;

				//matrix, overnemen van Matrix_copie
				unset($Matrix_tijdelijk);
				$Matrix_tijdelijk = $Matrix_Copie;
			}	//end if $lus_2_teller > 0

			//lus 1 in ronde 2
			$koppel = 0;
			for ($teller_1 = $lus_2_teller; $teller_1 < $Aantal_spelers; $teller_1++) {
				$Nr_1 = $Spelers[$teller_1]['spc_nummer'];

				//initialiseren
				$bBeschikbaar_1 = TRUE;
				if ($Gespeeld_tijdelijk[$Nr_1][$ronde] == 1) {
					$bBeschikbaar_1 = FALSE;
				}

				if ($bBeschikbaar_1 == TRUE) {
					//initialiseren
					$bGevonden = FALSE;

					//nu zoek 2			
					for ($teller_2 = 0; $teller_2 < $Aantal_spelers; $teller_2++) {
						$Nr_2 = $Spelers[$teller_2]['spc_nummer'];

						if ($Nr_1 <> $Nr_2) {
							//initialiseren
							$bBeschikbaar_2 = TRUE;
							if ($Gespeeld_tijdelijk[$Nr_2][$ronde] == 1) {
								$bBeschikbaar_2 = FALSE;
							}

							if ($bBeschikbaar_2 == TRUE) {
								//checks
								$Uitslag_code = fun_maakcode($Periode_keuze, $Nr_1, $Nr_2);
								if (
									fun_algespeeld($Org_nr, $Comp_nr, $Periode_keuze, $Nr_1, $Nr_2, $Path) == 0
									&& fun_bestaatpartij($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path) == 0
								)	//nog niet tegen elkaar gespeeld; nog niet ingedeeld
								{
									if ($Matrix_tijdelijk[$Nr_1][$Nr_2] == 0)	//ook nog niet toegekend
									{
										$koppel++;
										$Matrix_tijdelijk[$Nr_1][$Nr_2] = 1;
										$Matrix_tijdelijk[$Nr_2][$Nr_1] = 1;
										$Partijen_tijdelijk[$ronde][$koppel][1] = $Nr_1;
										$Partijen_tijdelijk[$ronde][$koppel][2] = $Nr_2;
										$Gespeeld_tijdelijk[$Nr_1][$ronde] = 1;
										$Gespeeld_tijdelijk[$Nr_2][$ronde] = 1;
										$bGevonden = TRUE;
									}
								}	//end if al gespeeld ?
							}	//end if 2 beschikbaar

							if ($bGevonden == TRUE || $koppel == $Aantal_koppels) {
								break;		//uit lus teller_2
							}
						}	//end if 1<>2
					}	//end for teller_2
				}	//end if 1 beschikbaar
			}	//end for $teller_1	

			if ($koppel > $Max_partijen) {
				//betere variant, dus in definitief opslaan
				//Max_partijen aanpassen
				$Max_partijen = $koppel;

				//partijen
				for ($b = 1; $b < $Aantal_koppels + 1; $b++) {
					$Partijen[2][$b][1] = $Partijen_tijdelijk[2][$b][1];
					$Partijen[2][$b][2] = $Partijen_tijdelijk[2][$b][2];
				}
				//gespeeld in ronde 2
				for ($gs = 0; $gs < $Aantal_spelers; $gs++) {
					$Nr_hulp = $Spelers[$gs]['spc_nummer'];
					$Gespeeld[$Nr_hulp][2] = $Gespeeld_tijdelijk[$Nr_hulp][2];
				}
				//matrix
				//De definitieve array terugzetten op array_copie en dan bijwerken met gegevens huidige variant
				unset($Matrix);
				$Matrix = $Matrix_Copie;

				for ($a = 0; $a < $Aantal_spelers; $a++) {
					$Nr_1 = $Spelers[$a]['spc_nummer'];
					for ($b = 0; $b < $Aantal_spelers; $b++) {
						$Nr_2 = $Spelers[$b]['spc_nummer'];
						$Matrix[$Nr_1][$Nr_2] = $Matrix_tijdelijk[$Nr_1][$Nr_2];
					}
				}
			}
			//verder als $koppel < $Aantal_koppels, anders break while
			if ($koppel == $Aantal_koppels) {
				break;
			}

			$lus_2_teller++;
		}	//end while $lus_2_teller < $Aantal_spelers

		//aantal ronden bepalen voor tonen in html
		if (isset($Partijen[1])) {
			$Aantal_ronden = 1;
		}
		if (isset($Partijen[2])) {
			$Aantal_ronden = 2;
		}
		if (isset($Partijen[3])) {
			$Aantal_ronden = 3;
		}
	}	//end if $Aantal_ronden == 2
}	//end if ($bPartijenAlBekend == FALSE)
else {
	//$Partijen bestaan al, dus terugkeer na koppelen
	$Partijen = $Partijen_def;
	//aantal ronden bepalen
	if (isset($Partijen[1])) {
		$Aantal_ronden = 1;
	}
	if (isset($Partijen[2])) {
		$Aantal_ronden = 2;
	}
	if (isset($Partijen[3])) {
		$Aantal_ronden = 3;
	}
}	//end else $bPartijenAlBekend == TRUE

//bepaal spelers die geselecteerd zijn, maar niet ingedeeld zijn in een ronde
//bij speler in ronde 1 die niet ingedeeld is: kijk of er 3 ronden (de rustronde) zijn, zo ja is de eerste speler van die partij de niet ingedeelde speler ? Ja: toch ingedeeld
//bij speler in ronde 2 die niet ingedeeld is: kijk of er 3 ronden (de rustronde) zijn, zo ja is de tweede speler van die partij de niet ingedeelde speler ? Ja: toch ingedeeld
$teller = 0;
for ($a = 0; $a < $Aantal_spelers; $a++) {
	$Nr_sp = $Spelers[$a]['spc_nummer'];

	for ($b = 1; $b < $Aantal_ronden + 1; $b++) {
		if ($b < 3)	//niet extra ronde met 1 partij tussen 2 rustspelers
		{
			//initialiseren
			$bGevonden = FALSE;
			if (isset($Partijen[$b])) {
				$Aantal_partijen = count($Partijen[$b]);
			} else {
				$Aantal_partijen = 0;
			}

			if ($Aantal_partijen > 0) {
				for ($c = 1; $c < $Aantal_partijen + 1; $c++) {
					if ($Nr_sp == $Partijen[$b][$c][1]) {
						$bGevonden = TRUE;
						break;
					}
					if ($Nr_sp == $Partijen[$b][$c][2]) {
						$bGevonden = TRUE;
						break;
					}
				}	//end for per partij in ronde $b

				if ($bGevonden == FALSE) {
					//misschien in rustronde 3
					if (isset($Partijen[3]) && $Nr_sp == $Partijen[3][1][$b])		//speler 1 in ronde 1 en speler 2 in ronde 2
					{
						//toch gevonden
						$bGevonden = TRUE;
					} else {
						$teller++;
						$Spelers_nietingedeeld[$teller]['spc_nummer'] = $Nr_sp;
						$Spelers_nietingedeeld[$teller]['naam'] = fun_ledennaam($Nr_sp, $Org_nr, $Path);
						$Spelers_nietingedeeld[$teller]['ronde'] = $b;
					}
				}
			}	//end if #part >0
			else {
				$teller++;
				$Spelers_nietingedeeld[$teller]['spc_nummer'] = $Nr_sp;
				$Spelers_nietingedeeld[$teller]['naam'] = fun_ledennaam($Nr_sp, $Org_nr, $Path);
				$Spelers_nietingedeeld[$teller]['ronde'] = $b;
			}
		}	//end if $b < 3
	}	//end for per ronde
}	//end for per geselecteerde speler

$Aantal_nietingedeeld = $teller;

//Pas $Partijen aan als er partijen zijn met spelerNr = 0
if (isset($Partijen[1])) {
	for ($a = 1; $a < $Aantal_ronden + 1; $a++) {
		//initialiseren
		$Aantal_partijen = count($Partijen[$a]);

		if ($Aantal_partijen > 0) {
			$teller = 0;
			for ($b = 1; $b < $Aantal_partijen + 1; $b++) {
				if ($Partijen[$a][$b][1] == 0 || $Partijen[$a][$b][2] == 0) {
					//niets doen
				} else {
					$teller++;
					$Partijen_def[$a][$teller][1] = $Partijen[$a][$b][1];
					$Partijen_def[$a][$teller][2] = $Partijen[$a][$b][2];
				}
			}
		}
	}
}

//toon pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Planning</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 1220px;
			margin-top: 0px;
			background-color: #FFF;
		}

		.black {
			font-size: 16px;
			color: #000;
		}

		.button:hover {
			border-color: #FFF;
		}

		.mooie-knop {
			width: 40px;
			height: 25px;
			font-size: 11px;
			background-color: #000000;
			color: white;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			text-align: center;
			line-height: 25px;
		}

		div.scroll {
			background-color: #FFF;
			width: 1200px;
			height: 550px;
			overflow: auto;
		}

		input.large {
			width: 20px;
			height: 20px;
		}

		input.larger {
			width: 30px;
			height: 30px;
		}
	</style>
	<script>
		function printDiv(divName) {
			const content = document.getElementById(divName).innerHTML;
			const printWindow = window.open('', '', 'width=800,height=600');

			printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { border-collapse: collapse; width: auto; margin: auto; }
                    td, th { border: 1px solid #000; padding: 4px; }
                    td[align="center"] { text-align: center; }
					td[align="right"]  { text-align: right; }
					td[align="left"]   { text-align: left; }
                    img { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>
                ${content}
            </body>
        </html>
		`);
			printWindow.document.close();

			// Wacht tot alles geladen is, dan pas printen
			printWindow.onload = function() {
				printWindow.focus();
				printWindow.print();
				printWindow.close();
			};
		}
	</script>
</head>

<body>
	<table width="1210" border="0">
		<tr>
			<td colspan="2" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Org_naam"); ?></strong></td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Dagdeel-Planning</strong></td>
		</tr>
		<tr>
			<td align="left" colspan="2">
				<div class="scroll">
					<table width="1180" border="1">
						<tr>
							<td colspan="2" align="center" class="grootzwart"><strong><?php print("$Comp_naam, periode $Periode_keuze"); ?></strong></td>
						</tr>
						<tr>
							<td width="510" align="center" class="grootzwart">Voorgestelde partijen</td>
							<td width="660" align="center" class="grootzwart">
								<?php
								if ($bVastAantalBeurten == FALSE) {
								?>
									Kies partij en vink tafelnummer(s) aan om te koppelen aan de scoreborden
								<?php
								} else {
								?>
									Gebruik scoreborden niet mogelijk
								<?php
								}
								?>
							</td>
						</tr>
						<tr>
							<td valign="top">
								<div id="printableArea">
									<table width="510" border="1">
										<tr>
											<td height="30" width="35" align="center" class="black"><strong>Rn</strong></td>
											<td width="220" class="black"><strong>Speler A</strong></td>
											<td width="20" align="center" class="black"><strong>-</strong></td>
											<td width="220" class="black"><strong>Speler B</strong></td>
										</tr>
										<?php
										for ($a = 1; $a < $Aantal_ronden + 1; $a++) {
											if (isset($Partijen_def[$a])) {
												$Aantal_partijen = count($Partijen_def[$a]);
											} else {
												$Aantal_partijen = 0;
											}

											if ($Aantal_partijen > 0) {
												for ($b = 1; $b < $Aantal_partijen + 1; $b++) {
													$Nr_1 = $Partijen_def[$a][$b][1];
													$Naam_1 = fun_ledennaam($Nr_1, $Org_nr, $Path);
													$Nr_2 = $Partijen_def[$a][$b][2];
													$Naam_2 = fun_ledennaam($Nr_2, $Org_nr, $Path);

										?>
													<tr>
														<td height="30" align="center" class="black"><?php print("$a"); ?></td>
														<td align="left" class="black"><?php print("$Naam_1"); ?></td>
														<td align="center" class="black">-</td>
														<td align="left" class="black"><?php print("$Naam_2"); ?></td>
													</tr>
											<?php
												}	//end for per partij
											}	//end if #part > 0
										}	//end for per ronde

										//niet ingedeelde spelers melden
										if ($Aantal_nietingedeeld > 0) {
											?>
											<tr>
												<td colspan="4" align="center" bgcolor="#333333">
													Geselecteerde spelers die niet ingedeeld konden worden
												</td>
											</tr>
											<?php
											for ($a = 1; $a < $Aantal_nietingedeeld + 1; $a++) {
												$Naam_not = $Spelers_nietingedeeld[$a]['naam'];
												$Ronde_not = $Spelers_nietingedeeld[$a]['ronde'];
											?>
												<tr>
													<td colspan="4" align="center" class="black">
														<?php print("$Naam_not in ronde $Ronde_not"); ?>
													</td>
												</tr>
										<?php
											}
										}
										?>
										<tr>
											<td colspan="4" align="center">
												<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#000; color:#FFF;"
													onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
											</td>
										</tr>
									</table>
								</div>
							</td>

							<td width="660" valign="top">
								<?php
								if ($bVastAantalBeurten == FALSE) {
								?>
									<form name="koppelen" method="post" action="Planning_03.php">
										<table width="660" border="1">
											<tr>
												<td height="30" width="95" align="center" class="black">
													<button type="button" class="mooie-knop" onClick="selectKolom(true)">Aan</button>
													<button type="button" class="mooie-knop" onClick="selectKolom(false)">Uit</button>
												</td>
												<?php
												for ($a = 1; $a < 13; $a++) {
													if ($a <= $Aantal_tafels) {
												?>
														<td height="30" width="30" align="center" class="black"><?php print("$a"); ?> </td>
														<?php
													} else {
														//bepaal colspan rest
														if ($a < 13) {
															$Rest = 13 - $a;
															if ($Rest == 1) {
														?>
																<td height="30" width="30" align="center" class="black">&nbsp;</td>
															<?php
															} else {
															?>
																<td height="30" colspan="<?php print("$Rest"); ?>" align="center" class="black">&nbsp;</td>
												<?php
															}
															break;
														}
													}
												}
												?>
												<td width="100" height="30" align="center" class="black">Alle tafels</td>
											</tr>
											<?php
											$form_teller = 0;
											for ($a = 1; $a < $Aantal_ronden + 1; $a++) {
												if (isset($Partijen_def[$a])) {
													$Aantal_partijen = count($Partijen_def[$a]);
												} else {
													$Aantal_partijen = 0;
												}

												if ($Aantal_partijen > 0) {
													for ($b = 1; $b < $Aantal_partijen + 1; $b++) {
														$Nr_1 = $Partijen_def[$a][$b][1];
														$Nr_2 = $Partijen_def[$a][$b][2];
														$Uitslag_code = fun_maakcode($Periode_keuze, $Nr_1, $Nr_2);

														if (fun_bestaatpartij($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path) == FALSE) {
															$form_teller++;
															$Nm_cb = ($form_teller < 10) ? "Part_0$form_teller" : "Part_$form_teller";
											?>
															<tr>
																<td height="30" align="center" class="black">
																	<input type="checkbox" class="partij-selectie" name="<?= $Nm_cb ?>" value="<?php print("$Uitslag_code"); ?>">
																</td>
																<?php
																for ($taf = 1; $taf < 13; $taf++) {
																	if ($taf <= $Aantal_tafels) {
																		if ($taf < 10) {
																			if ($form_teller < 10) {
																				$Id_box = "0" . $form_teller . "_" . "tafel_0" . $taf;		//voor id
																			} else {
																				$Id_box = $form_teller . "_" . "tafel_0" . $taf;		//voor id
																			}
																		} else {
																			if ($form_teller < 10) {
																				$Id_box = "0" . $form_teller . "_" . "tafel_" . $taf;		//voor id
																			} else {
																				$Id_box = $form_teller . "_" . "tafel_" . $taf;		//voor id
																			}
																		}
																?>
																		<td height="30" align="center" class="black">
																			<input type="checkbox" id="<?php print("$Id_box"); ?>" name="<?php print("$Id_box"); ?>" value="<?php print("$taf"); ?>">
																		</td>
																		<?php
																	} else {
																		//bepaal colspan rest
																		if ($taf < 13) {
																			$Rest = 13 - $taf;
																			if ($Rest == 1) {
																		?>
																				<td height="30" width="30" align="center" class="black">&nbsp;</td>
																			<?php
																			} else {
																			?>
																				<td width="396" colspan="<?php print("$Rest"); ?>" align="center" class="black">&nbsp;</td>
																<?php
																			}
																			break;
																		}
																	}	//end if < aantal_taf
																}	//end for per tafel

																$ft = str_pad($form_teller, 2, "0", STR_PAD_LEFT);
																?>
																<td height="30" width="95" align="center" class="black">
																	<button type="button" class="mooie-knop" onClick="selectTafels('<?= $ft ?>', true)">Aan</button>
																	<button type="button" class="mooie-knop" onClick="selectTafels('<?= $ft ?>', false)">Uit</button>
																</td>
															</tr>
														<?php
														} else {
															//partij bestaat
														?>
															<tr>
																<td height="30" align="center" class="black">
																	<img src="../Figuren/Chain_groen.JPG" width="70" height="25" alt="Gekoppeld">
																</td>
																<?php
																//bepaal tafelstring
																$Taf_string = fun_geeftafelstring($Org_nr, $Comp_nr, $Periode_keuze, $Uitslag_code, $Path);

																for ($taf = 1; $taf < 13; $taf++) {
																	if ($taf <= $Aantal_tafels) {
																		//toon gekozen tafel
																		if (fun_tafel_nummers($Taf_string, $Aantal_tafels, $taf, 2)) {
																?>
																			<td height="30" align="center" class="black"><?php print("$taf"); ?></td>
																		<?php
																		} else {
																		?>
																			<td height="30" align="center" class="black">&nbsp;</td>
																			<?php
																		}
																	} else {
																		//bepaal colspan rest
																		if ($taf < 13) {
																			$Rest = 13 - $taf;
																			if ($Rest == 1) {
																			?>
																				<td height="30" width="30" align="center" class="black">&nbsp;</td>
																			<?php
																			} else {
																			?>
																				<td height="30" width="396" colspan="<?php print("$Rest"); ?>" align="center" class="black">&nbsp;</td>
																<?php
																			}
																			break;
																		}
																	}	//end if < aantal_taf
																}	//end for per tafel
																?>
																<td height="30" align="center" class="black">&nbsp;</td>
															</tr>
											<?php
														}	//end if bestaat
													}	//end for per partij
												}	//end if aantal-part > 0
											}	//end aantal ronden
											?>
											<tr>
												<td colspan="15" align="center">
													<button type="submit" style="width:150px; height:40px; background-color:#000; color:#FFF;"
														class="submit-button" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">Koppelen</button>
													<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
													<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
													<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
													<input type="hidden" id="str_var" name="str_var" value="<?php print base64_encode(serialize($Partijen_def)); ?>" />
												</td>
											</tr>
										</table>
									</form>
								<?php
								}	//end if $bVastAantalBeurten == FALSE
								?>
							</td>
						</tr>
					</table>
				</div>
			</td>
		</tr>
	</table>
	<form name="cancel" method="post" action="Matrix.php">
		<table width="1200" border="0">
			<tr>
				<td width="245" align="center" height="45" bgcolor="#006600">
					<input type="submit" style="width:150px; height:40px; background-color:#CCC; color:#000;" class="submit-button" value="Cancel"
						title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
				</td>
				<td width="245" align="center" bgcolor="#006600">
					<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:24px; font-weight:bold;"
						name="help4" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_planning2.php','Help','width=620,height=600,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
				</td>
				<td width="245" align="center" bgcolor="#006600">
					Scroll zo nodig naar beneden voor de knoppen "Printen" en "Koppelen"
				</td>
				<td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
	<script>
		function selectTafels(formTeller, aan) {
			const selector = `input[type="checkbox"][id^='${formTeller}_tafel_']`;
			document.querySelectorAll(selector).forEach(cb => cb.checked = aan);
		}

		function selectKolom(aan) {
			document.querySelectorAll('input[type="checkbox"].partij-selectie').forEach(cb => cb.checked = aan);
		}
	</script>
</body>

</html>