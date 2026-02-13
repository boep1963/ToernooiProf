<?php
//© Hans Eekels, versie 30-08-2025
//Invoer-matrix. Namen afkappen op 20 tekens
//Aangepast met 12 tafels en vrije keuze tafelnummer(s)
//Aangepast met Refresh knop
//aangepast min breedte van 15 spelers (iv met knoppen)
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

//var_dump($_POST) geeft: array(2) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }
$Copy = Date("Y");
$Datum = Date("d-m-Y");

$Spelers_h = array();
$Spelers_v = array();
$Uitslagen = array();
$Matrix = array();

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

/*
tijdelijk gebruikt
$Code = "1002_CRJ@#";
$Org_nr = '1002';
$Org_naam = fun_orgnaam($Org_nr, $Path);
$Logo_naam = "../Beheer/uploads/Logo_" . $Org_nr . ".jpg";
if (file_exists($Logo_naam) == FALSE) {
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
}
$Comp_nr = 1;
*/

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
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
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

//verder
if (isset($_POST['periode_keuze'])) {
	//tweede keer geladen
	$Periode_keuze = $_POST['periode_keuze'];
	$Aantal_perioden = fun_periode($Comp_nr, $Org_nr, $Path);
} else {
	//eerste keer geladen
	$Periode_keuze = fun_periode($Comp_nr, $Org_nr, $Path);
	$Aantal_perioden = $Periode_keuze;
}

$Naam_hulp = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
$Competitie_naam = $Naam_hulp . " [Periode: " . $Periode_keuze . "]";
$Aantal_tafels = fun_aantaltafels($Code, $Path);
//bepaal breedte bovenste tabel met tafels
$tab_breed = intval(200 + ($Aantal_tafels * 70));

