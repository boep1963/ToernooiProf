<?php
//© Hans Eekels, versie 02-12-2025
//Wijzig naam organisatie , aantal tafels, nieuwsbrief ja/nee
//Kop gewijzigd
require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('PHP/Functies_biljarten.php');

$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1002_CRJ@#" }

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
      $Logo_naam = "Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
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
  $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
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
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_competitie.js" defer></script>
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
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

$Aantal_tafels = fun_aantaltafels($Code, $Path);
$Nieuwsbrief = fun_nieuwsbrief($Code, $Path);

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Naam of tafelgebruik wijzigen</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch Online" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 700px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="nieuw" method="post" action="Wijzig_naam02.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="85" align="left" valign="middle" bgcolor="#006600"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
        <td width="434" align="center" valign="middle" bgcolor="#006600" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600">
          <h2>Wijzigen gegevens:</h2>
        </td>
      </tr>
      <tr>
        <td height="40" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          Nieuwe naam organisatie<br>
          (min 5 en max 30 tekens):</td>
        <td align="center" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="naam" style="font-size:16px;" minlength="5" maxlength="30" size="30" value="<?php print("$Org_naam"); ?>" tabindex="1">
        </td>
      </tr>
      <tr>
        <td height="40" align="center" valign="middle" bgcolor="#009900" class="grootwit">Nieuw aantal tafels:</td>
        <td align="center" bgcolor="#009900">
          <select name="tafels" style="font-size:18px;">
            <?php
            for ($a = 1; $a < 13; $a++) {
              if ($a == $Aantal_tafels) {
            ?>
                <option value="<?php print("$a"); ?>" selected><?php print("$a"); ?></option>
              <?php
              } else {
              ?>
                <option value="<?php print("$a"); ?>"><?php print("$a"); ?></option>
            <?php
              }
            }
            ?>
          </select>
        </td>
      </tr>
      <tr>
        <td height="40" align="center" valign="middle" bgcolor="#009900" class="grootwit">Nieuwsbrief ontvangen ?</td>
        <td align="center" bgcolor="#009900">
          <select name="nieuwsbrief" style="font-size:18px;">
            <?php
            if ($Nieuwsbrief == 1) {
            ?>
              <option value="1" selected>Ja</option>
              <option value="0">Nee</option>
            <?php
            } else {
            ?>
              <option value="1">Ja</option>
              <option value="0" selected>Nee</option>
            <?php
            }
            ?>
          </select>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="70" align="center" bgcolor="#009900" class="groot">
          <input type="submit" class="submit-button" value="Wijzigingen akkoord" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig gegevens" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="2">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="ClubMatch_start.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" style="width:150px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#006600">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
      </tr>
    </table>
  </form>
</body>

</html>