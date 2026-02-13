<?php
//© Hans Eekels, versie 07-12-2025
//Beheersscherm competitie
//extra knop moy doorkoppelen toegevoegd, zichtbaar bij uislagen
//easter egg toegevoegd
//vast aantal beurten toegevoegd, nl geen scoreborden (voorlopig)
//comp gegevens toegevoegd
//Kop gewijzigd
//Knop Nieuwe periode ongedaan maken
//Ov uitslagen
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(2) { 
["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" }
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

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

if (count($_POST) != 2) {
	$bAkkoord = FALSE;
}
/*
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
*/
//verder
//Vast aantal beurten ?
$Brt_sys = fun_vastaantalbeurten($Org_nr, $Comp_nr, $Path);
if ($Brt_sys == 0) {
	$bVastAantalBeurten = FALSE;
} else {
	$bVastAantalBeurten = TRUE;
}

//Naam, datum, discipline en periode ophalen
//verder: aantal gekoppelde spelers, aantal uitslagen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//Data
	$sql = "SELECT * FROM bj_competities WHERE comp_nr = '$Comp_nr' AND org_nummer = '$Org_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Naam = $resultaat['comp_naam'];
		$Comp_datum = $resultaat['comp_datum'];
		$Comp_naam = $Naam . " (" . $Comp_datum . ")";
		$Periode = $resultaat['periode'];
		$Dis = $resultaat['discipline'];
		$Discipline = fun_naamdiscipline($Dis);
	}

	//aantal spelers
	$sql = "SELECT * FROM bj_spelers_comp WHERE spc_competitie = '$Comp_nr' AND spc_org = '$Org_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$bSpelers = FALSE;
	} else {
		$bSpelers = TRUE;
	}

	//aantal uitslagen algemeen
	$sql = "SELECT * FROM bj_uitslagen WHERE comp_nr = '$Comp_nr' AND org_nummer = '$Org_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$bUitslagen = FALSE;
	} else {
		$bUitslagen = TRUE;
	}
	
	//aantal uitslagen huidige periode voor terugdraaien
	$sql = "SELECT * FROM bj_uitslagen WHERE comp_nr = '$Comp_nr' AND org_nummer = '$Org_nr' AND periode = '$Periode'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$bTerugdraaien = TRUE;
	} else {
		$bTerugdraaien = FALSE;
	}
	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Beheersscherm</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 900px;
		}

		.puzzel-button {
			background-color: #090;
			color: #090;
			border: #090;
			border-style: hidden;
		}

		.button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<table width="900" border="0">
		<tr>
			<td width="220" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
			<td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
				ClubMatch Online<br>
				<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
			</td>
		</tr>
		<tr>
			<td colspan="4" align="center" valign="middle" bgcolor="#009900" class="kop">
			  <font style="font-size:32px; font-weight:bold;">Beheersscherm</font>
		  </td>
		</tr>
        <tr>
			<td height="35" align="center" bgcolor="#009900" class="grootwit">
			<strong>Huidige periode </strong></td>
		  <td colspan="2" align="center" bgcolor="#009900" class="grootwit">
			<strong>Naam competitie </strong></td>
		  <td align="center" bgcolor="#009900" class="grootwit">
			<strong>Discipline</strong></td>
	  </tr>
		<tr>
			<td height="35" align="center" bgcolor="#009900">
				<h2>Periode: <?php print("$Periode"); ?></h2>
			</td>
			<td colspan="2" align="center" bgcolor="#009900">
				<h2><?php print("$Comp_naam"); ?></h2>
			</td>
			<td align="center" bgcolor="#009900">
				<h2><?php print("$Discipline"); ?></h2>
			</td>
		</tr>
		<tr>
			<td width="220" align="center" bgcolor="#003300">
				<font style="font-size:24px; font-weight:bold;">Uitslagen</font>
			</td>
			<td width="220" align="center" bgcolor="#003300">
				<font style="font-size:24px; font-weight:bold;">Overzichten</font>
	    </td>
			<td width="220" align="center" bgcolor="#003300">
				<font style="font-size:24px; font-weight:bold;">Spelers</font>
	    </td>
			<td width="220" align="center" bgcolor="#003300">
				<font style="font-size:24px; font-weight:bold;">Diversen</font>
			</td>
		</tr>
		<tr>
			<td height="60" width="220" align="center" valign="middle" bgcolor="#00CC00">
				<?php
				if ($bSpelers == FALSE) {
					print("Uitslag invoeren<br>Nog niet mogelijk");
				} else {
				?>
					<form name="uitslag_1" method="post" action="Uitslag_invoeren.php">
						<input type="submit" class="submit-button" value="Uitslag invoeren" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Uitslag invoeren" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" width="220" bgcolor="#009900">
				<?php
				if ($bUitslagen == FALSE) {
					print("Stand opvragen<br>Nog niet mogelijk");
				} else {
				?>
					<form name="stand" method="post" action="Stand.php">
						<input type="submit" class="submit-button" value="Stand" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Stand" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" width="220" bgcolor="#00CC00">
				<form name="speler_1" method="post" action="Speler_koppelen.php">
					<input type="submit" class="submit-button" value="Speler koppelen" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
						title="Koppel speler aan deze competitie" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</form>
			</td>
			<td align="center" width="222" bgcolor="#009900">
				<?php
				if ($bVastAantalBeurten == FALSE) {
					if ($bSpelers == FALSE) {
						print("Partij beheer<br>Nog niet mogelijk");
					} else {
				?>
						<form name="partijen" method="post" action="../Partij_beheer/Invoer_matrix.php">
							<input type="submit" class="submit-button" value="Beheer partijen" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
								title="Beheer partijen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
							<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
							<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						</form>
				<?php
					}
				} else {
					print("Partij beheer<br>Niet mogelijk");
				}
				?>
			</td>
		</tr>
		<tr>
			<td height="60" align="center" valign="middle" bgcolor="#00CC00">
				<?php
				if ($bUitslagen == FALSE) {
					print("Uitslag wijzigen<br>Nog niet mogelijk");
				} else {
				?>
					<form name="uitslag_2" method="post" action="Uitslag_wijzigen.php">
						<input type="submit" class="submit-button" value="Uitslag wijzigen" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Uitslag wijzigen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" bgcolor="#009900">
				<?php
				if ($bSpelers == FALSE) {
					print("Matrix<br>Nog niet mogelijk");
				} else {
				?>
					<form name="matrix" method="post" action="Matrix.php">
						<input type="submit" class="submit-button" value="Matrix" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Matrix gespeelde partijen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" bgcolor="#00CC00">
				<?php
				if ($bSpelers == FALSE) {
					print("Speler verwijderen<br>Nog niet mogelijk");
				} else {
				?>
					<form name="speler_2" method="post" action="Speler_delete.php">
						<input type="submit" class="submit-button" value="Speler verwijderen" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Verwijder gekoppelde speler" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" bgcolor="#009900">
				<?php
				if ($bUitslagen == FALSE) {
					print("Moyennes doorkoppelen<br>Nog niet mogelijk");
				} else {
				?>
					<form name="moyennes" method="post" action="Doorkoppelen01.php">
						<input type="submit" class="submit-button" value="Moyennes doorkoppelen" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Behaalde moyennes doorkoppelen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
		</tr>
		<tr>
			<td height="60" align="center" valign="middle" bgcolor="#00CC00">
				<?php
				if ($bUitslagen == FALSE) {
					print("Uitslag verwijderen<br>Nog niet mogelijk");
				} else {
				?>
					<form name="uitslag_3" method="post" action="Uitslag_delete.php">
						<input type="submit" class="submit-button" value="Uitslag verwijderen" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Uitslag verwijderen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" bgcolor="#009900">
				<?php
				if ($bUitslagen == FALSE) {
					print("Overzicht speler<br>Nog niet mogelijk");
				} else {
				?>
					<form name="ovspeler" method="post" action="Ov_speler.php">
						<input type="submit" class="submit-button" value="Overzicht per speler" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Overzicht resultaten speler" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" bgcolor="#00CC00">
				<?php
				if ($bSpelers == FALSE) {
					print("Lijst met spelers<br>Nog niet mogelijk");
				} else {
				?>
					<form name="speler_3" method="post" action="Lijst_spelers.php">
						<input type="submit" class="submit-button" value="Lijst met spelers" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Lijst met gekoppelde spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
			<td align="center" bgcolor="#009900">
				<?php
				if ($bSpelers == FALSE || $Periode == 5) {
					print("Nieuwe periode aanmaken niet mogelijk");
				} else {
				?>
					<form name="periode_nieuw" method="post" action="Periode_nieuw.php">
						<input type="submit" class="submit-button" value="Nieuwe periode" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Nieuwe periode aanmaken" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
		</tr>
        <tr>
			<td height="60" align="center" valign="middle" bgcolor="#00CC00">
            <?php
				if ($bUitslagen == FALSE) {
					print("Overzicht uitslagen<br>nog niet mogelijk");
				} else {
				?>
					<form name="ov_uitslag" method="post" action="Ov_uitslagen01.php">
						<input type="submit" class="submit-button" value="Overzicht uitslagen" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
							title="Stand" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
            </td>
			<td align="center" bgcolor="#009900">&nbsp;</td>
            <td align="center" bgcolor="#00CC00">&nbsp;</td>
			<td align="center" bgcolor="#009900">
				<?php
				if ($Periode == 1 || $bTerugdraaien == FALSE) {
					print("Periode terugdraaien niet mogelijk; lees de help-tekst");
				} else {
				?>
					<form name="periode_terug" method="post" action="Periode_delete.php">
						<input type="submit" class="submit-button" value="Periode terugdraaien" style="width:200px; height:50px; background-color:#F00; color:#FFF; font-size:16px;"
							title="Periode terugdraaien" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				<?php
				}
				?>
			</td>
		</tr>
		<tr>
			<td height="45" align="center" valign="middle" bgcolor="#00CC00"><input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:18px; font-weight:bold;"
					name="help1" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
					onClick="window.open('../Help/Help_uitslagen.php','Help','width=520,height=520,scrollbars=no,toolbar=no,location=no'); return false" /></td>
			<td align="center" valign="middle" bgcolor="#009900">
				<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:18px; font-weight:bold;"
					name="help2" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
					onClick="window.open('../Help/Help_overzichten.php','Help','width=420,height=430,scrollbars=no,toolbar=no,location=no'); return false" />
			</td>
			<td align="center" valign="middle" bgcolor="#00CC00">
				<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:18px; font-weight:bold;"
					name="help3" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
					onClick="window.open('../Help/Help_spelers.php','Help','width=420,height=580,scrollbars=no,toolbar=no,location=no'); return false" />
			</td>
			<td align="center" valign="middle" bgcolor="#009900">
				<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:18px; font-weight:bold;"
					name="help4" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
					onClick="window.open('../Help/Help_diversen.php','Help','width=870,height=800,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
			</td>
		</tr>
	</table>
	<table width="900">
<tr>
			<td width="220" height="40" align="center" bgcolor="#009900">
				<form name="cancel" method="post" action="../ClubMatch_start.php">
					<input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
						title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="9">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</form>
			</td>
			<td width="220" align="center" bgcolor="#009900">
				<form name="data" method="post" action="Data_comp.php">
					<input type="submit" class="submit-button" value="Competitie-gegevens" style="width:150px; height:30px; background-color:#000; color:#FFF; font-size:12px;"
						title="Gegevens" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</form>
			</td>
			<td width="220" align="center" bgcolor="#009900">
				<input type="button" class="puzzel-button"
					style="width:210px; height:20px; background-color:#090; color:#090; border-color: #090;"
					ondblclick="window.open('Puzzel/Puzzel.html','Puzzel','width=630,height=730,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
			</td>
			<td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>