//spelers
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//spelers
	$sql = "SELECT * FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$teller++;
		$Nr = $resultaat['spc_nummer'];
		$Spelers_h[$teller]['naam'] = substr(fun_spelersnaam_competitie($Nr, $Org_nr, $Comp_nr, $Periode_keuze, 1, $Path), 0, 20);	//horizontaal 
		$Spelers_h[$teller]['nummer'] = $Nr;
		$Spelers_v[$teller]['naam'] = substr(fun_spelersnaam_competitie($Nr, $Org_nr, $Comp_nr, $Periode_keuze, 1, $Path), 0, 20);	//vertikaal
		$Spelers_v[$teller]['nummer'] = $Nr;
	}
	$Aantal_spelers = $teller;

	//free result set
	mysqli_free_result($res);

	//sorteren
	sort($Spelers_h);	//key_start = 0
	sort($Spelers_v);	//key_start = 0

	//Matrix vullen met 0;
	for ($h = 0; $h < $Aantal_spelers; $h++) {
		for ($v = 0; $v < $Aantal_spelers; $v++) {
			$Matrix[$h][$v] = 0;		//hierna vullen met kleur of knop 
			//(0=beschikbaar, dus groene startknop, 1=aangemaakt, niet begonnen dus gele startknop, 2=al gespeeld of al begonnen: rood)
		}
	}

	//uitslagen
	$sql = "SELECT * FROM bj_uitslagen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0) {
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Speler_h = $resultaat['sp_1_nr'];
			$Speler_v = $resultaat['sp_2_nr'];
			$Kleur_h = 2;	//al gespeeld
			$Kleur_v = 2;	//al gespeeld

			//nu toekennen in matrix
			//speler_h
			for ($h = 0; $h < $Aantal_spelers; $h++) {
				if ($Spelers_h[$h]['nummer'] == $Speler_h) {
					//toekennen positie
					$Pos_h = $h;
					break;
				}
			}

			//speler_v
			for ($v = 0; $v < $Aantal_spelers; $v++) {
				if ($Spelers_v[$v]['nummer'] == $Speler_v) {
					//toekennen positie
					$Pos_v = $v;
					break;
				}
			}

			//matrix vullen
			//horizontaal
			$Matrix[$Pos_h][$Pos_v] = 2;
			//vertikaal
			$Matrix[$Pos_v][$Pos_h] = 2;
		}
	}
	//zijn er partijen aangemaak, dan 2 mogelijkheden
	//a)	wel aangemaakt, geen record in bj_uitslag_hulp => knop geel om te verwijderen => kleur = 1
	//b)	wel aangemaakt, ook record in bj_uitslag_hulp => rood en geen actie mogelijk => kleur = 2

	//zoek uitslag_codes in bj_partijen
	$sql = "SELECT uitslag_code FROM bj_partijen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0) {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Hulpje_1 = $resultaat['uitslag_code'];
			$Hulpje_2 = str_replace(" ", "", $Hulpje_1);


			$Codes_check[$teller]['code'] = $Hulpje_2;
			$Codes_check[$teller]['kleur'] = 1;								//kan hierna 2 worden als record in bj_uitslag_hulp of bj_uitslag_hulp_tablet bestaat
		}
		$Aantal_checks = $teller;

		//var_dump($Codes_check) als test: klopt

		for ($a = 1; $a < $Aantal_checks + 1; $a++) {
			$C_hulp_1 = $Codes_check[$a]['code'];
			$C_hulp_2 = fun_invertcode($C_hulp_1);

			//nu deze checken in bj_uitslag_hulp
			$sql = "SELECT * FROM bj_uitslag_hulp 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$C_hulp_1' OR uitslag_code = '$C_hulp_2') ORDER BY brt DESC limit 1";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			if (mysqli_num_rows($res) > 0) {
				$Codes_check[$a]['kleur'] = 2;
			}

			//nu deze checken in bj_uitslag_hulp_tablet
			//nu deze checken in bj_uitslag_hulp
			$sql = "SELECT * FROM bj_uitslag_hulp_tablet 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$C_hulp_1' OR uitslag_code = '$C_hulp_2') ORDER BY brt DESC limit 1";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			if (mysqli_num_rows($res) > 0) {
				$Codes_check[$a]['kleur'] = 2;
			}
		}	//end for 
	} else {
		$Aantal_checks = 0;
	}

	//Nu verwerken in de matrix
	if ($Aantal_checks > 0) {
		for ($a = 1; $a < $Aantal_checks + 1; $a++) {
			$Code_u = $Codes_check[$a]['code'];
			$Kleur = $Codes_check[$a]['kleur'];

			//bepaal spelersnummers uit $Code_u
			$Lengte = strlen($Code_u);
			$Pos_1 = strpos($Code_u, "_", 0);
			$Pos_2 = strrpos($Code_u, "_", 0);
			//speler 1 tussen 1e en 2e streepje
			$Speler_A = substr($Code_u, $Pos_1 + 1, $Pos_2 - $Pos_1 - 1);
			//speler 2 na 2e streepje tot eind string
			$Speler_B = substr($Code_u, $Pos_2 + 1, $Lengte - $Pos_2 - 1);

			//voorloopnullen weg
			if (substr($Speler_A, 0, 1) == "0") {
				$L_1 = strlen($Speler_A);
				$Speler_A = substr($Speler_A, 1, $L_1 - 1);
				if (substr($Speler_A, 0, 1) == "0") {
					$L_1 = strlen($Speler_A);
					$Speler_A = substr($Speler_A, 1, $L_1 - 1);
				}
			}
			if (substr($Speler_B, 0, 1) == "0") {
				$L_1 = strlen($Speler_B);
				$Speler_B = substr($Speler_B, 1, $L_1 - 1);
				if (substr($Speler_B, 0, 1) == "0") {
					$L_1 = strlen($Speler_B);
					$Speler_B = substr($Speler_B, 1, $L_1 - 1);
				}
			}

			//nu toekennen in matrix
			//speler_h
			for ($h = 0; $h < $Aantal_spelers; $h++) {
				if ($Spelers_h[$h]['nummer'] == $Speler_A) {
					//toekennen positie
					$Pos_h = $h;
					break;
				}
			}

			//speler_v
			for ($v = 0; $v < $Aantal_spelers; $v++) {
				if ($Spelers_v[$v]['nummer'] == $Speler_B) {
					//toekennen positie
					$Pos_v = $v;
					break;
				}
			}

			//matrix vullen
			//horizontaal
			$Matrix[$Pos_h][$Pos_v] = $Kleur;
			//vertikaal
			$Matrix[$Pos_v][$Pos_h] = $Kleur;
		}	//end for per check
	}	//end if #checks > 0

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//bepaal breedte en hoogte tabellen
//breedte is kolombreedten + extra nl aantal_kolommen * 6 + 4

