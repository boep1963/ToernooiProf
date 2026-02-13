<?php
//© Hans Eekels, versie 10-11-2025
//Tablet keuze tafel
//alleen tafels kiezen met soort=2 uit bj_bediening

/*
var_dump($_POST) geeft:
array(2) { ["toernooi_nr"]=> string(1) "1" ["user_code"]=> string(10) "1024_AHS@#" }
*/
require_once('../../../../../data/connectie_toernooiprof.php');
$Path = '../../../../../data/connectie_toernooiprof.php';
require_once('../../../ToernooiProf/PHP/Functies_toernooi.php');

$Copy = Date("Y");

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

if (isset($_POST['user_code'])) {
	$Code = $_POST['user_code'];
	if (strlen($Code) != 10) {
		$bAkkoord = FALSE;
	} else {
		$Gebruiker_naam = fun_testgebruiker($Code, $Path);
		if ($Gebruiker_naam == '9999') {
			$bAkkoord = FALSE;
		} else {
			$Gebruiker_nr = substr($Code, 0, 4);
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = $_POST['toernooi_nr'];
	$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if ($bAkkoord == FALSE) {
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ToernooiProf</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ToernooiProf" />
		<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
		<style type="text/css">
			body {
				width: 500px;
				background-color: #000;
				margin-top: 100px;
				margin-left: auto;
				margin-right: auto;
				font-family: Verdana, Geneva, sans-serif;
				font-size: 16px;
				color: #FFF;
			}

			h1 {
				font-size: 18px;
				color: #FFF;
			}

			.button:hover {
				border-color: #FFF;
			}
		</style>
		<script>
			function mouseInBut(event) {
				var button = event.target || event.srcElement;
				button.style.borderColor = "#F00";
			}

			function mouseOutBut(event) {
				var button = event.target || event.srcElement;
				button.style.borderColor = "transparent";
			}
		</script>
	</head>

	<body>
		<table width="500" border="0">
			<tr>
				<td align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print($error_message); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" align="center" valign="middle" bgcolor="#003300">
					<form name="cancel" method="post" action="Tablet_inloggen.php">
						<input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Terug naar inloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					</form>
				</td>
			</tr>
			<tr>
				<td height="20" align="right" bgcolor="#003300">&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
$Aantal_tafels = fun_aantaltafels($Code, $Path);

//pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>ToernooiProf</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ToernooiProf" />
	<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
	<?php
	if ($Gebruiker_nr == 1024) {
		echo '<link rel="stylesheet" href="Media_1024.css">';
	} else {
		echo '<link rel="stylesheet" href="Media.css">';
	}
	?>
	<script>
		function mouseInBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "#F00";
		}

		function mouseOutBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "transparent";
		}
	</script>
</head>

<body>
	<form name="partijen" method="post" action="Tablet_toon_tafel.php">
		<table style="width:100%;" border="0">
			<tr>
				<td colspan="4" align="center" valign="middle" bgcolor="#003300">
					<h1>Kies Tafel</h1>
					<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
			<tr>
				<td colspan="4" align="center" valign="middle" bgcolor="#003300">
					<h2><?php print("$Toernooi_naam"); ?></h2>
				</td>
			</tr>
			<tr>
				<?php
				if (fun_soorttafel($Gebruiker_nr, 1, $Path) == 2) {
				?>
					<td align="center">
						<button type="submit" name="tafel_01" class="tel-button" style="background-color:#FF0; color:#000;"
							onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
							title="Kies tafel nummer 1">1</button>
					</td>
				<?php
				} else {
				?>
					<td align="center">&nbsp;</td>
					<?php
				}

				if ($Aantal_tafels > 1) {
					if (fun_soorttafel($Gebruiker_nr, 2, $Path) == 2) {
					?>
						<td align="center">
							<button type="submit" name="tafel_02" class="tel-button" style="background-color:#FF0; color:#000;"
								onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
								title="Kies tafel nummer 2">2</button>
						</td>
					<?php
					} else {
					?>
						<td align="center">&nbsp;</td>
					<?php
					}
				} else {
					?>
					<td align="center">&nbsp;</td>
					<?php
				}

				if ($Aantal_tafels > 2) {
					if (fun_soorttafel($Gebruiker_nr, 3, $Path) == 2) {
					?>
						<td align="center">
							<button type="submit" name="tafel_03" class="tel-button" style="background-color:#FF0; color:#000;"
								onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
								title="Kies tafel nummer 3">3</button>
						</td>
					<?php
					} else {
					?>
						<td align="center">&nbsp;</td>
					<?php
					}
				} else {
					?>
					<td align="center">&nbsp;</td>
					<?php
				}

				if ($Aantal_tafels > 3) {
					if (fun_soorttafel($Gebruiker_nr, 4, $Path) == 2) {
					?>
						<td align="center">
							<button type="submit" name="tafel_04" class="tel-button" style="background-color:#FF0; color:#000;"
								onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
								title="Kies tafel nummer 4">4</button>
						</td>
					<?php
					} else {
					?>
						<td align="center">&nbsp;</td>
					<?php
					}
				} else {
					?>
					<td align="center">&nbsp;</td>
				<?php
				}
				?>
			</tr>
			<?php
			if ($Aantal_tafels > 4) {
			?>
				<tr>
					<?php
					if (fun_soorttafel($Gebruiker_nr, 5, $Path) == 2) {
					?>
						<td align="center">
							<button type="submit" name="tafel_05" class="tel-button" style="background-color:#FF0; color:#000;"
								onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
								title="Kies tafel nummer 5">5</button>
						</td>
					<?php
					} else {
					?>
						<td align="center">&nbsp;</td>
						<?php
					}

					if ($Aantal_tafels > 5) {
						if (fun_soorttafel($Gebruiker_nr, 6, $Path) == 2) {
						?>
							<td align="center">
								<button type="submit" name="tafel_06" class="tel-button" style="background-color:#FF0; color:#000;"
									onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
									title="Kies tafel nummer 6">6</button>
							</td>
						<?php
						} else {
						?>
							<td align="center">&nbsp;</td>
						<?php
						}
					} else {
						?>
						<td align="center">&nbsp;</td>
						<?php
					}

					if ($Aantal_tafels > 6) {
						if (fun_soorttafel($Gebruiker_nr, 7, $Path) == 2) {
						?>
							<td align="center">
								<button type="submit" name="tafel_07" class="tel-button" style="background-color:#FF0; color:#000;"
									onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
									title="Kies tafel nummer 7">7</button>
							</td>
						<?php
						} else {
						?>
							<td align="center">&nbsp;</td>
						<?php
						}
					} else {
						?>
						<td align="center">&nbsp;</td>
						<?php
					}

					if ($Aantal_tafels > 7) {
						if (fun_soorttafel($Gebruiker_nr, 8, $Path) == 2) {
						?>
							<td align="center">
								<button type="submit" name="tafel_08" class="tel-button" style="background-color:#FF0; color:#000;"
									onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
									title="Kies tafel nummer 8">8</button>
							</td>
						<?php
						} else {
						?>
							<td align="center">&nbsp;</td>
						<?php
						}
					} else {
						?>
						<td align="center">&nbsp;</td>
					<?php
					}
					?>
				</tr>
			<?php
			}

			if ($Aantal_tafels > 8) {
			?>
				<tr>
					<?php
					if (fun_soorttafel($Gebruiker_nr, 9, $Path) == 2) {
					?>
						<td align="center">
							<button type="submit" name="tafel_09" class="tel-button" style="background-color:#FF0; color:#000;"
								onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
								title="Kies tafel nummer 9">9</button>
						</td>
					<?php
					} else {
					?>
						<td align="center">&nbsp;</td>
						<?php
					}

					if ($Aantal_tafels > 9) {
						if (fun_soorttafel($Gebruiker_nr, 10, $Path) == 2) {
						?>
							<td align="center">
								<button type="submit" name="tafel_10" class="tel-button" style="background-color:#FF0; color:#000;"
									onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
									title="Kies tafel nummer 10">10</button>
							</td>
						<?php
						} else {
						?>
							<td align="center">&nbsp;</td>
						<?php
						}
					} else {
						?>
						<td align="center">&nbsp;</td>
						<?php
					}

					if ($Aantal_tafels > 10) {
						if (fun_soorttafel($Gebruiker_nr, 11, $Path) == 2) {
						?>
							<td align="center">
								<button type="submit" name="tafel_11" class="tel-button" style="background-color:#FF0; color:#000;"
									onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
									title="Kies tafel nummer 11">11</button>
							</td>
						<?php
						} else {
						?>
							<td align="center">&nbsp;</td>
						<?php
						}
					} else {
						?>
						<td align="center">&nbsp;</td>
						<?php
					}

					if ($Aantal_tafels > 11) {
						if (fun_soorttafel($Gebruiker_nr, 12, $Path) == 2) {
						?>
							<td align="center">
								<button type="submit" name="tafel_12" class="tel-button" style="background-color:#FF0; color:#000;"
									onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
									title="Kies tafel nummer 12">12</button>
							</td>
						<?php
						} else {
						?>
							<td align="center">&nbsp;</td>
						<?php
						}
					} else {
						?>
						<td align="center">&nbsp;</td>
					<?php
					}
					?>
				</tr>
			<?php
			}
			?>
		</table>
	</form>
	<form name="cancel" method="post" action="Tablet_keuze_comp.php">
		<table style="width:100%;" border="0">
			<tr>
				<td align="left" bgcolor="#003300">
					<input type="submit" class="cancel-button" value="Terug" title="Terug naar keuze competitie"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
</body>

</html>