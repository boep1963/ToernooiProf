<?php
//© Hans Eekels, versie 02-12-2025
//Bestaand lid wijzigen
//Kop gewijzigd
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Speler = array();

/*
var_dump($_POST) geeft:
array(2) { 
["Leden"]=> string(1) "1" 	//lid nummer
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

if (!isset($_POST['Leden'])) {
  $bAkkoord = FALSE;
} else {
  $Lid_nr = $_POST['Leden'];
  if (filter_var($Lid_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
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

//verder, data lid ophalen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //Vrij nummer opzoeken
  $sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' AND spa_nummer = '$Lid_nr'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Speler['vnaam'] = $resultaat['spa_vnaam'];
    $Speler['tv'] = $resultaat['spa_tv'];
    $Speler['anaam'] = $resultaat['spa_anaam'];
    $Speler['moy_lib'] = $resultaat['spa_moy_lib'];
    $Speler['moy_band'] = $resultaat['spa_moy_band'];
    $Speler['moy_3bkl'] = $resultaat['spa_moy_3bkl'];
    $Speler['moy_3bgr'] = $resultaat['spa_moy_3bgr'];
    $Speler['moy_kad'] = $resultaat['spa_moy_kad'];
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
  <title>Bestaand lid wijzigen</title>
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
  <form name="speler" method="post" action="Leden_wijzig03.php">
    <table width="600" border="0">
      <tr>
        <td width="200" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td height="80" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <strong>Bestaand lid wijzigen</strong><br>
          NB: aan een competitie in een bepaalde discipline (libre, bandstoten, driebanden of kader) kunnen alleen leden met moyenne in die discipline gekoppeld worden!
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Voornaam:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Voornaam" minlength="3" maxlength="25" size="15" title="Max 10 letters" required
            value="<?php print("{$Speler['vnaam']}"); ?>" tabindex="1" /> (max 10 letters)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Tussenvoegsel:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Tv" maxlength="8" size="15" title="Max 8 letters"
            value="<?php print("{$Speler['tv']}"); ?>" tabindex="2" /> (max 8 letters)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Achternaam:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Achternaam" minlength="3" maxlength="20" size="30" title="Max 20 letters" required
            value="<?php print("{$Speler['anaam']}"); ?>" tabindex="3" />
          (max 20 letters)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy libre:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_lib" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt"
            value="<?php print("{$Speler['moy_lib']}"); ?>" tabindex="4" />
          (gebruik de punt en 3 decimalen)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy bandstoten:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_band" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt"
            value="<?php print("{$Speler['moy_band']}"); ?>" tabindex="5" />
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy 3band klein:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_3bandkl" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt"
            value="<?php print("{$Speler['moy_3bkl']}"); ?>" tabindex="6" />
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy 3band groot:</strong></td>
        <td align="left" valign="middle" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_3bandgr" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt"
            value="<?php print("{$Speler['moy_3bgr']}"); ?>" tabindex="7" />
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy kader:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_kader" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt"
            value="<?php print("{$Speler['moy_kad']}"); ?>" tabindex="8" />
        </td>
      </tr>
      <tr>
        <td height="40" align="center" valign="middle" bgcolor="#009900">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="lid_nr" value="<?php print("$Lid_nr"); ?>">
        </td>
        <td align="center" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Opslaan" style="width:120px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            title="Gegevens opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="9">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="../ClubMatch_start.php">
    <table width="600">
      <tr>
        <td width="200" height="30" align="center" bgcolor="#009900">
          <input type="submit" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="10">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>