$breed_form = 175 + ($Aantal_spelers * 36) + 10;
//toegevoegd minimale breedte obv 15 spelers = 175 + (15 * 36) + 10 = 725
if ($breed_form < 725) {
	$breed_form = 725;
}
$breed_tabel = 175 + ($Aantal_spelers * 36) + 10;
$breed_container = $breed_tabel + 20;
$hoog = ($Aantal_spelers * 24);

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Invoer-Matrix</title>
	<meta name="Keywords" content="Biljarten" />
	<meta name="Description" content="Biljartprogramma" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<style type="text/css">
		body,
		td,
		th {
			font-family: Verdana;
			font-size: 16px;
			color: #FFF;
		}

		.zwart {
			font-family: Verdana;
			font-size: 16px;
			color: #000;
		}

		.klein {
			font-family: Verdana;
			font-size: 10px;
			color: #FFF;
		}

		h1 {
			font-size: 24px;
		}

		h2 {
			font-size: 16px;
		}

		body {
			background-color: #000;
		}

		input[type=button] {
			height: 35px;
			width: 170px;
			background-color: #CCC;
			color: #000;
		}

		.submit-button:hover {
			border-color: #000;
		}

		.submit-button {
			border-color: #FFF;
			border: 2px solid transparent;
			cursor: pointer;
		}

		div.scroll {
			background-color: #FFF;
			width: auto;
			max-height: 350px;
			overflow: auto;
		}

		div.a {
			width: 30px;
			height: 175px;
			writing-mode: vertical-lr;
			display: inline-block;
			text-orientation: mixed;
		}
	</style>
	<script type="text/javascript">
		function myFunction() {
			location.reload(true);
		}

		function mouseIn(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "#000";
		}

		function mouseOut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "#FFF";
		}

		function mouseInBut(coor) {
			var nummers = coor.substring(4); // coor is bijvoorbeeld "Aan_6_22", dus nummers worden "6_22"
			var parts = nummers.split("_");
			var nr1 = parts[0];
			var nr2 = parts[1];

			// Vertikaal
			var Id_v = "NaamV_" + nr1;
			document.getElementById(Id_v).style.backgroundColor = "#000";
			document.getElementById(Id_v).style.color = "#FFF";

			// Horizontaal
			var Id_h = "NaamH_" + nr2;
			document.getElementById(Id_h).style.backgroundColor = "#000";
			document.getElementById(Id_h).style.color = "#FFF";
		}

		function mouseOutBut(coor) {
			var nummers = coor.substring(4); // coor is bijvoorbeeld "Aan_6_22", dus nummers worden "6_22"
			var parts = nummers.split("_");
			var nr1 = parts[0];
			var nr2 = parts[1];

			// Vertikaal
			var Id_v = "NaamV_" + nr1;
			document.getElementById(Id_v).style.backgroundColor = "#FFF";
			document.getElementById(Id_v).style.color = "#000";

			// Horizontaal
			var Id_h = "NaamH_" + nr2;
			document.getElementById(Id_h).style.backgroundColor = "#FFF";
			document.getElementById(Id_h).style.color = "#000";
		}
	</script>
</head>

