<?php
//© Hans Eekels, versie 15-12-2025
//Nieuwe ronde start
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
["user_code"]=> string(10) "1000_KYZ@#" 
["t_nummer"]=> string(1) "3" 
*/

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
      $Logo_naam = "../Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
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

if (count($_REQUEST) != 2) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../PHP/script_toernooi.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
          <form name="partijen" method="post" action="../../Start.php">
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

//verder
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Nieuwe_ronde = $Huidige_ronde + 1;

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Maak nieuwe ronde</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 750px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="750" border="0">
    <tr>
      <td width="250" height="105" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
      <td colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h1>ToernooiProf Online</h1>
        <strong><?php print("$Gebruiker_naam"); ?></strong>
      </td>
    </tr>

    <tr>
      <td colspan="3" height="40" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
    </tr>
    <tr>
      <td colspan="3" align="center" valign="middle" bgcolor="#009900">
        <h1>Maak nieuwe ronde</h1>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="3" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <strong>U werkt nu in ronde <?php print("$Huidige_ronde"); ?> en u gaat ronde <?php print("$Nieuwe_ronde"); ?> aanmaken</strong>
      </td>
    </tr>
    <tr>
      <td width="245" height="80" align="center" valign="middle" bgcolor="#009900">
        <form name="nieuw" method="post" action="Ronde_nieuw02.php">
          <input type="submit" class="submit-button" value="Koppel spelers per poule" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Speler naar nieuwe poule" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </form>
      </td>
      <td width="245" align="center" bgcolor="#009900">
        <form name="nieuw" method="post" action="Spelers_wijzigen01.php">
          <input type="submit" class="submit-button" value="Wijzig gekoppelde speler" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig een koppeling" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </form>
      </td>
      <td width="245" align="center" bgcolor="#009900">
        <= Als u een gekoppelde speler aan de nieuwe ronde weer wilt verwijderen uit die nieuwe ronde, dan kan dat ook met de knop "Wijzig gekoppelde speler"
          </td>
    </tr>
    <tr class="grootzwart">
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit"><strong>Overzichten tot nu toe in ronde <?php print("$Nieuwe_ronde"); ?></strong></td>
      <td align="center" valign="middle" bgcolor="#006600" class="grootwit"><strong>Help</strong></td>
    </tr>
    <tr>
      <td height="80" align="center" valign="middle" bgcolor="#009900">
        <form name="nieuw" method="post" action="Spelers_ovlijst.php">
          <input type="submit" class="submit-button" value="Lijst alle spelers" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Overzicht gekoppelde spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </form>
      </td>
      <td align="center" bgcolor="#009900">
        <form name="nieuw" method="post" action="Spelers_ovpoules.php">
          <input type="submit" class="submit-button" value="Overzicht nieuwe poules" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Overzicht per poule" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </form>
      </td>
      <td align="center" bgcolor="#009900">
        <input type="button" value="Help" style="width:165px; height:40px; background-color:#F00; border:none; color:#FFF; font-size:16px;"
          onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
          onClick="window.open('../Help/Help_doorkoppelen.php','Help','width=510,height=610,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <strong>Omdat de nieuwe ronde nog niet is aangemaakt,<br>kunt u terug keren naar de huidige ronde</strong>
      </td>
      <td align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart"><strong>Maak nieuwe ronde</strong><br></td>
    </tr>
    <tr>
      <td align="center" valign="middle" bgcolor="#009900">
        Als u terugkeert naar de huidige ronde kunt u later hier gewoon doorgaan met het aanmaken van een nieuwe ronde.
      </td>
      <td height="80" align="center" valign="middle" bgcolor="#009900">
        <form name="nieuw" method="post" action="../Toernooi_Beheer.php">
          <input type="submit" class="submit-button" value="Terug naar huidige ronde" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Toernooigegevens wijzigen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </form>
      </td>
      <td align="center" bgcolor="#FFFFFF">
        <form name="nieuw" method="post" action="Gestart.php">
          <input type="submit" class="submit-button" value="Start nieuwe ronde" style="width:200px; height:60px; background-color: #F00; color:#FFF; font-size:16px;"
            title="Nieuwe ronde aanmaken" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td colspan="3" align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?></td>
    </tr>
  </table>
</body>

</html>