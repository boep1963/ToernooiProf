<?php
//© Hans Eekels, versie 02-12-2025
//Start beheer avatars uploaden, verwijderen, overzicht
//Kop gewijzigd
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();

/*
var_dump($_POST) geeft:
array(1) { ["user_code"]=> string(10) "1001_CHR@#" }
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

if (count($_POST) != 1) {
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

//Leden opvragen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //spelers
  $sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' ORDER BY spa_anaam";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $Aantal_spelers = 0;
  } else {
    $teller = 0;
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $teller++;
      $Spelers[$teller]['nummer'] = $resultaat['spa_nummer'];
      $Vn = $resultaat['spa_vnaam'];
      $Tv = $resultaat['spa_tv'];
      $An = $resultaat['spa_anaam'];

      if (strlen($Tv) == 0) {
        $Spelers[$teller]['naam'] = $Vn . " " . $An;
      } else {
        $Spelers[$teller]['naam'] = $Vn . " " . $Tv . " " . $An;
      }
    }
    $Aantal_spelers = $teller;
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

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Beheer avatars</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 800px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="800" border="0">
    <tr>
      <td width="280" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo"></td>
      <td colspan="2" align="center" valign="middle" bgcolor="#009900" class="kop">
        ClubMatch Online<br>
        <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
      </td>
    </tr>

    <tr>
      <td height="50" colspan="3" align="center" valign="middle" bgcolor="#009900">
        <h2>Beheer avatars (foto's van spelers) voor gebruik op scoreborden</h2>
      </td>
    </tr>
    <tr>
      <td height="166" colspan="3" align="center" valign="top" bgcolor="#009900">
        <div align="center" style="margin:10px; font-size:16px;">
          Bij gebruik van elektronische scoreborden (een monitor verbonden met internet) kan naast de naam van een spelers ook een avatar van die spelers getoond worden. Een avatar is een gewone of wat bewerkte foto van een speler. Het beheer van die avatars doet u hier.<br><br>
          Een avatar wordt getoond in een circel naast de naam en heeft een afmeting op het scherm van 200 x 200 pixels. Als u een foto upload, dan moet de hoogte en de breedte gelijk zijn en voor een mooi resultaat de afmetingen tussen de 200 x 200 pixels en 300 x 300 pixels. NB: als u geen foto upload, wordt automatisch de standaard avatar bij die speler getoond.</div>
      </td>
    </tr>
    <tr>
      <td width="280" height="30" align="center" bgcolor="#009900" class="grootwit"><strong>Maak uw keuze</strong></td>
      <td width="356" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Kies speler</strong></td>
      <td width="150" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Kies</strong></td>
    </tr>
    <form name="upload" method="post" action="avatar_uploaden.php">
      <tr>
        <td width="280" align="center" bgcolor="#009900" class="grootwit"><strong>Nieuwe avatar uploaden</strong></td>
        <td width="356" align="center" valign="middle" bgcolor="#009900">
          <?php
          if ($Aantal_spelers == 0) {
            print("Geen spelers gevonden");
          } else {
          ?>
            <select name="Leden" style="font-size:16px;">
              <?php
              for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
                $Num = $Spelers[$a]['nummer'];
                $Naam = $Spelers[$a]['naam'];
              ?>
                <option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
              <?php
              }
              ?>
            </select>
          <?php
          }
          ?>
        </td>
        <td width="150" height="55" align="center" valign="middle" bgcolor="#009900">
          <?php
          if ($Aantal_spelers > 0) {
          ?>
            <input type="submit" class="submit-button" value="Kies nieuw" title="Uploaden" style="width:130px; height:50px;" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)" />
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <?php
          } else {
            print("N.v.t.");
          }
          ?>
        </td>
      </tr>
    </form>
    <form name="delete" method="post" action="avatars_delete01.php">
      <tr>
        <td width="280" align="center" bgcolor="#009900" class="grootwit"><strong>Bestaande avatar verwijderen</strong></td>
        <td width="356" align="center" valign="middle" bgcolor="#009900">
          <?php
          if ($Aantal_spelers == 0) {
            print("Geen spelers gevonden");
          } else {
          ?>
            <select name="Leden" style="font-size:16px;">
              <?php
              for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
                $Num = $Spelers[$a]['nummer'];
                $Naam = $Spelers[$a]['naam'];
              ?>
                <option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
              <?php
              }
              ?>
            </select>
          <?php
          }
          ?>
        </td>
        <td width="150" height="55" align="center" valign="middle" bgcolor="#009900">
          <?php
          if ($Aantal_spelers > 0) {
          ?>
            <input type="submit" class="submit-button" value="Kies verwijder" title="Verwijderen" style="width:130px; height:50px;" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)" />
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <?php
          } else {
            print("N.v.t.");
          }
          ?>
        </td>
      </tr>
    </form>
    <tr>
      <td colspan="3" height="20" align="center" bgcolor="#009900">&nbsp;</td>
    </tr>
    <tr>
      <td width="280" height="55" align="center" bgcolor="#009900" class="grootwit"><strong>Overzicht avatars</strong></td>
      <td width="356" align="center" valign="middle" bgcolor="#009900">
        <div align="center" style="margin:5px; font-size:12px;">In dit overzicht worden alle door u ingevoerde avatars in klein formaat getoond; bedoeld om inzicht te geven in welke avatars wellicht nog toegevoegd, gewijzigd of verwijderd dienen te worden.</div>
      </td>
      <td width="150" align="center" valign="middle" bgcolor="#009900">
        <?php
        if ($Aantal_spelers > 0) {
        ?>
          <form name="overzicht" method="post" action="avatars_ovz.php">
            <input type="submit" class="submit-button" value="Kies overzicht" title="Overzicht" style="width:130px; height:50px;" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)" />
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          </form>
        <?php
        } else {
          print("N.v.t.");
        }
        ?>
      </td>
    </tr>
  </table>
  <form name="cancel" method="post" action="../ClubMatch_start.php">
    <table width="800">
      <tr>
        <td width="300" height="35" align="center" bgcolor="#003300">
          <input type="submit" class="submit-button" style="background-color:#666; color:#FFF; width:150px; height:40px;"
            value="Cancel" title="Terug naar beheer" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>