<body>
	<form name="partijen" method="post" action="Partij_aanmaken.php">
		<table width="<?php print($breed_form); ?>" border="0" bgcolor="#FFFFFF" style="margin-left:auto; margin-right:auto;">
			<tr>
				<td height="20" align="center" bgcolor="#003300">
					<strong><?php print("$Competitie_naam"); ?></strong>
				</td>
			</tr>
			<tr>
				<td height="175">
					<table width="<?php echo $breed_container; ?>" border="1" bgcolor="#FFFFFF">
						<td width="200" height="30" align="left" bgcolor="#006600">Kies per partij tafelnr(s)</td>
						<?php
						for ($taf = 1; $taf < $Aantal_tafels + 1; $taf++) {
							$Naam_box = "tafel_" . $taf;
						?>
							<td width="70" align="center" valign="middle" bgcolor="#00FF00" class="zwart">
								<?php print("$taf"); ?><input type="checkbox" name="<?php print("$Naam_box"); ?>" value="<?php print("$taf"); ?>" checked>
							</td>
						<?php
						}
						?>
					</table>
					<table width="<?php print("$breed_tabel"); ?>" border="1">
						<tr>
							<td width="180" height="180" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
								<img src="../Figuren/Renvooi.jpg" width="175" height="130" alt="Matrix">
							</td>
							<?php
							for ($a = 0; $a < $Aantal_spelers; $a++) {
								$Naam = $Spelers_h[$a]['naam'];
								$Id_h = "NaamH_" . $a;
							?>
								<td width="175" height="30" align="left" valign="top" class="zwart">
									<div id="<?php echo $Id_h; ?>" class="a" style="background-color:#FFF; color:#000;">
										<?php print("$Naam"); ?>
									</div>
								</td>
							<?php
							}
							?>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td valign="top">
					<div class="scroll">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
						<table width="<?php print("$breed_tabel"); ?>" border="1">
							<?php
							for ($a = 0; $a < $Aantal_spelers; $a++) {
								$Naam = $Spelers_v[$a]['naam'];
								$Nummer_1 = $Spelers_v[$a]['nummer'];
								$Id_v = "NaamV_" . $a;
							?>
								<tr>
									<td width="170" height="30" align="left" valign="middle" class="zwart">
										<div id="<?php echo $Id_v; ?>" style="background-color:#FFF; color:#000; margin:0; padding:0;">
											<?php print("$Naam"); ?>
										</div>
									</td>
									<?php
									for ($b = 0; $b < $Aantal_spelers; $b++) {
										$Nummer_2 = $Spelers_h[$b]['nummer'];
										if ($a == $b) {
									?>
											<td width="30" align="center" valign="middle" bgcolor="#000000">&nbsp;</td>
											<?php
										} else {
											$Kleur = $Matrix[$a][$b];							//kleur is feitelijk de status van een eventuele partij tussen beide spelers
											$Naam_aan = "Aan_" . $Nummer_1 . "_" . $Nummer_2;
											$Naam_uit = "Uit_" . $Nummer_1 . "_" . $Nummer_2;
											$coor = "Aan_" . $a . "_" . $b;
											if ($Kleur == 0) {
											?>
												<td width="30" align="center" valign="middle" bgcolor="#FFFFFF">
													<input type="submit" class="submit-button" style="background-image:url(../Figuren/Aan.jpg); width:30px; height:30px;"
														name="<?php echo $Naam_aan; ?>" title="Partij aanmaken" value=""
														onMouseOver="mouseInBut('<?php echo $coor; ?>')" onMouseOut="mouseOutBut('<?php echo $coor; ?>')">
												</td>
											<?php
											}

											if ($Kleur == 1) {
											?>
												<td width="30" align="center" valign="middle" bgcolor="#FFFFFF">
													<input type="submit" class="submit-button" style="background-color:#FFD700; width:30px; height:30px;"
														name="<?php print("$Naam_uit"); ?>" title="Partij verwijderen" value=""
														onmouseover="mouseInBut('<?php echo $coor; ?>')" onMouseOut="mouseOutBut('<?php echo $coor; ?>')">
												</td>
											<?php
											}

											if ($Kleur == 2) {
											?>
												<td width="30" align="center" valign="middle" bgcolor="#F00">&nbsp;
												</td>
									<?php
											}
										}	//end if $a=$b 
									}	//end for $b
									?>
								</tr>
							<?php
							}	//end for $a
							?>
						</table>
					</div>
				</td>
			</tr>
		</table>
	</form>
	<form name="kies" method="post" action="Invoer_matrix.php">
		<table width="<?php print($breed_form); ?>" style="margin-left:auto; margin-right:auto;">
			<tr>
				<td width="404" bgcolor="#003300">Kies eventueel andere periode:
					<select name="periode_keuze">
						<?php
						for ($a = 1; $a < $Aantal_perioden + 1; $a++) {
							$Per_naam = "Periode_" . $a;
							if ($a == $Periode_keuze) {
						?>
								<option value="<?php print("$a"); ?>" selected><?php print("$Per_naam"); ?></option>
							<?php
							} else {
							?>
								<option value="<?php print("$a"); ?>"><?php print("$Per_naam"); ?></option>
						<?php
							}
						}
						?>
					</select>
					=>
				</td>
				<td width="300" align="center" bgcolor="#003300">
					&nbsp;<input type="submit" class="submit-button" value="Toon matrix in gekozen periode"
						title="Toon matrix in gekozen periode" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
				<td align="center" bgcolor="#003300">
					<input type="button" onClick="myFunction()" title="Refresh" value="Refresh" style="width:120px; height:25px; background-color:#FFF; color:#000;"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
			</tr>
		</table>
	</form>
	<form name="terug" method="post" action="../Competities/Competitie_beheer.php">
		<table width="<?php print($breed_form); ?>" style="margin-left:auto; margin-right:auto;">
			<tr>
				<td width="550" height="30" align="center" bgcolor="#003300">
					<input type="submit" class="submit-button" value="Terug naar beheer" title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
				<td align="center" bgcolor="#003300">
					<input type="button" class="submit-button" style="width:150px; height:25px; background-color:#F00; color:#FFF; font-size:16px; font-weight:bold;"
						name="help1" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_partijen.php','Help','width=620,height=600,scrollbars=no,toolbar=no,location=no'); return false" />
				</td>
			</tr>
		</table>
	</form>
</body>

</html>