<?php
//© Hans Eekels, versie 02-12-2025
//avatars overzicht
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();
$Bestanden = array();

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

      $Spelers[$teller]['naam'] = $An;
      if (strlen($Tv) == 0) {
        $Spelers[$teller]['vn'] = $Vn;
      } else {
        $Spelers[$teller]['vn'] = $Vn . " " . $Tv;
      }

      $Spelers[$teller]['avatar'] = 0;  //wordt 1 bij bestaan avatar, anders de standaard avatar
    }
    $Aantal_spelers = $teller;
    $Aantal_rijen = ceil($Aantal_spelers / 8);
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//bestaande avatars
//bestanden ophalen
$directory = "../../Competitieborden/Scoreborden/Avatars/";
$teller = 0;
if (is_dir($directory)) {
  if ($dh = opendir($directory)) {
    while (($file = readdir($dh)) !== false) {
      // Controleer of het een bestand is en geen directory
      if (is_file($directory . "/" . $file)) {
        // Haal de extensie van het bestand op
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        // Controleer of de extensie .jpg is
        if ($extension == "jpg" || $extension == "JPG") {
          //toevoegen aan $Bestanden
          $Hulp_1 = $file;    //Avatar_1002_54.jpg
          if (substr($Hulp_1, 0, 7) == "Avatar_") {
            $Hulp_2 = substr($Hulp_1, 7, 4);  //gebr nr
            if (intval($Hulp_2) == $Org_nr) {
              $teller++;
              $Bestanden[$teller]['naam'] = $file;
              //nu nummer, is altijd totale lengte minus 16
              $Tot_lengte = strlen($file);
              $L_nr = $Tot_lengte - 16;
              $Bestanden[$teller]['nummer'] = substr($file, 12, $L_nr);
            }  //end if = gebruiker
          }  //end if Slide_
        }  //end if is jpg
      }  //end if is dir
    }
    closedir($dh);
  }  //end if open dir
}  //end if dir

$Aantal_avatars = $teller;

/*
var_dump($Bestanden) geeft:
array(2) { 
	[1]=> array(2) { ["naam"]=> string(17) "Avatar_1002_2.jpg" ["nummer"]=> string(1) "2" } 
	[2]=> array(2) { ["naam"]=> string(17) "Avatar_1002_1.jpg" ["nummer"]=> string(1) "1" } }
*/

//nu array spelers vullen met ja/nee avatar
if ($Aantal_spelers > 0 && $Aantal_avatars > 0) {
  for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
    $Nr_hulp = $Spelers[$a]['nummer'];

    for ($b = 1; $b < $Aantal_avatars + 1; $b++) {
      if ($Bestanden[$b]['nummer'] == $Nr_hulp) {
        $Spelers[$a]['avatar'] = 1;
        break;
      }
    }
  }
}

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Overzicht avatars</title>
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

    #example1 {
      border: 2px solid white;
      border-radius: 45px;
    }
  </style>
</head>

<body>
  <table width="800" border="0">
    <tr>
      <td width="210" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo"></td>
      <td colspan="2" align="center" valign="middle" bgcolor="#009900" class="kop">
        ClubMatch Online<br>
        <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
      </td>
    </tr>
    <tr>
      <td height="50" colspan="3" align="center" valign="middle" bgcolor="#009900">
        <h2>Overzicht avatars (foto's van spelers)</h2>
      </td>
    </tr>
    <tr>
      <td height="194" colspan="3" align="center" valign="top" bgcolor="#009900">
        <table width="800" bgcolor="#CCCCCC" border="1">
          <?php

          for ($a = 1; $a < $Aantal_rijen + 1; $a++) {
          ?>
            <tr>
              <?php
              $teller_start = ($a * 8) - 7;
              for ($b = 1; $b < 9; $b++) {
                $teller_tot = $teller_start + $b - 1;
                if (isset($Spelers[$teller_tot])) {
                  if ($Spelers[$teller_tot]['avatar'] == 1) {
                    $link = "../../Competitieborden/Scoreborden/Avatars/Avatar_" . $Org_nr . "_" .  $Spelers[$teller_tot]['nummer'] . ".jpg";
              ?>
                    <td width="95" height="95" align="center" valign="middle" bgcolor="#CCCCCC">
                      <div style="width:95px; height:95px;">
                        <img src="<?php print("$link"); ?>" id="example1" width="95" height="95">
                      </div>
                    </td>
                  <?php
                  } else {
                    $link = "../../Competitieborden/Scoreborden/Avatars/Avatar_000000.jpg";
                  ?>
                    <td width="95" height="95" align="center" valign="middle" bgcolor="#CCCCCC">
                      <div style="width:95px; height:95px;">
                        <img src="<?php print("$link"); ?>" id="example1" width="95" height="95">
                      </div>
                    </td>
              <?php
                  }
                } else {
                  print("");
                }
              }
              ?>
            </tr>
            <tr>
              <?php
              $teller_start = ($a * 8) - 7;
              for ($b = 1; $b < 9; $b++) {
                $teller_tot = $teller_start + $b - 1;
              ?>
                <td width="95" height="25" align="center" valign="middle" bgcolor="#000000">
                  <?php
                  if (isset($Spelers[$teller_tot])) {
                    print("{$Spelers[$teller_tot]['vn']} <br> {$Spelers[$teller_tot]['naam']}");
                  } else {
                    print("");
                  }
                  ?>
                </td>
              <?php
              }
              ?>
            </tr>
          <?php
          }
          ?>
        </table>
      </td>
    </tr>
  </table>
  <form name="cancel" method="post" action="avatars_start.php">
    <table width="800">
      <tr>
        <td width="210" height="35" align="left" bgcolor="#003300">
          <input type="submit" class="submit-button" style="background-color:#666; color:#FFF; width:150px; height:40px;"
            value="Cancel" title="Terug" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>