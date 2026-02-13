<?php
//© Hans Eekels, versie 05-12-2025
//Uitslag verwijderen; controle
//fun_punten aangepast
//Kop aangepast
//Speeldatum toegevoegd
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(5) { 
["periode_keuze"]=> string(1) "1" 
["speler_A"]=> string(1) "1" 
["speler_B"]=> string(1) "2" 
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
  $Comp_naam = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
  if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['speler_A'])) {
  $bAkkoord = FALSE;
} else {
  $Speler_A = intval($_POST['speler_A']);
  if ($Speler_A > 0) {
    if (filter_var($Speler_A, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  } else {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['speler_B'])) {
  $bAkkoord = FALSE;
} else {
  $Speler_B = intval($_POST['speler_B']);
  if ($Speler_B > 0) {
    if (filter_var($Speler_B, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  } else {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['periode_keuze'])) {
  $bAkkoord = FALSE;
} else {
  $Periode_keuze = intval($_POST['periode_keuze']);
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

//test op gelijke spelers
$bKan = TRUE;   //wordt FALSE bij 2 x zelfde speler of nog geen uitslag 
$error_message = "";

//zelfde spelers ?
if ($Speler_A === $Speler_B) {
  $bKan = FALSE;
  $error_message .= "U heeft 2 keer dezelfde speler geselecteerd !<br>U keert terug naar de pagina.<br>";
}

if ($bKan == TRUE) {
  //uitslag ophalen en juiste speler_nummers toekennen
  try {
    $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
    if (!$dbh) {
      throw new Exception(mysqli_connect_error());
    }
    mysqli_set_charset($dbh, "utf8");

    //Uitslag
    $sql = "SELECT * FROM bj_uitslagen WHERE 
		org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND ((sp_1_nr = '$Speler_A' AND sp_2_nr = '$Speler_B') OR (sp_1_nr = '$Speler_B' AND sp_2_nr = '$Speler_A'))";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }

    if (mysqli_num_rows($res) > 0) {
      while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
        //spelers kunnen in de uitslag andersom staan dan op basis van de ingevoerde 2 spelers
        //De uitslag wordt getoond als opgeslagen in de tabel bj_uitslagen
			$Hulp_dat = $resultaat['speeldatum'];
		$Speeldatum = fun_wisseldatum($Hulp_dat);
        $Sp1 = $resultaat['sp_1_nr'];
        $Speler_A_naam = fun_spelersnaam_competitie($Sp1, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);
        $Sp2 = $resultaat['sp_2_nr'];
        $Speler_B_naam = fun_spelersnaam_competitie($Sp2, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);

        $Car_1 = $resultaat['sp_1_cargem'];
        $Car_2 = $resultaat['sp_2_cargem'];
        $Car_1_temaken = $resultaat['sp_1_cartem'];
        $Car_2_temaken = $resultaat['sp_2_cartem'];
        $Brt = $resultaat['brt'];
        $Hs_1 = $resultaat['sp_1_hs'];
        $Hs_2 = $resultaat['sp_2_hs'];
        $Punten_1 = $resultaat['sp_1_punt'];
        $Punten_2 = $resultaat['sp_2_punt'];
        $Uitslag_code = $resultaat['uitslag_code'];
      }
      $error_message = "Deze partij is gespeeld.";
    } else {
      //nu kijken naar aangemaakte partij
      $sql = "SELECT * FROM bj_partijen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' 
			AND periode = '$Periode_keuze' AND ((nummer_A = '$Speler_A' AND nummer_B = '$Speler_B') OR (nummer_A = '$Speler_B' AND nummer_B = '$Speler_A'))";

      $res = mysqli_query($dbh, $sql);
      if (!$res) {
        throw new Exception(mysqli_error($dbh));
      }
      if (mysqli_num_rows($res) > 0) {
        while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
          //spelers kunnen in de uitslag andersom staan dan op basis van de ingevoerde 2 spelers
          //De uitslag wordt getoond als opgeslagen in de tabel bj_partijen
          $Sp1 = $resultaat['nummer_A'];
          $Speler_A_naam = fun_spelersnaam_competitie($Sp1, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);
          $Sp2 = $resultaat['nummer_B'];
          $Speler_B_naam = fun_spelersnaam_competitie($Sp2, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);

          $Car_1 = 0;
          $Car_2 = 0;
          $Car_1_temaken = $resultaat['cartem_A'];
          $Car_2_temaken = $resultaat['cartem_B'];
          $Brt = 0;
          $Hs_1 = 0;
          $Hs_2 = 0;
          $Punten_1 = 0;
          $Punten_2 = 0;
          $Uitslag_code = $resultaat['uitslag_code'];
        }
        $error_message = "Deze partij is aangemaakt maar niet gespeeld !";
      } else {
        $bKan = FALSE;
        $error_message .= "De gekozen spelers hebben in de gekozen periode niet tegen elkaar gespeeld !<br>U keert terug naar de pagina.<br>";
      }
    }

    //close connection
    mysqli_close($dbh);
  } catch (Exception $e) {
    echo $e->getMessage();
  }
}

if ($bKan == FALSE) {
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
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
          <form name="terug" method="post" action="Competitie_beheer.php">
            <input type="submit" class="submit-button" value="Terug naar beheer" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
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
//moyenne en punten uitrekenen
if ($Brt > 0) {
  $Moy_1 = number_format($Car_1 / $Brt, 3);
  $Moy_2 = number_format($Car_2 / $Brt, 3);
} else {
  $Moy_1 = 0;
  $Moy_2 = 0;
  $Punten_1 = 0;
  $Punten_2 = 0;
}

//pagina check
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Partij controleren</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 600px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="uitslag" method="post" action="Uitslag_delete04.php">
    <table width="600" border="0">
      <tr>
        <td width="220" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="4" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Comp_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="77" colspan="3" align="center" valign="middle" bgcolor="#FF0000" class="grootwit">
          <h2>Wilt u deze partij verwijderen ?</h2>
          <?php print("Speeldatum: $Speeldatum in Periode: $Periode_keuze<br>$error_message"); ?>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Speler_A_naam"); ?></strong></td>
        <td align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Speler_B_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Car gemaakt:&nbsp;<?php print("$Car_1"); ?></td>
        <td align="center" width="298" bgcolor="#009900" class="grootwit">Car gemaakt:&nbsp;<?php print("$Car_2"); ?></td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Beurten:&nbsp;<?php print("$Brt"); ?> </td>
        <td align="center" bgcolor="#009900">&nbsp;</td>
      </tr>

      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">HS:&nbsp;<?php print("$Hs_1"); ?> </td>
        <td align="center" bgcolor="#009900" class="grootwit">HS:&nbsp;<?php print("$Hs_2"); ?></td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Moyenne:&nbsp;<?php print("$Moy_1"); ?></td>
        <td align="center" bgcolor="#009900" class="grootwit">Moyenne:&nbsp;<?php print("$Moy_2"); ?></td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Punten:&nbsp;<?php print("$Punten_1"); ?></td>
        <td align="center" bgcolor="#009900" class="grootwit">Punten:&nbsp;<?php print("$Punten_2"); ?></td>
      </tr>
      <tr>
        <td height="40" colspan="3" align="center" valign="middle" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Verwijderen" style="width:150px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            title="Partij verwijderen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="uitslag_code" value="<?php print("$Uitslag_code"); ?>">
          <input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <table width="600" border="0">
    <tr>
      <td width="297" height="40" align="left" bgcolor="#009900">&nbsp;
        <input type="button" class="submit-button" style="width:150px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
          value="Terug" title="Terug naar invoer" onClick="history.go(-1)" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
      </td>
      <td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>