<?php
//© Hans Eekels, versie 17-12-2025
//Toernooi-gegevens
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');
$Copy = Date("Y");

//["t_nummer"]=> string(1) "1" 
//["user_code"]=> string(10) "1000_KYZ@#" }

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

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
      //logonaam
      $Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['t_nummer'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['t_nummer'];
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
}
/*
if ($bAkkoord == FALSE) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_toernooi.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
          <form name="partijen" method="post" action="../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}
*/

//data
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//Data
	$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Naam = $resultaat['t_naam'];
		$Datum = $resultaat['t_datum'];
		$Datum_start = $resultaat['datum_start'];
		$Datum_eind = $resultaat['datum_eind'];
		
		$Dis_nr = $resultaat['discipline'];
		$Discipline = fun_naamdiscipline($Dis_nr);
		
		$Car_sys = $resultaat['t_car_sys'];
		if ($Car_sys == 1)
		{
			$Car_tekst = "Aantal te maken caramboles op basis van moyenne-formule";
		}
		else
		{
			$Car_tekst = "Vrije invoer aantal te maken caramboles";
		}

		$Moy_form = $resultaat['t-moy_form'];
		if ($Moy_form == 1) {
			$Moy_formule = "Aantal te maken car = moy_speler x 20";
		}
		if ($Moy_form == 2) {
			$Moy_formule = "Aantal te maken car = moy_speler x 25";
		}
		if ($Moy_form == 3) {
			$Moy_formule = "Aantal te maken car = moy_speler x 30";
		}
		if ($Moy_form == 4) {
			$Moy_formule = "Aantal te maken car = moy_speler x 40";
		}
		if ($Moy_form == 5) {
			$Moy_formule = "Aantal te maken car = moy_speler x 50";
		}
		if ($Moy_form == 6) {
			$Moy_formule = "Aantal te maken car = moy_speler x 60";
		}
		if ($Moy_form == 0) {
			$Moy_formule = "Geen moyenne-formule";
		}

		$P_sys = $resultaat['t_punten_sys'];
		if (substr($P_sys, 0, 1) == 1) {
			$Punten_sys = "Systeem Winst = 2 punten, Remise = 1 punt en Verlies = 0 punten";
		}
		if (substr($P_sys, 0, 1) == 2) {
			$Punten_sys = "10 punten systeem, met 1 punt per 10% gemaakt aantal car naar beneden afgerond";
		}
		if (substr($P_sys, 0, 1) == 3) {
			$Punten_sys = "Belgisch systeem, met 1 punt per 10% gemaakt aantal car naar beneden afgerond en 2 extra punten bij winst en 1 extra punt bij remise";
		}
		
		$Min_car = $resultaat['t_min_car'];
		if ($Min_car == 0) {
			$Minimum_car = "Geen minimum";
		} else {
			$Minimum_car = "$Min_car caramboles";
		}

		$Max_brt = $resultaat['t_max_beurten'];
		if ($Max_brt == 0) {
			$Max_beurten = "Geen maximum";
		} else {
			$Max_beurten = $Max_brt;
		}

		$Openbaar = $resultaat['openbaar'];
		if ($Openbaar == 0)
		{
			$Tekst_openbaar = "Standen poules zijn niet zichtbaar op de website van SpecialSoftware";
		}
		else
		{
			$Tekst_openbaar = "Standen poules zijn zichtbaar op de website van SpecialSoftware";
		}
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//pagina
?>
<!DOCTYPE html>
<html>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Toernooi gegevens</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 1010px;
      margin-top: 0px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
	<form name="nieuw" method="post" action="Toernooi_Beheer.php">
		<table width="700" border="0">
			<tr>
				<td width="231" height="85" align="left" valign="middle" bgcolor="#006600"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
				<td align="center" valign="middle" bgcolor="#006600" class="kop">
					ToernooiProf Online<br>
					<font style="font-size:18px; font-weight:bold;"><?php print("$Gebruiker_naam"); ?></font>
				</td>
			</tr>
			<tr>
				<td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600" style="font-size:24px; font-weight:bold;">
					Toernooi-gegevens
				</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">
					&nbsp;Naam</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Naam"); ?></td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Datum</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Datum"); ?></td>
			</tr>
            <tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Start_datum</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Datum_start"); ?></td>
			</tr>
            <tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Eind_datum</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Datum_eind"); ?></td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Discipline</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Discipline"); ?></td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Moyenne-formule</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Moy_formule"); ?></td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Punten-systeem</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Punten_sys"); ?></td>
			</tr>
            <tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Min aantal te maken car</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Minimum_car"); ?></td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Max aantal beurten</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Max_beurten"); ?></td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Standen openbaar</td>
				<td align="left" bgcolor="#009900">&nbsp;<?php print("$Tekst_openbaar"); ?></td>
			</tr>
			<tr>
				<td colspan="2" height="50" align="center" bgcolor="#009900" class="groot">
					<input type="submit" class="submit-button" value="Terug" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
					title="Wijzig gegevens" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="2">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
</body>

</html>