<?php
//© Hans Eekels, versie 02-12-2025
//Nieuw lid invoeren (algemeen)
//voornaam nu min 2 letters
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

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

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Nieuw lid invoeren</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
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
  <form name="speler" method="post" action="Leden_nieuw02.php">
    <table width="700" border="0">
      <tr>
        <td width="200" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td height="80" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <strong>Nieuw lid invoeren</strong><br>
          U voert hier leden in die straks aan een competitie gekoppeld kunnen worden. Competities worden altijd aangemaakt in een bepaalde discipline (libre, bandstoten, driebanden of kader).
          Wilt u dit lid straks (als voorbeeld) aan een libre-competitie koppelen, dan <strong>moet</strong> u hier een moyenne invoeren bij de discipline libre. Hetzelfde geldt voor de andere moyennes als u dit lid straks ook aan een andere competitie wilt koppelen.
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Voornaam:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" name="Voornaam" minlength="2" maxlength="25" size="15" title="Max 10 letters" required value="" tabindex="1" /> (max 10 letters)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Tussenvoegsel:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" name="Tv" maxlength="8" size="15" title="Max 8 letters" value="" tabindex="2" /> (max 8 letters)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Achternaam:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" name="Achternaam" minlength="3" maxlength="20" size="30" title="Max 20 letters" required value="" tabindex="3" />
          (max 20 letters)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy libre:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_lib" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="0.000" tabindex="4" />
          (gebruik de punt en 3 decimalen)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy bandstoten:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_band" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="0.000" tabindex="5" />
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy 3band klein:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_3bandkl" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="0.000" tabindex="6" />
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy 3band groot:</strong></td>
        <td align="left" valign="middle" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_3bandgr" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="0.000" tabindex="7" />
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Moy kader:</strong></td>
        <td align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Moy_kader" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="0.000" tabindex="8" />
        </td>
      </tr>
      <tr>
        <td height="40" align="center" valign="middle" bgcolor="#009900">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="center" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Opslaan" style="width:120px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            title="Gegevens opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="9">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="../ClubMatch_start.php">
    <table width="700">
      <tr>
        <td width="200" height="30" align="center" bgcolor="#009900">
          <input type="submit" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="10">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?></td>
      </tr>
    </table>
  </form>
</body>

</html>