<?php
//© Hans Eekels, 03-12-2025
//Kies optie
//	scorebord
//	Slideshow
//Logo refresh
require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('../ClubMatch/PHP/Functies_biljarten.php');

/*
var_dump($_POST) geeft:
array(2) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }
*/

$Copy = Date("Y");

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

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
      $Logo_naam = "../ClubMatch/Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../ClubMatch/Beheer/uploads/Logo_standaard.jpg";
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

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  $Logo_naam = "../ClubMatch/Beheer/uploads/Logo_standaard.jpg";

  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../ClubMatch/PHP/script_competitie.js" defer></script>
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
          <form name="cancel" method="post" action="../Start.php">
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
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Gebruik scoreborden</title>
  <meta name="Keywords" content="Biljarten, Competities, Hans Eekels" />
  <meta name="Description" content="ClubMatch Online" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../ClubMatch/PHP/script_competities.js" defer></script>
  <style type="text/css">
    body {
      width: 1800px;
    }

    .submit-button {
      border: 5px solid transparent;
      cursor: pointer;
    }

    .submit-button:hover {
      border-color: #F00;
    }

    .button:hover {
      border-color: #FFF;
    }

    h1 {
      font-size: 48px;
    }
  </style>
</head>

<body>
  <table width="1800" border="0">
    <tr>
      <td width="400" height="85" bgcolor="#FF6600">
        <img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="200" height="100" alt="Logo">
      </td>
      <td align="center" bgcolor="#FF6600">
        <h1><?php print("$Org_naam"); ?></h1>
      </td>
    </tr>
    <tr>
      <td height="80" colspan="2" align="center" valign="middle" bgcolor="#FF6600">
        <h1><?php print("$Comp_naam"); ?></h1>
      </td>
    </tr>
    <tr>
      <td height="100" align="center" valign="middle" bgcolor="#003300">
        <form name="borden" method="post" action="Scoreborden/Kies_tafel.php">
          <input type="submit" class="submit-button" style="width:300px; height:80px; background-color:#FF0; color:#000; font-size:48px; font-weight:bold;" value="Kies">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#003300">
        <h1>Beheer Partijen op scoreborden bij tafels</h1>
      </td>
    </tr>
    <tr>
      <td height="100" align="center" valign="middle" bgcolor="#003300">
        <form name="slideshow" method="post" action="Advertenties/Slide_show_start.php">
          <input type="submit" class="submit-button" style="width:300px; height:80px; background-color:#FF0; color:#000; font-size:48px; font-weight:bold;" value="Kies">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#003300">
        <h1>Slide-show met advertenties en mededelingen</h1>
      </td>
    </tr>
    <tr>
      <td height="100" colspan="2" align="center" valign="middle" bgcolor="#FF6600">
        <form name="cancel" method="post" action="Start.php">
          <input type="submit" class="submit-button" style="width:170px; height:80px; font-size:36px;" value="Cancel" title="Terug naar beheer" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
  </table>
</body>

</html>