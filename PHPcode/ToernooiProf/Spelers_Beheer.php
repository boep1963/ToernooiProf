<?php
//© Hans Eekels, versie 15-12-2025
//Startpagina voor Toernooiprogramma
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');
$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(2) { 
["t_nummer"]=> string(1) "1" 
["user_code"]=> string(10) "1000_KYZ@#" }
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

if (count($_REQUEST) != 2) {
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
//verder
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Beheer spelers</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
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
      <td width="250" height="75" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
      <td colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h2>ToernooiProf Online</h2><strong><?php print("$Gebruiker_naam"); ?></strong>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="3" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <strong><?php print("$Toernooi_naam"); ?></strong>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="3" align="center" bgcolor="#006600">
        <h1>Spelersbeheer</h1>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="3" align="center" valign="middle" bgcolor="#003300" class="grootwit"><strong>Spelers</strong></td>
    </tr>
    <tr>
      <td height="80" align="center" valign="middle" bgcolor="#003300">
        <form name="nieuw" method="post" action="Spelers/Spelers_nieuw01.php">
          <input type="submit" class="submit-button" value="Maak nieuwe speler aan" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Maak een nieuwe speler aan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td width="245" align="center" bgcolor="#003300">
        <form name="nieuw" method="post" action="Spelers/Spelers_wijzig.php">
          <input type="submit" class="submit-button" value="Wijzig speler" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig een bestaande speler" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td width="245" align="center" bgcolor="#003300">
        <form name="verwijder" method="post" action="Spelers/Spelers_delete.php">
          <input type="submit" class="submit-button" value="Verwijder speler" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Verwijder bestaande speler" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr class="grootzwart">
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit"><strong>Overzichten</strong></td>
      <td bgcolor="#006600">&nbsp;</td>
    </tr>
    <tr>
      <td height="80" align="center" valign="middle" bgcolor="#006600">
        <form name="nieuw" method="post" action="Spelers/Spelers_ovlijst.php">
          <input type="submit" class="submit-button" value="Lijst alle spelers" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Overzicht alle spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" bgcolor="#006600">
        <form name="nieuw" method="post" action="Spelers/Spelers_ovpoules.php">
          <input type="submit" class="submit-button" value="Overzicht poules" style="width:200px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Overzicht per poule" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" bgcolor="#FFFFFF" class="grootzwart"><strong>Start toernooi<br>met onderstaande knop</strong><br></td>
    </tr>
    <tr>
      <td height="80" colspan="2" align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
      <td align="center" bgcolor="#FFFFFF">
        <form name="nieuw" method="post" action="Gestart.php">
          <input type="submit" class="submit-button" value="Start Toernooi" style="width:200px; height:60px; background-color: #F00; color:#FFF; font-size:16px;"
            title="Toernooi starten" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="45" align="center" bgcolor="#006600">
        <form name="cancel" method="post" action="Toernooi_start.php">
          <input type="submit" class="submit-button" style="width:200px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
            title="Cancel" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" bgcolor="#006600">&nbsp;</td>
      <td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>