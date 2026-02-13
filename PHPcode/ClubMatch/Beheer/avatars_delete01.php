<?php
//© Hans Eekels, versie 02-12-2025
//avatars delete: toon avatar
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(2) { 
["Leden"]=> string(1) "1" 
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

if (isset($_POST['Leden'])) {
  $Speler_nr = $_POST['Leden'];
  if (filter_var($Speler_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  } else {
    $Naam_sp = fun_ledennaam($Speler_nr, $Org_nr, $Path);
  }
} else {
  $bAkkoord = FALSE;
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

//bestaande avatar?
$bGevonden = FALSE;
//bestand ophalen
$directory = "../../Competitieborden/Scoreborden/Avatars/";
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
              //nu nummer, is altijd totale lengte minus 16
              $Tot_lengte = strlen($file);
              $L_nr = $Tot_lengte - 16;
              if ($Speler_nr == substr($file, 12, $L_nr)) {
                $bGevonden = TRUE;
                break;
              }
            }  //end if = gebruiker
          }  //end if Slide_
        }  //end if is jpg
      }  //end if is dir
    }  //end while
    closedir($dh);
  }  //end if open dir
}  //end if dir

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Verwijder avatar</title>
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
      <td width="210" height="105" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo"></td>
      <td width="626" colspan="2" align="center" valign="middle" bgcolor="#009900" class="kop">
        ClubMatch Online<br>
        <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
      </td>
    </tr>
    <tr>
      <td height="50" colspan="3" align="center" valign="middle" bgcolor="#009900">
        <h2>Verwijder avatar van <?php print("$Naam_sp"); ?></h2>
      </td>
    </tr>
    <tr>
      <td width="170" height="95" align="center" valign="middle" bgcolor="#009900">
        <?php
        if ($bGevonden == TRUE) {
          $link = "../../Competitieborden/Scoreborden/Avatars/Avatar_" . $Org_nr . "_" .  $Speler_nr . ".jpg";
        ?>
          <div style="width:95px; height:95px;">
            <img src="<?php print("$link"); ?>" id="example1" width="95" height="95">
          </div>
        <?php
        } else {
          $link = "../../Competitieborden/Scoreborden/Avatars/Avatar_000000.jpg";
        ?>
          <div style="width:95px; height:95px;">
            <img src="<?php print("$link"); ?>" id="example1" width="95" height="95">
          </div>
        <?php
        }
        ?>
      </td>
      <td width="420" align="center" valign="middle" bgcolor="#009900" class="grootwit">
        <?php
        if ($bGevonden == TRUE) {
        ?>
          Klik op "Verwijderen" om deze avatar te verwijderen.
        <?php
        } else {
        ?>
          Geen avatar gevonden.
        <?php
        }
        ?>
      </td>
      <td width="200" align="center" valign="middle" bgcolor="#009900">
        <?php
        if ($bGevonden == TRUE) {
        ?>
          <form name="delete" method="post" action="avatars_delete02.php">
            <input type="submit" class="submit-button" style="background-color:#000; color:#FFF; width:150px; height:40px;"
              value="Verwijderen" title="Verwijderen" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
            <input type="hidden" name="speler_nr" value="<?php print("$Speler_nr"); ?>">
          </form>
        <?php
        } else {
          print("");
        }
        ?>
      </td>
    </tr>
  </table>
  <form name="cancel" method="post" action="avatars_start.php">
    <table width="800">
      <tr>
        <td width="300" height="35" align="left" bgcolor="#003300">
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